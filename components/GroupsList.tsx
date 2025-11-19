'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Button } from './ui/button'

interface Group {
  id: string
  name: string
  description: string | null
  courseTopic: string
  tags: string[]
  members: Array<{
    user: {
      id: string
      name: string
      email: string
      profilePhoto: string | null
    }
  }>
  _count: {
    members: number
    files: number
    events: number
  }
}

export function GroupsList() {
  const [groups, setGroups] = useState<Group[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchGroups = useCallback(async () => {
    try {
      const url = search
        ? `/api/groups?search=${encodeURIComponent(search)}`
        : '/api/groups'
      const response = await fetch(url)
      const data = await response.json()
      setGroups(data.groups || [])
    } catch (error) {
      console.error('Error fetching groups:', error)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search groups..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <CardTitle>
                <Link href={`/groups/${group.id}`} className="hover:underline">
                  {group.name}
                </Link>
              </CardTitle>
              <CardDescription>{group.courseTopic}</CardDescription>
            </CardHeader>
            <CardContent>
              {group.description && (
                <p className="text-sm text-gray-600 mb-4">{group.description}</p>
              )}
              <div className="flex flex-wrap gap-2 mb-4">
                {group.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="text-sm text-gray-600">
                {group._count.members} members • {group._count.files} files • {group._count.events} events
              </div>
              <Button asChild className="mt-4 w-full">
                <Link href={`/groups/${group.id}`}>View Group</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No groups found</p>
        </div>
      )}
    </div>
  )
}

