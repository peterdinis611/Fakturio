import "./landing.css";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link rel="preconnect" href="https://api.fontshare.com" />
      <link
        rel="preconnect"
        href="https://cdn.fontshare.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://api.fontshare.com/v2/css?f[]=chillax@400,500,600&display=swap"
        rel="stylesheet"
      />
      <style>{`:root { --font-chillax: "Chillax", sans-serif; }`}</style>
      {children}
    </>
  );
}
