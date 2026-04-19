import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { 
  testItemSchema, defectSchema, issueSchema, 
  documentSchema, milestoneSchema, deliverableSchema,
  reviewSchema, reviewItemSchema
} from './shared_schema'
import { getLocalDb, getProductionDb } from './db/index'
import * as schema from './db/schema'
import { eq, desc } from 'drizzle-orm'

import { authMiddleware, AuthUser, getGoogleUser, createSession } from './auth'
import { deleteCookie } from 'hono/cookie'

type Bindings = {
  DB: D1Database
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  SESSION_SECRET: string
  REDIRECT_URI?: string
  FRONTEND_URL?: string
}

type Variables = {
  db: any
  user: AuthUser
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

app.use('/*', cors({
  origin: (origin, c) => {
    // Explicitly return the origin to avoid '*' wildcard issues with credentials
    return origin || '*';
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
  maxAge: 600,
}))

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
// Auth Middleware for all API routes
app.use('/api/*', authMiddleware);

const getDb = (c: any) => c.get('db');

app.get('/', (c) => {
  return c.text('Qraft API Running')
})

// --- Authentication Routes ---

app.get('/api/auth/google/login', (c) => {
  const clientId = c.env.GOOGLE_CLIENT_ID
  const redirectUri = c.env.REDIRECT_URI || `${new URL(c.req.url).origin}/api/auth/google/callback`
  const scope = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile'
  
  const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`
  
  return c.redirect(url)
})

app.get('/api/auth/google/callback', async (c) => {
  const code = c.req.query('code')
  if (!code) return c.json({ error: 'Missing code' }, 400)

  try {
    const user = await getGoogleUser(c, code)
    await createSession(c, user)
    
    // Redirect back to frontend
    const frontendUrl = c.env.FRONTEND_URL || 'https://develop.qraft.pages.dev'
    
    return c.redirect(frontendUrl)
  } catch (err) {
    console.error('Callback error:', err)
    return c.json({ error: 'Auth failed' }, 500)
  }
})

app.get('/api/auth/logout', (c) => {
  deleteCookie(c, 'qraft_session')
  return c.json({ success: true })
})

app.get('/api/me', (c) => {
  const user = c.get('user');
  return c.json({ user });
});

// Middleware to ensure at least one system exists (Bootstrap)
app.use('*', async (c, next) => {
  const db = getDb(c);
  const existingSystems = await db.query.systems.findMany({ limit: 1 });
  
  if (existingSystems.length === 0) {
    const defaultId = crypto.randomUUID();
    await db.insert(schema.systems).values({
      id: defaultId,
      name: 'デフォルトシステム (System A)',
      description: '初期作成されたシステムです。',
      pmName: '管理者',
      color: '#3b82f6',
      updatedAt: new Date(),
    });
    
    // 既存データをこのシステムに紐付ける (マイグレーション)
    await db.update(schema.testItems).set({ systemId: defaultId });
    await db.update(schema.milestones).set({ systemId: defaultId });
    await db.update(schema.issues).set({ systemId: defaultId });
    await db.update(schema.defects).set({ systemId: defaultId });
  }
  await next();
});

app.get('/api/program/summary', async (c) => {
  const db = getDb(c);
  const allSystems = await db.query.systems.findMany();
  
  const summary = await Promise.all(allSystems.map(async (sys) => {
    const sysTests = await db.query.testItems.findMany({ where: eq(schema.testItems.systemId, sys.id) });
    const sysDefects = await db.query.defects.findMany({ where: eq(schema.defects.systemId, sys.id) });
    const sysMilestones = await db.query.milestones.findMany({ where: eq(schema.milestones.systemId, sys.id) });

    const totalTests = sysTests.length;
    const passedTests = sysTests.filter(t => t.status === 'Pass' || t.status === 'PassFixed').length;
    const totalDefects = sysDefects.length;
    
    const progress = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    const density = totalTests > 0 ? (totalDefects / totalTests) * 100 : 0;
    
    // Risk Calculation logic
    const hasDelayedMilestone = sysMilestones.some(m => m.status === 'Delayed');
    const openCriticalDefects = sysDefects.filter(d => d.priority === 'Critical' && d.status !== 'Closed').length;
    
    let riskLevel: 'Success' | 'Warning' | 'Critical' = 'Success';
    if (openCriticalDefects > 0 || hasDelayedMilestone) riskLevel = 'Critical';
    else if (density > 15 || progress < 20) riskLevel = 'Warning';

    // Current Phase Extraction
    const activeMilestone = sysMilestones.find(m => m.status === 'Active') || sysMilestones.find(m => m.status === 'Planning');
    const currentPhase = activeMilestone?.category || '未設定';

    return {
      id: sys.id,
      name: sys.name,
      pmName: sys.pmName,
      color: sys.color,
      progress: progress.toFixed(1),
      density: density.toFixed(2),
      passRate: progress.toFixed(1),
      totalDefects,
      riskLevel,
      currentPhase, // New Field
    };
  }));

  return c.json(summary);
});

// --- Systems API ---

app.get('/api/systems', async (c) => {
  const db = getDb(c);
  const result = await db.query.systems.findMany({
    orderBy: [desc(schema.systems.updatedAt)]
  });
  return c.json(result);
});

app.post('/api/milestones', async (c) => {
  const db = getDb(c);
  const body = await c.req.json();
  const id = crypto.randomUUID();
  const result = milestoneSchema.safeParse({ ...body, id, dependsOnMilestoneId: body.dependsOnMilestoneId || null });
  if (!result.success) return c.json({ error: result.error }, 400);

  await db.insert(schema.milestones).values({
    ...result.data,
    updatedAt: new Date(),
  });
  return c.json(result.data, 201);
});

app.post('/api/systems', async (c) => {
  const db = getDb(c);
  const body = await c.req.json();
  const id = crypto.randomUUID();
  const result = systemSchema.safeParse({ ...body, id });
  if (!result.success) return c.json({ error: result.error }, 400);

  await db.insert(schema.systems).values({
    ...result.data,
    updatedAt: new Date(),
  });
  return c.json(result.data, 201);
});

// --- Test Items API ---

app.get('/api/test-items', async (c) => {
  const db = getDb(c);
  const systemId = c.req.query('systemId');
  
  const result = await db.query.testItems.findMany({
    where: systemId ? eq(schema.testItems.systemId, systemId) : undefined,
    orderBy: [asc(schema.testItems.id)]
  });
  return c.json(result);
});

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
  const systemId = c.req.query('systemId');
  const result = await db.query.defects.findMany({
    where: systemId ? eq(schema.defects.systemId, systemId) : undefined,
    orderBy: [desc(schema.defects.updatedAt)]
  });
  return c.json(result);
});

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
    return c.json({ error: result.error, details: result.error.errors }, 400)
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
  const systemId = c.req.query('systemId');
  const result = await db.query.issues.findMany({
    where: systemId ? eq(schema.issues.systemId, systemId) : undefined,
    orderBy: [desc(schema.issues.updatedAt)]
  });
  return c.json(result);
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

// --- Wiki / Documents ---

app.get('/api/documents', async (c) => {
  const db = getDb(c);
  const items = await db.query.documents.findMany({
    orderBy: [desc(schema.documents.updatedAt)]
  })
  return c.json({ items })
})

app.get('/api/documents/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id')
  const item = await db.query.documents.findFirst({
    where: eq(schema.documents.id, id)
  })
  if (!item) return c.json({ error: 'Not Found' }, 404)
  return c.json(item)
})

app.post('/api/documents', async (c) => {
  const db = getDb(c);
  const body = await c.req.json()
  const id = body.id || crypto.randomUUID()
  const result = documentSchema.safeParse({
    ...body,
    id,
    updatedAt: new Date(),
  })
  if (!result.success) return c.json({ error: result.error }, 400)
  await db.insert(schema.documents).values(result.data as any)
  return c.json(result.data, 201)
})

app.put('/api/documents/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id')
  const body = await c.req.json()
  const existing = await db.query.documents.findFirst({ where: eq(schema.documents.id, id) })
  if (!existing) return c.json({ error: 'Not Found' }, 404)
  const result = documentSchema.safeParse({ ...existing, ...body, updatedAt: new Date() })
  if (!result.success) return c.json({ error: result.error }, 400)
  await db.update(schema.documents).set(result.data as any).where(eq(schema.documents.id, id))
  return c.json(result.data)
})

app.delete('/api/documents/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id')
  const result = await db.delete(schema.documents).where(eq(schema.documents.id, id))
  if (result.changes === 0) return c.json({ error: 'Not Found' }, 404)
  return c.json({ success: true })
})

// --- Milestones ---

app.get('/api/milestones', async (c) => {
  const db = getDb(c);
  const systemId = c.req.query('systemId');
  const result = await db.query.milestones.findMany({
    where: systemId ? eq(schema.milestones.systemId, systemId) : undefined,
    orderBy: [asc(schema.milestones.dueDate)]
  });
  return c.json(result);
})

app.post('/api/milestones', async (c) => {
  const db = getDb(c);
  const body = await c.req.json()
  const id = body.id || crypto.randomUUID()
  const result = milestoneSchema.safeParse({ ...body, id, updatedAt: new Date() })
  if (!result.success) return c.json({ error: result.error }, 400)
  await db.insert(schema.milestones).values(result.data as any)
  return c.json(result.data, 201)
})

// --- Deliverables (Artifact Governance) ---

app.get('/api/deliverables', async (c) => {
  const db = getDb(c);
  const systemId = c.req.query('systemId');
  const items = await db.query.deliverables.findMany({
    where: systemId ? eq(schema.deliverables.systemId, systemId) : undefined,
    orderBy: [asc(schema.deliverables.dueDate)]
  });
  return c.json(items);
});

app.post('/api/deliverables', async (c) => {
  const db = getDb(c);
  const body = await c.req.json();
  const id = crypto.randomUUID();
  const result = deliverableSchema.safeParse({ ...body, id, updatedAt: new Date() });
  if (!result.success) return c.json({ error: result.error }, 400);

  await db.insert(schema.deliverables).values(result.data as any);
  return c.json(result.data, 201);
});

app.put('/api/deliverables/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id');
  const body = await c.req.json();
  const existing = await db.query.deliverables.findFirst({ where: eq(schema.deliverables.id, id) });
  if (!existing) return c.json({ error: 'Not Found' }, 404);
  
  const result = deliverableSchema.safeParse({ ...existing, ...body, updatedAt: new Date() });
  if (!result.success) return c.json({ error: result.error }, 400);

  await db.update(schema.deliverables).set(result.data as any).where(eq(schema.deliverables.id, id));
  return c.json(result.data);
});

// --- Reviews ---

app.get('/api/reviews', async (c) => {
  const db = getDb(c);
  const items = await db.query.reviews.findMany({
    orderBy: [desc(schema.reviews.updatedAt)]
  })
  return c.json({ items })
})

app.get('/api/reviews/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id')
  const item = await db.query.reviews.findFirst({
    where: eq(schema.reviews.id, id)
  })
  if (!item) return c.json({ error: 'Not Found' }, 404)
  return c.json(item)
})

app.post('/api/reviews', async (c) => {
  const db = getDb(c);
  const body = await c.req.json()
  const id = body.id || crypto.randomUUID()
  const result = reviewSchema.safeParse({ ...body, id, updatedAt: new Date() })
  if (!result.success) return c.json({ error: result.error }, 400)
  await db.insert(schema.reviews).values(result.data as any)
  return c.json(result.data, 201)
})

app.put('/api/reviews/:id', async (c) => {
  const db = getDb(c);
  const id = c.req.param('id')
  const body = await c.req.json()
  const existing = await db.query.reviews.findFirst({ where: eq(schema.reviews.id, id) })
  if (!existing) return c.json({ error: 'Not Found' }, 404)
  const result = reviewSchema.safeParse({ ...existing, ...body, updatedAt: new Date() })
  if (!result.success) return c.json({ error: result.error }, 400)
  await db.update(schema.reviews).set(result.data as any).where(eq(schema.reviews.id, id))
  return c.json(result.data)
})

// --- Review Items ---

app.get('/api/review-items/review/:reviewId', async (c) => {
  const db = getDb(c);
  const reviewId = c.req.param('reviewId')
  const items = await db.query.reviewItems.findMany({
    where: eq(schema.reviewItems.reviewId, reviewId)
  })
  return c.json({ items })
})

app.post('/api/review-items', async (c) => {
  const db = getDb(c);
  const body = await c.req.json()
  const id = body.id || crypto.randomUUID()
  const result = reviewItemSchema.safeParse({ ...body, id, updatedAt: new Date() })
  if (!result.success) return c.json({ error: result.error }, 400)
  await db.insert(schema.reviewItems).values(result.data as any)
  return c.json(result.data, 201)
})

// --- Weekly Reports & Auto-Generation ---

app.get('/api/weekly-reports', async (c) => {
  const db = getDb(c);
  const systemId = c.req.query('systemId');
  const reports = await db.query.weeklyReports.findMany({
    where: systemId ? eq(schema.weeklyReports.systemId, systemId) : undefined,
    orderBy: [desc(schema.weeklyReports.startDate)]
  });
  return c.json(reports);
});

app.post('/api/weekly-reports/generate', async (c) => {
  const db = getDb(c);
  const { systemId } = await c.req.json();
  if (!systemId) return c.json({ error: 'systemId is required' }, 400);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // 1. Fetch activities
  const recentIssues = await db.query.issues.findMany({
    where: and(eq(schema.issues.systemId, systemId), gte(schema.issues.updatedAt, sevenDaysAgo), eq(schema.issues.status, 'Done'))
  });
  const recentDefects = await db.query.defects.findMany({
    where: and(eq(schema.defects.systemId, systemId), gte(schema.defects.updatedAt, sevenDaysAgo), eq(schema.defects.status, 'Fixed'))
  });
  const recentTests = await db.query.testItems.findMany({
    where: and(eq(schema.testItems.systemId, systemId), gte(schema.testItems.updatedAt, sevenDaysAgo), eq(schema.testItems.status, 'Pass'))
  });

  // 2. Fetch pending risks
  const critDefects = await db.query.defects.findMany({
    where: and(eq(schema.defects.systemId, systemId), eq(schema.defects.priority, 'Critical'), not(eq(schema.defects.status, 'Closed')))
  });

  // 3. Construct Draft
  const achievements = [
    `【課題完了】: ${recentIssues.length} 件のタスクをクローズしました。 (${recentIssues.map(i => i.title).join(', ')})`,
    `【不具合解決】: ${recentDefects.length} 件の修正を確認しました。`,
    `【テスト進捗】: 新たに ${recentTests.length} 件のテストケースが Accept されました。`
  ].join('\n');

  const pendingIssues = [
    `【Critical不具合】: ${critDefects.length} 件の最優先課題が残存しています。`,
    `不明点・ブロック事項: (任意入力)`
  ].join('\n');

  const draft = {
    systemId,
    startDate: new Date(),
    weekNumber: Math.ceil(new Date().getDate() / 7), // Simple logic
    achievements,
    pendingIssues,
    nextSteps: '次フェーズの準備、および残課題の消化',
    riskLevel: critDefects.length > 0 ? 'Critical' : 'Success'
  };

  return c.json(draft);
});

app.post('/api/weekly-reports', async (c) => {
  const db = getDb(c);
  const body = await c.req.json();
  const id = crypto.randomUUID();
  const result = weeklyReportSchema.safeParse({ ...body, id, updatedAt: new Date() });
  if (!result.success) return c.json({ error: result.error }, 400);

  await db.insert(schema.weeklyReports).values(result.data as any);
  return c.json(result.data, 201);
});

app.get('/api/reports/verdict', async (c) => {
  const db = getDb(c);
  const verdict = await db.query.qualityVerdicts.findFirst({
    orderBy: [desc(schema.qualityVerdicts.updatedAt)]
  });
  return c.json(verdict || { verdictText: '', author: '' });
});

app.post('/api/reports/verdict', async (c) => {
  const db = getDb(c);
  const body = await c.req.json();
  const id = body.id || crypto.randomUUID();
  const result = qualityVerdictSchema.safeParse({ ...body, id });
  if (!result.success) return c.json({ error: result.error }, 400);

  // Insert or update logic (simple version: always insert new as history, or update first)
  await db.insert(schema.qualityVerdicts).values({
    ...result.data,
    updatedAt: new Date(),
  });
  return c.json(result.data);
});

app.get('/api/reports/quality-summary', async (c) => {
  const db = getDb(c);
  
  const allTests = await db.query.testItems.findMany();
  const allDefects = await db.query.defects.findMany();
  const allMilestones = await db.query.milestones.findMany();
  
  const totalTests = allTests.length;
  const totalDefects = allDefects.length;
  const passedTests = allTests.filter(t => t.status === 'Pass').length;
  const closedDefects = allDefects.filter(d => d.status === 'Closed').length;
  
  const defectDensity = totalTests > 0 ? (totalDefects / totalTests) * 100 : 0;
  
  const defectTypeDist = allDefects.reduce((acc, d) => {
    const type = d.defectType || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const causeDist = allDefects.reduce((acc, d) => {
    const cause = d.causeCategory || 'Unknown';
    acc[cause] = (acc[cause] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Traceability: Milestone -> Tests
  const traceability = allMilestones.map(m => {
    const milestoneTests = allTests.filter(t => t.milestoneId === m.id);
    const mPass = milestoneTests.filter(t => t.status === 'Pass').length;
    const mTotal = milestoneTests.length;
    return {
      milestoneName: m.name,
      totalTests: mTotal,
      passedTests: mPass,
      tests: milestoneTests.map(t => ({
        title: t.title,
        status: t.status,
        defects: allDefects.filter(d => d.testItemId === t.id).map(d => ({ title: d.title, status: d.status }))
      }))
    };
  });

  return c.json({
    totalTests,
    passedTests,
    totalDefects,
    closedDefects,
    defectDensity: defectDensity.toFixed(2),
    defectTypeDist,
    causeDist,
    traceability,
    updatedAt: new Date()
  });
});

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

import { serve } from '@hono/node-server'

// ... existing code ...

const port = 3001
console.log(`Server is running on port ${port}`)

if (typeof process !== 'undefined' && process.versions && process.versions.node) {
  serve({
    fetch: app.fetch,
    port
  })
}

export default app
