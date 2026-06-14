import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login, register, checkEmail } from './authService';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const okJson = (data: unknown) =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(data),
  } as Response);

beforeEach(() => {
  mockFetch.mockReset();
});

describe('login', () => {
  it('sends x-aivus-forwarded-client when clientIp provided', async () => {
    mockFetch.mockReturnValueOnce(okJson({ id: '1', name: 'Test', email: 'a@b.com', group: 'client' }));

    await login({ email: 'a@b.com', password: 'pw', authType: 'CREDENTIALS' as const, clientIp: '1.2.3.4' });

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers['x-aivus-forwarded-client']).toBe('1.2.3.4');
  });

  it('does not send x-aivus-forwarded-client when clientIp absent', async () => {
    mockFetch.mockReturnValueOnce(okJson({ id: '1', name: 'Test', email: 'a@b.com', group: 'client' }));

    await login({ email: 'a@b.com', password: 'pw', authType: 'CREDENTIALS' as const });

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers['x-aivus-forwarded-client']).toBeUndefined();
  });

  it('does not include clientIp in request body', async () => {
    mockFetch.mockReturnValueOnce(okJson({ id: '1', name: 'Test', email: 'a@b.com', group: 'client' }));

    await login({ email: 'a@b.com', password: 'pw', authType: 'CREDENTIALS' as const, clientIp: '5.5.5.5' });

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string) as Record<string, unknown>;
    expect(body['clientIp']).toBeUndefined();
  });
});

describe('register', () => {
  it('sends x-aivus-forwarded-client when clientIp provided', async () => {
    mockFetch.mockReturnValueOnce(okJson({ message: 'ok', id: '2' }));

    await register({ name: 'Alice', email: 'a@b.com', authType: 'CREDENTIALS' as const, clientIp: '9.9.9.9' });

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers['x-aivus-forwarded-client']).toBe('9.9.9.9');
  });
});

describe('checkEmail', () => {
  it('sends x-aivus-forwarded-client when clientIp provided', async () => {
    mockFetch.mockReturnValueOnce(okJson({ exists: false, authType: 'CREDENTIALS' as const }));

    await checkEmail({ email: 'a@b.com', clientIp: '7.7.7.7' });

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers['x-aivus-forwarded-client']).toBe('7.7.7.7');
  });
});
