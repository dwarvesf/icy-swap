/** @type {import('next').NextConfig} */

// Security headers. Kept conservative on purpose: only clickjacking / sniffing /
// referrer protections that do NOT restrict script or network origins, so wallet
// connect + RPC calls are unaffected. A full Content-Security-Policy (script-src /
// connect-src allowlist) needs to be tested against WalletConnect + the Base RPC
// endpoints before it can be turned on, so it is left as a follow-up.
// If the swap widget is ever legitimately embedded (e.g. inside icy.so), relax
// frame-ancestors to that specific origin instead of 'none'.
const securityHeaders = [
  // A first-visit plain-HTTP request to a wallet dapp is the highest-value
  // phish there is: MITM serves a pixel-perfect fake swap page.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
]

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

module.exports = nextConfig
