import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      login: {
        title: 'Welcome Auto Repair Shop Manager Tool',
        subtitle: 'Sign in to continue',
        identifierLabel: 'Email / Phone Number',
        identifierPlaceholder: 'Email / Phone Number',
        email: 'Email',
        phone: 'Phone',
        password: 'Password',
        submit: 'Login',
        loading: 'Logging in...',
        invalidFormat: 'Invalid format. Try again.',
        invalidCredentials: 'Invalid login credentials. Please try again.',
        passwordIncorrect: 'Invalid login credentials. Please try again.',
        identifierNotFound: 'Username/phone number does not exist.',
        attemptsExceeded: 'Too many attempts. Please try again later.',
        attemptsExceededWithDuration: 'Too many attempts. Try again in {{minutes}} minutes.',
        serverError500: 'Internal server error (500). Please try again later.',
        databaseUnavailable: 'Database is currently unavailable.',
        error: 'Login failed. Please try again.',
        mechanicOnly: 'Only mechanics can access this portal',
        helpText: 'Need help? Contact your administrator!',
      },
      layout: {
        logout: 'Logout',
        allRightsReserved: 'All rights reserved.',
      },
      dashboard: {
        title: 'Dashboard',
        welcome: 'Welcome',
        appointments: 'Appointments',
        vehicles: 'Vehicles',
        customers: 'Customers',
      },
      notFound: {
        pageNotFound: 'Page Not Found',
        redirectDashboard: 'Redirecting to Dashboard in {{seconds}} seconds...',
        redirectLogin: 'Redirecting to Login in {{seconds}} seconds...',
      },
    },
  },
  hu: {
    translation: {
      login: {
        title: 'Üdvözli az Autószerviz Kezelő Eszköz',
        subtitle: 'A folytatáshoz jelentkezzen be',
        identifierLabel: 'E-mail / Telefonszám',
        identifierPlaceholder: 'E-mail / Telefonszám',
        email: 'E-mail',
        phone: 'Telefon',
        password: 'Jelszó',
        submit: 'Bejelentkezés',
        loading: 'Bejelentkezés...',
        invalidFormat: 'Érvénytelen formátum. Próbálja újra.',
        invalidCredentials: 'Érvénytelen bejelentkezési adatok. Próbálja újra.',
        passwordIncorrect: 'Érvénytelen bejelentkezési adatok. Próbálja újra.',
        identifierNotFound: 'A felhasználónév/telefonszám nem létezik.',
        attemptsExceeded: 'Túl sok próbálkozás. Próbálja újra később.',
        attemptsExceededWithDuration: 'Túl sok próbálkozás. Próbálja újra {{minutes}} perc múlva.',
        serverError500: 'Belső szerverhiba (500). Kérjük, próbálja újra később.',
        databaseUnavailable: 'Az adatbázis jelenleg nem érhető el.',
        error: 'A bejelentkezés sikertelen. Próbálja újra.',
        mechanicOnly: 'Csak szerelők férhetnek hozzá a portálhoz',
        helpText: 'Segítség kell? Lépjen kapcsolatba a rendszergazdával!',
      },
      layout: {
        logout: 'Kijelentkezés',
        allRightsReserved: 'Minden jog fenntartva.',
      },
      dashboard: {
        title: 'Irányítópult',
        welcome: 'Üdvözöljük',
        appointments: 'Időpontok',
        vehicles: 'Járművek',
        customers: 'Ügyfelek',
      },
      notFound: {
        pageNotFound: 'Oldal nem található',
        redirectDashboard: 'Átirányítás az irányítópultra {{seconds}} másodperc múlva...',
        redirectLogin: 'Átirányítás a bejelentkezéshez {{seconds}} másodperc múlva...',
      },
    },
  },
};

const savedLang = localStorage.getItem('preferred-language') || 'hu';

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'hu',
    lng: savedLang,
    showSupportNotice: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'preferred-language',
      caches: ['localStorage'],
      excludeCacheFor: ['cimode'],
    },
  });

export default i18next;
