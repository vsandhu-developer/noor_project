'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setMessage('No verification token provided')
      return
    }

    fetch(`/api/auth/verify-email?token=${token}`)
      .then(async (res) => {
        if (res.ok) {
          setStatus('success')
          setMessage('Email verified successfully! You can now sign in.')
          setTimeout(() => {
            router.push('/auth/signin?verified=true')
          }, 2000)
        } else {
          const data = await res.json()
          setStatus('error')
          setMessage(data.error || 'Verification failed')
        }
      })
      .catch(() => {
        setStatus('error')
        setMessage('An error occurred during verification')
      })
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Email Verification</CardTitle>
          <CardDescription className="text-center">
            {status === 'loading' && 'Verifying your email...'}
            {status === 'success' && 'Verification successful!'}
            {status === 'error' && 'Verification failed'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'loading' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Please wait while we verify your email...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="text-green-600 text-5xl mb-4">✓</div>
              <p className="text-green-600 font-medium mb-4">{message}</p>
              <p className="text-sm text-gray-500">Redirecting to sign in...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="text-red-600 text-5xl mb-4">✗</div>
              <p className="text-red-600 font-medium mb-4">{message}</p>
              <Button asChild className="mt-4">
                <Link href="/auth/signin">Go to Sign In</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

