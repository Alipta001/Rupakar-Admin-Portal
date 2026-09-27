export type VendorStatus = 'Approved' | 'Under review' | 'Suspended' | 'Rejected' | 'Pending'
export type BankVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED'

export interface VendorBankAccount {
  id: string
  accountHolderName: string
  bankName: string
  branchName?: string | null
  ifscCode?: string
  accountType?: string
  maskedAccountNumber: string
  verificationStatus: BankVerificationStatus
  verifiedAt?: string | null
  rejectedAt?: string | null
  rejectionReason?: string | null
  submittedAt?: string
  updatedAt?: string
}

export interface Vendor {
  id: string
  code: string
  name: string
  businessName?: string
  sellerName?: string
  sellerEmail?: string
  sellerPhone?: string
  category: string
  location: string
  ownerName: string
  email: string
  phone: string
  status: VendorStatus
  rawStatus?: string
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
  bankAccount?: VendorBankAccount | null
}
