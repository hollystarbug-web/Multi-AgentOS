/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Don't bundle these — let Node resolve them at runtime.
    // ssh2 ships a native .node binary that webpack can't process.
    serverComponentsExternalPackages: ['ssh2'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ]
  },
}

export default nextConfig
