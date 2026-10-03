import type { AxiosAdapter, AxiosResponse } from 'axios'
import { getRoutes, type HttpMethod } from './registry'
import { delay, httpError, parseBody } from './utils'

const RESPONSE_DELAY_MS = 150

function normalizePath(url: string): string {
  const withoutOrigin = url.replace(/^[a-z][a-z0-9+.-]*:\/\/[^/]+/i, '')
  const withoutQuery = withoutOrigin.split('?')[0]
  const withoutApi = withoutQuery.replace(/^\/api(?=\/)/, '')
  const withLeadingSlash = withoutApi.startsWith('/') ? withoutApi : `/${withoutApi}`
  return withLeadingSlash.replace(/\/+$/, '') || '/'
}

function findRoute(method: HttpMethod, path: string) {
  for (const route of getRoutes()) {
    if (route.method !== method) continue
    const match = route.pattern.exec(path)
    if (match) return { route, match }
  }
  return null
}

export const mockAdapter: AxiosAdapter = async (config) => {
  await delay(RESPONSE_DELAY_MS, config)

  const method = (config.method ?? 'get').toUpperCase() as HttpMethod
  const path = normalizePath(config.url ?? '')
  const found = findRoute(method, path)

  if (!found) {
    throw httpError(404, `No hay handler mock para ${method} ${path}`, config)
  }

  const params = (config.params ?? {}) as Record<string, unknown>
  const body = parseBody(config.data)

  const data = await found.route.handler({
    method,
    path,
    params,
    body,
    match: found.match,
    config,
  })

  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
    request: {},
  } as AxiosResponse
}
