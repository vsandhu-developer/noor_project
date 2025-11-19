'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { formatDate } from '@/lib/utils'
import { getSocket } from '@/lib/socket'

interface GroupDetailProps {
  group: any
  currentMember: any
  userId: string
}

export function GroupDetail({ group, currentMember, userId }: GroupDetailProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'messages' | 'files' | 'events' | 'members'>('overview')
  const [messageContent, setMessageContent] = useState('')
  const [messages, setMessages] = useState(group.messages.reverse())
  const [socket, setSocket] = useState<any>(null)
  const [showAddMember, setShowAddMember] = useState(false)
  const [memberSearch, setMemberSearch] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])

  useEffect(() => {
    const socketInstance = getSocket()
    if (socketInstance && currentMember) {
      socketInstance.emit('join-group', group.id)
      setSocket(socketInstance)

      socketInstance.on('new-message', (message: any) => {
        setMessages((prev: any[]) => [...prev, message])
      })

      return () => {
        socketInstance.emit('leave-group', group.id)
        socketInstance.off('new-message')
      }
    }
  }, [group.id, currentMember])

  const handleJoinGroup = async () => {
    try {
      const response = await fetch(`/api/groups/${group.id}/join`, {
        method: 'POST',
      })

      if (response.ok) {
        toast.success('Joined group successfully')
        router.refresh()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to join group')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleSearchMembers = async () => {
    if (!memberSearch.trim()) return

    try {
      const response = await fetch(`/api/users/search?search=${encodeURIComponent(memberSearch)}`)
      const data = await response.json()

      // Filter out users who are already members
      const existingMemberIds = new Set(group.members.map((m: any) => m.userId))
      const filtered = data.users.filter((user: any) => !existingMemberIds.has(user.id))
      setSearchResults(filtered)
    } catch (error) {
      toast.error('Failed to search users')
    }
  }

  const handleAddMember = async (targetUserId: string) => {
    try {
      const response = await fetch(`/api/groups/${group.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetUserId, role: 'MEMBER' }),
      })

      if (response.ok) {
        toast.success('Member added successfully')
        setShowAddMember(false)
        setMemberSearch('')
        setSearchResults([])
        router.refresh()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to add member')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleRemoveMember = async (targetUserId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      const response = await fetch(`/api/groups/${group.id}/members/${targetUserId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Member removed successfully')
        router.refresh()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to remove member')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageContent.trim()) return

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: group.id,
          content: messageContent,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessages((prev: any[]) => [...prev, data.message])
        setMessageContent('')
        if (socket) {
          socket.emit('send-message', {
            groupId: group.id,
            message: data.message,
          })
        }
      } else {
        toast.error(data.error || 'Failed to send message')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('groupId', group.id)
    formData.append('name', file.name)

    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        toast.success('File uploaded successfully')
        router.refresh()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to upload file')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
        <p className="text-gray-600 mt-2">{group.courseTopic}</p>
        {group.description && <p className="text-gray-600 mt-2">{group.description}</p>}
        {!currentMember && (
          <Button onClick={handleJoinGroup} className="mt-4">
            Join Group
          </Button>
        )}
      </div>

      <div className="flex space-x-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 ${activeTab === 'overview' ? 'border-b-2 border-blue-600' : ''}`}
        >
          Overview
        </button>
        {currentMember && (
          <>
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-4 py-2 ${activeTab === 'messages' ? 'border-b-2 border-blue-600' : ''}`}
            >
              Messages
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`px-4 py-2 ${activeTab === 'files' ? 'border-b-2 border-blue-600' : ''}`}
            >
              Files
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 py-2 ${activeTab === 'events' ? 'border-b-2 border-blue-600' : ''}`}
            >
              Events
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2 ${activeTab === 'members' ? 'border-b-2 border-blue-600' : ''}`}
            >
              Members
            </button>
          </>
        )}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Members</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{group.members.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Files</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{group.files.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Events</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{group.events.length}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'messages' && currentMember && (
        <Card>
          <CardHeader>
            <CardTitle>Group Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-4 h-96 overflow-y-auto">
              {messages.map((message: any) => (
                <div key={message.id} className="flex space-x-3">
                  {message.user.profilePhoto && (
                    <Image
                      src={message.user.profilePhoto}
                      alt={message.user.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  )}
                  <div>
                    <div className="font-medium">{message.user.name}</div>
                    <div className="text-sm text-gray-600">{message.content}</div>
                    <div className="text-xs text-gray-500">
                      {formatDate(new Date(message.createdAt))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <Input
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Type a message..."
              />
              <Button type="submit">Send</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'files' && currentMember && (
        <Card>
          <CardHeader>
            <CardTitle>Files</CardTitle>
          </CardHeader>
          <CardContent>
            {currentMember.role !== 'VIEWER' && (
              <div className="mb-4">
                <Input
                  type="file"
                  onChange={handleFileUpload}
                  className="mb-2"
                />
              </div>
            )}
            <div className="space-y-2">
              {group.files.map((file: any) => (
                <div key={file.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <div className="font-medium">{file.name}</div>
                    <div className="text-sm text-gray-600">
                      Uploaded by {file.user.name} • {formatDate(new Date(file.createdAt))}
                    </div>
                  </div>
                  <a
                    href={`/api/files/${file.id}`}
                    download
                    className="text-blue-600 hover:underline"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'events' && currentMember && (
        <Card>
          <CardHeader>
            <CardTitle>Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {group.events.map((event: any) => (
                <div key={event.id} className="border rounded p-4">
                  <div className="font-medium">{event.title}</div>
                  <div className="text-sm text-gray-600">{event.description}</div>
                  <div className="text-sm text-gray-600 mt-2">
                    {formatDate(new Date(event.startTime))} - {formatDate(new Date(event.endTime))}
                  </div>
                  {event.location && (
                    <div className="text-sm text-gray-600">Location: {event.location}</div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'members' && currentMember && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Members ({group.members.length})</CardTitle>
              {currentMember.role === 'ADMIN' && (
                <Button onClick={() => setShowAddMember(true)} size="sm">
                  Add Member
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {showAddMember && currentMember.role === 'ADMIN' && (
              <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                <h3 className="font-medium mb-3">Add New Member</h3>
                <div className="space-y-3">
                  <Input
                    placeholder="Search by email or name..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchMembers()}
                  />
                  {searchResults.length > 0 && (
                    <div className="border rounded-lg max-h-48 overflow-y-auto">
                      {searchResults.map((user: any) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleAddMember(user.id)}
                        >
                          <div className="flex items-center space-x-2">
                            {user.profilePhoto && (
                              <Image
                                src={user.profilePhoto}
                                alt={user.name}
                                width={32}
                                height={32}
                                className="rounded-full"
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium">{user.name}</div>
                              <div className="text-xs text-gray-600">{user.email}</div>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            Add
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleSearchMembers}
                      size="sm"
                      disabled={!memberSearch.trim()}
                    >
                      Search
                    </Button>
                    <Button
                      onClick={() => {
                        setShowAddMember(false)
                        setMemberSearch('')
                        setSearchResults([])
                      }}
                      size="sm"
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-4">
              {group.members.map((member: any) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                >
                  <div className="flex items-center space-x-3">
                    {member.user.profilePhoto && (
                      <Image
                        src={member.user.profilePhoto}
                        alt={member.user.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    )}
                    <div>
                      <div className="font-medium">{member.user.name}</div>
                      <div className="text-sm text-gray-600">
                        {member.role} • {member.user.email}
                      </div>
                    </div>
                  </div>
                  {currentMember.role === 'ADMIN' &&
                    member.userId !== userId &&
                    member.role !== 'ADMIN' && (
                      <Button
                        onClick={() => handleRemoveMember(member.userId)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

