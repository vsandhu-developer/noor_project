'use client'

import { useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import Link from 'next/link'
import Image from 'next/image'

export function SearchComponent() {
  const [query, setQuery] = useState('')
  const [type, setType] = useState<'all' | 'groups' | 'users' | 'files'>('all')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    try {
      const searchType = type === 'all' ? '' : type
      const url = searchType
        ? `/api/search?q=${encodeURIComponent(query)}&type=${searchType}`
        : `/api/search?q=${encodeURIComponent(query)}`

      const response = await fetch(url)
      const data = await response.json()
      setResults(data.results)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex space-x-4">
        <Input
          placeholder="Search groups, users, files..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          className="px-4 py-2 border rounded-md"
        >
          <option value="all">All</option>
          <option value="groups">Groups</option>
          <option value="users">Users</option>
          <option value="files">Files</option>
        </select>
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {results && (
        <div className="space-y-6">
          {results.groups && results.groups.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Groups</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.groups.map((group: any) => (
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
                      <div className="text-sm text-gray-500">
                        {group._count.members} members
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {results.users && results.users.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Users</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.users.map((user: any) => (
                  <Card key={user.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-3">
                        {user.profilePhoto && (
                          <Image
                            src={user.profilePhoto}
                            alt={user.name}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        )}
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.program && (
                            <div className="text-sm text-gray-500">{user.program}</div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {results.files && results.files.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Files</h2>
              <div className="space-y-2">
                {results.files.map((file: any) => (
                  <Card key={file.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{file.name}</div>
                          <div className="text-sm text-gray-500">
                            {file.group.name} • {file.user.name}
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {results &&
            (!results.groups || results.groups.length === 0) &&
            (!results.users || results.users.length === 0) &&
            (!results.files || results.files.length === 0) && (
              <div className="text-center py-12">
                <p className="text-gray-500">No results found</p>
              </div>
            )}
        </div>
      )}
    </div>
  )
}

