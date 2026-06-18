import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3002';

let socket: Socket | null = null;

export interface WebSocketMessage {
  type: string;
  channel: string;
  payload: Record<string, unknown>;
}

export const connectWebSocket = (onMessage: (message: WebSocketMessage) => void) => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(WS_URL, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('WebSocket connected');
  });

  socket.on('disconnect', (reason) => {
    console.log('WebSocket disconnected:', reason);
  });

  socket.on('message', (data: WebSocketMessage) => {
    onMessage(data);
  });

  socket.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
};

export const disconnectWebSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const subscribeToChannel = (channel: string) => {
  if (socket) {
    socket.emit('subscribe', { channel });
  }
};

export const unsubscribeFromChannel = (channel: string) => {
  if (socket) {
    socket.emit('unsubscribe', { channel });
  }
};

export default socket;