import React from 'react'

export interface TimelineEvent {
  status: string
  date: string
  completed: boolean
}

export function OrderTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '14px 0' }}>
      {events.map((evt, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: evt.completed ? '#45815a' : '#e9e5df',
            }}
          />
          <div>
            <strong>{evt.status}</strong>
            <span style={{ display: 'block', fontSize: '10px', color: '#827b72' }}>{evt.date}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
