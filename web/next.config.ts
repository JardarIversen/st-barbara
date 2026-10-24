import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:lang/messetider/bispevisitas-2026-10-08t09-00-00-02-00",
        destination: "/:lang/kunngjoringer/bispevisitas-8-11-oktober",
        permanent: true,
      },
      {
        source: "/index.php/2026/06/11/pamelding-til-katekese",
        destination: "/nb/katekese",
        permanent: true,
      },
      // The old WordPress site lived on this domain, and search engines still list its pages.
      // Vercel itself blocks /wp-content, so its PDFs cannot be redirected from here.
      {
        source: "/index.php/:page(kunngjoringer|messetider|kontakt|katekese|innlegg|donasjoner)",
        destination: "/nb/:page",
        permanent: true,
      },
      {
        source: "/index.php/katekese-2",
        destination: "/nb/katekese",
        permanent: true,
      },
      {
        source: "/index.php/:page(menighetsrad|st-barbara|om)",
        destination: "/nb/om",
        permanent: true,
      },
      {
        source: "/index.php/event/:path*",
        destination: "/nb/messetider",
        permanent: true,
      },
      {
        source: "/index.php/:section(category|\\d{4})/:path*",
        destination: "/nb/innlegg",
        permanent: true,
      },
      {
        source: "/index.php/:path*",
        destination: "/nb",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
};

export default nextConfig;
