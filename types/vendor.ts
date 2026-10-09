export type VendorStatus = 'Approved' | 'Under review' | 'Suspended' | 'Rejected' | 'Pending'
export type BankVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED'
export type DocumentVerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface VendorDocument {
  id: string
  vendorId?: string
  documentType: string
  documentNumber?: string
  storageKey?: string
  status: DocumentVerificationStatus
  submittedAt?: string
  verifiedAt?: string | null
  rejectionReason?: string | null
  viewUrl?: string | null
  downloadUrl?: string | null
}

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
  pickupAddress?: VendorPickupLocation | null
}

export type PickupRegistrationStatus = 'PENDING' | 'REGISTERED' | 'FAILED'
export type PickupAdminStatus = 'PENDING' | 'APPROVED' | 'DEACTIVATED' | 'ARCHIVED'

export interface VendorPickupLocation {
  vendorId: string
  businessName: string
  sellerName?: string
  sellerEmail?: string
  sellerPhone?: string
  pickupLocationName: string
  contactPerson: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  country?: string
  shiprocketPickupId?: string | null
  registrationStatus: PickupRegistrationStatus
  adminStatus: PickupAdminStatus
  registeredAt?: string | null
  registrationError?: string | null
  updatedAt?: string
}

