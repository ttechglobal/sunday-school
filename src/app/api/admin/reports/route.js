import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

async function getChurchId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabaseAdmin
    .from('profiles').select('church_id').eq('id', user.id).single()
  return data?.church_id || null
}

function formatNaira(v) {
  return `₦${Number(v || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}

export async function GET(request) {
  const churchId = await getChurchId()
  if (!churchId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const type    = searchParams.get('type')    || 'combined'
  const scope   = searchParams.get('scope')   || 'church'
  const period  = searchParams.get('period')  || 'single'
  const date    = searchParams.get('date')
  const month   = searchParams.get('month')
  const from    = searchParams.get('from')
  const to      = searchParams.get('to')
  const classId = searchParams.get('classId')
  const group   = searchParams.get('group')

  // Build date range
  let dateFrom, dateTo
  if (period === 'single' && date) { dateFrom = date; dateTo = date }
  else if (period === 'monthly' && month) {
    const [y, m] = month.split('-')
    dateFrom = `${y}-${m}-01`
    dateTo   = new Date(parseInt(y), parseInt(m), 0).toISOString().slice(0, 10)
  } else if (period === 'range' && from && to) { dateFrom = from; dateTo = to }

  if (!dateFrom || !dateTo) {
    return NextResponse.json({ error: 'Please select a valid date range.' }, { status: 400 })
  }

  // Get sessions in range
  let sessionQuery = supabaseAdmin
    .from('sessions')
    .select('id, session_date')
    .eq('church_id', churchId)
    .gte('session_date', dateFrom)
    .lte('session_date', dateTo)
    .order('session_date')

  const { data: sessions } = await sessionQuery
  if (!sessions?.length) {
    return NextResponse.json({
      title: `No sessions found between ${dateFrom} and ${dateTo}`,
      summary: {}, rows: [], columns: [],
    })
  }

  const sessionIds = sessions.map(s => s.id)

  // Get attendance records
  let attQuery = supabaseAdmin
    .from('attendance_records')
    .select('session_id, class_id, member_id, attendance, on_time, bible, memory_verse, offering, classes(name, group_name)')
    .eq('church_id', churchId)
    .in('session_id', sessionIds)

  if (scope === 'class' && classId) attQuery = attQuery.eq('class_id', classId)
  if (scope === 'group' && group) attQuery = attQuery.eq('classes.group_name', group)

  const { data: records } = await attQuery

  // Aggregate
  const totalPresent     = (records || []).filter(r => r.attendance === 'present').length
  const totalOnTime      = (records || []).filter(r => r.on_time).length
  const totalBible       = (records || []).filter(r => r.bible).length
  const totalMemoryVerse = (records || []).filter(r => r.memory_verse).length
  const totalOffering    = (records || []).reduce((s, r) => s + parseFloat(r.offering || 0), 0)

  // Build per-session rows
  const rowsBySession = {}
  for (const rec of (records || [])) {
    const sess = sessions.find(s => s.id === rec.session_id)
    if (!sess) continue
    if (!rowsBySession[sess.session_date]) {
      rowsBySession[sess.session_date] = { present: 0, onTime: 0, bible: 0, verse: 0, offering: 0 }
    }
    const r = rowsBySession[sess.session_date]
    if (rec.attendance === 'present') r.present++
    if (rec.on_time) r.onTime++
    if (rec.bible)   r.bible++
    if (rec.memory_verse) r.verse++
    r.offering += parseFloat(rec.offering || 0)
  }

  const columns = type === 'offering'
    ? ['Date', 'Offering']
    : type === 'attendance'
    ? ['Date', 'Present', 'On Time', 'Bible', 'Memory Verse']
    : ['Date', 'Present', 'On Time', 'Bible', 'Verse', 'Offering']

  const rows = Object.entries(rowsBySession).map(([date, agg]) => ({
    cells: type === 'offering'
      ? [date, formatNaira(agg.offering)]
      : type === 'attendance'
      ? [date, agg.present, agg.onTime, agg.bible, agg.verse]
      : [date, agg.present, agg.onTime, agg.bible, agg.verse, formatNaira(agg.offering)],
  }))

  // Totals row
  rows.push({
    isTotal: true,
    cells: type === 'offering'
      ? ['TOTAL', formatNaira(totalOffering)]
      : type === 'attendance'
      ? ['TOTAL', totalPresent, totalOnTime, totalBible, totalMemoryVerse]
      : ['TOTAL', totalPresent, totalOnTime, totalBible, totalMemoryVerse, formatNaira(totalOffering)],
  })

  const summary = {}
  if (type !== 'offering') {
    summary['Present']  = totalPresent
    summary['On Time']  = totalOnTime
    summary['Bible']    = totalBible
    summary['Verse']    = totalMemoryVerse
  }
  if (type !== 'attendance') summary['Total Offering'] = formatNaira(totalOffering)
  summary['Sessions'] = sessions.length

  return NextResponse.json({
    title: `${dateFrom === dateTo ? dateFrom : `${dateFrom} – ${dateTo}`}`,
    summary, rows, columns,
  })
}