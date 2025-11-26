import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function ShareFilePage({
  params,
}: {
  params: { token: string }
}) {
  try {
    let file = await prisma.file.findUnique({
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

    if (!file && params.token.startsWith('https://')) {
      file = await prisma.file.findFirst({
        where: { 
          shareToken: params.token,
          isPublic: true,
        },
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
    }

    if (!file) {
      if (params.token.startsWith('https://')) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <CardTitle>Cloudinary File</CardTitle>
                <CardDescription>
                  Direct file access via Cloudinary URL
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <a
                    href={params.token}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button>Download File</Button>
                  </a>
                  <Link href="/">
                    <Button variant="outline">Go to Home</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }

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
              <Link href="/">
                <Button>Go to Home</Button>
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

    const isImage = file.fileType.startsWith('image/')
    const isPdf = file.fileType === 'application/pdf'

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

            {(isImage || isPdf) && (
              <div className="border rounded-lg p-4 bg-gray-50">
                {isImage ? (
                  <div className="flex justify-center">
                    {file.filePath.startsWith('http://') || file.filePath.startsWith('https://') ? (
                      <img
                        src={file.filePath}
                        alt={file.name}
                        className="max-w-full h-auto max-h-96 rounded"
                      />
                    ) : (
                      <img
                        src={file.filePath}
                        alt={file.name}
                        className="max-w-full h-auto max-h-96 rounded"
                      />
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">PDF Preview</p>
                    {file.filePath.startsWith('http://') || file.filePath.startsWith('https://') ? (
                      <iframe
                        src={file.filePath}
                        className="w-full h-96 border rounded"
                        title={file.name}
                      />
                    ) : (
                      <iframe
                        src={file.filePath}
                        className="w-full h-96 border rounded"
                        title={file.name}
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex space-x-2">
              <a
                href={`/api/files/${file.id}?token=${params.token}`}
                download={file.fileName}
              >
                <Button>Download File</Button>
              </a>
              <Link href="/">
                <Button variant="outline">Go to Home</Button>
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
            <Link href="/">
              <Button>Go to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }
}

