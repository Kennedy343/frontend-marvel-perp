import type { InternalAxiosRequestConfig } from 'axios'

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

export interface MockRequest {
  method: HttpMethod
  path: string
  params: Record<string, unknown>
  body: unknown
  match: RegExpExecArray
  config: InternalAxiosRequestConfig
}

export type MockHandler = (request: MockRequest) => unknown | Promise<unknown>

export interface MockRoute {
  method: HttpMethod
  pattern: RegExp
  handler: MockHandler
}

const routes: MockRoute[] = []

export function registerRoute(route: MockRoute): void {
  routes.push(route)
}

export function getRoutes(): readonly MockRoute[] {
  return routes
}
