export function formatINR(amount: number): string {
  if (isNaN(amount)) return '₹0'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatCompactINR(amount: number): string {
  if (isNaN(amount)) return '₹0'
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)}Cr`
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}k`
  }
  return formatINR(amount)
}

export function formatNumber(val: number): string {
  if (isNaN(val)) return '0'
  return new Intl.NumberFormat('en-IN').format(val)
}

export function maskPhoneNumber(phone?: string): string {
  if (!phone) return ''
  const trimmed = phone.trim()
  if (trimmed.length < 6) return '******'
  return `${trimmed.slice(0, 3)}****${trimmed.slice(-3)}`
}

export function maskEmail(email?: string): string {
  if (!email || !email.includes('@')) return '***@***.***'
  const [local, domain] = email.split('@')
  const visible = local.length > 2 ? local.slice(0, 2) : local.slice(0, 1)
  return `${visible}***@${domain}`
}
