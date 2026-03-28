import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https?.*(\/api\/v1\/marketplace\/feed)/,
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'marketplace-feed', expiration: { maxEntries: 50, maxAgeSeconds: 300 } },
    },
    {
      urlPattern: /^https?.*\.(png|jpg|jpeg|webp|svg|gif|avif)/,
      handler: 'CacheFirst',
      options: { cacheName: 'marketplace-images', expiration: { maxEntries: 200, maxAgeSeconds: 86400 } },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'pub-c8f7f8134f02427ea1e58cd11b27ebf2.r2.dev' },
      { protocol: 'https', hostname: '*.r2.dev' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
    ],
  },
};

export default withPWA(nextConfig);
