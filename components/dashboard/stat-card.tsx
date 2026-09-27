import React from 'react'
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react'

export interface StatCardProps {
  label: string
  value: string
  delta?: string
  deltaType?: 'positive' | 'negative'
  note?: string
  icon: LucideIcon
}

export function StatCard({
  label,
  value,
  delta,
  deltaType = 'positive',
  note,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <span>{label}</span>
        <div className="metric-icon">
          <Icon size={17} />
        </div>
      </div>
      <div className="metric-value">{value}</div>
      {(delta || note) && (
        <div className="metric-note">
          {delta && (
            <span className={deltaType === 'positive' ? 'positive' : 'negative'}>
              {deltaType === 'positive' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
              {delta}
            </span>
          )}
          {note && <span>{note}</span>}
        </div>
      )}
    </div>
  )
}
