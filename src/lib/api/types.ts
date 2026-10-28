export type InvoiceStatus =
  | "Draft"
  | "Issued"
  | "Paid"
  | "Cancelled"
  | "Overdue";

export type PagedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type Customer = {
  id: string;
  name: string;
  ico: string | null;
  dic: string | null;
  icDph: string | null;
  email: string | null;
  phone: string | null;
  street: string | null;
  city: string | null;
  postalCode: string | null;
  country: string;
  createdAt: string;
  invoiceCount: number;
};

export type CreateCustomerInput = {
  name: string;
  ico?: string | null;
  dic?: string | null;
  icDph?: string | null;
  email?: string | null;
  phone?: string | null;
  street?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
};

export type CompanyCompletenessItem = {
  key: string;
  label: string;
  isRequired: boolean;
  isComplete: boolean;
  hint: string | null;
};

export type CompanyCompleteness = {
  isReadyToInvoice: boolean;
  completedRequired: number;
  totalRequired: number;
  percentComplete: number;
  items: CompanyCompletenessItem[];
};

export type CompanySettings = {
  id: string;
  name: string;
  legalForm: string | null;
  ico: string | null;
  dic: string | null;
  icDph: string | null;
  isVatPayer: boolean;
  commercialRegister: string | null;
  email: string | null;
  invoiceEmail: string | null;
  phone: string | null;
  website: string | null;
  contactPerson: string | null;
  street: string | null;
  city: string | null;
  postalCode: string | null;
  country: string;
  bankIban: string | null;
  bankBic: string | null;
  bankName: string | null;
  defaultDueDays: number;
  defaultVatRate: number;
  defaultCurrency: string;
  invoicePrefix: string | null;
  defaultPaymentMethod: string | null;
  defaultConstantSymbol: string | null;
  defaultInvoiceNotes: string | null;
  invoiceFooter: string | null;
  logoUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  completeness: CompanyCompleteness;
};

export type CompanySummary = {
  id: string;
  name: string;
  legalForm: string | null;
  ico: string | null;
  email: string | null;
  city: string | null;
  country: string;
  isVatPayer: boolean;
  logoUrl: string | null;
  isReadyToInvoice: boolean;
};

export type InvoiceParty = {
  name: string;
  ico: string | null;
  dic: string | null;
  icDph: string | null;
  email: string | null;
  street: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
};

export type InvoiceItem = {
  id: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  subtotal: number;
  vatAmount: number;
  total: number;
  sortOrder: number;
};

export type InvoiceListItem = {
  id: string;
  number: string;
  status: InvoiceStatus;
  customerId: string;
  customerName: string;
  issueDate: string;
  dueDate: string;
  paidAt: string | null;
  currency: string;
  total: number;
  isOverdue: boolean;
  daysUntilDue: number | null;
  createdAt: string;
};

export type Invoice = {
  id: string;
  number: string;
  status: InvoiceStatus;
  customerId: string;
  customer: InvoiceParty;
  seller: InvoiceParty | null;
  sellerIsVatPayer?: boolean;
  issueDate: string;
  dueDate: string;
  deliveryDate: string | null;
  paidAt: string | null;
  cancelReason: string | null;
  cancelledAt: string | null;
  lastReminderSentAt: string | null;
  reminderCount: number;
  currency: string;
  variableSymbol: string | null;
  constantSymbol: string | null;
  specificSymbol: string | null;
  paymentMethod: string | null;
  bankIban: string | null;
  bankBic: string | null;
  notes: string | null;
  subtotal: number;
  vatTotal: number;
  total: number;
  isOverdue: boolean;
  daysUntilDue: number | null;
  createdAt: string;
  updatedAt: string;
  items: InvoiceItem[];
};

export type InvoiceItemInput = {
  description: string;
  unit?: string | null;
  quantity: number;
  unitPrice: number;
  vatRate?: number | null;
};

export type CreateInvoiceInput = {
  customerId: string;
  issueDate?: string | null;
  dueDate?: string | null;
  deliveryDate?: string | null;
  currency?: string | null;
  variableSymbol?: string | null;
  constantSymbol?: string | null;
  specificSymbol?: string | null;
  paymentMethod?: string | null;
  bankIban?: string | null;
  bankBic?: string | null;
  notes?: string | null;
  status?: InvoiceStatus | null;
  items: InvoiceItemInput[];
};

export type UpdateInvoiceInput = {
  customerId: string;
  issueDate: string;
  dueDate: string;
  deliveryDate?: string | null;
  currency?: string | null;
  variableSymbol?: string | null;
  constantSymbol?: string | null;
  specificSymbol?: string | null;
  paymentMethod?: string | null;
  bankIban?: string | null;
  bankBic?: string | null;
  notes?: string | null;
  items: InvoiceItemInput[];
};

export type InvoiceStatusResponse = {
  id: string;
  number: string;
  status: InvoiceStatus;
  paidAt: string | null;
  cancelReason: string | null;
  cancelledAt: string | null;
};

export type InvoiceStats = {
  from: string | null;
  to: string | null;
  totalCount: number;
  draftCount: number;
  issuedCount: number;
  paidCount: number;
  overdueCount: number;
  cancelledCount: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  overdueAmount: number;
  currency: string;
};

export type InvoiceReminder = {
  id: string;
  number: string;
  status: InvoiceStatus;
  customerId: string;
  customerName: string;
  customerEmail: string | null;
  issueDate: string;
  dueDate: string;
  currency: string;
  total: number;
  isOverdue: boolean;
  daysUntilDue: number;
  reminderCount: number;
  lastReminderSentAt: string | null;
};

export type SyncOverdueResponse = { updatedCount: number };

export type ReportOverview = {
  from: string | null;
  to: string | null;
  asOf: string;
  totalInvoices: number;
  draftCount: number;
  issuedCount: number;
  paidCount: number;
  overdueCount: number;
  cancelledCount: number;
  issuedAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  overdueAmount: number;
  cancelledAmount: number;
  averageInvoiceAmount: number;
  averageDaysToPay: number | null;
  collectionRatePercent: number;
  currency: string;
  byStatus: { status: InvoiceStatus; count: number; amount: number }[];
};

export type MonthlyRevenue = {
  year: number;
  currency: string;
  months: {
    year: number;
    month: number;
    label: string;
    issuedCount: number;
    issuedAmount: number;
    paidCount: number;
    paidAmount: number;
    outstandingAmount: number;
  }[];
  yearIssuedTotal: number;
  yearPaidTotal: number;
};

export type AgingReport = {
  asOf: string;
  currency: string;
  totalOutstanding: number;
  buckets: {
    key: string;
    label: string;
    fromDaysInclusive: number;
    toDaysInclusive: number | null;
    count: number;
    amount: number;
  }[];
  largestOutstanding: {
    id: string;
    number: string;
    customerName: string;
    dueDate: string;
    daysOverdue: number;
    total: number;
    currency: string;
    status: InvoiceStatus;
  }[];
};

export type TopCustomersReport = {
  from: string | null;
  to: string | null;
  currency: string;
  customers: {
    customerId: string;
    customerName: string;
    customerIco: string | null;
    invoiceCount: number;
    paidCount: number;
    outstandingCount: number;
    totalAmount: number;
    paidAmount: number;
    outstandingAmount: number;
    averageDaysToPay: number | null;
    shareOfRevenuePercent: number;
  }[];
};

export type VatReport = {
  from: string | null;
  to: string | null;
  currency: string;
  taxBaseTotal: number;
  vatTotal: number;
  grossTotal: number;
  byRate: {
    vatRate: number;
    itemCount: number;
    invoiceCount: number;
    taxBase: number;
    vatAmount: number;
    grossAmount: number;
  }[];
};

export type SearchHit = {
  type: string;
  id: string;
  title: string;
  subtitle: string | null;
  number: string | null;
  email: string | null;
  ico: string | null;
  status: InvoiceStatus | null;
  amount: number | null;
  currency: string | null;
  issueDate: string | null;
  score: number;
};

export type GlobalSearch = {
  query: string;
  types: number;
  limit: number;
  totalHits: number;
  hits: SearchHit[];
};

export type ApiProblem = {
  title?: string;
  detail?: string;
  status?: number;
  code?: string;
  errors?: Record<string, string[]>;
  type?: string;
  instance?: string;
};

export type OverdueJobSettings = {
  enabled: boolean;
  runAtHourUtc: number;
  runAtMinuteUtc: number;
  runOnStartup: boolean;
  startupDelaySeconds: number;
  disabledRecheckHours: number;
};

export type ReminderJobSettings = {
  enabled: boolean;
  runAtHourUtc: number;
  runAtMinuteUtc: number;
  runOnStartup: boolean;
  startupDelaySeconds: number;
  disabledRecheckHours: number;
  withinDays: number;
  onlyOverdue: boolean;
  minDaysBetweenReminders: number;
  markAsSent: boolean;
};

export type JobSettings = {
  overdueSync: OverdueJobSettings;
  reminderJob: ReminderJobSettings;
};

export type ServiceCatalogItem = {
  id: string;
  description: string;
  unit: string;
  unitPrice: number;
  vatRate: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type PaymentImportMatchStatus =
  | "matched"
  | "ambiguous"
  | "unmatched"
  | "already_paid"
  | "skipped";

export type PaymentImportRowResult = {
  lineNumber: number;
  rawVariableSymbol: string | null;
  normalizedVariableSymbol: string | null;
  amount: number | null;
  bookingDate: string | null;
  counterparty: string | null;
  note: string | null;
  matchStatus: PaymentImportMatchStatus;
  invoiceId: string | null;
  invoiceNumber: string | null;
  invoiceTotal: number | null;
  invoiceCurrency: string | null;
  message: string | null;
};

export type PaymentImportPreviewResponse = {
  totalRows: number;
  matched: number;
  ambiguous: number;
  unmatched: number;
  alreadyPaid: number;
  skipped: number;
  rows: PaymentImportRowResult[];
};

export type PaymentImportConfirmResult = {
  invoiceId: string;
  success: boolean;
  message: string | null;
};

export type PaymentImportConfirmResponse = {
  markedPaid: number;
  failed: number;
  results: PaymentImportConfirmResult[];
};
