'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Locale = 'en' | 'zh' | 'es' | 'fr' | 'de' | 'ja' | 'ko';

interface Translations {
  [key: string]: string;
}

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string>) => string;
  availableLocales: { code: Locale; name: string; flag: string }[];
}

const translations: Record<Locale, Translations> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.forums': 'Forums',
    'nav.blogs': 'Blogs',
    'nav.events': 'Events',
    'nav.messages': 'Messages',
    'nav.notifications': 'Notifications',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.admin': 'Admin',
    'nav.logout': 'Logout',
    'nav.signIn': 'Sign In',
    'nav.signUp': 'Sign Up',

    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.create': 'Create',
    'common.search': 'Search',
    'common.loading': 'Loading...',
    'common.noResults': 'No results found',
    'common.showMore': 'Show more',
    'common.showLess': 'Show less',

    // Auth
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.username': 'Username',
    'auth.displayName': 'Display Name',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.dontHaveAccount': "Don't have an account?",
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.createAccount': 'Create Account',
    'auth.signInSuccess': 'Sign in successful',
    'auth.registerSuccess': 'Account created successfully',

    // Forum
    'forum.categories': 'Categories',
    'forum.topics': 'Topics',
    'forum.replies': 'Replies',
    'forum.views': 'Views',
    'forum.lastReply': 'Last Reply',
    'forum.createTopic': 'Create Topic',
    'forum.topicTitle': 'Topic Title',
    'forum.topicContent': 'Content',
    'forum.noTopics': 'No topics yet',
    'forum.beFirst': 'Be the first to start a discussion!',
    'forum.locked': 'Locked',
    'forum.pinned': 'Pinned',
    'forum.poll': 'Poll',
    'forum.vote': 'Vote',
    'forum.votes': 'votes',

    // User
    'user.profile': 'Profile',
    'user.joined': 'Joined',
    'user.reputation': 'Reputation',
    'user.badges': 'Badges',
    'user.followers': 'Followers',
    'user.following': 'Following',
    'user.follow': 'Follow',
    'user.unfollow': 'Unfollow',
    'user.sendMessage': 'Send Message',

    // Notifications
    'notification.newTopic': 'New topic in',
    'notification.newReply': 'New reply to your topic',
    'notification.mention': 'mentioned you in',
    'notification.badge': 'You earned a new badge!',
    'notification.reputation': 'Your reputation changed',

    // Messages
    'messages.title': 'Messages',
    'messages.noConversations': 'No conversations yet',
    'messages.typeMessage': 'Type a message...',
    'messages.send': 'Send',
    'messages.newConversation': 'New Conversation',

    // Achievements
    'achievements.title': 'Achievements',
    'achievements.earned': 'Earned',
    'achievements.locked': 'Locked',
    'achievements.progress': 'Progress',

    // Search
    'search.placeholder': 'Search forums...',
    'search.results': 'Search Results',
    'search.noResults': 'No results for',

    // Time
    'time.justNow': 'Just now',
    'time.minutesAgo': '{n} minutes ago',
    'time.hoursAgo': '{n} hours ago',
    'time.daysAgo': '{n} days ago',
    'time.weeksAgo': '{n} weeks ago',
  },
  zh: {
    // Navigation
    'nav.home': '首页',
    'nav.forums': '论坛',
    'nav.blogs': '博客',
    'nav.events': '活动',
    'nav.messages': '消息',
    'nav.notifications': '通知',
    'nav.profile': '个人资料',
    'nav.settings': '设置',
    'nav.admin': '管理',
    'nav.logout': '退出',
    'nav.signIn': '登录',
    'nav.signUp': '注册',

    // Common
    'common.save': '保存',
    'common.cancel': '取消',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.create': '创建',
    'common.search': '搜索',
    'common.loading': '加载中...',
    'common.noResults': '未找到结果',
    'common.showMore': '显示更多',
    'common.showLess': '收起',

    // Auth
    'auth.email': '邮箱',
    'auth.password': '密码',
    'auth.confirmPassword': '确认密码',
    'auth.username': '用户名',
    'auth.displayName': '显示名称',
    'auth.forgotPassword': '忘记密码？',
    'auth.dontHaveAccount': '没有账号？',
    'auth.alreadyHaveAccount': '已有账号？',
    'auth.createAccount': '创建账号',
    'auth.signInSuccess': '登录成功',
    'auth.registerSuccess': '账号创建成功',

    // Forum
    'forum.categories': '分类',
    'forum.topics': '主题',
    'forum.replies': '回复',
    'forum.views': '浏览',
    'forum.lastReply': '最后回复',
    'forum.createTopic': '创建主题',
    'forum.topicTitle': '主题标题',
    'forum.topicContent': '内容',
    'forum.noTopics': '暂无主题',
    'forum.beFirst': '成为第一个发起讨论的人！',
    'forum.locked': '已锁定',
    'forum.pinned': '已置顶',
    'forum.poll': '投票',
    'forum.vote': '投票',
    'forum.votes': '票',

    // User
    'user.profile': '个人资料',
    'user.joined': '加入于',
    'user.reputation': '声望',
    'user.badges': '徽章',
    'user.followers': '粉丝',
    'user.following': '关注',
    'user.follow': '关注',
    'user.unfollow': '取消关注',
    'user.sendMessage': '发送消息',

    // Notifications
    'notification.newTopic': '新主题在',
    'notification.newReply': '您的主题有新回复',
    'notification.mention': '在',
    'notification.badge': '您获得了新徽章！',
    'notification.reputation': '您的声望变化了',

    // Messages
    'messages.title': '消息',
    'messages.noConversations': '暂无对话',
    'messages.typeMessage': '输入消息...',
    'messages.send': '发送',
    'messages.newConversation': '新对话',

    // Achievements
    'achievements.title': '成就',
    'achievements.earned': '已获得',
    'achievements.locked': '未解锁',
    'achievements.progress': '进度',

    // Search
    'search.placeholder': '搜索论坛...',
    'search.results': '搜索结果',
    'search.noResults': '未找到',

    // Time
    'time.justNow': '刚刚',
    'time.minutesAgo': '{n}分钟前',
    'time.hoursAgo': '{n}小时前',
    'time.daysAgo': '{n}天前',
    'time.weeksAgo': '{n}周前',
  },
  es: {
    'nav.home': 'Inicio',
    'nav.forums': 'Foros',
    'nav.blogs': 'Blogs',
    'nav.events': 'Eventos',
    'nav.messages': 'Mensajes',
    'nav.notifications': 'Notificaciones',
    'nav.profile': 'Perfil',
    'nav.settings': 'Configuración',
    'nav.admin': 'Admin',
    'nav.logout': 'Cerrar sesión',
    'nav.signIn': 'Iniciar sesión',
    'nav.signUp': 'Registrarse',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.create': 'Crear',
    'common.search': 'Buscar',
    'common.loading': 'Cargando...',
    'forum.topics': 'Temas',
    'forum.replies': 'Respuestas',
    'forum.views': 'Vistas',
    'user.profile': 'Perfil',
    'user.reputation': 'Reputación',
  },
  fr: {
    'nav.home': 'Accueil',
    'nav.forums': 'Forums',
    'nav.blogs': 'Blogs',
    'nav.events': 'Événements',
    'nav.messages': 'Messages',
    'nav.notifications': 'Notifications',
    'nav.profile': 'Profil',
    'nav.settings': 'Paramètres',
    'nav.admin': 'Admin',
    'nav.logout': 'Déconnexion',
    'nav.signIn': 'Connexion',
    'nav.signUp': "S'inscrire",
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.create': 'Créer',
    'common.search': 'Rechercher',
    'common.loading': 'Chargement...',
    'forum.topics': 'Sujets',
    'forum.replies': 'Réponses',
    'forum.views': 'Vues',
    'user.profile': 'Profil',
    'user.reputation': 'Réputation',
  },
  de: {
    'nav.home': 'Startseite',
    'nav.forums': 'Foren',
    'nav.blogs': 'Blogs',
    'nav.events': 'Veranstaltungen',
    'nav.messages': 'Nachrichten',
    'nav.notifications': 'Benachrichtigungen',
    'nav.profile': 'Profil',
    'nav.settings': 'Einstellungen',
    'nav.admin': 'Admin',
    'nav.logout': 'Abmelden',
    'nav.signIn': 'Anmelden',
    'nav.signUp': 'Registrieren',
    'common.save': 'Speichern',
    'common.cancel': 'Abbrechen',
    'common.delete': 'Löschen',
    'common.edit': 'Bearbeiten',
    'common.create': 'Erstellen',
    'common.search': 'Suchen',
    'common.loading': 'Laden...',
    'forum.topics': 'Themen',
    'forum.replies': 'Antworten',
    'forum.views': 'Aufrufe',
    'user.profile': 'Profil',
    'user.reputation': 'Ruf',
  },
  ja: {
    'nav.home': 'ホーム',
    'nav.forums': 'フォーラム',
    'nav.blogs': 'ブログ',
    'nav.events': 'イベント',
    'nav.messages': 'メッセージ',
    'nav.notifications': '通知',
    'nav.profile': 'プロフィール',
    'nav.settings': '設定',
    'nav.admin': '管理',
    'nav.logout': 'ログアウト',
    'nav.signIn': 'ログイン',
    'nav.signUp': '登録',
    'common.save': '保存',
    'common.cancel': 'キャンセル',
    'common.delete': '削除',
    'common.edit': '編集',
    'common.create': '作成',
    'common.search': '検索',
    'common.loading': '読み込み中...',
    'forum.topics': 'トピック',
    'forum.replies': '返信',
    'forum.views': '閲覧',
    'user.profile': 'プロフィール',
    'user.reputation': '評価',
  },
  ko: {
    'nav.home': '홈',
    'nav.forums': '포럼',
    'nav.blogs': '블로그',
    'nav.events': '이벤트',
    'nav.messages': '메시지',
    'nav.notifications': '알림',
    'nav.profile': '프로필',
    'nav.settings': '설정',
    'nav.admin': '관리',
    'nav.logout': '로그아웃',
    'nav.signIn': '로그인',
    'nav.signUp': '회원가입',
    'common.save': '저장',
    'common.cancel': '취소',
    'common.delete': '삭제',
    'common.edit': '편집',
    'common.create': '생성',
    'common.search': '검색',
    'common.loading': '로딩 중...',
    'forum.topics': '토픽',
    'forum.replies': '답변',
    'forum.views': '조회',
    'user.profile': '프로필',
    'user.reputation': '평판',
  },
};

const availableLocales = [
  { code: 'en' as Locale, name: 'English', flag: '🇺🇸' },
  { code: 'zh' as Locale, name: '中文', flag: '🇨🇳' },
  { code: 'es' as Locale, name: 'Español', flag: '🇪🇸' },
  { code: 'fr' as Locale, name: 'Français', flag: '🇫🇷' },
  { code: 'de' as Locale, name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja' as Locale, name: '日本語', flag: '🇯🇵' },
  { code: 'ko' as Locale, name: '한국어', flag: '🇰🇷' },
];

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && translations[savedLocale]) {
      setLocaleState(savedLocale);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
    document.documentElement.lang = newLocale;
  };

  const t = (key: string, params?: Record<string, string>): string => {
    let text = translations[locale][key] || translations.en[key] || key;
    
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }
    
    return text;
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, availableLocales }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return context;
}
