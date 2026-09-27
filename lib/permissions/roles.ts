import { AdminRole } from '@/types/auth'

export const ROLES: Record<AdminRole, { label: string; description: string }> = {
  SUPER_ADMIN: {
    label: 'Super Administrator',
    description: 'Full marketplace access across all modules, configuration, and security settings.',
  },
  ADMIN: {
    label: 'Administrator',
    description: 'Standard administrative access to oversee operations, catalog, and customers.',
  },
  admin: {
    label: 'Administrator',
    description: 'Standard administrative access to oversee operations, catalog, and customers.',
  },

  FINANCE_MANAGER: {
    label: 'Finance Manager',
    description: 'Oversees payments, payouts, refunds, commissions, and invoicing.',
  },
  CONTENT_MANAGER: {
    label: 'Content Manager',
    description: 'Manages catalog moderation, categories, brands, authenticity, and reviews.',
  },
  SUPPORT: {
    label: 'Support Representative',
    description: 'Assists customers and vendors, handles tickets, and views order status.',
  },
}
