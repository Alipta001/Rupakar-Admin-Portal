export type ReturnStatus =
  | 'REQUESTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'PICKUP_SCHEDULED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'RETURN_RECEIVED'
  | 'INSPECTION_PENDING'
  | 'INSPECTION_PASSED'
  | 'INSPECTION_FAILED'
  | 'DISPOSITION_PENDING'
  | 'DISPOSITION_COMPLETED'
  | 'DISPUTED'
  | 'APPROVED_FOR_REFUND'
  | 'REFUND_PENDING'
  | 'REFUND_PROCESSING'
  | 'REFUNDED'
  | 'REFUND_FAILED'
  | 'MANUAL_PAYOUT_PENDING'
  | 'MANUAL_PAYOUT_PROCESSING'
  | 'REPLACEMENT_PENDING'
  | 'REPLACEMENT_SHIPPED'
  | 'REPLACEMENT_DELIVERED'
  | 'REJECTED'
  | 'REJECTED_AFTER_INSPECTION'
  | 'CANCELLED'
  | 'CLOSED'

export type AdminDispositionCategory =
  | 'RESTOCKABLE'
  | 'DAMAGED'
  | 'DEFECTIVE'
  | 'UNSALEABLE'
  | 'MISSING_PARTS'
  | 'WRONG_ITEM'
  | 'AUTHENTICITY_HOLD'
  | 'SUSPECTED_COUNTERFEIT'
  | 'TAMPERED'
  | 'AUTHENTICITY_MISMATCH'

export interface AdminReturnDispositionItem {
  disposedAt?: string
  disposedBy?: string
  disposition: AdminDispositionCategory
  returnedQuantity: number
  acceptedQuantity: number
  rejectedQuantity: number
  restockableQuantity: number
  nonRestockableQuantity: number
  reason?: string
  notes?: string
  restocked?: boolean
  restockedAt?: string
}

export interface AdminReturnDisposition {
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED'
  disposedAt?: string
  disposedBy?: string
  notes?: string
  totalRestockableQuantity?: number
  totalNonRestockableQuantity?: number
  items?: AdminReturnDispositionItem[]
}

export interface ReturnItemSnapshot {
  _id: string
  returnId?: string
  orderItemId?: string
  productId?: string
  variantId?: string
  title?: string
  productName?: string
  quantity: number
  unitPrice: number
  lineTotal: number
  returnReason?: string
  customerComments?: string
  condition?: string
  productSnapshot?: {
    title?: string
    sku?: string
    thumbnail?: string
  }
  disposition?: AdminReturnDispositionItem | null
}

export interface ReturnInspection {
  inspectedAt?: string
  inspectedBy?: string
  result?: 'PASSED' | 'FAILED'
  condition?: 'INTACT' | 'DAMAGED' | 'USED' | 'DEFECTIVE' | 'MISSING_PARTS' | 'WRONG_ITEM'
  notes?: string
}

export interface ReturnDispute {
  disputedAt?: string
  disputedBy?: string
  reason?: string
  description?: string
  evidence?: string[]
  status?: 'PENDING_ADMIN_REVIEW' | 'UPHELD_CUSTOMER' | 'UPHELD_SELLER' | 'MORE_INFO_REQUESTED'
  decision?: 'UPHOLD_CUSTOMER' | 'UPHOLD_SELLER' | 'REQUEST_MORE_INFO'
  decisionReason?: string
  decidedBy?: string
  decidedAt?: string
  adminNotes?: string
}

export interface ReturnResolution {
  action?: 'RETURN_REFUND' | 'REPLACEMENT' | 'REJECT_RETURN'
  resolvedBy?: string
  resolvedAt?: string
  notes?: string
  calculatedRefundAmount?: number
}

export interface StatusHistoryEntry {
  status: ReturnStatus
  changedAt: string
  changedBy?: string
  actorType?: 'CUSTOMER' | 'VENDOR' | 'ADMIN' | 'SYSTEM'
  notes?: string
}

export interface CalculatedRefundBreakdown {
  amount: number
  currency?: string
  breakdown?: {
    itemSubtotal: number
    discountAdjustment: number
    taxAdjustment: number
    shippingAdjustment: number
    refundAmount: number
  }
  refundSnapshot?: {
    orderTotal: number
    vendorOrderTotal?: number | null
    subtotal: number
    discount: number
    tax: number
  }
}

export interface AdminReturn {
  _id: string
  id?: string
  returnNumber: string
  orderId: string
  vendorOrderId?: string
  customerId: string
  vendorId?: string
  type: 'RETURN' | 'REPLACE'
  reason: string
  description?: string
  status: ReturnStatus
  items: ReturnItemSnapshot[]
  evidenceImages?: string[]
  requestedAt?: string
  reviewedAt?: string
  reviewedBy?: string
  approvedAt?: string
  approvedBy?: string
  rejectedAt?: string
  receivedAt?: string
  receivedBy?: string
  completedAt?: string
  inspection?: ReturnInspection | null
  dispute?: ReturnDispute | null
  resolution?: ReturnResolution | null
  refundDetails?: {
    amount?: number
    status?: string
    refundId?: string
    providerRefundId?: string
    failureReason?: string
    processedAt?: string
    calculation?: any
  } | null
  payoutDetails?: {
    method?: 'UPI' | 'BANK_ACCOUNT'
    upiId?: string
    accountHolderName?: string
    maskedAccountNumber?: string
    ifscCode?: string
    bankName?: string
    submittedAt?: string
  } | null
  manualPayout?: {
    status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
    reference?: string
    paidAt?: string
    paidBy?: string
    failureReason?: string
    notes?: string
  } | null
  calculatedRefund?: CalculatedRefundBreakdown | null
  disposition?: AdminReturnDisposition | null
  statusHistory?: StatusHistoryEntry[]
  order?: {
    _id?: string
    orderNumber?: string
    status?: string
    paymentMethod?: string
    paymentStatus?: string
    total?: number
    currency?: string
    createdAt?: string
    shippingAddress?: {
      fullName?: string
      city?: string
      state?: string
      pincode?: string
    }
  } | null
  customer?: {
    _id?: string
    name?: string
    email?: string
    phone?: string
  } | null
  vendor?: {
    _id?: string
    storeName?: string
    businessName?: string
    email?: string
  } | null
  vendorOrder?: {
    _id?: string
    status?: string
    total?: number
  } | null
  replacement?: {
    _id?: string
    replacementNumber?: string
    status?: string
    quantity?: number
    replacementOrderId?: string
    replacementOrderNumber?: string | null
    replacementOrderStatus?: string | null
    vendorOrderStatus?: string | null
    fulfillmentStatus?: string | null
    packageInfo?: {
      weight?: number
      length?: number
      width?: number
      height?: number
      unit?: string
      dimensionUnit?: string
    } | null
    readyToShip?: boolean
    failureReason?: string | null
    shipment?: {
      carrier?: string
      provider?: string
      trackingNumber?: string
      providerShipmentId?: string
      pickupStatus?: string
    } | null
    createdAt?: string
    approvedAt?: string
    completedAt?: string
  } | null
  reverseShipment?: AdminReverseShipment | null
  createdAt?: string
  updatedAt?: string
}

export interface AdminReverseShipment {
  _id: string
  shipmentNumber?: string
  returnId?: string
  orderId?: string
  vendorOrderId?: string | null
  vendorId?: string
  status: string
  provider?: string
  carrier?: string
  trackingNumber?: string | null
  carrierOrderId?: string | null
  carrierShipmentId?: string | null
  pickupAddress?: Record<string, any>
  destinationAddress?: Record<string, any>
  packageInfo?: {
    weight?: number
    dimensions?: { length?: number; width?: number; height?: number }
  }
  scheduledPickupDate?: string | null
  actualPickupDate?: string | null
  deliveredAt?: string | null
  labelUrl?: string | null
  manifestUrl?: string | null
  trackingUrl?: string | null
  trackingHistory?: Array<{
    status?: string
    activity?: string
    location?: string
    timestamp?: string
  }>
  metadata?: Record<string, any>
  createdAt?: string
  updatedAt?: string
}
