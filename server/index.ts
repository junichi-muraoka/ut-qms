import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { testItemSchema, defectSchema, issueSchema } from './shared_schema'
import { getLocalDb, getProductionDb } from './db/index'
import * as schema from './db/schema'
import { eq, desc } from 'drizzle-orm'

import { authMiddleware, AuthUser } from './auth'

type Bindings = {
  DB: D1Database
  CF_TEAM_DOMAIN: string
  CF_ACCESS_AUD: string
}

type Variables = {
  db: any
  user: AuthUser
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

app.use('/*', cors())

// Middleware to inject DB
app.use('*', async (c, next) => {
  let db;
  if (c.env && c.env.DB) {
    // Production (Cloudflare D1)
    db = getProductionDb(c.env.DB);
  } else {
    // Local (better-sqlite3)
    db = await getLocalDb();
  }
  c.set('db', db);
  await next();
});

// Auth Middleware for all API routes
app.use('/api/*', authMiddleware);

const getDb = (c: any) => c.get('db');

app.get('/', (c) => {
  return c.text('Qraft API Running')
})

app.get('/api/me', (c) => {
  const user = c.get('user');
  return c.json({ user });
});

// --- Test Case Management ---

app.get('/api/test-items', async (c) => {
  const db = getDb(c);
  const items = await db.query.testItems.findMany({
    orderBy: [desc(schema.testItems.updatedAt)]
  })
  return c.json({ items })
})

app.get('/api/test-items/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id')
  const item = await db.query.testItems.findFirst({
    where: eq(schema.testItems.id, id)
  })
  if (!item) return c.json({ error: 'Not Found' }, 404)
  return c.json(item)
})

app.post('/api/test-items', async (c) => {
  const db = getDb(c);
  const body = await c.req.json()
  const id = body.id || crypto.randomUUID()
  const result = testItemSchema.safeParse({
    ...body,
    id,
    updatedAt: new Date(),
  })
  
  if (!result.success) {
    return c.json({ error: result.error }, 400)
  }
  
  await db.insert(schema.testItems).values(result.data as any)
  return c.json(result.data, 201)
})

app.put('/api/test-items/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id')
  const body = await c.req.json()
  
  const existing = await db.query.testItems.findFirst({
    where: eq(schema.testItems.id, id)
  })
  if (!existing) return c.json({ error: 'Not Found' }, 404)

  const updatedItem = {
    ...existing,
    ...body,
    updatedAt: new Date()
  }

  const result = testItemSchema.safeParse(updatedItem)
  if (!result.success) {
    return c.json({ error: result.error }, 400)
  }

  await db.update(schema.testItems).set(result.data as any).where(eq(schema.testItems.id, id))
  return c.json(result.data)
})

app.delete('/api/test-items/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id')
  const result = await db.delete(schema.testItems).where(eq(schema.testItems.id, id))
  if (result.changes === 0) return c.json({ error: 'Not Found' }, 404)
  return c.json({ success: true })
})

// --- Defect Tracking ---

app.get('/api/defects', async (c) => {
  const db = getDb(c);
  const items = await db.query.defects.findMany({
    orderBy: [desc(schema.defects.updatedAt)]
  })
  return c.json({ items })
})

app.get('/api/defects/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id')
  const item = await db.query.defects.findFirst({
    where: eq(schema.defects.id, id)
  })
  if (!item) return c.json({ error: 'Not Found' }, 404)
  return c.json(item)
})

app.post('/api/defects', async (c) => {
  const db = getDb(c);
  const body = await c.req.json()
  const id = body.id || crypto.randomUUID()
  const result = defectSchema.safeParse({
    ...body,
    id,
    updatedAt: new Date(),
  })

  if (!result.success) {
    return c.json({ error: result.error }, 400)
  }

  await db.insert(schema.defects).values(result.data as any)
  return c.json(result.data, 201)
})

app.put('/api/defects/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id')
  const body = await c.req.json()
  const existing = await db.query.defects.findFirst({
    where: eq(schema.defects.id, id)
  })
  
  if (!existing) return c.json({ error: 'Not Found' }, 404)

  const updatedDefect = {
    ...existing,
    ...body,
    updatedAt: new Date()
  }

  const result = defectSchema.safeParse(updatedDefect)
  if (!result.success) {
    return c.json({ error: result.error }, 400)
  }

  await db.update(schema.defects).set(result.data as any).where(eq(schema.defects.id, id))
  return c.json(result.data)
})

app.delete('/api/defects/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id')
  const result = await db.delete(schema.defects).where(eq(schema.defects.id, id))
  if (result.changes === 0) return c.json({ error: 'Not Found' }, 404)
  return c.json({ success: true })
})

// --- Issue & Progress ---

app.get('/api/issues', async (c) => {
  const db = getDb(c);
  const items = await db.query.issues.findMany({
    orderBy: [desc(schema.issues.updatedAt)]
  })
  return c.json({ items })
})

app.get('/api/issues/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id')
  const item = await db.query.issues.findFirst({
    where: eq(schema.issues.id, id)
  })
  if (!item) return c.json({ error: 'Not Found' }, 404)
  return c.json(item)
})

app.post('/api/issues', async (c) => {
  const db = getDb(c);
  const body = await c.req.json()
  const id = body.id || crypto.randomUUID()
  const result = issueSchema.safeParse({
    ...body,
    id,
    updatedAt: new Date(),
  })

  if (!result.success) {
    return c.json({ error: result.error }, 400)
  }

  await db.insert(schema.issues).values(result.data as any)
  return c.json(result.data, 201)
})

app.put('/api/issues/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id')
  const body = await c.req.json()
  const existing = await db.query.issues.findFirst({
    where: eq(schema.issues.id, id)
  })
  
  if (!existing) return c.json({ error: 'Not Found' }, 404)

  const updatedIssue = {
    ...existing,
    ...body,
    updatedAt: new Date()
  }

  const result = issueSchema.safeParse(updatedIssue)
  if (!result.success) {
    return c.json({ error: result.error }, 400)
  }

  await db.update(schema.issues).set(result.data as any).where(eq(schema.issues.id, id))
  return c.json(result.data)
})

app.delete('/api/issues/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id')
  const result = await db.delete(schema.issues).where(eq(schema.issues.id, id))
  if (result.changes === 0) return c.json({ error: 'Not Found' }, 404)
  return c.json({ success: true })
})

// --- Quality Stats ---

app.get('/api/trends', async (c) => {
  const db = getDb(c);
  const today = new Date().toISOString().split('T')[0]
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })

  const currentIssues = await db.query.issues.findMany()
  const currentDefects = await db.query.defects.findMany()
  const currentTests = await db.query.testItems.findMany()

  const totalIssuesEnvisaged = 20
  const progressTrend = last7Days.map((date, i) => ({
    date,
    remaining: Math.max(0, totalIssuesEnvisaged - (i * 2 + Math.floor(Math.random() * 2))),
    ideal: Math.max(0, totalIssuesEnvisaged - (i * 3))
  }))
  progressTrend[6] = {
    date: today,
    remaining: currentIssues.length - currentIssues.filter((i: any) => i.status === 'Done').length,
    ideal: Math.max(0, totalIssuesEnvisaged - 18)
  }

  const qualityTrend = last7Days.map((date, i) => ({
    date,
    defects: i * 2 + Math.floor(Math.random() * 3),
    passRate: 50 + (i * 5) + Math.floor(Math.random() * 5)
  }))
  qualityTrend[6] = {
    date: today,
    defects: currentDefects.length,
    passRate: currentTests.length > 0 ? (currentTests.filter((i: any) => i.status === 'Pass').length / currentTests.length) * 100 : 0
  }

  return c.json({ progressTrend, qualityTrend })
})

app.get('/api/stats', async (c) => {
  const db = getDb(c);
  const allTests = await db.query.testItems.findMany()
  const allDefects = await db.query.defects.findMany()
  const allIssues = await db.query.issues.findMany()

  const totalTests = allTests.length
  const passCount = allTests.filter((i: any) => i.status === 'Pass').length
  const failCount = allTests.filter((i: any) => i.status === 'Fail').length
  
  const testPassRate = totalTests > 0 ? (passCount / totalTests) * 100 : 0
  
  const totalDefects = allDefects.length
  const openDefects = allDefects.filter((d: any) => d.status !== 'Closed').length
  
  const totalIssues = allIssues.length
  const doneIssues = allIssues.filter((i: any) => i.status === 'Done').length
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

export default app
