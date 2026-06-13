import { describe, it, expect, vi, beforeAll } from 'vitest';

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
});

vi.mock('@/constants/apiRoute', () => ({
  ApiRoute: {
    PROJECT_LIST: '/service/vendor/projects',
    PROJECT: (id: string) => `/service/vendor/projects/${id}`,
    PROJECT_THUMBNAIL: (id: string) => `/service/vendor/projects/${id}/thumbnail`,
    PROJECT_ARCHIVED: '/service/vendor/projects/archived',
    PROJECT_RESTORE: (id: string) => `/service/vendor/projects/${id}/restore`,
    VENDOR_PROJECT_BRIEF_DOCUMENTS: (id: string) => `/service/vendor/projects/${id}/brief/documents`,
  },
}));

describe('getVendorProjectBriefDocuments transformResponse', () => {
  it('extracts documents array from object response', () => {
    const rawResponse = {
      projectId: 'p1',
      briefId: 'b1',
      conversationStatus: 'finalized',
      documents: [
        {
          id: 'doc-1',
          kind: 'production_brief' as const,
          html: '<p>Brief</p>',
          plainText: 'Brief',
          createdAt: null,
          updatedAt: null,
        },
      ],
    };

    const transform = (response: typeof rawResponse) => response.documents;
    const result = transform(rawResponse);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('doc-1');
    expect(result[0].kind).toBe('production_brief');
  });

  it('returns empty array when documents is empty', () => {
    const rawResponse = {
      projectId: 'p1',
      briefId: 'b1',
      conversationStatus: 'finalized',
      documents: [],
    };

    const transform = (response: typeof rawResponse) => response.documents;
    expect(transform(rawResponse)).toEqual([]);
  });
});
