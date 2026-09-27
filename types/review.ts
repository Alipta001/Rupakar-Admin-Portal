export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface Review {
  id: string
  _id?: string
  productId: string
  productTitle?: string
  productImage?: string
  userId: string
  customerName?: string
  customerEmail?: string
  rating: number
  title?: string
  comment: string
  status: ReviewStatus
  isVerifiedPurchase?: boolean
  helpfulVotes?: number
  createdAt: string
  updatedAt?: string
}
