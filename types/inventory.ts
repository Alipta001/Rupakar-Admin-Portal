export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock'

export interface InventoryItem {
  id: string
  productId: string
  productTitle: string
  sku: string
  vendorName: string
  vendorId?: string
  category: string
  availableStock: number
  reservedStock: number
  safetyThreshold: number
  status: StockStatus
  lastUpdated: string
}
