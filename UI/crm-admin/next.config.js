const path = require('path');

/** @type {import('next').NextConfig} */
const MARKETPLACE_URL = process.env.MARKETPLACE_URL || 'https://crm-soft-ui.vercel.app';

module.exports = {
  output: 'standalone',
  async rewrites() {
    return [
      // Proxy all /marketplace/* requests to the marketplace Next.js deployment
      {
        source: '/marketplace/:path*',
        destination: `${MARKETPLACE_URL}/marketplace/:path*`,
      },
    ];
  },
  // Prevent browser from caching HTML pages so stale chunk URLs never cause 404s
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
        ],
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: [
    '@coreui/ui',
    '@coreui/ui-react',
    '@coreui/theme',
    '@coreui/layout',
    // MSW v2 and its ESM-only dependencies need transformation in jest
    'msw',
    '@mswjs/interceptors',
    'until-async',
    'rettime',
  ],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@coreui/ui':       path.resolve(__dirname, 'lib/coreui/packages/ui/src'),
      '@coreui/ui-react': path.resolve(__dirname, 'lib/coreui/packages/ui-react/src'),
      '@coreui/theme':    path.resolve(__dirname, 'lib/coreui/packages/theme/src'),
      '@coreui/layout':   path.resolve(__dirname, 'lib/coreui/packages/layout/src'),
    };
    return config;
  },
};
