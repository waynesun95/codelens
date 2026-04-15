/**
 * Test diffs for CodeLens development.
 * 
 * Use these to test the diff viewer component and the review API.
 * Each diff targets a different review scenario.
 * 
 * Diffs include realistic surrounding context (unchanged lines)
 * to test expand/collapse/show-more UI behavior.
 */

// ============================================================
// 1. SECURITY VULNERABILITY — SQL injection + unsanitized input
//    Surrounded by unchanged imports and route setup
// ============================================================
export const DIFF_SECURITY_VULN = `diff --git a/api/users.ts b/api/users.ts
--- a/api/users.ts
+++ b/api/users.ts
@@ -1,22 +1,28 @@
 import { Router } from 'express';
-import { pool } from '../db';
+import { pool, sanitize } from '../db';
 import { authenticate } from '../middleware/auth';
 import { validateQuery } from '../middleware/validate';
 import { UserSchema } from '../schemas/user';
 
 const router = Router();
 
 router.use(authenticate);
 
 // List all users with optional name filter
-router.get('/users', async (req, res) => {
-  const result = await pool.query('SELECT * FROM users WHERE name = \\'' + req.query.name + '\\'');
-  res.json(result.rows);
+router.get('/users', async (req, res) => {
+  const name = req.query.name as string;
+  if (!name) return res.status(400).json({ error: 'Name is required' });
+  const result = await pool.query(
+    'SELECT id, name, email FROM users WHERE name = $1',
+    [name]
+  );
+  res.json(result.rows);
 });
 
 // Get user by ID
 router.get('/users/:id', async (req, res) => {
   const { id } = req.params;
   const result = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [id]);
   if (result.rows.length === 0) {
     return res.status(404).json({ error: 'User not found' });
   }
   res.json(result.rows[0]);
 });
 
 export default router;`;

// ============================================================
// 2. REACT ANTI-PATTERN — missing useEffect deps, direct state mutation
//    Surrounded by unchanged component structure and JSX
// ============================================================
export const DIFF_REACT_ANTIPATTERN = `diff --git a/components/UserList.tsx b/components/UserList.tsx
--- a/components/UserList.tsx
+++ b/components/UserList.tsx
@@ -1,52 +1,65 @@
-import React, { useState, useEffect } from 'react';
+import React, { useState, useEffect, useCallback } from 'react';
 import { Card } from './ui/Card';
 import { Spinner } from './ui/Spinner';
 import { ErrorBanner } from './ui/ErrorBanner';
 
 interface User {
   id: number;
   name: string;
+  email: string;
 }
 
-export function UserList({ apiUrl }) {
+interface UserListProps {
+  apiUrl: string;
+  onUserSelect: (user: User) => void;
+}
+
+export function UserList({ apiUrl, onUserSelect }: UserListProps) {
   const [users, setUsers] = useState<User[]>([]);
+  const [loading, setLoading] = useState(true);
+  const [error, setError] = useState<string | null>(null);
   const [searchTerm, setSearchTerm] = useState('');
 
-  useEffect(() => {
-    fetch(apiUrl)
-      .then(res => res.json())
-      .then(data => {
-        users.push(...data);
-        setUsers(users);
-      });
-  }, []);
+  const fetchUsers = useCallback(async () => {
+    try {
+      setLoading(true);
+      const res = await fetch(apiUrl);
+      if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
+      const data = await res.json();
+      setUsers(data);
+    } catch (err) {
+      setError(err instanceof Error ? err.message : 'Failed to fetch');
+    } finally {
+      setLoading(false);
+    }
+  }, [apiUrl]);
+
+  useEffect(() => { fetchUsers(); }, [fetchUsers]);
 
   const filteredUsers = users.filter(u =>
     u.name.toLowerCase().includes(searchTerm.toLowerCase())
   );
 
   return (
     <Card>
       <div className="user-list-header">
         <h2>Team Members</h2>
         <input
           type="text"
           placeholder="Search users..."
           value={searchTerm}
           onChange={e => setSearchTerm(e.target.value)}
           className="search-input"
         />
       </div>
       <ul className="user-list">
-        {filteredUsers.map(u => <li>{u.name}</li>)}
+        {loading && <li><Spinner size="sm" /></li>}
+        {error && <li><ErrorBanner message={error} /></li>}
+        {!loading && !error && filteredUsers.map(u => (
+          <li key={u.id} onClick={() => onUserSelect(u)} className="user-item">
+            <span className="user-name">{u.name}</span>
+            <span className="user-email">{u.email}</span>
+          </li>
+        ))}
       </ul>
       <div className="user-list-footer">
         <span>{filteredUsers.length} of {users.length} users</span>
       </div>
     </Card>
   );
 }`;

// ============================================================
// 3. CLEAN CODE — well-written, should return mostly praise
//    New file but with enough substance to have context
// ============================================================
export const DIFF_CLEAN_CODE = `diff --git a/utils/retry.ts b/utils/retry.ts
--- /dev/null
+++ b/utils/retry.ts
@@ -0,0 +1,48 @@
+/**
+ * Generic retry utility with exponential backoff.
+ *
+ * Usage:
+ *   const data = await withRetry(() => fetchData(url), { maxAttempts: 5 });
+ */
+
+interface RetryOptions {
+  maxAttempts: number;
+  delayMs: number;
+  backoffMultiplier?: number;
+  onRetry?: (attempt: number, error: Error) => void;
+}
+
+const DEFAULT_OPTIONS: Required<RetryOptions> = {
+  maxAttempts: 3,
+  delayMs: 1000,
+  backoffMultiplier: 2,
+  onRetry: () => {},
+};
+
+export async function withRetry<T>(
+  fn: () => Promise<T>,
+  options: Partial<RetryOptions> = {}
+): Promise<T> {
+  const opts = { ...DEFAULT_OPTIONS, ...options };
+  let lastError: Error;
+
+  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
+    try {
+      return await fn();
+    } catch (err) {
+      lastError = err instanceof Error ? err : new Error(String(err));
+
+      if (attempt === opts.maxAttempts) {
+        break;
+      }
+
+      opts.onRetry(attempt, lastError);
+
+      const delay = opts.delayMs * Math.pow(opts.backoffMultiplier, attempt - 1);
+      await new Promise(resolve => setTimeout(resolve, delay));
+    }
+  }
+
+  throw lastError!;
+}`;

// ============================================================
// 4. LARGE MULTI-CONCERN DIFF — performance, style, and bugs
//    Lots of unchanged surrounding code to test collapsing
// ============================================================
export const DIFF_MULTI_CONCERN = `diff --git a/services/orderService.ts b/services/orderService.ts
--- a/services/orderService.ts
+++ b/services/orderService.ts
@@ -1,71 +1,94 @@
-import { db } from '../database';
+import { db, Transaction } from '../database';
+import { logger } from '../utils/logger';
+import { OrderStatus, Order, LineItem } from '../types/order';
 import { EventEmitter } from '../events';
 import { metrics } from '../monitoring';
 
 const ORDER_EVENTS = {
   CREATED: 'order.created',
   PROCESSED: 'order.processed',
   FAILED: 'order.failed',
 } as const;
 
-export async function processOrder(orderId: any) {
-  const order = await db.query('SELECT * FROM orders WHERE id = ' + orderId);
+export async function processOrder(orderId: string): Promise<Order> {
+  if (!orderId) throw new Error('Order ID is required');
 
-  if (order == null) {
-    throw new Error('not found');
+  const order = await db.orders.findById(orderId);
+  if (!order) {
+    throw new Error(\`Order \${orderId} not found\`);
   }
 
-  var total = 0;
-  for (var i = 0; i < order.items.length; i++) {
-    const item = order.items[i];
-    const product = await db.query('SELECT * FROM products WHERE id = ' + item.productId);
-    total = total + (product.price * item.quantity);
+  if (order.status !== OrderStatus.PENDING) {
+    throw new Error(\`Cannot process order with status: \${order.status}\`);
   }
 
-  order.total = total;
-  order.status = 'processed';
-  order.processedAt = new Date();
+  const trx = await db.transaction();
 
-  await db.query('UPDATE orders SET total = ' + total + ', status = \\'processed\\' WHERE id = ' + orderId);
-
-  // send email
-  const nodemailer = require('nodemailer');
-  const transport = nodemailer.createTransport({ host: 'smtp.gmail.com', port: 587 });
-  await transport.sendMail({
-    from: 'noreply@shop.com',
-    to: order.customerEmail,
-    subject: 'Order processed',
-    text: 'Your order ' + orderId + ' has been processed. Total: $' + total
-  });
+  try {
+    const total = await calculateTotal(order.items, trx);
 
-  EventEmitter.emit(ORDER_EVENTS.PROCESSED, { orderId, total });
-  metrics.increment('orders.processed');
+    const updatedOrder = await db.orders.update(
+      orderId,
+      {
+        total,
+        status: OrderStatus.PROCESSED,
+        processedAt: new Date(),
+      },
+      trx
+    );
+
+    await trx.commit();
+    logger.info(\`Order \${orderId} processed successfully\`, { total });
+    EventEmitter.emit(ORDER_EVENTS.PROCESSED, { orderId, total });
+    metrics.increment('orders.processed');
 
-  return order;
+    return updatedOrder;
+  } catch (err) {
+    await trx.rollback();
+    logger.error(\`Failed to process order \${orderId}\`, { error: err });
+    EventEmitter.emit(ORDER_EVENTS.FAILED, { orderId, error: err });
+    metrics.increment('orders.failed');
+    throw err;
+  }
 }
 
+async function calculateTotal(
+  items: LineItem[],
+  trx: Transaction
+): Promise<number> {
+  const productIds = items.map(item => item.productId);
+  const products = await db.products.findByIds(productIds, trx);
+
+  return items.reduce((sum, item) => {
+    const product = products.get(item.productId);
+    if (!product) throw new Error(\`Product \${item.productId} not found\`);
+    return sum + product.price * item.quantity;
+  }, 0);
+}
+
+// ---- Everything below is unchanged ----
+
 export async function cancelOrder(orderId: string): Promise<void> {
   const order = await db.orders.findById(orderId);
   if (!order) throw new Error(\`Order \${orderId} not found\`);
   if (order.status === OrderStatus.SHIPPED) {
     throw new Error('Cannot cancel shipped order');
   }
   await db.orders.update(orderId, { status: OrderStatus.CANCELLED });
   EventEmitter.emit('order.cancelled', { orderId });
   metrics.increment('orders.cancelled');
 }
 
 export async function getOrderHistory(
   userId: string,
   page: number = 1,
   limit: number = 20
 ): Promise<{ orders: Order[]; total: number }> {
   const offset = (page - 1) * limit;
   const [orders, total] = await Promise.all([
     db.orders.findByUserId(userId, { limit, offset }),
     db.orders.countByUserId(userId),
   ]);
   return { orders, total };
 }
 
 export function formatOrderSummary(order: Order): string {
   const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
   return \`Order #\${order.id}: \${itemCount} items, $\${order.total.toFixed(2)} (\${order.status})\`;
 }`;

// ============================================================
// 5. MINIMAL DIFF — single line change surrounded by context
// ============================================================
export const DIFF_MINIMAL = `diff --git a/config.ts b/config.ts
--- a/config.ts
+++ b/config.ts
@@ -1,18 +1,18 @@
 /**
  * Application configuration.
  * Values can be overridden via environment variables.
  */
 
 export const config = {
   appName: 'CodeLens',
   version: '1.0.0',
   api: {
     baseUrl: process.env.API_URL ?? 'http://localhost:3001',
-    timeout: 5000,
+    timeout: 30000,
     retries: 3,
   },
   ui: {
     theme: 'dark',
     maxDiffLines: 500,
   },
 };`;

// ============================================================
// 6. NEW FILE — entire file is additions (no removals)
//    Long enough to test collapsing large add-only blocks
// ============================================================
export const DIFF_NEW_FILE = `diff --git a/middleware/rateLimit.ts b/middleware/rateLimit.ts
--- /dev/null
+++ b/middleware/rateLimit.ts
@@ -0,0 +1,52 @@
+import { Request, Response, NextFunction } from 'express';
+import { logger } from '../utils/logger';
+
+interface RateLimitRecord {
+  count: number;
+  resetTime: number;
+}
+
+/**
+ * Simple in-memory rate limiter.
+ * For production, replace with Redis-backed solution.
+ */
+const requests = new Map<string, RateLimitRecord>();
+
+// Clean up expired entries every 5 minutes
+setInterval(() => {
+  const now = Date.now();
+  for (const [ip, record] of requests.entries()) {
+    if (now > record.resetTime) {
+      requests.delete(ip);
+    }
+  }
+}, 5 * 60 * 1000);
+
+export function rateLimit(maxRequests: number, windowMs: number) {
+  return (req: Request, res: Response, next: NextFunction) => {
+    const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
+    const now = Date.now();
+    const record = requests.get(ip);
+
+    if (!record || now > record.resetTime) {
+      requests.set(ip, { count: 1, resetTime: now + windowMs });
+      return next();
+    }
+
+    if (record.count >= maxRequests) {
+      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
+      logger.warn(\`Rate limit exceeded for \${ip}\`, { count: record.count });
+      res.set('Retry-After', String(retryAfter));
+      return res.status(429).json({
+        error: 'Too many requests',
+        retryAfter,
+      });
+    }
+
+    record.count++;
+    next();
+  };
+}
+
+export function resetRateLimits(): void {
+  requests.clear();
+}`;

// ============================================================
// 7. MULTIPLE HUNKS — changes in different parts of the same file
//    Tests that the viewer correctly shows collapsed regions between hunks
// ============================================================
export const DIFF_MULTIPLE_HUNKS = `diff --git a/services/authService.ts b/services/authService.ts
--- a/services/authService.ts
+++ b/services/authService.ts
@@ -1,9 +1,10 @@
 import jwt from 'jsonwebtoken';
 import bcrypt from 'bcryptjs';
+import { z } from 'zod';
 import { db } from '../database';
 import { logger } from '../utils/logger';
 import { config } from '../config';
 import { User, AuthTokens } from '../types/auth';
 import { UnauthorizedError, ValidationError } from '../errors';
 
 const SALT_ROUNDS = 12;
@@ -18,14 +19,18 @@
 
 export async function login(
   email: string,
   password: string
 ): Promise<AuthTokens> {
+  const parsed = z.string().email().safeParse(email);
+  if (!parsed.success) {
+    throw new ValidationError('Invalid email format');
+  }
+
   const user = await db.users.findByEmail(email);
   if (!user) {
-    throw new UnauthorizedError('Invalid credentials');
+    throw new UnauthorizedError('Invalid email or password');
   }
 
   const valid = await bcrypt.compare(password, user.passwordHash);
   if (!valid) {
-    throw new UnauthorizedError('Invalid credentials');
+    throw new UnauthorizedError('Invalid email or password');
   }
 
   logger.info(\`User \${user.id} logged in successfully\`);
@@ -45,8 +50,12 @@
   return { accessToken, refreshToken };
 }
 
-export async function register(email: string, password: string, name: string): Promise<User> {
-  const existing = await db.users.findByEmail(email);
+export async function register(
+  email: string,
+  password: string,
+  name: string
+): Promise<User> {
+  const existing = await db.users.findByEmail(email.toLowerCase().trim());
   if (existing) {
     throw new ValidationError('Email already registered');
   }
@@ -56,7 +65,7 @@
 
   const user = await db.users.create({
     email: email.toLowerCase().trim(),
-    passwordHash: hash,
+    passwordHash,
     name: name.trim(),
   });
 
@@ -72,6 +81,7 @@
 export async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
   try {
     const payload = jwt.verify(refreshToken, config.jwt.refreshSecret) as { userId: string };
+    const user = await db.users.findById(payload.userId);
     return generateTokens(payload.userId);
   } catch {
     throw new UnauthorizedError('Invalid refresh token');
@@ -84,4 +94,5 @@
   const refreshToken = jwt.sign({ userId }, config.jwt.refreshSecret, { expiresIn: '7d' });
   return { accessToken, refreshToken };
 }
+
 export default { login, register, refreshTokens };`;
