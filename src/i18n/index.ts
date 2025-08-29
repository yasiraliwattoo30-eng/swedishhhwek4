import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      dashboard: 'Dashboard',
      foundations: 'Foundations',
      governance: 'Governance',
      documents: 'Documents',
      financial: 'Financial',
      meetings: 'Meetings',
      expenses: 'Expenses',
      investments: 'Investments',
      projects: 'Projects',
      grants: 'Grants',
      reports: 'Reports',
      profile: 'Profile',
      settings: 'Settings',
      
      // Common
      search: 'Search',
      filter: 'Filter',
      add: 'Add',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel',
      submit: 'Submit',
      approve: 'Approve',
      reject: 'Reject',
      view: 'View',
      download: 'Download',
      upload: 'Upload',
      create: 'Create',
      update: 'Update',
      loading: 'Loading...',
      
      // Dashboard
      welcomeBack: 'Welcome back! Here\'s what\'s happening with your foundations.',
      activeFoundations: 'Active Foundations',
      pendingVerification: 'Pending Verification',
      upcomingMeetings: 'Upcoming Meetings',
      myFoundations: 'My Foundations',
      recentActivities: 'Recent Activities',
      
      // Foundation Registration
      foundationRegistration: 'Foundation Registration',
      registerFoundation: 'Register Foundation',
      accessYourFoundation: 'Access Your Foundation',
      loginToFoundation: 'Login to Foundation',
      basicInformation: 'Basic Information',
      boardMembers: 'Board Members',
      contactPerson: 'Contact Person',
      complianceCheck: 'Compliance Check',
      documentGeneration: 'Document Generation',
      digitalSignatures: 'Digital Signatures',
      authoritySubmission: 'Authority Submission',
      
      // Financial
      totalAssets: 'Total Assets',
      totalExpenses: 'Total Expenses',
      totalInvestments: 'Total Investments',
      netGainLoss: 'Net Gain/Loss',
      monthlyTrends: 'Monthly Trends',
      expensesByCategory: 'Expenses by Category',
      investmentsByType: 'Investments by Type',
      
      // Status
      active: 'Active',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      completed: 'Completed',
      inProgress: 'In Progress',
      draft: 'Draft',
      
      // Forms
      foundationName: 'Foundation Name',
      email: 'Email',
      password: 'Password',
      fullName: 'Full Name',
      phone: 'Phone',
      address: 'Address',
      description: 'Description',
      amount: 'Amount',
      date: 'Date',
      status: 'Status',
      type: 'Type',
      
      // Messages
      noDataFound: 'No data found',
      tryAdjustingFilters: 'Try adjusting your search or filter criteria.',
      getStarted: 'Get started by creating your first {{item}}.',
    }
  },
  sv: {
    translation: {
      // Navigation
      dashboard: 'Instrumentpanel',
      foundations: 'Stiftelser',
      governance: 'Styrning',
      documents: 'Dokument',
      financial: 'Ekonomi',
      meetings: 'Möten',
      expenses: 'Utgifter',
      investments: 'Investeringar',
      projects: 'Projekt',
      grants: 'Bidrag',
      reports: 'Rapporter',
      profile: 'Profil',
      settings: 'Inställningar',
      
      // Common
      search: 'Sök',
      filter: 'Filtrera',
      add: 'Lägg till',
      edit: 'Redigera',
      delete: 'Ta bort',
      save: 'Spara',
      cancel: 'Avbryt',
      submit: 'Skicka',
      approve: 'Godkänn',
      reject: 'Avvisa',
      view: 'Visa',
      download: 'Ladda ner',
      upload: 'Ladda upp',
      create: 'Skapa',
      update: 'Uppdatera',
      loading: 'Laddar...',
      
      // Dashboard
      welcomeBack: 'Välkommen tillbaka! Här är vad som händer med dina stiftelser.',
      activeFoundations: 'Aktiva Stiftelser',
      pendingVerification: 'Väntar på Verifiering',
      upcomingMeetings: 'Kommande Möten',
      myFoundations: 'Mina Stiftelser',
      recentActivities: 'Senaste Aktiviteter',
      
      // Foundation Registration
      foundationRegistration: 'Stiftelseregistrering',
      registerFoundation: 'Registrera Stiftelse',
      accessYourFoundation: 'Kom åt Din Stiftelse',
      loginToFoundation: 'Logga in till Stiftelse',
      basicInformation: 'Grundläggande Information',
      boardMembers: 'Styrelsemedlemmar',
      contactPerson: 'Kontaktperson',
      complianceCheck: 'Regelefterlevnadskontroll',
      documentGeneration: 'Dokumentgenerering',
      digitalSignatures: 'Digitala Signaturer',
      authoritySubmission: 'Myndighetsinlämning',
      
      // Financial
      totalAssets: 'Totala Tillgångar',
      totalExpenses: 'Totala Utgifter',
      totalInvestments: 'Totala Investeringar',
      netGainLoss: 'Nettovinst/förlust',
      monthlyTrends: 'Månatliga Trender',
      expensesByCategory: 'Utgifter per Kategori',
      investmentsByType: 'Investeringar per Typ',
      
      // Status
      active: 'Aktiv',
      pending: 'Väntande',
      approved: 'Godkänd',
      rejected: 'Avvisad',
      completed: 'Slutförd',
      inProgress: 'Pågående',
      draft: 'Utkast',
      
      // Forms
      foundationName: 'Stiftelsens Namn',
      email: 'E-post',
      password: 'Lösenord',
      fullName: 'Fullständigt Namn',
      phone: 'Telefon',
      address: 'Adress',
      description: 'Beskrivning',
      amount: 'Belopp',
      date: 'Datum',
      status: 'Status',
      type: 'Typ',
      
      // Messages
      noDataFound: 'Ingen data hittades',
      tryAdjustingFilters: 'Försök justera dina sök- eller filterkriterier.',
      getStarted: 'Kom igång genom att skapa din första {{item}}.',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;