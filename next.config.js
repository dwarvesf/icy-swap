/** @type {import('next').NextConfig} */

// Security headers, including the full Content-Security-Policy that was
// deferred until it could be tested against the real wallet flows. Every
// origin below is earned by a specific dependency; when one goes away,
// remove its line.
//
//   'unsafe-inline' in script-src: the Pages Router injects inline bootstrap
//   scripts into static HTML, and static pages cannot carry per-request
//   nonces. External script ORIGINS are still locked to 'self', which is the
//   attack that matters (no third-party script can load).
//   'unsafe-inline' in style-src: ConnectKit styles itself with css-in-js.
//   connect-src: the backend API, the Base RPC, and WalletConnect's relay +
//   wallet-registry endpoints, all observed in the tested connect flow.
//   frame-src: WalletConnect's Verify iframe.
//
// If the swap widget is ever legitimately embedded (e.g. inside icy.so),
// relax frame-ancestors to that specific origin instead of 'none'.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://imagedelivery.net https://explorer-api.walletconnect.com",
  "font-src 'self'",
  // WalletConnect moved relay + verify to .org (js-2.17 dials
  // relay.walletconnect.org); the .com twins stay for older SDK paths.
  "connect-src 'self' https://api.icy.so https://mainnet.base.org wss://relay.walletconnect.org https://relay.walletconnect.org wss://relay.walletconnect.com https://relay.walletconnect.com https://explorer-api.walletconnect.com https://pulse.walletconnect.org https://api.web3modal.org",
  "frame-src https://verify.walletconnect.com https://verify.walletconnect.org",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ')

const securityHeaders = [
  // A first-visit plain-HTTP request to a wallet dapp is the highest-value
  // phish there is: MITM serves a pixel-perfect fake swap page.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Content-Security-Policy', value: csp },
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
