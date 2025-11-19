'use client'

interface EmailStatusBadgeProps {
  emailSent: boolean
  message?: string
}

export function EmailStatusBadge({ emailSent, message }: EmailStatusBadgeProps) {
  if (!emailSent) return null

  return (
    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-blue-600 text-lg">📧</span>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-blue-800">Email Status</p>
          <p className="text-xs text-blue-600 mt-1">{message || 'Email sent successfully'}</p>
        </div>
      </div>
    </div>
  )
}

