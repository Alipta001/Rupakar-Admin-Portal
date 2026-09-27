export type UserStatus = 'Active' | 'Suspended' | 'Pending' | 'Inactive'

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  status: UserStatus
  verified: boolean
  ordersCount: number
  totalSpent: number
  registeredDate: string
  lastActive?: string
  address?: {
    street?: string
    city?: string
    state?: string
    pincode?: string
  }
}
