import { afterEach, describe, expect, it, vi } from 'vitest'
import { api, configureApi } from './api'

describe('API client', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('adds the bearer token and parses JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } }))
    vi.stubGlobal('fetch', fetchMock)
    configureApi({ getToken: () => 'token-1', onUnauthorized: () => undefined })
    await expect(api<{ ok: boolean }>('/health')).resolves.toEqual({ ok: true })
    expect(fetchMock.mock.calls[0][1].headers.get('Authorization')).toBe('Bearer token-1')
  })

  it('maps a 401 response and clears the session through its callback', async () => {
    const unauthorized = vi.fn()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: 'Expired' }), { status: 401, headers: { 'content-type': 'application/json' } })))
    configureApi({ getToken: () => 'expired', onUnauthorized: unauthorized })
    await expect(api('/me')).rejects.toMatchObject({ status: 401, message: 'Expired' })
    expect(unauthorized).toHaveBeenCalledOnce()
  })
})
