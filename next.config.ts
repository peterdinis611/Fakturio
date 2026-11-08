import type { NextConfig } from "next";
import path from "path";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const apiBase =
  process.env.API_BASE_URL?.replace(/\/$/, "") || "http://localhost:5148";

const publicApiBase =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || apiBase;

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";

const isProd = process.env.NODE_ENV === "production";

type ImageProtocol = "http" | "https";

type RemotePattern = {
  protocol: ImageProtocol;
  hostname: string;
  pathname: string;
  port?: string;
};

function parseOrigin(url: string): {
  protocol: ImageProtocol;
  hostname: string;
  port?: string;
} | null {
  try {
    const u = new URL(url);
    const protocol = u.protocol === "https:" ? "https" : "http";
    const port = u.port || undefined;
    return { protocol, hostname: u.hostname, port };
  } catch {
    return null;
  }
}

function uploadPatterns(...origins: string[]): RemotePattern[] {
  const seen = new Set<string>();
  const out: RemotePattern[] = [];

  for (const origin of origins) {
    const parsed = parseOrigin(origin);
    if (!parsed) continue;
    const key = `${parsed.protocol}://${parsed.hostname}:${parsed.port ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      protocol: parsed.protocol,
      hostname: parsed.hostname,
      ...(parsed.port ? { port: parsed.port } : {}),
      pathname: "/uploads/**",
    });
  }

  return out;
}

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "X-Permitted-Cross-Domain-Policies",
    value: "none",
  },
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  trailingSlash: false,

  /** Quiet cross-origin noise when opening the app via LAN IP in dev. */
  allowedDevOrigins: ["127.0.0.1", "localhost"],

  turbopack: {
    root: path.join(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: uploadPatterns(
      apiBase,
      publicApiBase,
      appUrl,
      "http://localhost:5148",
      "http://127.0.0.1:5148",
      "http://localhost:3000",
    ),
  },

  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "recharts",
      "motion",
      "@tanstack/react-table",
    ],
  },

  logging: {
    fetches: {
      fullUrl: !isProd,
    },
  },

  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: `${apiBase}/uploads/:path*`,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/icon.svg",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/apple-icon",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, max-age=3600",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
