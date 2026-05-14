import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "pub-8f1538554ef5413f9b6101e5d67fd1ea.r2.dev",
                pathname: "/**",
            },
        ],
    },
};

export default nextConfig;
