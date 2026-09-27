export type AdminRole =
  | 'admin'
  | 'ADMIN'
  | 'SUPER_ADMIN'
  | 'SUPPORT'
  | 'FINANCE_MANAGER'
  | 'CONTENT_MANAGER'


export interface AdminUser {
  id: string
  name: string
  email: string
  role: AdminRole
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE'
  avatarUrl?: string
  lastSignIn?: string
  createdAt?: string
}

export interface AdminSession {
  name: string
  email: string
  role: string
  status: 'Active' | 'Suspended'
  lastSignIn: string
  token?: string
}
