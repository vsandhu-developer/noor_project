'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import toast from 'react-hot-toast'

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    program: '',
    semester: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          semester: formData.semester ? parseInt(formData.semester) : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Registration failed')
      } else {
        if (data.emailSent) {
          toast.success('Account created! Verification email sent. Please check your email.')
        } else {
          toast.success('Account created! Please check your email to verify your account.')
        }
        
        if (data.verificationUrl && !data.emailConfigured) {
          toast(
            <div>
              <p className="font-medium mb-2">Display Mode: Verification Link</p>
              <p className="text-xs mb-2">Email service not configured. Use this link to verify:</p>
              <a
                href={data.verificationUrl}
                className="text-blue-600 underline text-xs break-all"
                target="_blank"
                rel="noopener noreferrer"
              >
                {data.verificationUrl}
              </a>
            </div>,
            { duration: 10000 }
          )
        }
        
        router.push('/auth/signin')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Join CampusConnect with your student email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email (Student/Institutional)
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="student@university.edu"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
              />
            </div>
            <div>
              <label htmlFor="program" className="block text-sm font-medium text-gray-700 mb-1">
                Program (Optional)
              </label>
              <Input
                id="program"
                type="text"
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                placeholder="Computer Science"
              />
            </div>
            <div>
              <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
                Semester (Optional)
              </label>
              <Input
                id="semester"
                type="number"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                placeholder="1"
                min="1"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

