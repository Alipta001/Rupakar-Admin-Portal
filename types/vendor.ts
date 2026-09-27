export type VendorStatus = 'Approved' | 'Under review' | 'Suspended' | 'Rejected' | 'Pending'

export interface Vendor {
  id: string
  code: string
  name: string
  category: string
  location: string
  ownerName: string
  email: string
  phone: string
  status: VendorStatus
  verified: boolean
  productsCount: number
  ordersCount: number
  grossMerchandiseValue: number
  formattedGmv: string
  initials: string
  avatarTheme?: number
  commissionRate?: number
  payoutPending?: number
  rating?: number
  joinedDate?: string
}
