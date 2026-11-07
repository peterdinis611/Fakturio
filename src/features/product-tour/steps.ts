export type TourStepDef = {
  id: string;
  /** Path where the highlighted element is expected to exist. */
  route: string;
  /** CSS selector — prefer `[data-tour="…"]`. */
  element?: string;
  side?: "top" | "right" | "bottom" | "left";
  titleKey: string;
  bodyKey: string;
};

/** Full-app walkthrough: sidebar anchors + a few page-level highlights. */
export const PRODUCT_TOUR_STEPS: TourStepDef[] = [
  {
    id: "welcome",
    route: "/dashboard",
    element: '[data-tour="brand"]',
    side: "right",
    titleKey: "welcomeTitle",
    bodyKey: "welcomeBody",
  },
  {
    id: "dashboard",
    route: "/dashboard",
    element: '[data-tour="nav-dashboard"]',
    side: "right",
    titleKey: "dashboardTitle",
    bodyKey: "dashboardBody",
  },
  {
    id: "today",
    route: "/dashboard",
    element: '[data-tour="dashboard-today"]',
    side: "left",
    titleKey: "todayTitle",
    bodyKey: "todayBody",
  },
  {
    id: "cashflow",
    route: "/dashboard",
    element: '[data-tour="dashboard-cashflow"]',
    side: "left",
    titleKey: "cashflowTitle",
    bodyKey: "cashflowBody",
  },
  {
    id: "invoices",
    route: "/invoices",
    element: '[data-tour="nav-invoices"]',
    side: "right",
    titleKey: "invoicesTitle",
    bodyKey: "invoicesBody",
  },
  {
    id: "invoices-page",
    route: "/invoices",
    element: '[data-tour="page-header"]',
    side: "bottom",
    titleKey: "invoicesPageTitle",
    bodyKey: "invoicesPageBody",
  },
  {
    id: "customers",
    route: "/customers",
    element: '[data-tour="nav-customers"]',
    side: "right",
    titleKey: "customersTitle",
    bodyKey: "customersBody",
  },
  {
    id: "customers-page",
    route: "/customers",
    element: '[data-tour="page-header"]',
    side: "bottom",
    titleKey: "customersPageTitle",
    bodyKey: "customersPageBody",
  },
  {
    id: "expenses",
    route: "/expenses",
    element: '[data-tour="nav-expenses"]',
    side: "right",
    titleKey: "expensesTitle",
    bodyKey: "expensesBody",
  },
  {
    id: "services",
    route: "/services",
    element: '[data-tour="nav-services"]',
    side: "right",
    titleKey: "servicesTitle",
    bodyKey: "servicesBody",
  },
  {
    id: "recurring",
    route: "/recurring",
    element: '[data-tour="nav-recurring"]',
    side: "right",
    titleKey: "recurringTitle",
    bodyKey: "recurringBody",
  },
  {
    id: "payments",
    route: "/payments/import",
    element: '[data-tour="nav-payments"]',
    side: "right",
    titleKey: "paymentsTitle",
    bodyKey: "paymentsBody",
  },
  {
    id: "reminders",
    route: "/reminders",
    element: '[data-tour="nav-reminders"]',
    side: "right",
    titleKey: "remindersTitle",
    bodyKey: "remindersBody",
  },
  {
    id: "reports",
    route: "/reports",
    element: '[data-tour="nav-reports"]',
    side: "right",
    titleKey: "reportsTitle",
    bodyKey: "reportsBody",
  },
  {
    id: "reports-page",
    route: "/reports",
    element: '[data-tour="page-header"]',
    side: "bottom",
    titleKey: "reportsPageTitle",
    bodyKey: "reportsPageBody",
  },
  {
    id: "search",
    route: "/search",
    element: '[data-tour="nav-search"]',
    side: "right",
    titleKey: "searchTitle",
    bodyKey: "searchBody",
  },
  {
    id: "notifications",
    route: "/search",
    element: '[data-tour="notifications"]',
    side: "bottom",
    titleKey: "notificationsTitle",
    bodyKey: "notificationsBody",
  },
  {
    id: "settings",
    route: "/settings/company",
    element: '[data-tour="nav-settings"]',
    side: "right",
    titleKey: "settingsTitle",
    bodyKey: "settingsBody",
  },
  {
    id: "done",
    route: "/settings/company",
    element: '[data-tour="page-header"]',
    side: "bottom",
    titleKey: "doneTitle",
    bodyKey: "doneBody",
  },
];
