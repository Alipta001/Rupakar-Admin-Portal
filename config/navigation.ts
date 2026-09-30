import {
  Activity,
  ArrowDownRight,
  BarChart3,
  Box,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  FileText,
  LayoutDashboard,
  PackageCheck,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Store,
  Tag,
  TicketCheck,
  TrendingUp,
  UserRound,
  Users,
  WalletCards,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  count?: string
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { label: 'Orders', href: '/orders', icon: ShoppingBag },
      { label: 'Products', href: '/products', icon: Box },
      { label: 'Inventory', href: '/inventory', icon: PackageCheck },
      { label: 'Categories', href: '/categories', icon: Tag },
      { label: 'Brands', href: '/brands', icon: Tag },
      { label: 'Coupons', href: '/coupons', icon: TicketCheck },
    ],
  },
  {
    label: 'Marketplace',
    items: [
      { label: 'Vendors', href: '/vendors', icon: Store },
      { label: 'Customers', href: '/users', icon: Users },
      { label: 'Reviews', href: '/reviews', icon: ClipboardList },
      { label: 'Authenticity', href: '/authenticity', icon: ShieldCheck },
      { label: 'Support', href: '/support', icon: UserRound },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Payments', href: '/payments', icon: CreditCard },
      { label: 'Refunds', href: '/refunds', icon: ArrowDownRight },
      { label: 'Commissions', href: '/commissions', icon: CircleDollarSign },
      { label: 'Payouts', href: '/payouts', icon: WalletCards },
      { label: 'Invoices', href: '/invoices', icon: FileText },
    ],
  },
  {
    label: 'Manage',
    items: [
      { label: 'Notifications', href: '/notifications', icon: Activity },
      { label: 'Analytics', href: '/analytics', icon: TrendingUp },
      { label: 'Audit logs', href: '/audit-logs', icon: Activity },
      { label: 'Settings', href: '/settings', icon: Settings2 },
    ],
  },
]

export const isKnownRoute = (pathname: string): boolean => {
  if (pathname === '/' || pathname === '/dashboard') return true
  return navGroups.some(group => group.items.some(item => item.href === pathname))
}
