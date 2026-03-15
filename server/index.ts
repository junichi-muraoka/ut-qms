import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { z } from 'zod'
import { TestItemSchema, DefectSchema, IssueSchema } from '../shared/schema'

const app = new Hono()

app.use('/*', cors())

app.get('/', (c) => {
  return c.text('UT-QMS API Running')
})

// --- API Endpoints ---

app.get('/api/test-items', (c) => {
  // In a real app, fetch from DB
  return c.json({ items: [] })
})

app.post('/api/test-items', async (c) => {
  const body = await c.req.json()
  const result = TestItemSchema.safeParse(body)
  if (!result.success) {
    return c.json({ error: result.error }, 400)
  }
  return c.json(result.data, 201)
})

const port = 3000
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})
