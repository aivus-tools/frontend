import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetcher } from './fetcher';

// Mock global fetch
global.fetch = vi.fn();

describe('fetcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and parse JSON successfully', async () => {
    const mockData = { id: 1, name: 'Test' };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await fetcher('/api/test');
    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith('/api/test');
  });

  it('should throw error when response is not ok', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found',
    });

    await expect(fetcher('/api/test')).rejects.toThrow('Not Found');
  });

  it('should throw error on 404', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found',
      status: 404,
    });

    await expect(fetcher('/api/test')).rejects.toThrow('Not Found');
  });

  it('should throw error on 500', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      statusText: 'Internal Server Error',
      status: 500,
    });

    await expect(fetcher('/api/test')).rejects.toThrow('Internal Server Error');
  });

  it('should pass fetch options correctly', async () => {
    const mockData = { success: true };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: 'data' }),
    };

    await fetcher('/api/test', options);
    expect(global.fetch).toHaveBeenCalledWith('/api/test', options);
  });

  it('should handle typed responses', async () => {
    interface User {
      id: number;
      email: string;
    }

    const mockUser: User = { id: 1, email: 'test@example.com' };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

    const result = await fetcher<User>('/api/user');
    expect(result.id).toBe(1);
    expect(result.email).toBe('test@example.com');
  });
});
