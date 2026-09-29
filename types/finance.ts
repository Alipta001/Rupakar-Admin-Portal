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
}

export interface EligibleSettlement {
  vendorId: string
  vendorName: string
  eligibleAmount: number
  eligibleAmountPaise: number
  entryCount: number
  entryIds: string[]
  bankDetails?: BankSnapshot | null
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
