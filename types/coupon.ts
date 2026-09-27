export type CouponDiscountType = 'PERCENTAGE' | 'FIXED'

export interface Coupon {
  id: string
  _id?: string
  code: string
  description?: string
  discountType: CouponDiscountType
  discountValue: number
  minOrderValue?: number
  maxDiscount?: number
  startDate?: string
  endDate?: string
  usageLimit?: number
  usageCount: number
  isActive: boolean
  applicableCategories?: string[]
  applicableVendors?: string[]
  createdAt?: string
}
