export interface Category {
  id: string
  _id?: string
  name: string
  slug: string
  description?: string
  parentId?: string | null
  parentCategory?: {
    id: string
    name: string
  } | null
  image?: string
  isActive?: boolean
  productsCount?: number
  commissionRate?: number
  sortOrder?: number
  createdAt?: string
  updatedAt?: string
}

export interface Brand {
  id: string
  _id?: string
  name: string
  slug: string
  description?: string
  logo?: string
  website?: string
  isActive?: boolean
  productsCount?: number
  createdAt?: string
  updatedAt?: string
}
