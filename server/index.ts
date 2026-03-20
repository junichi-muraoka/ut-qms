import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import crypto from 'node:crypto'
import { testItemSchema, defectSchema, issueSchema } from './shared_schema.ts'
import type { TestItem, Defect, Issue } from './shared_schema.ts'

const app = new Hono()

app.use('/*', cors())

// --- In-Memory Storage (Mock DB) ---
const db = {
  testItems: [] as TestItem[],
  defects: [] as Defect[],
  issues: [] as Issue[],
}

app.get('/', (c) => {
  return c.text('UT-QMS API Running')
})

// --- Test Case Management ---

app.get('/api/test-items', (c) => {
  return c.json({ items: db.testItems })
})

app.get('/api/test-items/:id', (c) => {
  const id = c.req.param('id')
  const item = db.testItems.find((i: TestItem) => i.id === id)
  if (!item) return c.json({ error: 'Not Found' }, 404)
  return c.json(item)
})

app.post('/api/test-items', async (c) => {
  const body = await c.req.json()
  const result = testItemSchema.safeParse({
    ...body,
    id: body.id || crypto.randomUUID(),
    updatedAt: new Date(),
  })
  
  if (!result.success) {
    return c.json({ error: result.error }, 400)
  }
  
  db.testItems.push(result.data as TestItem)
  return c.json(result.data, 201)
})

app.put('/api/test-items/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const index = db.testItems.findIndex((i: TestItem) => i.id === id)
  
  if (index === -1) return c.json({ error: 'Not Found' }, 404)

  const updatedItem = {
    ...db.testItems[index],
    ...body,
    updatedAt: new Date()
  }

  const result = testItemSchema.safeParse(updatedItem)
  if (!result.success) {
    return c.json({ error: result.error }, 400)
  }

  db.testItems[index] = result.data as TestItem
  return c.json(result.data)
})

app.delete('/api/test-items/:id', (c) => {
  const id = c.req.param('id')
  const index = db.testItems.findIndex((i: TestItem) => i.id === id)
  if (index === -1) return c.json({ error: 'Not Found' }, 404)
  db.testItems.splice(index, 1)
  return c.json({ success: true })
})

app.patch('/api/test-items/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const index = db.testItems.findIndex((i: TestItem) => i.id === id)
  
  if (index === -1) return c.json({ error: 'Not found' }, 404)
  
  const updatedItem = {
    ...db.testItems[index],
    ...body,
    updatedAt: new Date(),
  }
  
  const result = testItemSchema.safeParse(updatedItem)
  if (!result.success) return c.json({ error: result.error }, 400)

  db.testItems[index] = result.data as TestItem
  return c.json(result.data)
})

// --- Defect Tracking ---

app.get('/api/defects', (c) => {
  return c.json({ items: db.defects })
})

app.get('/api/defects/:id', (c) => {
  const id = c.req.param('id')
  const defect = db.defects.find(d => d.id === id)
  if (!defect) return c.json({ error: 'Not Found' }, 404)
  return c.json(defect)
})

app.post('/api/defects', async (c) => {
  const body = await c.req.json()
  const result = defectSchema.safeParse({
    ...body,
    id: body.id || crypto.randomUUID(),
    updatedAt: new Date(),
  })

  if (!result.success) {
    return c.json({ error: result.error }, 400)
  }

  db.defects.push(result.data as Defect)
  return c.json(result.data, 201)
})

app.put('/api/defects/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const index = db.defects.findIndex(d => d.id === id)
  
  if (index === -1) return c.json({ error: 'Not Found' }, 404)

  const updatedDefect = {
    ...db.defects[index],
    ...body,
    updatedAt: new Date()
  }

  const result = defectSchema.safeParse(updatedDefect)
  if (!result.success) {
    return c.json({ error: result.error }, 400)
  }

  db.defects[index] = result.data as Defect
  return c.json(result.data)
})

app.delete('/api/defects/:id', (c) => {
  const id = c.req.param('id')
  const index = db.defects.findIndex(d => d.id === id)
  if (index === -1) return c.json({ error: 'Not Found' }, 404)
  db.defects.splice(index, 1)
  return c.json({ success: true })
})

// --- Issue & Progress ---

app.get('/api/issues', (c) => {
  return c.json({ items: db.issues })
})

app.get('/api/issues/:id', (c) => {
  const id = c.req.param('id')
  const issue = db.issues.find(i => i.id === id)
  if (!issue) return c.json({ error: 'Not Found' }, 404)
  return c.json(issue)
})

app.post('/api/issues', async (c) => {
  const body = await c.req.json()
  const result = issueSchema.safeParse({
    ...body,
    id: body.id || crypto.randomUUID(),
    updatedAt: new Date(),
  })

  if (!result.success) {
    return c.json({ error: result.error }, 400)
  }

  db.issues.push(result.data as Issue)
  return c.json(result.data, 201)
})

app.put('/api/issues/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const index = db.issues.findIndex(i => i.id === id)
  
  if (index === -1) return c.json({ error: 'Not Found' }, 404)

  const updatedIssue = {
    ...db.issues[index],
    ...body,
    updatedAt: new Date()
  }

  const result = issueSchema.safeParse(updatedIssue)
  if (!result.success) {
    return c.json({ error: result.error }, 400)
  }

  db.issues[index] = result.data as Issue
  return c.json(result.data)
})

app.delete('/api/issues/:id', (c) => {
  const id = c.req.param('id')
  const index = db.issues.findIndex(i => i.id === id)
  if (index === -1) return c.json({ error: 'Not Found' }, 404)
  db.issues.splice(index, 1)
  return c.json({ success: true })
})

// --- Quality Stats ---

app.get('/api/trends', (c) => {
  // Mock time-series data for charts (Burndown and Quality Trends)
  const today = new Date().toISOString().split('T')[0]
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })

  // Burndown: Remaining Issues
  const totalIssuesEnvisaged = 20
  const progressTrend = last7Days.map((date, i) => ({
    date,
    remaining: Math.max(0, totalIssuesEnvisaged - (i * 2 + Math.floor(Math.random() * 2))),
    ideal: Math.max(0, totalIssuesEnvisaged - (i * 3))
  }))
  // Overwrite today with actual current data
  progressTrend[6] = {
    date: today,
    remaining: db.issues.length - db.issues.filter(i => i.status === 'Done').length,
    ideal: Math.max(0, totalIssuesEnvisaged - 18)
  }

  // Quality: Cumulative Defects vs Pass Rate
  const qualityTrend = last7Days.map((date, i) => ({
    date,
    defects: i * 2 + Math.floor(Math.random() * 3),
    passRate: 50 + (i * 5) + Math.floor(Math.random() * 5)
  }))
  // Overwrite today with actual current data
  qualityTrend[6] = {
    date: today,
    defects: db.defects.length,
    passRate: db.testItems.length > 0 ? (db.testItems.filter(i => i.status === 'Pass').length / db.testItems.length) * 100 : 0
  }

  return c.json({
    progressTrend,
    qualityTrend
  })
})

app.get('/api/stats', (c) => {
  const totalTests = db.testItems.length
  const passCount = db.testItems.filter(i => i.status === 'Pass').length
  const failCount = db.testItems.filter(i => i.status === 'Fail').length
  
  const testPassRate = totalTests > 0 ? (passCount / totalTests) * 100 : 0
  
  const totalDefects = db.defects.length
  const openDefects = db.defects.filter(d => d.status !== 'Closed').length
  
  const totalIssues = db.issues.length
  const doneIssues = db.issues.filter(i => i.status === 'Done').length
  const progress = totalIssues > 0 ? (doneIssues / totalIssues) * 100 : 0

  return c.json({
    totalTests,
    passCount,
    failCount,
    testPassRate,
    totalDefects,
    openDefects,
    totalIssues,
    progress
  })
})

const port = 3001
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})
