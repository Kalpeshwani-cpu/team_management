export interface PaginationParams {
  page?: number
  pageSize?: number
  cursor?: string // For cursor-based pagination
}

export interface PaginatedResponse<T> {
  data: T[]
  pageInfo: {
    page?: number
    pageSize: number
    totalCount?: number
    hasNextPage: boolean
    hasPreviousPage: boolean
    nextCursor?: string
    previousCursor?: string
  }
}

const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100

/**
 * Get valid pagination parameters
 */
export function getPaginationParams(
  page?: number | string,
  pageSize?: number | string,
  maxSize: number = MAX_PAGE_SIZE
): { page: number; pageSize: number; offset: number } {
  let p = page ? parseInt(page.toString(), 10) : 1
  let size = pageSize ? parseInt(pageSize.toString(), 10) : DEFAULT_PAGE_SIZE

  // Validate parameters
  p = Math.max(1, p)
  size = Math.min(Math.max(1, size), maxSize)

  const offset = (p - 1) * size

  return { page: p, pageSize: size, offset }
}

/**
 * Create pagination response
 */
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  pageSize: number,
  totalCount?: number
): PaginatedResponse<T> {
  return {
    data,
    pageInfo: {
      page,
      pageSize,
      totalCount,
      hasNextPage: totalCount ? page * pageSize < totalCount : data.length === pageSize,
      hasPreviousPage: page > 1,
    },
  }
}

/**
 * Create cursor-based pagination response
 */
export function createCursorPaginatedResponse<T>(
  data: T[],
  pageSize: number,
  getCursorFn: (item: T) => string,
  hasPreviousPage: boolean = false,
  previousCursor?: string
): PaginatedResponse<T> {
  const hasNextPage = data.length > pageSize
  const items = hasNextPage ? data.slice(0, pageSize) : data

  return {
    data: items,
    pageInfo: {
      pageSize,
      hasNextPage,
      hasPreviousPage,
      nextCursor: hasNextPage ? getCursorFn(items[items.length - 1]) : undefined,
      previousCursor,
    },
  }
}

/**
 * Decode cursor (base64 encoded JSON)
 */
export function decodeCursor(cursor: string): Record<string, any> {
  try {
    return JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'))
  } catch {
    return {}
  }
}

/**
 * Encode cursor (base64 encoded JSON)
 */
export function encodeCursor(data: Record<string, any>): string {
  return Buffer.from(JSON.stringify(data)).toString('base64')
}
