const fontSans =
  "var(--font-bricolage), var(--font-plex), ui-sans-serif, system-ui, sans-serif";

const sharedElements = {
  rootBox: "!w-full",
  cardBox: "!w-full !shadow-none",
  card: "!bg-transparent !shadow-none !border-0",
  headerTitle: "!tracking-tight !font-semibold",
  headerSubtitle: "!text-[0.9375rem]",
  socialButtonsBlockButton:
    "!h-11 !rounded-full !font-medium !shadow-none !border transition-transform hover:-translate-y-px",
  socialButtonsBlockButtonText: "!font-medium",
  dividerLine: "!opacity-70",
  dividerText: "!text-[0.75rem] !uppercase !tracking-[0.08em]",
  formFieldLabel: "!text-[0.8125rem] !font-medium",
  formFieldInput:
    "!h-11 !rounded-[0.85rem] !shadow-none !border transition-shadow",
  formButtonPrimary:
    "!h-11 !rounded-full !font-semibold !shadow-none transition-transform hover:-translate-y-px active:translate-y-0",
  footerActionLink: "!font-semibold underline-offset-2 hover:underline",
  formFieldAction: "!text-[0.8125rem] !font-medium",
  otpCodeFieldInput: "!rounded-[0.75rem]",
  alternativeMethodsBlockButton: "!rounded-full !h-10",
  footer: "!hidden",
  footerAction: "!hidden",
} as const;

export const fakturioClerkLight = {
  variables: {
    colorPrimary: "#0f766e",
    colorPrimaryForeground: "#f7f8fa",
    colorForeground: "#12151a",
    colorMutedForeground: "#5a6270",
    colorBackground: "#f7f8fa",
    colorInput: "#eef0f3",
    colorInputForeground: "#12151a",
    colorNeutral: "#5a6270",
    colorBorder: "#cdd2da",
    colorMuted: "#e8eaee",
    colorDanger: "#b91c1c",
    colorRing: "#0f766e",
    colorShadow: "transparent",
    borderRadius: "0.9rem",
    fontFamily: fontSans,
    fontFamilyButtons: fontSans,
    fontSize: "0.9375rem",
  },
  elements: {
    ...sharedElements,
    socialButtonsBlockButton: `${sharedElements.socialButtonsBlockButton} !bg-[#f7f8fa] !border-[#cdd2da] !text-[#12151a] hover:!bg-[#eef0f3]`,
    socialButtonsBlockButtonText: `${sharedElements.socialButtonsBlockButtonText} !text-[#12151a]`,
    formFieldInput: `${sharedElements.formFieldInput} !bg-[#eef0f3] !border-[#cdd2da] !text-[#12151a] focus:!border-[#0f766e]`,
    formButtonPrimary: `${sharedElements.formButtonPrimary} !bg-[#12151a] !text-[#f7f8fa] hover:!bg-[#0f766e] hover:!text-[#f7f8fa]`,
  },
};

export const fakturioClerkDark = {
  variables: {
    colorPrimary: "#2dd4bf",
    colorPrimaryForeground: "#0e1a18",
    colorForeground: "#f2f2ee",
    colorMutedForeground: "#c4c4ba",
    colorBackground: "#1a1a18",
    colorInput: "#242422",
    colorInputForeground: "#f2f2ee",
    colorNeutral: "#c4c4ba",
    colorBorder: "#3f3f38",
    colorMuted: "#2a2a26",
    colorDanger: "#f87171",
    colorRing: "#2dd4bf",
    colorShadow: "transparent",
    borderRadius: "0.9rem",
    fontFamily: fontSans,
    fontFamilyButtons: fontSans,
    fontSize: "0.9375rem",
  },
  elements: {
    ...sharedElements,
    /* OAuth: light chip + dark ink — never inherit page foreground */
    socialButtonsBlockButton: `${sharedElements.socialButtonsBlockButton} !bg-[#f2f2ee] !border-[#f2f2ee] !text-[#111110] hover:!bg-white`,
    socialButtonsBlockButtonText: `${sharedElements.socialButtonsBlockButtonText} !text-[#111110]`,
    formFieldInput: `${sharedElements.formFieldInput} !bg-[#242422] !border-[#33332e] !text-[#f2f2ee] focus:!border-[#2dd4bf]`,
    /* Primary: teal brand, dark ink — matches colorPrimaryForeground */
    formButtonPrimary: `${sharedElements.formButtonPrimary} !bg-[#2dd4bf] !text-[#0e1a18] hover:!bg-[#5eead4] hover:!text-[#0e1a18]`,
  },
};

export type FakturioClerkAppearance =
  | typeof fakturioClerkLight
  | typeof fakturioClerkDark;

export function fakturioClerkAppearance(isDark: boolean): FakturioClerkAppearance {
  return isDark ? fakturioClerkDark : fakturioClerkLight;
}
