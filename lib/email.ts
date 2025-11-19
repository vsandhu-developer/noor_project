export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; message: string }> {
  if (!process.env.EMAIL_SERVICE_API_KEY) {
    console.log('📧 [EMAIL SERVICE] Email would be sent:')
    console.log('   To:', options.to)
    console.log('   Subject:', options.subject)
    console.log('   Content:', options.text || options.html.substring(0, 100) + '...')
    return {
      success: true,
      message: `Email would be sent to ${options.to} (Email service not configured - display only mode)`,
    }
  }

  const emailService = process.env.EMAIL_SERVICE || 'resend'

  if (emailService === 'resend') {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.EMAIL_SERVICE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'noreply@campusconnect.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to send email: ${error}`)
    }
    
    console.log('📧 [EMAIL SERVICE] Email sent successfully via Resend')
    return {
      success: true,
      message: `Email sent successfully to ${options.to}`,
    }
  } else if (emailService === 'sendgrid') {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.EMAIL_SERVICE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: options.to }],
        }],
        from: { email: process.env.EMAIL_FROM || 'noreply@campusconnect.com' },
        subject: options.subject,
        content: [
          {
            type: 'text/html',
            value: options.html,
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to send email: ${error}`)
    }
    
    console.log('📧 [EMAIL SERVICE] Email sent successfully via SendGrid')
    return {
      success: true,
      message: `Email sent successfully to ${options.to}`,
    }
  }
  
  return {
    success: false,
    message: 'Unknown email service',
  }
}

export async function sendVerificationEmail(email: string, token: string): Promise<{ success: boolean; message: string }> {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`
  
  return await sendEmail({
    to: email,
    subject: 'Verify your CampusConnect email',
    html: `
      <h1>Welcome to CampusConnect!</h1>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>Or copy and paste this URL into your browser:</p>
      <p>${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
    `,
    text: `Verify your email: ${verificationUrl}`,
  })
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<{ success: boolean; message: string }> {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`
  
  return await sendEmail({
    to: email,
    subject: 'Reset your CampusConnect password',
    html: `
      <h1>Password Reset Request</h1>
      <p>You requested to reset your password. Click the link below to reset it:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>Or copy and paste this URL into your browser:</p>
      <p>${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
    text: `Reset your password: ${resetUrl}`,
  })
}

export async function sendEventReminderEmail(email: string, eventTitle: string, eventTime: Date, groupName: string): Promise<{ success: boolean; message: string }> {
  return await sendEmail({
    to: email,
    subject: `Event Reminder: ${eventTitle}`,
    html: `
      <h1>Event Reminder</h1>
      <p>You have an upcoming event:</p>
      <h2>${eventTitle}</h2>
      <p><strong>Group:</strong> ${groupName}</p>
      <p><strong>Time:</strong> ${eventTime.toLocaleString()}</p>
    `,
    text: `Event Reminder: ${eventTitle} at ${eventTime.toLocaleString()}`,
  })
}

