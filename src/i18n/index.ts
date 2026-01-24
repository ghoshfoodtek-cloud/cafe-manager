import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English translations
import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enNavigation from './locales/en/navigation.json';
import enDashboard from './locales/en/dashboard.json';
import enClients from './locales/en/clients.json';
import enOrders from './locales/en/orders.json';
import enEvents from './locales/en/events.json';

// Hindi translations
import hiCommon from './locales/hi/common.json';
import hiAuth from './locales/hi/auth.json';
import hiNavigation from './locales/hi/navigation.json';
import hiDashboard from './locales/hi/dashboard.json';
import hiClients from './locales/hi/clients.json';
import hiOrders from './locales/hi/orders.json';
import hiEvents from './locales/hi/events.json';

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    navigation: enNavigation,
    dashboard: enDashboard,
    clients: enClients,
    orders: enOrders,
    events: enEvents,
  },
  hi: {
    common: hiCommon,
    auth: hiAuth,
    navigation: hiNavigation,
    dashboard: hiDashboard,
    clients: hiClients,
    orders: hiOrders,
    events: hiEvents,
  },
};

// Get saved language from localStorage or default to English
const savedLanguage = localStorage.getItem('language') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'auth', 'navigation', 'dashboard', 'clients', 'orders', 'events'],
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false,
    },
  });

// Save language preference when it changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

export default i18n;
