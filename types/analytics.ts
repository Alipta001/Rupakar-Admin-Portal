export interface AnalyticsData {
  range: string
  kpis: {
    revenue: number
    ordersCount: number
    aov: number
    growthRate: number
    formattedRevenue: string
    formattedAov: string
  }
  salesTrends: Array<{
    date: string
    revenue: number
    orders: number
  }>
  categoryPerformance: Array<{
    category: string
    revenue: number
    orders: number
    percentage: number
  }>
  vendorPerformance: Array<{
    vendorId: string
    vendorName: string
    gmv: number
    ordersCount: number
    commissionEarned: number
  }>
}
