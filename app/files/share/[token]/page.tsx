import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function ShareFilePage({
  params,
}: {
  params: { token: string }
}) {
  try {
    const file = await prisma.file.findUnique({
      where: { shareToken: params.token },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!file) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>File Not Found</CardTitle>
              <CardDescription>
                This file link is invalid or has expired.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/groups">
                <Button>Go to Groups</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )
    }

    if (!file.isPublic) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>File Access Restricted</CardTitle>
              <CardDescription>
                This file is not publicly accessible. Please sign in to view it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/auth/signin?redirect=/files/share/${params.token}`}>
                <Button>Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )
    }

    const filePath = join(process.cwd(), 'public', file.filePath)
    const fileBuffer = await readFile(filePath)

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>{file.name}</CardTitle>
            <CardDescription>
              Shared by {file.user.name} from {file.group.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <strong>File Name:</strong> {file.fileName}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Size:</strong> {(file.fileSize / 1024 / 1024).toFixed(2)} MB
              </p>
              <p className="text-sm text-gray-600">
                <strong>Type:</strong> {file.fileType}
              </p>
            </div>
            <div className="flex space-x-2">
              <a
                href={`/api/files/${file.id}?token=${params.token}`}
                download={file.fileName}
              >
                <Button>Download File</Button>
              </a>
              <Link href={`/groups/${file.groupId}`}>
                <Button variant="outline">View Group</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              An error occurred while loading the file.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/groups">
              <Button>Go to Groups</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }
}

