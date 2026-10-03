import { AxiosError, CanceledError } from 'axios'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface Paginated<T> {
  data: T[]
  meta: PaginationMeta
}

export function paginate<T>(items: T[], page = 1, limit = 10): Paginated<T> {
  const safeLimit = limit > 0 ? limit : 10
  const safePage = page > 0 ? page : 1
  const total = items.length
  const totalPages = Math.ceil(total / safeLimit)
  const start = (safePage - 1) * safeLimit

  return {
    data: items.slice(start, start + safeLimit),
    meta: { page: safePage, limit: safeLimit, total, totalPages },
  }
}

export function normalizeText(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function searchMatch(values: unknown[], term: string): boolean {
  const query = normalizeText(term)
  if (!query) return true
  return values.some((value) => normalizeText(value).includes(query))
}

const STATUS_TEXT: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  500: 'Internal Server Error',
}

export type ApiErrorMessage = string | string[]

export function httpError(
  status: number,
  message: ApiErrorMessage,
  config?: InternalAxiosRequestConfig,
): AxiosError {
  const response = {
    data: { statusCode: status, message },
    status,
    statusText: STATUS_TEXT[status] ?? 'Error',
    headers: {},
    config,
    request: {},
  } as unknown as AxiosResponse

  return new AxiosError(
    Array.isArray(message) ? message.join(', ') : message,
    String(status),
    config,
    undefined,
    response,
  )
}

export function delay(ms: number, config?: InternalAxiosRequestConfig): Promise<void> {
  return new Promise((resolve, reject) => {
    const signal = config?.signal

    if (signal?.aborted) {
      reject(new CanceledError())
      return
    }

    const timer = setTimeout(() => {
      signal?.removeEventListener?.('abort', onAbort)
      resolve()
    }, ms)

    const onAbort = () => {
      clearTimeout(timer)
      signal?.removeEventListener?.('abort', onAbort)
      reject(new CanceledError())
    }

    signal?.addEventListener?.('abort', onAbort)
  })
}

export function parseBody<T>(data: unknown): T | undefined {
  if (data == null) return undefined
  if (typeof data === 'string') {
    if (data.trim() === '') return undefined
    return JSON.parse(data) as T
  }
  return data as T
}

export function toNumber(value: unknown): number | undefined {
  if (value == null || value === '') return undefined
  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

export function toBoolean(value: unknown): boolean | undefined {
  if (value == null || value === '') return undefined
  if (value === true || value === 'true') return true
  if (value === false || value === 'false') return false
  return undefined
}

export function toStringValue(value: unknown): string | undefined {
  if (value == null) return undefined
  const text = String(value).trim()
  return text === '' ? undefined : text
}
