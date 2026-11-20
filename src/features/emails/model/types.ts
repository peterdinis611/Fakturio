export type EmailStatus = {
  configured: boolean;
  provider: string;
  fromAddress: string | null;
  fromName: string | null;
  hasPublicAppBaseUrl: boolean;
  simulated?: boolean;
};

export type SendTestEmailResponse = {
  to: string;
  provider: string;
};

export type SendInvoiceEmailInput = {
  to?: string | null;
  subject?: string | null;
  message?: string | null;
  attachPdf?: boolean;
  includePublicLink?: boolean;
};

export type SendInvoiceEmailResponse = {
  invoiceId: string;
  number: string;
  to: string;
  provider: string;
  pdfAttached: boolean;
  publicLinkIncluded: boolean;
};
