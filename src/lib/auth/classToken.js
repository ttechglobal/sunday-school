import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const COOKIE = 'class_token'
const ALG    = 'HS256'

function secret() {
  return new TextEncoder().encode(
    process.env.CLASS_JWT_SECRET || 'sunday-school-secret-change-in-prod'
  )
}

export async function signClassToken(payload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret())
}

export async function verifyClassToken() {
  try {
    const jar   = await cookies()
    const token = jar.get(COOKIE)?.value

    if (!token) {
      console.log('[classToken] no cookie found')
      return null
    }

    const { payload } = await jwtVerify(token, secret())

    if (!payload.classId || !payload.churchId) {
      console.error('[classToken] missing classId or churchId in payload:', payload)
      return null
    }

    return {
      classId:     String(payload.classId),
      churchId:    String(payload.churchId),
      className:   String(payload.className   || ''),
      churchName:  String(payload.churchName  || ''),
      isAdminView: Boolean(payload.isAdminView || false),
      adminId:     payload.adminId ? String(payload.adminId) : null,
    }
  } catch (err) {
    console.error('[classToken] verify failed:', err.message)
    return null
  }
}