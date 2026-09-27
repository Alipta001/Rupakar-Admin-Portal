export type ProductStatus = 'Approved' | 'Published' | 'Under review' | 'Draft' | 'Rejected' | 'Archived' | 'Processing'

export type ModerationStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' | 'UNPUBLISHED' | 'ARCHIVED'

export interface ProductImageDetail {
  id?: string
  _id?: string
  productId?: string
  storageKey?: string
  url: string
  altText?: string
  sortOrder?: number
  isPrimary?: boolean
  width?: number | null
  height?: number | null
  fileSize?: number | null
  mimeType?: string | null
  status?: string
}

export interface ProductVariantDetail {
  id?: string
  _id?: string
  sku: string
  barcode?: string
  price: number
  compareAtPrice?: number | null
  costPrice?: number | null
  stock: number
  availableStock?: number
  reservedStock?: number
  weight?: number | null
  dimensions?: {
    length?: number
    width?: number
    height?: number
  } | null
  attributes?: Record<string, string>
  status?: string
}

export interface ProductVendorDetail {
  id?: string
  _id?: string
  businessName?: string
  legalName?: string
  description?: string
  website?: string
  originState?: string
  originDistrict?: string
}

export interface ProductBrandDetail {
  id?: string
  _id?: string
  name?: string
  slug?: string
  logo?: string
}

export interface ProductAuthenticityDetail {
  reference?: string
  status?: 'VERIFIED' | 'UNVERIFIED' | 'PENDING'
}

export interface ProductShippingDetail {
  originState?: string
  originDistrict?: string
  deliveryDays?: number
  freeShipping?: boolean
}

export interface ProductTaxDetail {
  taxable?: boolean
  taxCode?: string
  gstIncluded?: boolean
}

export interface ProductReviewerDetail {
  id?: string
  name?: string
  email?: string
  role?: string
}

export interface Product {
  id: string
  _id?: string
  sku: string
  title: string
  name?: string
  slug?: string
  shortDescription?: string | null
  description?: string | null
  vendorName: string
  vendorId?: string
  vendor?: ProductVendorDetail | null
  category: any
  categoryId?: string | null
  categoryName?: string | null
  subcategoryId?: string | null
  subcategory?: { id?: string; name?: string; slug?: string } | null
  brandId?: string | null
  brand?: ProductBrandDetail | null
  price: number
  formattedPrice: string
  compareAtPrice?: number | null
  stock: number
  availableStock?: number
  reservedStock?: number
  status: ProductStatus
  moderationStatus?: ModerationStatus
  isPublished?: boolean
  thumbnail?: string
  image?: string | null
  images?: ProductImageDetail[]
  variants?: ProductVariantDetail[]
  dimensions?: { length?: number; width?: number; height?: number } | string | null
  weight?: number | null
  tags?: string[]
  attributes?: Record<string, any>
  authenticity?: ProductAuthenticityDetail | null
  shipping?: ProductShippingDetail | null
  tax?: ProductTaxDetail | null
  featured?: boolean
  craft?: string
  origin?: string
  artisan?: string
  rating?: number | null
  reviews?: number | null
  reviewsCount?: number
  story?: string | null
  material?: string | null
  care?: string | null
  publishedAt?: string | null
  reviewedBy?: ProductReviewerDetail | string | null
  reviewedAt?: string | null
  rejectionReason?: string | null
  createdAt?: string
  updatedAt?: string
}
