export interface DashboardMetrics {
  grossRevenue: number
  formattedGrossRevenue: string
  totalOrders: number
  activeCustomers: number
  totalVendors: number
  pendingVendors: number
  totalProducts: number
  pendingProducts: number
  publishedProducts: number
  lowStock: number
  outOfStock: number
}

export interface DashboardAlert {
  id: string
  title: string
  subtitle: string
  href: string
  theme: string
  icon: string
  count: number
}

export interface RecentOrderItem {
  id: string
  orderId: string
  customer: string
  item: string
  vendor: string
  amount: number
  formattedAmount: string
  status: string
  date: string
}

export interface TopVendorItem {
  id: string
  name: string
  type: string
  amount: number
  formattedAmount: string
  initials: string
}

export interface DashboardOverviewData {
  metrics: DashboardMetrics
  ordersBreakdown: Record<string, number>
  alerts: DashboardAlert[]
  recentOrders: RecentOrderItem[]
  topVendors: TopVendorItem[]
  revenueTrend?: Array<{
    date: string
    revenue: number
    orders: number
  }>
}
