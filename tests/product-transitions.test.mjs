import test from 'node:test'
import assert from 'node:assert/strict'

// Direct mirror test of the centralized transition matrix and getAdminProductActions capabilities
const ADMIN_ALLOWED_TRANSITIONS = {
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

function normalizeProductStatus(status, moderationStatus) {
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

function getAdminProductActions(status, moderationStatus, backendAllowedTransitions) {
  const normalizedStatus = normalizeProductStatus(status, moderationStatus)
  const allowed =
    Array.isArray(backendAllowedTransitions) && backendAllowedTransitions.length > 0
      ? backendAllowedTransitions
      : ADMIN_ALLOWED_TRANSITIONS[normalizedStatus] || []

  return {
    canApprove: allowed.includes('APPROVED'),
    canReject: allowed.includes('REJECTED'),
    canPublish: allowed.includes('PUBLISHED'),
    canUnpublish: allowed.includes('UNPUBLISHED'),
    canArchive: allowed.includes('ARCHIVED'),
    canDelete: normalizedStatus === 'REJECTED',
    isArchived: normalizedStatus === 'ARCHIVED',
    allowedTransitions: allowed,
    normalizedStatus,
  }
}

test('ARCHIVED status: can never reject or delete, can only restore/publish', () => {
  const caps = getAdminProductActions('Archived')
  assert.equal(caps.canReject, false, 'ARCHIVED must not have canReject')
  assert.equal(caps.canDelete, false, 'ARCHIVED must not have canDelete')
  assert.equal(caps.canPublish, true, 'ARCHIVED can be published/restored')
  assert.equal(caps.isArchived, true)
  assert.deepEqual(caps.allowedTransitions, ['PUBLISHED', 'DRAFT'])
})

test('REJECTED status: can never reject, only allows delete and re-moderation', () => {
  const caps = getAdminProductActions('Rejected')
  assert.equal(caps.canReject, false, 'REJECTED must not have canReject')
  assert.equal(caps.canDelete, true, 'REJECTED allows admin delete')
  assert.equal(caps.canApprove, true)
})

test('PUBLISHED status: can unpublish or archive, cannot reject', () => {
  const caps = getAdminProductActions('Published')
  assert.equal(caps.canReject, false, 'PUBLISHED must not have canReject')
  assert.equal(caps.canUnpublish, true)
  assert.equal(caps.canArchive, true)
  assert.equal(caps.canDelete, false)
})

test('UNPUBLISHED status: can publish or archive, cannot reject', () => {
  const caps = getAdminProductActions('Unpublished')
  assert.equal(caps.canReject, false, 'UNPUBLISHED must not have canReject')
  assert.equal(caps.canPublish, true)
  assert.equal(caps.canArchive, true)
  assert.equal(caps.canDelete, false)
})

test('APPROVED status: can publish, unpublish, reject', () => {
  const caps = getAdminProductActions('Approved')
  assert.equal(caps.canPublish, true)
  assert.equal(caps.canReject, true)
  assert.equal(caps.canDelete, false)
})

test('SUBMITTED, UNDER_REVIEW, and EDITED: allow review / approve / reject', () => {
  for (const st of ['Submitted', 'Under review', 'Edited']) {
    const caps = getAdminProductActions(st)
    assert.equal(caps.canApprove, true, `${st} should allow approve`)
    assert.equal(caps.canReject, true, `${st} should allow reject`)
    assert.equal(caps.canDelete, false, `${st} should not allow delete`)
  }
})

test('DRAFT status: cannot reject or approve or delete', () => {
  const caps = getAdminProductActions('Draft')
  assert.equal(caps.canReject, false)
  assert.equal(caps.canApprove, false)
  assert.equal(caps.canDelete, false)
})

test('Dynamic source of truth: respects backend-provided allowedTransitions when present', () => {
  const dynamicCaps = getAdminProductActions('Archived', 'ARCHIVED', ['PUBLISHED'])
  assert.equal(dynamicCaps.canReject, false)
  assert.equal(dynamicCaps.canPublish, true)
  assert.deepEqual(dynamicCaps.allowedTransitions, ['PUBLISHED'])
})
