import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  program: z.string().optional(),
  semester: z.number().int().positive().optional(),
  skills: z.array(z.string()).optional(),
  profileVisibility: z.enum(['PUBLIC', 'RESTRICTED', 'PRIVATE']).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        program: true,
        semester: true,
        skills: true,
        profilePhoto: true,
        profileVisibility: true,
        emailNotifications: true,
        pushNotifications: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const profilePhoto = formData.get('profilePhoto') as File | null
    const name = formData.get('name') as string | null
    const program = formData.get('program') as string | null
    const semester = formData.get('semester') as string | null
    const skills = formData.get('skills') as string | null
    const profileVisibility = formData.get('profileVisibility') as string | null

    const updateData: any = {}

    if (name) updateData.name = name
    if (program !== null) updateData.program = program || null
    if (semester) updateData.semester = parseInt(semester) || null
    if (skills) {
      try {
        updateData.skills = JSON.parse(skills)
      } catch {
        updateData.skills = skills.split(',').map(s => s.trim())
      }
    }
    if (profileVisibility) {
      updateData.profileVisibility = profileVisibility
    }

    const emailNotifications = formData.get('emailNotifications') as string | null
    const pushNotifications = formData.get('pushNotifications') as string | null
    
    if (emailNotifications !== null) {
      updateData.emailNotifications = emailNotifications === 'true'
    }
    if (pushNotifications !== null) {
      updateData.pushNotifications = pushNotifications === 'true'
    }

    if (profilePhoto) {
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'profiles')
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true })
      }

      const fileName = `${session.user.id}-${Date.now()}-${profilePhoto.name}`
      const filePath = join(uploadsDir, fileName)
      const bytes = await profilePhoto.arrayBuffer()
      const buffer = Buffer.from(bytes)

      await writeFile(filePath, buffer)
      updateData.profilePhoto = `/uploads/profiles/${fileName}`
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        program: true,
        semester: true,
        skills: true,
        profilePhoto: true,
        profileVisibility: true,
        emailNotifications: true,
        pushNotifications: true,
      },
    })

    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

