'use client'

import React, { useState, useMemo } from 'react'
import {
  CheckCircle,
  XCircle,
  Archive,
  RefreshCw,
  Search,
  Filter,
  MapPin,
  Building,
  Phone,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react'
import {
  useGetPickupLocationsQuery,
  useApprovePickupLocationMutation,
  useDeactivatePickupLocationMutation,
  useArchivePickupLocationMutation,
  useReactivatePickupLocationMutation,
} from '@/redux/api/adminApi'
import { VendorPickupLocation, PickupAdminStatus, PickupRegistrationStatus } from '@/types/vendor'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { LoadingState } from '@/components/shared/loading-state'
import { ErrorState } from '@/components/shared/error-state'

function AdminStatusBadge({ status }: { status: PickupAdminStatus }) {
  const map: Record<PickupAdminStatus, { label: string; bg: string; color: string; border: string }> = {
    APPROVED: { label: 'Approved', bg: '#e6f5ec', color: '#2d7a50', border: '#b8e2cb' },
    PENDING: { label: 'Pending Approval', bg: '#fff8e5', color: '#9c7a00', border: '#f5e4b7' },
    DEACTIVATED: { label: 'Deactivated', bg: '#fcecea', color: '#c0392b', border: '#f5c6cb' },
    ARCHIVED: { label: 'Archived', bg: '#f0efee', color: '#6b6560', border: '#dedcd9' },
  }
  const s = map[status] || { label: status, bg: '#f0efee', color: '#6b6560', border: '#dedcd9' }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 8px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: 600,
        backgroundColor: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        letterSpacing: '0.02em',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: s.color,
        }}
      />
      {s.label}
    </span>
  )
}

function RegistrationStatusBadge({
  status,
  error,
}: {
  status: PickupRegistrationStatus
  error?: string | null
}) {
  const map: Record<PickupRegistrationStatus, { label: string; bg: string; color: string }> = {
    REGISTERED: { label: 'Registered', bg: '#e6f5ec', color: '#2d7a50' },
    PENDING: { label: 'Pending API', bg: '#fff8e5', color: '#9c7a00' },
    FAILED: { label: 'Failed', bg: '#fcecea', color: '#c0392b' },
  }
  const s = map[status] || { label: status, bg: '#f0efee', color: '#6b6560' }

  return (
    <div>
      <span
        style={{
          display: 'inline-block',
          padding: '2px 7px',
          borderRadius: '4px',
          fontSize: '10px',
          fontWeight: 600,
          backgroundColor: s.bg,
          color: s.color,
        }}
        title={error || undefined}
      >
        {s.label}
      </span>
      {status === 'FAILED' && error && (
        <span
          style={{
            display: 'block',
            fontSize: '9px',
            color: '#c0392b',
            maxWidth: '120px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginTop: '2px',
          }}
          title={error}
        >
          {error}
        </span>
      )}
    </div>
  )
}

export function PickupLocationsTable() {
  const [adminStatusFilter, setAdminStatusFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  // Dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    type: 'DEACTIVATE' | 'ARCHIVE' | null
    item: VendorPickupLocation | null
  }>({
    isOpen: false,
    type: null,
    item: null,
  })

  const { data, isLoading, error, refetch } = useGetPickupLocationsQuery({
    adminStatus: adminStatusFilter !== 'ALL' ? adminStatusFilter : undefined,
    search: searchQuery || undefined,
  })

  const [approveLocation] = useApprovePickupLocationMutation()
  const [deactivateLocation] = useDeactivatePickupLocationMutation()
  const [archiveLocation] = useArchivePickupLocationMutation()
  const [reactivateLocation] = useReactivatePickupLocationMutation()

  const rawList: VendorPickupLocation[] = useMemo(() => {
    if (!data) return []
    if (Array.isArray(data.items)) return data.items
    if (Array.isArray((data as any).data)) return (data as any).data
    if (Array.isArray(data)) return data as any
    return []
  }, [data])

  const filteredList = useMemo(() => {
    return rawList.filter((item) => {
      if (adminStatusFilter !== 'ALL' && item.adminStatus !== adminStatusFilter) {
        return false
      }
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        item.businessName?.toLowerCase().includes(q) ||
        item.sellerName?.toLowerCase().includes(q) ||
        item.pickupLocationName?.toLowerCase().includes(q) ||
        item.city?.toLowerCase().includes(q) ||
        item.pincode?.includes(q) ||
        item.shiprocketPickupId?.toLowerCase().includes(q) ||
        item.phone?.includes(q)
      )
    })
  }, [rawList, adminStatusFilter, searchQuery])

  const handleApprove = async (item: VendorPickupLocation) => {
    try {
      setActionLoadingId(item.vendorId)
      await approveLocation({ vendorId: item.vendorId }).unwrap()
      await refetch()
    } catch (err: any) {
      alert(err?.data?.message || err?.message || 'Failed to approve pickup location')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleReactivate = async (item: VendorPickupLocation) => {
    try {
      setActionLoadingId(item.vendorId)
      await reactivateLocation({ vendorId: item.vendorId }).unwrap()
      await refetch()
    } catch (err: any) {
      alert(err?.data?.message || err?.message || 'Failed to reactivate pickup location')
    } finally {
      setActionLoadingId(null)
    }
  }

  const confirmAction = async () => {
    if (!confirmDialog.item || !confirmDialog.type) return
    const { item, type } = confirmDialog
    setConfirmDialog({ isOpen: false, type: null, item: null })

    try {
      setActionLoadingId(item.vendorId)
      if (type === 'DEACTIVATE') {
        await deactivateLocation({ vendorId: item.vendorId }).unwrap()
      } else if (type === 'ARCHIVE') {
        await archiveLocation({ vendorId: item.vendorId }).unwrap()
      }
      await refetch()
    } catch (err: any) {
      alert(err?.data?.message || err?.message || `Failed to ${type.toLowerCase()} pickup location`)
    } finally {
      setActionLoadingId(null)
    }
  }

  if (isLoading) {
    return <LoadingState message="Loading vendor pickup locations..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load pickup locations"
        message="Could not retrieve seller pickup locations. Please verify connection."
        onRetry={refetch}
      />
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Toolbar */}
      <div
        className="panel"
        style={{
          padding: '16px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 300px', maxWidth: '450px' }}>
          <div className="search-box" style={{ width: '100%' }}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search seller, business, nickname, pincode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={14} style={{ color: '#827b72' }} />
          <span style={{ fontSize: '12px', color: '#827b72', fontWeight: 500 }}>Lifecycle:</span>
          <select
            value={adminStatusFilter}
            onChange={(e) => setAdminStatusFilter(e.target.value)}
            style={{
              fontSize: '12px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #e5e0d8',
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="DEACTIVATED">Deactivated</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#faf9f7', borderBottom: '1px solid #e5e0d8' }}>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#4a433c', textTransform: 'uppercase' }}>
                  Seller / Business
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#4a433c', textTransform: 'uppercase' }}>
                  Pickup Nickname
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#4a433c', textTransform: 'uppercase' }}>
                  Location Address
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#4a433c', textTransform: 'uppercase' }}>
                  Shiprocket ID
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#4a433c', textTransform: 'uppercase' }}>
                  Shiprocket Status
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#4a433c', textTransform: 'uppercase' }}>
                  Admin Status
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#4a433c', textTransform: 'uppercase', textAlign: 'right' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#827b72', fontSize: '13px' }}>
                    No seller pickup locations found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const isBusy = actionLoadingId === item.vendorId

                  return (
                    <tr
                      key={item.vendorId}
                      style={{
                        borderBottom: '1px solid #f0efee',
                        fontSize: '12px',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      {/* Seller & Business */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#1e1a17' }}>{item.businessName || '—'}</div>
                        <div style={{ color: '#827b72', fontSize: '11px', marginTop: '2px' }}>
                          {item.sellerName || '—'}
                        </div>
                        {item.sellerPhone && (
                          <div style={{ color: '#827b72', fontSize: '10px', marginTop: '1px' }}>
                            {item.sellerPhone}
                          </div>
                        )}
                      </td>

                      {/* Pickup Nickname & Contact */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#8b5e34', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={13} />
                          {item.pickupLocationName || '—'}
                        </div>
                        <div style={{ color: '#5d4a3c', fontSize: '11px', marginTop: '2px' }}>
                          {item.contactPerson} ({item.phone})
                        </div>
                      </td>

                      {/* Location Address */}
                      <td style={{ padding: '14px 16px', maxWidth: '240px' }}>
                        <div style={{ color: '#1e1a17', lineHeight: 1.4 }}>
                          {item.addressLine1}
                          {item.addressLine2 ? `, ${item.addressLine2}` : ''}
                        </div>
                        <div style={{ color: '#827b72', fontSize: '11px', marginTop: '2px' }}>
                          {item.city}, {item.state} — {item.pincode}
                        </div>
                      </td>

                      {/* Shiprocket Pickup ID */}
                      <td style={{ padding: '14px 16px' }}>
                        {item.shiprocketPickupId ? (
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontSize: '11px',
                              background: '#f4f2ef',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              color: '#3d3834',
                            }}
                          >
                            {item.shiprocketPickupId}
                          </span>
                        ) : (
                          <span style={{ color: '#a8a29e', fontSize: '11px' }}>Not assigned</span>
                        )}
                      </td>

                      {/* Registration Status */}
                      <td style={{ padding: '14px 16px' }}>
                        <RegistrationStatusBadge
                          status={item.registrationStatus}
                          error={item.registrationError}
                        />
                      </td>

                      {/* Admin Lifecycle Status */}
                      <td style={{ padding: '14px 16px' }}>
                        <AdminStatusBadge status={item.adminStatus} />
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                          {/* Approve (for PENDING or DEACTIVATED) */}
                          {item.adminStatus === 'PENDING' && (
                            <button
                              type="button"
                              className="button primary"
                              style={{
                                fontSize: '11px',
                                padding: '4px 10px',
                                backgroundColor: '#2d7a50',
                                color: '#fff',
                                border: 'none',
                              }}
                              disabled={isBusy}
                              onClick={() => handleApprove(item)}
                              title="Approve pickup location for Ready-to-Ship dispatches"
                            >
                              <CheckCircle size={13} style={{ marginRight: '4px' }} />
                              Approve
                            </button>
                          )}

                          {/* Reactivate (for DEACTIVATED) */}
                          {item.adminStatus === 'DEACTIVATED' && (
                            <button
                              type="button"
                              className="button secondary"
                              style={{
                                fontSize: '11px',
                                padding: '4px 10px',
                                color: '#2d7a50',
                                borderColor: '#b8e2cb',
                              }}
                              disabled={isBusy}
                              onClick={() => handleReactivate(item)}
                              title="Reactivate previously deactivated location"
                            >
                              <RefreshCw size={13} style={{ marginRight: '4px' }} />
                              Reactivate
                            </button>
                          )}

                          {/* Deactivate (for APPROVED) */}
                          {item.adminStatus === 'APPROVED' && (
                            <button
                              type="button"
                              className="button secondary"
                              style={{
                                fontSize: '11px',
                                padding: '4px 10px',
                                color: '#c0392b',
                                borderColor: '#f5c6cb',
                              }}
                              disabled={isBusy}
                              onClick={() =>
                                setConfirmDialog({
                                  isOpen: true,
                                  type: 'DEACTIVATE',
                                  item,
                                })
                              }
                              title="Temporarily deactivate from new shipments"
                            >
                              <XCircle size={13} style={{ marginRight: '4px' }} />
                              Deactivate
                            </button>
                          )}

                          {/* Archive (for APPROVED or DEACTIVATED or PENDING) */}
                          {item.adminStatus !== 'ARCHIVED' && (
                            <button
                              type="button"
                              className="button secondary"
                              style={{
                                fontSize: '11px',
                                padding: '4px 8px',
                                color: '#6b6560',
                              }}
                              disabled={isBusy}
                              onClick={() =>
                                setConfirmDialog({
                                  isOpen: true,
                                  type: 'ARCHIVE',
                                  item,
                                })
                              }
                              title="Permanently retire location while retaining all historical shipment records"
                            >
                              <Archive size={13} />
                            </button>
                          )}

                          {/* Archived label */}
                          {item.adminStatus === 'ARCHIVED' && (
                            <span style={{ fontSize: '11px', color: '#9c958f', fontStyle: 'italic' }}>
                              Permanently Archived
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog for Deactivate & Archive */}
      {confirmDialog.isOpen && confirmDialog.item && confirmDialog.type === 'DEACTIVATE' && (
        <ConfirmDialog
          isOpen={true}
          title="Deactivate Pickup Location"
          description={`Are you sure you want to temporarily deactivate the pickup location "${confirmDialog.item.pickupLocationName}" for seller "${confirmDialog.item.businessName}"? This location will be blocked from being used for new Ready-to-Ship operations. Existing shipments, historical records, and the Shiprocket location will NOT be deleted.`}
          confirmText="Deactivate Location"
          cancelText="Cancel"
          tone="danger"
          onConfirm={confirmAction}
          onCancel={() => setConfirmDialog({ isOpen: false, type: null, item: null })}
        />
      )}

      {confirmDialog.isOpen && confirmDialog.item && confirmDialog.type === 'ARCHIVE' && (
        <ConfirmDialog
          isOpen={true}
          title="Archive Pickup Location"
          description={`Are you sure you want to permanently archive the pickup location "${confirmDialog.item.pickupLocationName}" for seller "${confirmDialog.item.businessName}"? This permanently retires the location from normal use. This is a non-destructive action: database records and Shiprocket mappings are safely preserved, keeping all historical shipments intact.`}
          confirmText="Archive Location"
          cancelText="Cancel"
          tone="danger"
          onConfirm={confirmAction}
          onCancel={() => setConfirmDialog({ isOpen: false, type: null, item: null })}
        />
      )}
    </div>
  )
}
