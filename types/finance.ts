export type CommissionRuleSource = 'Product' | 'Vendor' | 'Category' | 'Global'

export interface Commission {
  id: string
  orderNumber: string
  vendorName: string
  productTitle: string
  rate: number
  amount: number
  formattedAmount: string
  ruleSource: CommissionRuleSource
  status: 'Collected' | 'Pending' | 'Reversed'
  date: string
}

export type PayoutStatus = 'Ready to process' | 'Processing' | 'Completed' | 'Failed' | 'On hold'

export interface BankSnapshot {
  accountHolderName?: string | null
  accountNumberMasked?: string | null
  ifsc?: string | null
  bankName?: string | null
}

export interface Payout {
  id: string
  payoutNumber: string
  vendorName: string
  vendorId?: string
  grossAmount: number
  commissionAmount: number
  netPayable: number
  formattedNetPayable: string
  status: PayoutStatus
  paymentReference?: string
  bankAccountLast4?: string
  bankSnapshot?: BankSnapshot
  referenceId?: string
  rawStatus?: string
  provider?: string
  failureReason?: string
  processedAt?: string | null
  date: string
  alreadyPaidAmount?: number
  totalPayable?: number
  metadata?: Record<string, unknown>
}

export interface EligibleSettlement {
  vendorId: string
  vendorName: string
  eligibleAmount: number
  eligibleAmountPaise: number
  alreadyPaidAmount?: number
  alreadyPaidAmountPaise?: number
  totalPayable?: number
  totalPayablePaise?: number
  remainingAmount?: number
  remainingAmountPaise?: number
  entryCount: number
  entryIds: string[]
  ordersCount?: number
  earliestEligibleAt?: string | null
  eligibleSince?: string | null
  status?: string
  existingPayoutId?: string | null
  bankDetails?: (BankSnapshot & { isVerified?: boolean }) | null
}

export interface CommissionConfigRule {
  id: string
  _id?: string
  scope: 'PRODUCT' | 'VENDOR' | 'CATEGORY' | 'GLOBAL'
  productId?: any
  vendorId?: any
  categoryId?: any
  commissionType?: 'PERCENTAGE' | 'FIXED'
  rate: number
  fixedAmount?: number
  minPrice?: number
  maxPrice?: number | null
  description?: string
  active: boolean
  effectiveFrom?: string | null
  effectiveTo?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface SettlementReadinessVendor {
  vendorId: string
  vendorName: string
  eligibleAmount: number
  eligibleAmountPaise: number
  pendingAmount: number
  pendingAmountPaise: number
  onHoldAmount: number
  onHoldAmountPaise: number
  totalPayable: number
  totalPayablePaise: number
  ordersCount: number
  earliestEligibleAt?: string | null
  eligibleSince?: string | null
  status: 'READY' | 'ON_HOLD' | 'PENDING' | 'ACTION_REQUIRED'
  ineligibilityReason?: string
  ineligibilityDetails?: string
  bankDetails?: (BankSnapshot & { isVerified?: boolean }) | null
}

export interface FinanceOverview {
  vendorPayable: { amount: number; paise: number }
  eligibleSettlements: { amount: number; paise: number; vendorCount: number }
  onHoldSettlements: { amount: number; paise: number; vendorCount: number }
  pendingSettlements: { amount: number; paise: number; vendorCount: number }
  completedPayouts: { amount: number; paise: number; count: number }
}

export interface Invoice {
  id: string
  invoiceNumber: string
  type: 'Customer' | 'Vendor Commission' | 'Packing Slip'
  orderNumber: string
  recipientName: string
  amount: number
  formattedAmount: string
  status: 'Generated' | 'Pending' | 'Downloaded'
  generatedDate: string
  downloadUrl?: string
}

