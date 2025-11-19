import { NextRequest, NextResponse } from 'next/server'
import { sendEventReminders } from '@/lib/event-reminders'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await sendEventReminders()
    return NextResponse.json({ message: 'Event reminders sent' }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

