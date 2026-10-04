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
