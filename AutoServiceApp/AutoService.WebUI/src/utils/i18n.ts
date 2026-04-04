import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      login: {
        title: 'Welcome ARSM tool',
        subtitle: 'Sign in to continue!',
        emailPlaceholder: 'Enter your email address!',
        phonePlaceholder: 'Enter your phone number!',
        loginMethodLabel: 'Login method',
        loginWithEmail: 'Email',
        loginWithPhone: 'Phone',
        passwordPlaceholder: 'Password',
        loginPassword: 'Enter your password!',
        showPassword: 'Show',
        hidePassword: 'Hide',
        email: 'Email',
        phone: 'Phone',
        submit: 'Login',
        loading: 'Logging in...',
        invalidFormat: 'Invalid format. Try again!',
        wrongMethodEmailInPhone: 'Please switch to Email mode or enter a valid phone number!',
        wrongMethodPhoneInEmail: 'Please switch to Phone mode or enter a valid email address!',
        invalidCredentials: 'Invalid login credentials. Please try again!',
        identifierNotFoundEmail: 'Email address does not exist!',
        identifierNotFoundPhone: 'Phone number does not exist!',
        attemptsExceeded: 'Too many attempts. Please try again later!',
        attemptsExceededWithDuration: 'Too many attempts. Try again in {{minutes}} minutes!',
        serverError500: 'Internal server error (500). Please try again later!',
        databaseUnavailable: 'Database is currently unavailable.',
        error: 'Login failed. Please try again!',
        mechanicOnly: 'Only mechanics can access this portal!',
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
      nav: {
        tools: 'Tools',
        scheduler: 'Scheduler',
        inventory: 'Inventory',
        settings: 'Settings',
        list: 'LIST',
      },
      sidebar: {
        collapse: 'Collapse sidebar',
        expand: 'Expand sidebar',
        openMenu: 'Open menu',
      },
      scheduler: {
        plannerSpace: 'Planner Space',
        todayDate: 'Today, {{date}}',
        scheduledCount: '{{count}} scheduled repair tasks',
        emptyToday: 'No appointments scheduled for today',
        claim: 'Claim',
        assigned: 'Assigned',
        claimError: 'Failed to claim appointment',
        statusUpdateError: 'Failed to update status',
        status: {
          scheduled: 'Scheduled',
          inprogress: 'In Progress',
          completed: 'Completed',
          cancelled: 'Cancelled',
        },
        specs: {
          mileage: '{{value}} km',
          power: '{{value}} HP',
          torque: '{{value}} Nm',
        },
        calendar: {
          title: '{{month}} {{year}}',
          prevMonth: 'Previous month',
          nextMonth: 'Next month',
          loading: 'Loading calendar...',
        },
      },
      placeholder: {
        comingSoon: 'Coming soon',
      },
      notFound: {
        pageNotFound: 'Page Not Found',
        subtitle: 'Looks like this route took a wrong turn.',
        goToDashboard: 'Go to Dashboard',
        goToLogin: 'Go to Login',
        redirectIn: 'Redirect in',
        redirectDashboard: 'Redirecting to Dashboard in {{seconds}}s...',
        redirectLogin: 'Redirecting to Login in {{seconds}}s...',
      },
    },
  },
  hu: {
    translation: {
      login: {
        title: 'Üdvözli az ARSM eszköz',
        subtitle: 'A folytatáshoz jelentkezzen be!',
        emailPlaceholder: 'Adja meg az e-mail címet!',
        phonePlaceholder: 'Adja meg a telefonszámot!',
        loginMethodLabel: 'Bejelentkezési mód',
        loginWithEmail: 'E-mail',
        loginWithPhone: 'Telefon',
        passwordPlaceholder: 'Jelszó',
        loginPassword: 'Adja meg a jelszót!',
        showPassword: 'Mutat',
        hidePassword: 'Elrejt',
        email: 'E-mail',
        phone: 'Telefon',
        submit: 'Bejelentkezés',
        loading: 'Bejelentkezés...',
        invalidFormat: 'Érvénytelen formátum. Próbálja újra!',
        wrongMethodEmailInPhone: 'Váltson E-mail módra, vagy adjon meg érvényes telefonszámot!',
        wrongMethodPhoneInEmail: 'Váltson Telefon módra, vagy adjon meg érvényes e-mail címet!',
        invalidCredentials: 'Érvénytelen bejelentkezési adatok. Próbálja újra!',
        identifierNotFoundEmail: 'Az e-mail cím nem létezik!',
        identifierNotFoundPhone: 'A telefonszám nem létezik!',
        attemptsExceeded: 'Túl sok próbálkozás. Próbálja újra később!',
        attemptsExceededWithDuration: 'Túl sok próbálkozás. Próbálja újra {{minutes}} perc múlva!',
        serverError500: 'Belső szerverhiba (500). Kérjük, próbálja újra később!',
        databaseUnavailable: 'Az adatbázis jelenleg nem érhető el!',
        error: 'A bejelentkezés sikertelen. Próbálja újra!',
        mechanicOnly: 'Csak szerelők férhetnek hozzá a portálhoz!',
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
      nav: {
        tools: 'Eszközök',
        scheduler: 'Ütemező',
        inventory: 'Készlet',
        settings: 'Beállítások',
        list: 'LISTA',
      },
      sidebar: {
        collapse: 'Oldalsáv összecsukás',
        expand: 'Oldalsáv kinyitása',
        openMenu: 'Menü megnyitása',
      },
      scheduler: {
        plannerSpace: 'Tervező Tér',
        todayDate: 'Ma, {{date}}',
        scheduledCount: '{{count}} ütemezett javítás',
        emptyToday: 'Ma nincs ütemezett időpont',
        claim: 'Igénylés',
        assigned: 'Hozzárendelve',
        claimError: 'Nem sikerült igényelni az időpontot',
        statusUpdateError: 'Nem sikerült frissíteni az állapotot',
        status: {
          scheduled: 'Ütemezett',
          inprogress: 'Folyamatban',
          completed: 'Befejezett',
          cancelled: 'Lemondott',
        },
        specs: {
          mileage: '{{value}} km',
          power: '{{value}} LE',
          torque: '{{value}} Nm',
        },
        calendar: {
          title: '{{month}} {{year}}',
          prevMonth: 'Előző hónap',
          nextMonth: 'Következő hónap',
          loading: 'Naptár betöltése...',
        },
      },
      placeholder: {
        comingSoon: 'Hamarosan',
      },
      notFound: {
        pageNotFound: 'Oldal nem található',
        subtitle: 'Úgy tűnik, ez az útvonal rossz kanyart vett.',
        goToDashboard: 'Irányítópult',
        goToLogin: 'Bejelentkezés',
        redirectIn: 'Átirányítás',
        redirectDashboard: 'Átirányítás az irányítópultra {{seconds}} mp múlva...',
        redirectLogin: 'Átirányítás a bejelentkezéshez {{seconds}} mp múlva...',
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
