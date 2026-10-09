export type ShipmentStatus =
  | 'PENDING'
  | 'CREATED'
  | 'LABEL_GENERATED'
  | 'READY_TO_SHIP'
  | 'PACKED'
  | 'PICKUP_REQUESTED'
  | 'PICKED_UP'
  | 'SHIPPED'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'DELIVERY_FAILED'
  | 'RTO_INITIATED'
  | 'RTO_IN_TRANSIT'
  | 'RTO_DELIVERED'
  | 'CANCELLED'

export interface Shipment {
  _id: string
  orderId: string
  vendorOrderId: string
  vendorId: string
  customerId: string
  shipmentNumber: string
  carrier: string
  provider: string
  trackingNumber: string | null
  trackingUrl: string | null
  shippingMethod: string
  shippingCost: number
  status: ShipmentStatus
  pickupStatus: 'PENDING' | 'REQUESTED' | 'SCHEDULED' | 'PICKED_UP' | 'FAILED' | 'CANCELLED'
  pickupToken?: string | null
  pickupScheduledAt?: string | null
  estimatedDeliveryAt?: string | null
  shippedAt?: string | null
  deliveredAt?: string | null
  labelUrl?: string | null
  providerShipmentId?: string | null
  packageInfo?: {
    weight?: number
    length?: number
    width?: number
    height?: number
    unit?: string
    dimensionUnit?: string
  }
  pickupAddress?: Record<string, any>
  deliveryAddress?: Record<string, any>
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}
