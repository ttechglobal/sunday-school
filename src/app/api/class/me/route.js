import { NextResponse } from 'next/server'
import { verifyClassToken } from '@/lib/auth/classToken'

export async function GET() {
  const cls = await verifyClassToken()
  if (!cls) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({
    classId:    cls.classId,
    className:  cls.className,
    churchId:   cls.churchId,
    churchName: cls.churchName,
    groupName:  cls.groupName,
  })
}