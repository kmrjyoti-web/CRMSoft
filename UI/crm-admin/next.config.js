const path = require('path');

/** @type {import('next').NextConfig} */
module.exports = {
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
