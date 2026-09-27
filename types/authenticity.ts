export type AuthenticityStatus = 'PENDING' | 'VERIFIED' | 'REJECTED'

export interface AuthenticityRecord {
  id: string
  _id?: string
  productId: string
  productTitle?: string
  productSku?: string
  productImage?: string
  vendorId: string
  vendorName?: string
  artisanName?: string
  craftType?: string
  region?: string
  district?: string
  certificateNumber?: string
  giTagNumber?: string
  status: AuthenticityStatus
  verificationNotes?: string
  verifiedAt?: string
  verifiedBy?: string
  qrCodeUrl?: string
  createdAt: string
}
