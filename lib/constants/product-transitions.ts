import { ModerationStatus, ProductStatus } from '@/types/product'

/**
 * Centralized Admin Product Transition Matrix.
 * Mirrors the backend authority in rupakar-backend/app/services/product.service.js.
 *
 * Transition rules:
 * - DRAFT: ['SUBMITTED']
 * - SUBMITTED: ['UNDER_REVIEW', 'APPROVED', 'REJECTED']
 * - UNDER_REVIEW: ['APPROVED', 'REJECTED']
 * - APPROVED: ['PUBLISHED', 'REJECTED', 'UNPUBLISHED', 'UNDER_REVIEW', 'EDITED']
 * - REJECTED: ['DRAFT', 'UNDER_REVIEW', 'APPROVED']
 * - PUBLISHED: ['UNPUBLISHED', 'ARCHIVED', 'APPROVED', 'EDITED']
 * - UNPUBLISHED: ['PUBLISHED', 'APPROVED', 'ARCHIVED']
 * - ARCHIVED: ['PUBLISHED', 'DRAFT']
 * - EDITED: ['UNDER_REVIEW', 'APPROVED', 'REJECTED']
 */
export const ADMIN_ALLOWED_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['UNDER_REVIEW', 'APPROVED', 'REJECTED'],
  UNDER_REVIEW: ['APPROVED', 'REJECTED'],
  APPROVED: ['PUBLISHED', 'REJECTED', 'UNPUBLISHED', 'UNDER_REVIEW', 'EDITED'],
  REJECTED: ['DRAFT', 'UNDER_REVIEW', 'APPROVED'],
  PUBLISHED: ['UNPUBLISHED', 'ARCHIVED', 'APPROVED', 'EDITED'],
  UNPUBLISHED: ['PUBLISHED', 'APPROVED', 'ARCHIVED'],
  ARCHIVED: ['PUBLISHED', 'DRAFT'],
  EDITED: ['UNDER_REVIEW', 'APPROVED', 'REJECTED'],
}

/**
 * Normalizes any product status string (UI title-cased or backend uppercase)
 * into a standard uppercase status key.
 */
export function normalizeProductStatus(
  status?: string | null,
  moderationStatus?: string | null
): string {
  const candidate = moderationStatus || status || ''
  const upper = candidate.trim().toUpperCase().replace(/\s+/g, '_')

  if (upper === 'UNDER_REVIEW' || upper === 'UNDERREVIEW') return 'UNDER_REVIEW'
  if (upper === 'SUBMITTED') return 'SUBMITTED'
  if (upper === 'APPROVED') return 'APPROVED'
  if (upper === 'REJECTED') return 'REJECTED'
  if (upper === 'PUBLISHED') return 'PUBLISHED'
  if (upper === 'UNPUBLISHED') return 'UNPUBLISHED'
  if (upper === 'ARCHIVED') return 'ARCHIVED'
  if (upper === 'DRAFT') return 'DRAFT'
  if (upper === 'EDITED') return 'EDITED'

  return upper
}

export interface AdminProductActionCapabilities {
  canApprove: boolean
  canReject: boolean
  canPublish: boolean
  canUnpublish: boolean
  canArchive: boolean
  canDelete: boolean
  isArchived: boolean
  allowedTransitions: string[]
  normalizedStatus: string
}

/**
 * Determines exact allowed admin actions for a product based on backend transition rules.
 * Acts as the single dynamic authority across table 3-dot menu, detail modal, and any action trigger.
 *
 * @param status - Product status (e.g. 'Archived', 'Published', etc.)
 * @param moderationStatus - Backend moderationStatus if present
 * @param backendAllowedTransitions - Dynamic allowed transitions array from backend API if available
 */
export function getAdminProductActions(
  status?: string | null,
  moderationStatus?: string | null,
  backendAllowedTransitions?: string[] | null
): AdminProductActionCapabilities {
  const normalizedStatus = normalizeProductStatus(status, moderationStatus)

  // Use backend-provided transitions if available and non-empty, otherwise use centralized matrix
  const allowed =
    Array.isArray(backendAllowedTransitions) && backendAllowedTransitions.length > 0
      ? backendAllowedTransitions
      : ADMIN_ALLOWED_TRANSITIONS[normalizedStatus] || []

  const isArchived = normalizedStatus === 'ARCHIVED'

  return {
    canApprove: allowed.includes('APPROVED'),
    canReject: allowed.includes('REJECTED'),
    canPublish: allowed.includes('PUBLISHED'),
    canUnpublish: allowed.includes('UNPUBLISHED'),
    canArchive: allowed.includes('ARCHIVED'),
    // Backend adminDeleteProduct: ONLY allowed when product.status === 'REJECTED'
    canDelete: normalizedStatus === 'REJECTED',
    isArchived,
    allowedTransitions: allowed,
    normalizedStatus,
  }
}
