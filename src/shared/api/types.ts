export type InvoiceStatus =
  | "Draft"
  | "Issued"
  | "Paid"
  | "Cancelled"
  | "Overdue";

export type InvoiceDocumentType =
  | "Invoice"
  | "Proforma"
  | "CreditNote"
  | "Quote"
  | "DeliveryNote"
  | "SalesOrder";

export type DocumentFlow = "Issued" | "Received";

export type AuditAction =
  | "Created"
  | "Updated"
  | "Issued"
  | "Paid"
  | "Cancelled"
  | "ReminderSent"
  | "Deleted"
  | "Duplicated"
  | "OverdueMarked"
  | "CreditNoteCreated"
  | "ProformaFinalized"
  | "CustomerCreated"
  | "CustomerUpdated"
  | "CustomerDeleted"
  | "CompanyUpdated"
  | "PaymentImportApplied"
  | "ExportRequested"
  | "GdprExport"
  | "GdprErasure"
  | "RecurringCreated"
  | "RecurringUpdated"
  | "RecurringDeleted"
  | "RecurringGenerated"
  | "LoginSucceeded";

export type AuditEntityType =
  | "Invoice"
  | "Customer"
  | "Company"
  | "Recurring"
  | "PaymentImport"
  | "Export"
  | "Gdpr"
  | "Auth";

export type AuditLogEntry = {
  id: string;
  occurredAt: string;
  action: AuditAction;
  entityType: string;
  entityId: string | null;
  entityNumber: string | null;
  actorUserId: string | null;
  actorClerkUserId: string | null;
  actorDisplayName: string | null;
  actorEmail: string | null;
  summary: string;
  detailsJson: string | null;
  companyId?: string | null;
};

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

export type CustomerLookupItem = {
  id: string;
  name: string;
  ico: string | null;
  city: string | null;
};

export type CustomerSummary = {
  id: string;
  name: string;
  ico: string | null;
  invoiceCount: number;
  draftCount: number;
  issuedCount: number;
  paidCount: number;
  overdueCount: number;
  cancelledCount: number;
  totalInvoiced: number;
  paidAmount: number;
  outstandingAmount: number;
  overdueAmount: number;
  currency: string;
  lastInvoiceDate: string | null;
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
  invoicePdfTemplate: "classic" | "modern" | "compact";
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

export type CompanyBank = {
  bankIban: string | null;
  bankBic: string | null;
  bankName: string | null;
  defaultPaymentMethod: string | null;
  defaultConstantSymbol: string | null;
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
  documentType: InvoiceDocumentType;
  flow: DocumentFlow;
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
  relatedInvoiceId: string | null;
  relatedInvoiceNumber: string | null;
  createdAt: string;
};

export type Invoice = {
  id: string;
  number: string;
  documentType: InvoiceDocumentType;
  flow: DocumentFlow;
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
  relatedInvoiceId: string | null;
  relatedInvoiceNumber: string | null;
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
  documentType?: InvoiceDocumentType | null;
  flow?: DocumentFlow | null;
  items: InvoiceItemInput[];
};

export type InvoiceStatusResponse = {
  id: string;
  number: string;
  documentType: InvoiceDocumentType;
  status: InvoiceStatus;
  paidAt: string | null;
  cancelReason: string | null;
  cancelledAt: string | null;
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
  documentType?: InvoiceDocumentType;
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

/** Normalized company from ARES (CZ) or ORSF / RPO + FS (SK). */
export type RegistryCompany = {
  country: string;
  source: string;
  ico: string;
  name: string;
  legalForm: string | null;
  dic: string | null;
  icDph: string | null;
  street: string | null;
  city: string | null;
  postalCode: string | null;
  countryCode: string;
  isVatPayer: boolean | null;
  commercialRegister: string | null;
};

export type RegistrySearchHit = {
  ico: string;
  name: string;
  city: string | null;
  icDph: string | null;
  isVatPayer: boolean | null;
  legalForm: string | null;
  source: string;
};

export type RegistrySearchResponse = {
  query: string;
  hits: RegistrySearchHit[];
};

export type VatVerification = {
  isValid: boolean;
  countryCode: string;
  vatNumber: string;
  name: string | null;
  address: string | null;
  source: string;
  userError: string | null;
};

export type FxRates = {
  base: string;
  date: string;
  rates: Record<string, number>;
  source: string;
  requestedDate?: string | null;
};

export type IbanLookup = {
  isValid: boolean;
  iban: string;
  countryCode: string | null;
  bankCode: string | null;
  bankName: string | null;
  bic: string | null;
  city: string | null;
  source: string;
};

export type FsVatPayer = {
  isVatPayer: boolean;
  ico: string;
  dic: string | null;
  icDph: string | null;
  name: string | null;
  source: string;
};

export type AddressNormalize = {
  displayName: string;
  street: string | null;
  city: string | null;
  postalCode: string | null;
  countryCode: string | null;
  lat: number | null;
  lon: number | null;
  source: string;
};

export type OrsrDocument = {
  title: string | null;
  submittedAt: string | null;
  type: string | null;
};

export type OrsrCompanySummary = {
  ico: string;
  name: string;
  fileReference: string | null;
  courtName: string | null;
  street: string | null;
  cityPostal: string | null;
  documentsCount: number;
  documents: OrsrDocument[];
  source: string;
};

export type AdisregAccount = {
  account: string;
  bankCode: string | null;
  publishedAt: string | null;
  isStandard: boolean;
};

export type AdisregStatus = {
  dic: string;
  status: string;
  isUnreliable: boolean;
  found: boolean;
  taxOfficeCode: string | null;
  unreliablePublishedAt: string | null;
  accounts: AdisregAccount[];
  source: string;
};

export type IsirProceeding = {
  name: string | null;
  courtFile: string | null;
  state: string | null;
  city: string | null;
  detailUrl: string | null;
};

export type IsirStatus = {
  ico: string;
  hasProceedings: boolean;
  count: number;
  proceedings: IsirProceeding[];
  source: string;
};

export type RegisterUzUnit = {
  ico: string;
  dic: string | null;
  name: string;
  street: string | null;
  city: string | null;
  postalCode: string | null;
  foundedAt: string | null;
  cancelledAt: string | null;
  statementsCount: number;
  annualReportsCount: number;
  source: string;
};

export type PostalValidate = {
  isValid: boolean;
  code: string;
  country: string;
  exists: boolean;
  city: string | null;
  displayName: string | null;
  normalizedCode: string | null;
  source: string;
};

export type AresVrPerson = {
  name: string;
  role: string | null;
  organ: string | null;
  since: string | null;
};

export type AresVrSummary = {
  ico: string;
  name: string | null;
  courtFile: string | null;
  registeredCapital: string | null;
  officers: AresVrPerson[];
  officersCount: number;
  source: string;
};

export type RegisterUzStatement = {
  id: number;
  type: string | null;
  periodFrom: string | null;
  periodTo: string | null;
  assembledAt: string | null;
  filedAt: string | null;
  reportsCount: number;
};

export type RegisterUzStatements = {
  ico: string;
  name: string | null;
  statements: RegisterUzStatement[];
  source: string;
};

export type BusinessDay = {
  country: string;
  from: string;
  addDays: number;
  result: string;
  adjusted: boolean;
  holidaysSkipped: string[];
  source: string;
};

export type RpvsOwner = {
  name: string;
  isPublicOfficial: boolean;
  validFrom: string | null;
  validTo: string | null;
};

export type RpvsRegistration = {
  id: number;
  name: string | null;
  validFrom: string | null;
  validTo: string | null;
  isActive: boolean;
  partnerId: number | null;
  fileNumber: number | null;
};

export type RpvsStatus = {
  ico: string;
  isRegistered: boolean;
  name: string | null;
  partnerId: number | null;
  fileNumber: number | null;
  portalUrl: string | null;
  registrations: RpvsRegistration[];
  beneficialOwners: RpvsOwner[];
  source: string;
};

export type RegistrSmluvContract = {
  subjectName: string | null;
  description: string | null;
  publishedAt: string | null;
  value: string | null;
  partyName: string | null;
  detailUrl: string | null;
};

export type RegistrSmluvStatus = {
  ico: string;
  found: boolean;
  totalCount: number;
  portalUrl: string;
  recent: RegistrSmluvContract[];
  source: string;
};

export type LeiRecord = {
  lei: string;
  legalName: string | null;
  jurisdiction: string | null;
  registeredAs: string | null;
  entityStatus: string | null;
  registrationStatus: string | null;
  nextRenewalDate: string | null;
  city: string | null;
  country: string | null;
  detailUrl: string | null;
};

export type LeiLookup = {
  query: string;
  found: boolean;
  count: number;
  records: LeiRecord[];
  source: string;
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

export type RecurringJobSettings = {
  enabled: boolean;
  intervalHours: number;
  startupDelaySeconds: number;
  disabledRecheckHours: number;
};

export type JobRunStatus = {
  lastRunAtUtc: string | null;
  lastMessage: string | null;
};

export type JobSettings = {
  overdueSync: OverdueJobSettings;
  reminderJob: ReminderJobSettings;
  recurringInvoices: RecurringJobSettings;
  overdueSyncRun: JobRunStatus;
  reminderJobRun: JobRunStatus;
  recurringInvoicesRun: JobRunStatus;
};

export type AdminHealth = {
  status: string;
  database: string;
  utc: string;
};

export type AdminCounts = {
  users: number;
  companies: number;
  customers: number;
  invoices: number;
  recurringTemplates: number;
  notes: number;
  catalogItems: number;
  auditLogs: number;
};

export type AdminInvoices = {
  draft: number;
  issued: number;
  paid: number;
  overdue: number;
  cancelled: number;
  openAmount: number;
  paidAmount: number;
  currency: string;
};

export type AdminUserSummary = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: string;
  lastSeenAt: string | null;
  isAdmin: boolean;
  companyName: string | null;
};

export type AdminOverview = {
  health: AdminHealth;
  counts: AdminCounts;
  invoices: AdminInvoices;
  recentUsers: AdminUserSummary[];
  jobs: JobSettings;
  generatedAtUtc: string;
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

export type AppUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  lastSeenAt: string | null;
  isAdmin?: boolean;
};

export type Note = {
  id: string;
  title: string;
  body: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  accessToken: string;
  expiresAt: string;
  user: AppUser;
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
