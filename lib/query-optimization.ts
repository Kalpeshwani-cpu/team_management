/**
 * Query optimization utilities and best practices for Supabase
 */

export interface QueryConfig {
  select?: string[]
  limit?: number
  offset?: number
  orderBy?: { column: string; ascending?: boolean }[]
  filters?: Array<{ column: string; operator: string; value: any }>
}

/**
 * Build optimized select statement for Supabase
 * Only select the columns you need to reduce payload size
 */
export function buildOptimizedSelect(columns: string[]): string {
  // Include only necessary columns
  return columns.join(',')
}

/**
 * Get related data efficiently using foreign key selects
 * Example: "users(id,name), projects(id,name)"
 */
export function buildRelationSelect(relations: { table: string; columns: string[] }[]): string {
  return relations.map(({ table, columns }) => `${table}(${columns.join(',')})`).join(',')
}

/**
 * Recommended batch size for different operations
 */
export const BATCH_SIZES = {
  INSERT: 1000, // Max 1000 rows per insert
  UPDATE: 500,
  DELETE: 500,
  SELECT: 1000, // Fetch 1000 rows at a time
}

/**
 * Process large datasets in batches
 */
export async function processBatch<T, R>(
  items: T[],
  processFn: (batch: T[]) => Promise<R[]>,
  batchSize: number = BATCH_SIZES.SELECT
): Promise<R[]> {
  const results: R[] = []

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await processFn(batch)
    results.push(...batchResults)
  }

  return results
}

/**
 * Index recommendations for common queries
 * These should be created in the database migration
 */
export const INDEX_RECOMMENDATIONS = {
  users: ['id', 'email', 'department_id', 'is_active'],
  tasks: ['id', 'project_id', 'assigned_to', 'status', 'created_by', 'due_date'],
  projects: ['id', 'owner_id', 'department_id', 'status'],
  user_roles: ['user_id', 'role_id'],
  task_history: ['task_id', 'created_at'],
  time_entries: ['task_id', 'user_id', 'work_date'],
  notifications: ['user_id', 'is_read', 'created_at'],
  performance_metrics: ['user_id', 'metric_date'],
  ml_recommendations: ['task_id', 'expires_at'],
}

/**
 * Query patterns to avoid N+1 queries
 */
export const QUERY_PATTERNS = {
  // Good: Single query with relations
  getProjectWithTasks: `
    id, name, description, owner:users(id,name),
    tasks(id,title,status,assigned_user:users(id,name))
  `,

  // Good: Select only needed columns
  getTasksForBoard: `
    id, title, status, priority, due_date,
    assigned_to:users(id,name,avatar_url),
    created_by:users(id,name)
  `,

  // Good: Use count with filters instead of fetching all
  getTaskCountByStatus: 'id, status', // Then count in client
}

/**
 * Calculate query complexity and suggest optimizations
 */
export function analyzeQueryComplexity(
  config: QueryConfig
): {
  complexity: 'low' | 'medium' | 'high'
  suggestions: string[]
} {
  const suggestions: string[] = []
  let complexityScore = 0

  // Check if selecting too many columns
  if (config.select && config.select.length > 15) {
    complexityScore += 3
    suggestions.push('Consider selecting fewer columns to reduce payload size')
  }

  // Check if limit is missing
  if (!config.limit) {
    complexityScore += 2
    suggestions.push('Always add a limit to prevent fetching too much data')
  } else if (config.limit > 1000) {
    complexityScore += 2
    suggestions.push('Limit seems high, consider pagination instead')
  }

  // Check for missing indexes
  if (config.orderBy && config.orderBy.length > 2) {
    complexityScore += 1
    suggestions.push('Multiple order by clauses may slow down queries')
  }

  // Determine complexity level
  let complexity: 'low' | 'medium' | 'high' = 'low'
  if (complexityScore >= 5) complexity = 'high'
  else if (complexityScore >= 2) complexity = 'medium'

  return { complexity, suggestions }
}

/**
 * Best practices for Supabase queries
 */
export const QUERY_BEST_PRACTICES = `
1. Always specify columns instead of SELECT *
   ✓ .select('id,name,email')
   ✗ .select('*')

2. Use pagination for large datasets
   ✓ .range(0, 99)
   ✗ Fetch all data

3. Batch insert/update/delete operations
   ✓ Insert 1000 rows per query
   ✗ Insert 1 row at a time in loop

4. Use LIMIT in filters
   ✓ .select('*').limit(100)
   ✗ .select('*') without limit

5. Create indexes for commonly filtered columns
   ✓ Index on user_id, task_id, created_at
   ✗ No indexes

6. Use select for relations instead of fetching separately
   ✓ .select('id,name,user:users(id,name)')
   ✗ Fetch users in separate query

7. Cache frequently accessed data
   ✓ Cache user roles, permissions
   ✗ Fetch from DB on every request

8. Use filters before joins when possible
   ✓ .eq('status', 'completed').select('*,user_id')
   ✗ Fetch all then filter in code
`
