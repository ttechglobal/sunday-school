import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/auth/getAdminUser'
import { supabaseAdmin } from '@/lib/supabase/admin'

function getDateRange(scope) {
  const now   = new Date()
  const year  = now.getFullYear()
  const month = now.getMonth()

  if (scope === 'sunday') {
    // Most recent approved session date
    return { type: 'sunday' }
  }
  if (scope === 'month') {
    const from = new Date(year, month, 1).toISOString().slice(0, 10)
    const to   = new Date(year, month + 1, 0).toISOString().slice(0, 10)
    return { from, to, type: 'month' }
  }
  if (scope === 'year') {
    const from = new Date(year, 0, 1).toISOString().slice(0, 10)
    const to   = new Date(year, 11, 31).toISOString().slice(0, 10)
    return { from, to, type: 'year' }
  }
}

function getPrevRange(scope) {
  const now   = new Date()
  const year  = now.getFullYear()
  const month = now.getMonth()

  if (scope === 'month') {
    const from = new Date(year, month - 1, 1).toISOString().slice(0, 10)
    const to   = new Date(year, month, 0).toISOString().slice(0, 10)
    return { from, to }
  }
  if (scope === 'year') {
    const from = new Date(year - 1, 0, 1).toISOString().slice(0, 10)
    const to   = new Date(year - 1, 11, 31).toISOString().slice(0, 10)
    return { from, to }
  }
  return null
}

export async function GET(request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const scope = searchParams.get('scope') || 'month'

  // Get all approved batches
  const { data: allBatches } = await supabaseAdmin
    .from('submission_batches')
    .select(`
      id, present_count, record_count, total_offering,
      class_id, session_id,
      classes ( id, name, group_name ),
      sessions ( id, session_date )
    `)
    .eq('church_id', admin.churchId)
    .eq('status',    'approved')
    .order('sessions(session_date)', { ascending: false })

  const batches = allBatches || []

  // Filter by scope
  let currentBatches = batches
  let prevBatches    = []

  if (scope === 'sunday') {
    // Most recent date
    const latestDate = batches[0]?.sessions?.session_date
    currentBatches = latestDate ? batches.filter(b => b.sessions?.session_date === latestDate) : []

    // Previous Sunday
    const prevDate = batches.find(b => b.sessions?.session_date && b.sessions.session_date !== latestDate)?.sessions?.session_date
    prevBatches = prevDate ? batches.filter(b => b.sessions?.session_date === prevDate) : []

  } else if (scope === 'month' || scope === 'year') {
    const range = getDateRange(scope)
    currentBatches = batches.filter(b => {
      const d = b.sessions?.session_date
      return d && d >= range.from && d <= range.to
    })
    const prev = getPrevRange(scope)
    if (prev) {
      prevBatches = batches.filter(b => {
        const d = b.sessions?.session_date
        return d && d >= prev.from && d <= prev.to
      })
    }
  }

  // Get attendance records for current period
  const sessionIds = [...new Set(currentBatches.map(b => b.session_id).filter(Boolean))]

  let attendanceRecords = []
  if (sessionIds.length > 0) {
    const { data: records } = await supabaseAdmin
      .from('attendance_records')
      .select('session_id, class_id, attendance, on_time, bible, memory_verse, offering, member_id, member_type, members(id, first_name, last_name, full_name)')
      .in('session_id', sessionIds)
      .eq('church_id', admin.churchId)

    attendanceRecords = records || []
  }

  // Compute stats
  function computeStats(batches, records) {
    const totalPresent  = batches.reduce((s, b) => s + (b.present_count  || 0), 0)
    const totalRecords  = batches.reduce((s, b) => s + (b.record_count   || 0), 0)
    const totalOffering = batches.reduce((s, b) => s + (b.total_offering || 0), 0)

    const presentRecs   = records.filter(r => r.attendance === 'present')
    const totalOnTime   = presentRecs.filter(r => r.on_time).length
    const totalBible    = presentRecs.filter(r => r.bible).length
    const totalVerse    = presentRecs.filter(r => r.memory_verse).length

    return {
      totalPresent,
      totalAbsent:  totalRecords - totalPresent,
      totalRecords,
      totalOffering,
      totalOnTime,
      totalBible,
      totalVerse,
      attendanceRate: totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0,
      onTimeRate:     totalPresent > 0 ? Math.round((totalOnTime  / totalPresent) * 100) : 0,
      bibleRate:      totalPresent > 0 ? Math.round((totalBible   / totalPresent) * 100) : 0,
      verseRate:      totalPresent > 0 ? Math.round((totalVerse   / totalPresent) * 100) : 0,
    }
  }

  const prevSessionIds = [...new Set(prevBatches.map(b => b.session_id).filter(Boolean))]
  let prevRecords = []
  if (prevSessionIds.length > 0) {
    const { data: pr } = await supabaseAdmin
      .from('attendance_records')
      .select('session_id, attendance, on_time, bible, memory_verse, offering')
      .in('session_id', prevSessionIds)
      .eq('church_id', admin.churchId)
    prevRecords = pr || []
  }

  const stats     = computeStats(currentBatches, attendanceRecords)
  const prevStats = computeStats(prevBatches, prevRecords)

  // Group breakdown
  const groupMap = {}
  for (const b of currentBatches) {
    const g = b.classes?.group_name || 'General'
    if (!groupMap[g]) groupMap[g] = { group: g, present: 0, total: 0 }
    groupMap[g].present += b.present_count || 0
    groupMap[g].total   += b.record_count  || 0
  }
  const groups = Object.values(groupMap).map(g => ({
    ...g,
    rate: g.total > 0 ? Math.round((g.present / g.total) * 100) : 0,
  })).sort((a, b) => b.present - a.present)

  // Insights (max 5)
  const insights = []

  // 1. Consecutive absences per member (3+)
  const memberAbsences = {}
  const allSessions = [...new Set(batches.map(b => b.sessions?.session_date).filter(Boolean))].sort().reverse()

  for (const record of attendanceRecords) {
    if (record.attendance === 'absent' && record.member_id && record.member_type === 'member') {
      const name = record.members?.full_name ||
        `${record.members?.first_name || ''} ${record.members?.last_name || ''}`.trim()
      const clsName = currentBatches.find(b => b.session_id === record.session_id)?.classes?.name || ''
      if (!memberAbsences[record.member_id]) memberAbsences[record.member_id] = { name, clsName, count: 0 }
      memberAbsences[record.member_id].count++
    }
  }

  const longAbsent = Object.values(memberAbsences)
    .filter(m => m.count >= 4)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  if (longAbsent.length > 0) {
    insights.push(`${longAbsent.length} member${longAbsent.length > 1 ? 's' : ''} ${longAbsent.length > 1 ? 'have' : 'has'} been absent for 4+ Sundays recently — including ${longAbsent[0].name} (${longAbsent[0].clsName})`)
  }

  // 2. Classes with perfect attendance this period
  const perfectClasses = currentBatches.filter(b => b.present_count === b.record_count && b.record_count > 0)
  if (perfectClasses.length > 0) {
    const names = perfectClasses.map(b => b.classes?.name).filter(Boolean).join(', ')
    insights.push(`Perfect attendance this period: ${names}`)
  }

  // 3. Offering trend
  if (prevStats.totalOffering > 0) {
    const diff    = stats.totalOffering - prevStats.totalOffering
    const pct     = Math.abs(Math.round((diff / prevStats.totalOffering) * 100))
    const direction = diff >= 0 ? 'up' : 'down'
    if (pct >= 5) {
      insights.push(`Offering is ${direction} ${pct}% compared to the previous period — ₦${Math.abs(diff).toLocaleString('en-NG')} ${diff >= 0 ? 'more' : 'less'}`)
    }
  }

  // 4. Attendance trend
  if (prevStats.attendanceRate > 0) {
    const diff = stats.attendanceRate - prevStats.attendanceRate
    if (Math.abs(diff) >= 3) {
      insights.push(`Attendance is ${diff >= 0 ? 'up' : 'down'} ${Math.abs(diff)} percentage points compared to the previous period`)
    }
  }

  // 5. Best and worst group
  if (groups.length >= 2) {
    const best  = groups[0]
    const worst = groups[groups.length - 1]
    if (best.rate - worst.rate >= 10) {
      insights.push(`${best.group} has the highest attendance rate (${best.rate}%) while ${worst.group} has the lowest (${worst.rate}%)`)
    }
  }

  return NextResponse.json({
    scope,
    stats,
    prevStats,
    groups,
    insights: insights.slice(0, 5),
    currentDate: currentBatches[0]?.sessions?.session_date || null,
  })
}