use axum::{
    extract::{Path, Query, WebSocketUpgrade},
    http::{Response, StatusCode},
    routing::{get, post},
    Router, Server,
};
use redis::{Client, Commands, PubSub};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::sync::Arc;
use tokio::sync::{broadcast, Mutex};
use tracing::{info, warn};

type Clients = Arc<Mutex<HashMap<String, ClientConnection>>>;
type MessageSender = broadcast::Sender<Message>;

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Message {
    #[serde(rename = "type")]
    msg_type: String,
    channel: String,
    payload: serde_json::Value,
}

struct ClientConnection {
    sender: tokio::sync::mpsc::Sender<Result<axum::extract::ws::Message, axum::extract::ws::Error>>,
    subscribed_channels: HashSet<String>,
}

async fn health_check() -> Result<Response<String>, StatusCode> {
    Ok(Response::new("OK".to_string()))
}

async fn websocket_handler(
    ws: WebSocketUpgrade,
    clients: Clients,
    message_sender: MessageSender,
) -> Response<axum::response::IntoResponse> {
    Ok(ws.on_upgrade(|socket| handle_socket(socket, clients, message_sender)))
}

async fn handle_socket(
    socket: axum::extract::ws::WebSocket,
    clients: Clients,
    message_sender: MessageSender,
) {
    let (sender, mut receiver) = socket.split();
    let (tx, rx) = tokio::sync::mpsc::channel(100);

    let client_id = uuid::Uuid::new_v4().to_string();

    tokio::spawn(async move {
        while let Some(msg) = rx.recv().await {
            if sender.send(msg).await.is_err() {
                break;
            }
        }
    });

    {
        let mut clients = clients.lock().await;
        clients.insert(
            client_id.clone(),
            ClientConnection {
                sender: tx,
                subscribed_channels: HashSet::new(),
            },
        );
    }

    info!("Client connected: {}", client_id);

    let mut message_receiver = message_sender.subscribe();
    let clients_clone = clients.clone();
    let client_id_clone = client_id.clone();

    tokio::spawn(async move {
        while let Ok(msg) = message_receiver.recv().await {
            let mut clients = clients_clone.lock().await;
            if let Some(client) = clients.get(&client_id_clone) {
                if client.subscribed_channels.contains(&msg.channel) {
                    let json = serde_json::to_string(&msg).unwrap();
                    if client.sender.send(Ok(axum::extract::ws::Message::Text(json))).await.is_err() {
                        clients.remove(&client_id_clone);
                    }
                }
            }
        }
    });

    while let Some(msg) = receiver.next().await {
        match msg {
            Ok(axum::extract::ws::Message::Text(text)) => {
                handle_client_message(&text, &client_id, &clients).await;
            }
            Err(e) => {
                warn!("WebSocket error for client {}: {}", client_id, e);
                break;
            }
            _ => {}
        }
    }

    {
        let mut clients = clients.lock().await;
        clients.remove(&client_id);
    }

    info!("Client disconnected: {}", client_id);
}

async fn handle_client_message(text: &str, client_id: &str, clients: &Clients) {
    if let Ok(msg) = serde_json::from_str::<Message>(text) {
        match msg.msg_type.as_str() {
            "subscribe" => {
                let mut clients = clients.lock().await;
                if let Some(client) = clients.get_mut(client_id) {
                    client.subscribed_channels.insert(msg.channel);
                    info!("Client {} subscribed to channel {}", client_id, msg.channel);
                }
            }
            "unsubscribe" => {
                let mut clients = clients.lock().await;
                if let Some(client) = clients.get_mut(client_id) {
                    client.subscribed_channels.remove(&msg.channel);
                    info!("Client {} unsubscribed from channel {}", client_id, msg.channel);
                }
            }
            _ => {}
        }
    }
}

async fn publish_message(
    Query(params): Query<HashMap<String, String>>,
    message_sender: MessageSender,
) -> Result<Response<String>, StatusCode> {
    let channel = params.get("channel").ok_or(StatusCode::BAD_REQUEST)?;
    let payload = params.get("payload").ok_or(StatusCode::BAD_REQUEST)?;
    
    let payload_value: serde_json::Value = serde_json::from_str(payload).map_err(|_| StatusCode::BAD_REQUEST)?;

    let message = Message {
        msg_type: "message".to_string(),
        channel: channel.clone(),
        payload: payload_value,
    };

    message_sender.send(message).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Response::new("Message published".to_string()))
}

async fn redis_pubsub_listener(client: Client, message_sender: MessageSender) {
    let mut pubsub = client.get_pubsub().await.unwrap();
    pubsub.subscribe("forum").await.unwrap();

    loop {
        let msg = pubsub.get_message().await;
        match msg {
            Ok(msg) => {
                let payload: String = msg.get_payload().unwrap();
                let channel = msg.get_channel_name().to_string();
                
                let payload_value: serde_json::Value = serde_json::from_str(&payload).unwrap_or(serde_json::json!({}));
                
                let message = Message {
                    msg_type: "message".to_string(),
                    channel,
                    payload: payload_value,
                };
                
                let _ = message_sender.send(message);
            }
            Err(e) => {
                warn!("Redis pubsub error: {}", e);
                tokio::time::sleep(tokio::time::Duration::from_secs(5)).await;
            }
        }
    }
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .init();

    let clients: Clients = Arc::new(Mutex::new(HashMap::new()));
    let (message_sender, _) = broadcast::channel(1000);

    let redis_url = std::env::var("REDIS_URL").unwrap_or_else(|_| "redis://localhost:6379".to_string());
    let redis_client = Client::open(redis_url).unwrap();

    let message_sender_clone = message_sender.clone();
    tokio::spawn(async move {
        redis_pubsub_listener(redis_client, message_sender_clone).await;
    });

    let app = Router::new()
        .route("/health", get(health_check))
        .route("/ws", get({
            let clients_clone = clients.clone();
            let message_sender_clone = message_sender.clone();
            move |ws| websocket_handler(ws, clients_clone.clone(), message_sender_clone.clone())
        }))
        .route("/publish", post({
            let message_sender_clone = message_sender.clone();
            move |params| publish_message(params, message_sender_clone.clone())
        }));

    info!("Starting core service on http://0.0.0.0:3002");

    Server::bind(&([0, 0, 0, 0], 3002).into())
        .serve(app.into_make_service())
        .await
        .unwrap();
}
