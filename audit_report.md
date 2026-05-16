# TPMS Code Audit Report

This report summarizes issues, bugs, and potential vulnerabilities found in the current codebase.

## 🔴 Critical Issues (Blockers)

### 1. Incomplete Migration State
The codebase is currently in a broken state due to an incomplete migration from Supabase to Neon.
*   **Missing Dependencies**: `lib/supabase` has been deleted, but 20+ files still import from it.
*   **Broken Imports**: Files like `app/api/auth/wallet/route.ts` and `hooks/useAuth.ts` will fail to compile.
*   **Incomplete Refactor**: Most API routes still use `supabase.from()` calls which are no longer supported.

### 2. Missing Database Models
Several tables used in Supabase logic (`notifications`, `task_history`, `ml_recommendations`, etc.) are not yet properly synchronized or indexed in the Prisma schema for Neon.

---

## 🟠 Security Issues

### 3. Wallet Auth Replay Attack Vulnerability
`app/api/auth/wallet/route.ts` verifies signatures but does not check for a **nonce**.
*   **Bug**: A signature can be reused indefinitely.
*   **Fix**: Implement a nonce system where the server issues a random challenge that must be signed and can only be used once.

### 4. Broken Auth Flow in Wallet Sign-in
*   **Issue**: The wallet authentication route returns user data but **never sets a session cookie** or JWT.
*   **Impact**: Users can "sign in" with a wallet but will remain unauthenticated for subsequent requests.

### 5. Plain Text Configuration
*   **Issue**: `.env` file contains placeholders, but some hardcoded values like `wallet-${checksumAddress.toLowerCase()}@team-management.local` in `app/api/auth/wallet/route.ts` are rigid and might cause collision issues.

---

## 🟡 Logic & Performance Issues

### 6. Redundant Database Queries (RBAC)
*   **Issue**: `lib/rbac.ts` and `lib/auth.ts` perform sequential, overlapping DB queries.
*   **Example**: `getCurrentUser()` fetches roles, but then `hasRole()` fetches them again from the DB.
*   **Impact**: Increased latency on every authorized request.

### 7. Missing Data Validation
*   **Issue**: API routes (e.g., `app/api/tasks/route.ts`) accept JSON payloads and use them directly.
*   **Bug**: No Zod or equivalent validation ensures data integrity before DB insertion.

### 8. Silent Failures in Monitoring
*   **Issue**: `lib/db.ts` catches errors in `logActivity` but only logs to console.
*   **Impact**: If audit logging fails, the system continues as if it succeeded, leading to incomplete compliance trails.

### 9. SMTP Removal (Partial)
*   **Issue**: SMTP has been removed from config, but some notification logic still assumes email capabilities might exist (commented out code).

---

## 🟢 Recommendations

1.  **Finish Phase 4 Migration**: Refactor the remaining 20 files to use Prisma.
2.  **Consolidate Auth**: Move all Wallet Auth logic into `lib/auth-options.ts` as a custom Credentials provider to ensure session consistency.
3.  **Implement Zod**: Add schema validation for all API inputs.
4.  **Optimize RBAC**: Use the user object already returned by `getCurrentUser()` to check permissions instead of re-fetching from DB.
