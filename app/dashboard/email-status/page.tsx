import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Navbar } from '@/components/Navbar'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function EmailStatusPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      emailVerified: true,
      emailNotifications: true,
      pushNotifications: true,
    },
  })

  const emailConfigured = !!process.env.EMAIL_SERVICE_API_KEY

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Email Status & Settings</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Service Status</CardTitle>
              <CardDescription>Current email service configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Email Service:</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    emailConfigured 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {emailConfigured ? '✓ Configured' : '⚠ Display Mode'}
                  </span>
                </div>
                {!emailConfigured && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      <strong>Display Mode Active:</strong> Email service is not configured. 
                      All email operations will be logged to console and shown in the UI, 
                      but no actual emails will be sent. This is perfect for development and testing.
                    </p>
                    <p className="text-xs text-yellow-700 mt-2">
                      To enable actual email sending, configure EMAIL_SERVICE_API_KEY in your environment variables.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Verification Status</CardTitle>
              <CardDescription>Your email verification status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Email Address:</span>
                  <span className="text-sm text-gray-600">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Verification Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    user?.emailVerified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user?.emailVerified ? '✓ Verified' : '✗ Not Verified'}
                  </span>
                </div>
                {user?.emailVerified && (
                  <p className="text-xs text-gray-600">
                    Verified on: {new Date(user.emailVerified).toLocaleString()}
                  </p>
                )}
                {!user?.emailVerified && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800 mb-2">
                      Your email is not verified. Please check your inbox for a verification email.
                    </p>
                    <p className="text-xs text-blue-700">
                      In display mode, you can find the verification link in the browser console or in the registration confirmation message.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage your email and push notification settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">Email Notifications</span>
                    <p className="text-xs text-gray-600">Receive notifications via email</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    user?.emailNotifications 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user?.emailNotifications ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">Push Notifications</span>
                    <p className="text-xs text-gray-600">Receive push notifications</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    user?.pushNotifications 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user?.pushNotifications ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-4">
                  You can update these settings in your <a href="/profile" className="text-blue-600 hover:underline">profile settings</a>.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Operations Log</CardTitle>
              <CardDescription>Recent email operations (check browser console for details)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  In display mode, all email operations are logged to the browser console.
                </p>
                <p className="text-xs text-gray-600">
                  Open your browser&apos;s developer console (F12) to see detailed email logs including:
                </p>
                <ul className="text-xs text-gray-600 list-disc list-inside ml-4 mt-2">
                  <li>Verification emails</li>
                  <li>Password reset emails</li>
                  <li>Event reminder emails</li>
                  <li>Notification emails</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

