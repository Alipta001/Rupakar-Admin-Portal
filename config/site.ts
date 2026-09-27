export const siteConfig = {
  name: 'Rupakar',
  portalName: 'ADMIN PORTAL',
  description: 'Rupakar Marketplace Operations & Administration Portal',
  version: '1.0.0',
  apiBaseUrl: (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1').replace(/\/+$/, ''),
  supportEmail: 'ops@rupakar.com',
  links: {
    storefront: 'https://rupakar.com',
    sellerPortal: 'https://seller.rupakar.com',
  },
}
