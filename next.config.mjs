/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "images.unsplash.com",
      "cdn-icons-png.flaticon.com",
      "cdn3d.iconscout.com",
      "img.icons8.com",
    ],
    unoptimized: false,
  },
  async rewrites() {
    return [
      { source: '/privacy-policy', destination: '/privacy' },
    ];
  },
};

export default nextConfig;
