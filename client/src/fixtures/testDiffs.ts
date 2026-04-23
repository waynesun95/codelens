/**
 * Dev-only sample diffs kept under `client/` so the app does not import from repo-root paths.
 * (A fuller catalog may still live in /tests/fixtures for non-client runners.)
 */

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
