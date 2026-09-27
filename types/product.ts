export type ProductStatus = 'Approved' | 'Under review' | 'Draft' | 'Rejected' | 'Archived' | 'Processing'

export type ModerationStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'

export interface Product {
  id: string
  sku: string
  title: string
  vendorName: string
  vendorId?: string
  category: string
  price: number
  formattedPrice: string
  compareAtPrice?: number
  stock: number
  status: ProductStatus
  moderationStatus?: ModerationStatus
  isPublished?: boolean
  thumbnail?: string
  craft?: string
  origin?: string
  rating?: number
  reviewsCount?: number
  createdAt?: string
}
