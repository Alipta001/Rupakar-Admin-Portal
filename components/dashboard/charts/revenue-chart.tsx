import React from 'react'

export interface RevenueChartProps {
  values?: number[]
  labels?: string[]
}

const defaultValues = [42, 54, 48, 68, 56, 74, 64, 86, 72, 92, 82, 96]
const defaultLabels = ['Apr 1', '', 'Apr 7', '', 'Apr 14', '', 'Apr 21', '', 'Apr 28', '', 'May 5', '']

export function RevenueChart({ values = defaultValues, labels = defaultLabels }: RevenueChartProps) {
  return (
    <div className="chart-wrap">
      <div className="chart-y">
        <span>₹2.0L</span>
        <span>₹1.5L</span>
        <span>₹1.0L</span>
        <span>₹0.5L</span>
        <span>₹0</span>
      </div>
      <div className="chart-area">
        <div className="chart-grid">
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="chart-bars">
          {values.map((height, i) => (
            <div className="bar-column" key={i}>
              <div className="bar" style={{ height: `${height}%` }} />
              <span>{labels[i] || ''}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
