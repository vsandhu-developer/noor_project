'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import toast from 'react-hot-toast'
import Image from 'next/image'


interface User {
  id: string
  email: string
  name: string
  program: string | null
  semester: number | null
  skills: string[]
  profilePhoto: string | null
  profileVisibility: string
  emailNotifications?: boolean
  pushNotifications?: boolean
}

export function ProfileForm({ user }: { user: User }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: user.name,
    program: user.program || '',
    semester: user.semester?.toString() || '',
    skills: user.skills.join(', '),
    profileVisibility: user.profileVisibility,
    emailNotifications: (user as any).emailNotifications?.toString() || 'true',
    pushNotifications: (user as any).pushNotifications?.toString() || 'true',
  })
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      if (formData.program) formDataToSend.append('program', formData.program)
      if (formData.semester) formDataToSend.append('semester', formData.semester)
      if (formData.skills) {
        const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s)
        formDataToSend.append('skills', JSON.stringify(skillsArray))
      }
      formDataToSend.append('profileVisibility', formData.profileVisibility)
      formDataToSend.append('emailNotifications', formData.emailNotifications)
      formDataToSend.append('pushNotifications', formData.pushNotifications)
      if (profilePhoto) {
        formDataToSend.append('profilePhoto', profilePhoto)
      }

      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        body: formDataToSend,
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to update profile')
      } else {
        toast.success('Profile updated successfully')
        router.refresh()
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Photo
            </label>
            {user.profilePhoto && (
              <div className="mb-2">
                <Image
                  src={user.profilePhoto}
                  alt="Profile"
                  width={100}
                  height={100}
                  className="rounded-full"
                />
              </div>
            )}
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePhoto(e.target.files?.[0] || null)}
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input id="email" value={user.email} disabled />
          </div>

          <div>
            <label htmlFor="program" className="block text-sm font-medium text-gray-700 mb-1">
              Program
            </label>
            <Input
              id="program"
              value={formData.program}
              onChange={(e) => setFormData({ ...formData, program: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
              Semester
            </label>
            <Input
              id="semester"
              type="number"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              min="1"
            />
          </div>

          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
              Skills (comma-separated)
            </label>
            <Input
              id="skills"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              placeholder="JavaScript, Python, React"
            />
          </div>

          <div>
            <label htmlFor="profileVisibility" className="block text-sm font-medium text-gray-700 mb-1">
              Profile Visibility
            </label>
            <select
              id="profileVisibility"
              value={formData.profileVisibility}
              onChange={(e) => setFormData({ ...formData, profileVisibility: e.target.value })}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <option value="PUBLIC">Public</option>
              <option value="RESTRICTED">Restricted</option>
              <option value="PRIVATE">Private</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notification Preferences
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.emailNotifications === 'true'}
                  onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked.toString() })}
                  className="mr-2"
                />
                <span className="text-sm">Email Notifications</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.pushNotifications === 'true'}
                  onChange={(e) => setFormData({ ...formData, pushNotifications: e.target.checked.toString() })}
                  className="mr-2"
                />
                <span className="text-sm">Push Notifications</span>
              </label>
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

