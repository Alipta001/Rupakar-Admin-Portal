export interface AuditLog {
  id: string
  _id?: string
  action: string
  entity: string
  entityId?: string
  actorId?: string
  actorName?: string
  actorRole?: string
  actorEmail?: string
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, unknown>
  createdAt: string
}
