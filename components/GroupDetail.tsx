'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { formatDate } from '@/lib/utils'
import { getSocket } from '@/lib/socket'
import { CreateEventFormInline } from './CreateEventFormInline'

interface GroupDetailProps {
  group: any
  currentMember: any
  userId: string
}

export function GroupDetail({ group, currentMember, userId }: GroupDetailProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'messages' | 'files' | 'events' | 'members'>('overview')
  const [messageContent, setMessageContent] = useState('')
  const [messages, setMessages] = useState(group.messages)
  const [socket, setSocket] = useState<any>(null)
  const [showAddMember, setShowAddMember] = useState(false)
  const [memberSearch, setMemberSearch] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showInviteLink, setShowInviteLink] = useState(false)
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [sharingFiles, setSharingFiles] = useState<Set<string>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadingFileName, setUploadingFileName] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [showFileSelector, setShowFileSelector] = useState(false)

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

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

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

  const handleGenerateInviteLink = async () => {
    try {
      const response = await fetch(`/api/groups/${group.id}/invite`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        setInviteUrl(data.inviteUrl)
        setShowInviteLink(true)
        toast.success('Invite link generated')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to generate invite link')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleGetInviteLink = async () => {
    try {
      const response = await fetch(`/api/groups/${group.id}/invite`)

      if (response.ok) {
        const data = await response.json()
        if (data.inviteUrl) {
          setInviteUrl(data.inviteUrl)
          setShowInviteLink(true)
        } else {
          await handleGenerateInviteLink()
        }
      } else {
        await handleGenerateInviteLink()
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleShareFile = async (fileId: string) => {
    try {
      const newSet = new Set(sharingFiles)
      newSet.add(fileId)
      setSharingFiles(newSet)
      const response = await fetch(`/api/files/${fileId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: true }),
      })

      if (response.ok) {
        const data = await response.json()
        navigator.clipboard.writeText(data.shareUrl)
        toast.success('Share link copied to clipboard!')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to generate share link')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      const newSet = new Set(sharingFiles)
      newSet.delete(fileId)
      setSharingFiles(newSet)
    }
  }

  const handleCreateEvent = async (eventData: any) => {
    try {
      const startDate = new Date(eventData.startTime)
      const endDate = new Date(eventData.endTime)

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...eventData,
          groupId: group.id,
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Event created successfully')
        setShowCreateEvent(false)
        router.refresh()
      } else {
        toast.error(data.error || 'Failed to create event')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleDeleteGroup = async () => {
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone and will delete all messages, files, and events in this group.')) {
      return
    }

    try {
      const response = await fetch(`/api/groups/${group.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Group deleted successfully')
        router.push('/groups')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to delete group')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageContent.trim() && selectedFiles.size === 0) return

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: group.id,
          content: messageContent || 'Shared file(s)',
          attachmentIds: Array.from(selectedFiles),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessages((prev: any[]) => [...prev, data.message])
        setMessageContent('')
        setSelectedFiles(new Set())
        setShowFileSelector(false)
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

  const toggleFileSelection = (fileId: string) => {
    const newSet = new Set(selectedFiles)
    if (newSet.has(fileId)) {
      newSet.delete(fileId)
    } else {
      newSet.add(fileId)
    }
    setSelectedFiles(newSet)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('groupId', group.id)
    formData.append('name', file.name)

    setIsUploading(true)
    setUploadProgress(0)
    setUploadingFileName(file.name)

    try {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(percentComplete)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          toast.success('File uploaded successfully')
          setUploadProgress(100)
          setTimeout(() => {
            setIsUploading(false)
            setUploadProgress(0)
            setUploadingFileName(null)
            router.refresh()
          }, 500)
        } else {
          const error = JSON.parse(xhr.responseText || '{}')
          toast.error(error.error || 'Failed to upload file')
          setIsUploading(false)
          setUploadProgress(0)
          setUploadingFileName(null)
        }
      })

      xhr.addEventListener('error', () => {
        toast.error('An error occurred during upload')
        setIsUploading(false)
        setUploadProgress(0)
        setUploadingFileName(null)
      })

      xhr.addEventListener('abort', () => {
        toast.error('Upload cancelled')
        setIsUploading(false)
        setUploadProgress(0)
        setUploadingFileName(null)
      })

      xhr.open('POST', '/api/files')
      xhr.send(formData)
    } catch (error) {
      toast.error('An error occurred')
      setIsUploading(false)
      setUploadProgress(0)
      setUploadingFileName(null)
    }

    e.target.value = ''
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
        {currentMember?.role === 'ADMIN' && (
          <div className="mt-4 flex items-center space-x-2">
            <Button onClick={handleGetInviteLink} variant="outline" size="sm">
              Get Invite Link
            </Button>
            <Button
              onClick={handleDeleteGroup}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
            >
              Delete Group
            </Button>
            {showInviteLink && inviteUrl && (
              <div className="mt-2 p-3 bg-gray-50 rounded border">
                <p className="text-sm font-medium mb-2">Invite Link:</p>
                <div className="flex items-center space-x-2">
                  <Input
                    value={inviteUrl}
                    readOnly
                    className="text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(inviteUrl)
                      toast.success('Link copied!')
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            )}
          </div>
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
          <CardContent className="p-0">
            <div className="flex flex-col h-[500px]">
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.length === 0 && (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                )}
                {messages.map((message: any) => {
                  const isCurrentUser = message.userId === userId
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`flex items-end space-x-2 max-w-[70%] ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}
                      >
                        {!isCurrentUser && message.user.profilePhoto && (
                          <Image
                            src={message.user.profilePhoto}
                            alt={message.user.name}
                            width={32}
                            height={32}
                            className="rounded-full flex-shrink-0"
                          />
                        )}
                        <div
                          className={`rounded-2xl px-4 py-2 shadow-sm ${
                            isCurrentUser
                              ? 'bg-blue-600 text-white rounded-br-md'
                              : 'bg-white text-gray-900 rounded-bl-md border border-gray-200'
                          }`}
                        >
                          {!isCurrentUser && (
                            <div className="text-xs font-semibold mb-1 text-gray-700">
                              {message.user.name}
                            </div>
                          )}
                          <div
                            className={`text-sm break-words ${
                              isCurrentUser ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {message.content}
                          </div>
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {message.attachments.map((attachment: any) => (
                                <a
                                  key={attachment.id}
                                  href={`/api/messages/attachments/${attachment.id}`}
                                  download
                                  className={`block text-xs underline ${
                                    isCurrentUser ? 'text-blue-100' : 'text-blue-600'
                                  }`}
                                >
                                  📎 {attachment.fileName}
                                </a>
                              ))}
                            </div>
                          )}
                          <div
                            className={`text-xs mt-1 ${
                              isCurrentUser
                                ? 'text-blue-100'
                                : 'text-gray-500'
                            }`}
                          >
                            {new Date(message.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                        {isCurrentUser && message.user.profilePhoto && (
                          <Image
                            src={message.user.profilePhoto}
                            alt={message.user.name}
                            width={32}
                            height={32}
                            className="rounded-full flex-shrink-0"
                          />
                        )}
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
              <div className="border-t p-4 bg-white">
                {selectedFiles.size > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {Array.from(selectedFiles).map((fileId) => {
                      const file = group.files.find((f: any) => f.id === fileId)
                      return file ? (
                        <span
                          key={fileId}
                          className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs"
                        >
                          {file.name}
                          <button
                            type="button"
                            onClick={() => toggleFileSelection(fileId)}
                            className="ml-2 text-blue-700 hover:text-blue-900"
                          >
                            ×
                          </button>
                        </span>
                      ) : null
                    })}
                  </div>
                )}
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <Input
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFileSelector(!showFileSelector)}
                    className="whitespace-nowrap"
                  >
                    📎 Attach
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Send
                  </Button>
                </form>
                {showFileSelector && (
                  <div className="mt-2 p-3 bg-gray-50 rounded border max-h-40 overflow-y-auto">
                    <p className="text-xs font-medium mb-2 text-gray-700">Select files to share:</p>
                    <div className="space-y-1">
                      {group.files.length === 0 ? (
                        <p className="text-xs text-gray-500">No files available</p>
                      ) : (
                        group.files.map((file: any) => (
                          <label
                            key={file.id}
                            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-1 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={selectedFiles.has(file.id)}
                              onChange={() => toggleFileSelection(file.id)}
                              className="rounded"
                            />
                            <span className="text-xs text-gray-700">{file.name}</span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
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
              <div className="mb-4 space-y-2">
                <Input
                  type="file"
                  onChange={handleFileUpload}
                  className="mb-2"
                  disabled={isUploading}
                />
                {isUploading && uploadingFileName && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Uploading: {uploadingFileName}</span>
                      <span className="text-gray-600 font-medium">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
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
                    {file.shareToken && (
                      <div className="text-xs text-green-600 mt-1">
                        Shared • <a
                          href={`/files/share/${file.shareToken}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          View share link
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <a
                      href={`/api/files/${file.id}`}
                      download
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Download
                    </a>
                    {(file.userId === userId || currentMember.role === 'ADMIN') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleShareFile(file.id)}
                        disabled={sharingFiles.has(file.id)}
                      >
                        {sharingFiles.has(file.id) ? 'Sharing...' : 'Share'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'events' && currentMember && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Events</CardTitle>
              {currentMember.role !== 'VIEWER' && (
                <Button onClick={() => setShowCreateEvent(!showCreateEvent)} size="sm">
                  {showCreateEvent ? 'Cancel' : 'Create Event'}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {showCreateEvent && currentMember.role !== 'VIEWER' && (
              <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                <h3 className="font-medium mb-3">Create New Event</h3>
                <CreateEventFormInline
                  groupId={group.id}
                  onSubmit={handleCreateEvent}
                  onCancel={() => setShowCreateEvent(false)}
                />
              </div>
            )}
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

