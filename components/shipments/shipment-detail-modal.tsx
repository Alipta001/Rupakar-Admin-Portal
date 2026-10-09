'use client'

import React, { useState } from 'react'
import { Shipment } from '@/types/shipment'
import { ShipmentStatusBadge } from './shipment-status-badge'
import { formatDateTime, formatINR } from '@/lib/utils/formatters'
import {
  useUpdateShipmentStatusMutation,
  useRetryShipmentPickupMutation,
  useResyncShipmentTrackingMutation,
  useRetryShipmentFulfillmentMutation,
  useAssignShipmentAwbMutation,
  useGenerateShipmentLabelMutation,
} from '@/redux/api/adminApi'
import { Download, FileText, RefreshCw, Send, Tag, Truck } from 'lucide-react'

export function ShipmentDetailModal({
  shipment,
  isOpen,
  onClose,
}: {
  shipment: Shipment | null
  isOpen: boolean
  onClose: () => void
}) {
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [statusReason, setStatusReason] = useState<string>('')
  const [actionMessage, setActionMessage] = useState<string>('')

  const [updateStatus, { isLoading: isUpdating }] = useUpdateShipmentStatusMutation()
  const [retryPickup, { isLoading: isRetryingPickup }] = useRetryShipmentPickupMutation()
  const [resyncTracking, { isLoading: isResyncing }] = useResyncShipmentTrackingMutation()
  const [retryFulfillment, { isLoading: isRetryingFulfillment }] = useRetryShipmentFulfillmentMutation()
  const [assignAwb, { isLoading: isAssigningAwb }] = useAssignShipmentAwbMutation()
  const [generateLabel, { isLoading: isGeneratingLabel }] = useGenerateShipmentLabelMutation()

  if (!isOpen || !shipment) return null

  const handleUpdateStatus = async () => {
    if (!selectedStatus) return
    try {
      await updateStatus({
        id: shipment._id,
        status: selectedStatus,
        reason: statusReason || 'Admin status override',
      }).unwrap()
      setActionMessage(`Status updated to ${selectedStatus}`)
      setSelectedStatus('')
      setStatusReason('')
    } catch (err: any) {
      setActionMessage(err?.data?.message || 'Failed to update shipment status')
    }
  }

  const handleRetryPickup = async () => {
    try {
      await retryPickup({ id: shipment._id }).unwrap()
      setActionMessage('Carrier pickup requested successfully')
    } catch (err: any) {
      setActionMessage(err?.data?.message || 'Failed to retry pickup request')
    }
  }

  const handleResyncTracking = async () => {
    try {
      await resyncTracking({ id: shipment._id }).unwrap()
      setActionMessage('Tracking synchronized from carrier')
    } catch (err: any) {
      setActionMessage(err?.data?.message || 'Failed to resync tracking')
    }
  }

  const handleRetryFulfillment = async () => {
    try {
      await retryFulfillment({ id: shipment._id }).unwrap()
      setActionMessage('Shipment fulfillment workflow resumed and updated successfully')
    } catch (err: any) {
      setActionMessage(err?.data?.message || 'Failed to retry shipment fulfillment')
    }
  }

  const handleAssignAwb = async () => {
    try {
      await assignAwb({ id: shipment._id }).unwrap()
      setActionMessage('AWB assigned successfully')
    } catch (err: any) {
      setActionMessage(err?.data?.message || 'Failed to assign AWB')
    }
  }

  const handleGenerateLabel = async () => {
    try {
      await generateLabel({ id: shipment._id }).unwrap()
      setActionMessage('Label generated successfully')
    } catch (err: any) {
      setActionMessage(err?.data?.message || 'Failed to generate label')
    }
  }

  const handleDownloadLabel = () => {
    if (shipment.labelUrl && /^https?:\/\//i.test(shipment.labelUrl)) {
      window.open(shipment.labelUrl, '_blank')
    } else {
      window.open(`/api/admin/shipments/${shipment._id}/label`, '_blank')
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(39, 35, 31, 0.45)',
        backdropFilter: 'blur(2px)',
        display: 'grid',
        placeItems: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="panel"
        style={{
          width: '100%',
          maxWidth: '640px',
          padding: '24px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px' }}>Shipment {shipment.shipmentNumber}</h2>
            <span style={{ fontSize: '11px', color: '#827b72' }}>Created {formatDateTime(shipment.createdAt)}</span>
          </div>
          <ShipmentStatusBadge status={shipment.status} />
        </div>

        {actionMessage && (
          <div style={{ padding: '8px 12px', background: '#F8F4EE', border: '1px solid #E6D8C4', borderRadius: '6px', fontSize: '12px', marginBottom: '16px', color: '#5B4B3F' }}>
            {actionMessage}
          </div>
        )}

        {/* Provider Error Alert if any */}
        {(shipment.metadata?.labelError || shipment.metadata?.pickupError || shipment.metadata?.awbError || shipment.pickupStatus === 'FAILED') && (
          <div style={{ padding: '10px 14px', background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '6px', fontSize: '12px', marginBottom: '16px', color: '#92400E' }}>
            <strong>Fulfillment Notice:</strong>{' '}
            {shipment.metadata?.pickupError || shipment.metadata?.labelError || shipment.metadata?.awbError || 'Shipment has pending fulfillment stages.'}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '12px', marginBottom: '20px' }}>
          <div>
            <span style={{ color: '#827b72', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Carrier & Service</span>
            <strong style={{ fontSize: '13px' }}>{shipment.carrier || 'Standard Express'}</strong>
            <span style={{ display: 'block', color: '#827b72', fontSize: '11px' }}>
              Provider: {shipment.provider} {shipment.metadata?.courierCompanyId ? `(ID: ${shipment.metadata.courierCompanyId})` : ''}
            </span>
          </div>
          <div>
            <span style={{ color: '#827b72', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>AWB / Tracking Number</span>
            <strong style={{ fontSize: '13px' }}>{shipment.trackingNumber || 'Pending Assignment'}</strong>
            {shipment.trackingUrl && (
              <a href={shipment.trackingUrl} target="_blank" rel="noreferrer" style={{ display: 'block', color: '#8B5E34', fontSize: '11px', textDecoration: 'underline' }}>
                Track Carrier Package →
              </a>
            )}
          </div>
          <div>
            <span style={{ color: '#827b72', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Shiprocket Order & Shipment ID</span>
            <strong style={{ fontSize: '13px' }}>
              {shipment.providerShipmentId || shipment.metadata?.shiprocketShipmentId || 'N/A'}
            </strong>
            {shipment.metadata?.shiprocketOrderId && (
              <span style={{ display: 'block', color: '#827b72', fontSize: '11px' }}>
                Order ID: {shipment.metadata.shiprocketOrderId}
              </span>
            )}
          </div>
          <div>
            <span style={{ color: '#827b72', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Pickup Status</span>
            <strong style={{ fontSize: '13px' }}>{shipment.pickupStatus}</strong>
            {shipment.pickupScheduledAt && (
              <span style={{ display: 'block', color: '#827b72', fontSize: '11px' }}>Scheduled: {formatDateTime(shipment.pickupScheduledAt)}</span>
            )}
          </div>
          <div>
            <span style={{ color: '#827b72', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Package Dimensions & Weight</span>
            <strong style={{ fontSize: '13px' }}>
              {shipment.packageInfo?.weight || 0.5} kg · {shipment.packageInfo?.length || 15}×{shipment.packageInfo?.width || 10}×{shipment.packageInfo?.height || 5} cm
            </strong>
            <span style={{ display: 'block', color: '#827b72', fontSize: '11px' }}>Est. Cost: {formatINR(shipment.shippingCost || 0)}</span>
          </div>
          <div>
            <span style={{ color: '#827b72', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Fulfillment Stages Completed</span>
            <span style={{ display: 'block', color: '#1E1A17', fontSize: '11px', fontWeight: 500, marginTop: '2px' }}>
              {(shipment.metadata?.stagesCompleted || ['ORDER_CREATED']).join(' → ')}
            </span>
          </div>
        </div>

        {/* Addresses */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '12px', padding: '14px', background: '#FCF9F4', borderRadius: '8px', border: '1px solid #EFE3D3', marginBottom: '20px' }}>
          <div>
            <span style={{ color: '#827b72', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Pickup Location (Vendor)</span>
            <p style={{ margin: '4px 0 0', lineHeight: 1.4 }}>
              {shipment.pickupAddress?.street || 'Vendor Hub'}
              <br />
              {[shipment.pickupAddress?.city, shipment.pickupAddress?.state, shipment.pickupAddress?.postalCode].filter(Boolean).join(', ')}
            </p>
          </div>
          <div>
            <span style={{ color: '#827b72', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Delivery Location (Customer)</span>
            <p style={{ margin: '4px 0 0', lineHeight: 1.4 }}>
              {shipment.deliveryAddress?.street || 'Customer Address'}
              <br />
              {[shipment.deliveryAddress?.city, shipment.deliveryAddress?.state, shipment.deliveryAddress?.postalCode].filter(Boolean).join(', ')}
            </p>
          </div>
        </div>

        {/* Admin Exception Management Tools */}
        <div style={{ padding: '16px', background: '#F8F4EE', border: '1px solid #E6D8C4', borderRadius: '8px', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 10px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5B4B3F' }}>
            Exception Management & Actions
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
            <button
              type="button"
              className="button secondary"
              style={{ fontSize: '11px', padding: '6px 12px' }}
              onClick={handleDownloadLabel}
            >
              <Download size={13} style={{ marginRight: '4px' }} /> Download Shipping Label
            </button>
            <button
              type="button"
              className="button secondary"
              style={{ fontSize: '11px', padding: '6px 12px' }}
              disabled={isRetryingPickup}
              onClick={handleRetryPickup}
            >
              <Truck size={13} style={{ marginRight: '4px' }} /> {isRetryingPickup ? 'Requesting…' : 'Retry Carrier Pickup'}
            </button>
            {(!shipment.trackingNumber || shipment.trackingNumber.startsWith('TRK-')) && (
              <button
                type="button"
                className="button secondary"
                style={{ fontSize: '11px', padding: '6px 12px' }}
                disabled={isAssigningAwb}
                onClick={handleAssignAwb}
              >
                <Tag size={13} style={{ marginRight: '4px' }} /> {isAssigningAwb ? 'Assigning…' : 'Assign AWB'}
              </button>
            )}
            {(!shipment.labelUrl || shipment.labelUrl.includes('/api/v1/vendors/orders/')) && (
              <button
                type="button"
                className="button secondary"
                style={{ fontSize: '11px', padding: '6px 12px' }}
                disabled={isGeneratingLabel}
                onClick={handleGenerateLabel}
              >
                <FileText size={13} style={{ marginRight: '4px' }} /> {isGeneratingLabel ? 'Generating…' : 'Generate Label'}
              </button>
            )}
            <button
              type="button"
              className="button secondary"
              style={{ fontSize: '11px', padding: '6px 12px' }}
              disabled={isRetryingFulfillment}
              onClick={handleRetryFulfillment}
            >
              <RefreshCw size={13} style={{ marginRight: '4px' }} className={isRetryingFulfillment ? 'animate-spin' : ''} /> {isRetryingFulfillment ? 'Fulfilling…' : 'Retry Fulfillment'}
            </button>
            <button
              type="button"
              className="button secondary"
              style={{ fontSize: '11px', padding: '6px 12px' }}
              disabled={isResyncing}
              onClick={handleResyncTracking}
            >
              <RefreshCw size={13} style={{ marginRight: '4px' }} /> {isResyncing ? 'Resyncing…' : 'Resync Tracking'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{ fontSize: '12px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #D4C4B0', background: '#FFFFFF' }}
            >
              <option value="">Manual status override…</option>
              <option value="PICKED_UP">Mark Picked Up</option>
              <option value="SHIPPED">Mark Shipped</option>
              <option value="IN_TRANSIT">Mark In Transit</option>
              <option value="OUT_FOR_DELIVERY">Mark Out For Delivery</option>
              <option value="DELIVERED">Mark Delivered</option>
              <option value="DELIVERY_FAILED">Mark Delivery Failed</option>
              <option value="RTO_INITIATED">Initiate RTO</option>
              <option value="CANCELLED">Cancel Shipment</option>
            </select>
            {selectedStatus && (
              <>
                <input
                  type="text"
                  placeholder="Reason / Note..."
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  style={{ fontSize: '12px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #D4C4B0', flex: 1, background: '#FFFFFF' }}
                />
                <button
                  type="button"
                  className="button primary"
                  style={{ fontSize: '11px', padding: '6px 12px' }}
                  disabled={isUpdating}
                  onClick={handleUpdateStatus}
                >
                  <Send size={13} style={{ marginRight: '4px' }} /> Apply
                </button>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" className="button secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
