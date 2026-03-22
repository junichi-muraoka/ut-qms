import { expect, test, describe } from 'vitest'
import app from './index'

describe('Qraft API', () => {
  test('GET /api/test-items should return 200', async () => {
    // Hono's app.request is a great way to test endpoints without a real server
    const res = await app.request('/api/test-items')
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body).toHaveProperty('items')
    expect(Array.isArray(body.items)).toBe(true)
  })
})
