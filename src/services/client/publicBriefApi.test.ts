import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { BriefFinalPackage, BriefV3ChatResponse } from '@/types/briefAi.interface';

vi.mock('@/constants/apiRoute', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/constants/apiRoute')>();
  return {
    ...actual,
    ApiRoute: {
      ...actual.ApiRoute,
      PUBLIC_BRIEF_AI_FINAL_DOCUMENTS: (briefId: string) =>
        `http://localhost/service/public/briefs/ai/${briefId}/final-documents`,
      PUBLIC_BRIEF_AI_CHAT: (briefId: string) => `http://localhost/service/public/briefs/ai/${briefId}/chat`,
    },
  };
});

import { publicBriefApi } from './publicBriefApi';

const createTestStore = () =>
  configureStore({
    reducer: { [publicBriefApi.reducerPath]: publicBriefApi.reducer },
    middleware: (getDefault) => getDefault().concat(publicBriefApi.middleware),
  });

const initialPackage: BriefFinalPackage = {
  briefId: 'brief-1',
  conversationStatus: 'finalized',
  documents: [
    {
      id: 'doc-1',
      kind: 'production_brief',
      html: '<p>original</p>',
      plainText: 'original',
      createdAt: null,
      updatedAt: null,
    },
  ],
  generating: false,
};

const makeChatResponse = (updatedHtml: string): BriefV3ChatResponse => ({
  reply: 'reply',
  messageId: 'msg-1',
  readyToFinalize: false,
  conversationStatus: 'in_progress',
  documentLanguage: 'en',
  inputTokens: 1,
  outputTokens: 1,
  costUsd: '0.001',
  messageCount: 2,
  updatedDocuments: [
    {
      id: 'doc-1',
      kind: 'production_brief',
      html: updatedHtml,
      plainText: 'updated',
      createdAt: null,
      updatedAt: '2026-01-01T00:00:00Z',
    },
  ],
});

describe('sendPublicBriefChat onQueryStarted cache sync', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('updates getPublicBriefFinalDocuments cache after successful chat mutation', async () => {
    const store = createTestStore();

    fetchSpy
      .mockResolvedValueOnce(
        new Response(JSON.stringify(initialPackage), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(makeChatResponse('<p>updated</p>')), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

    await store.dispatch(
      publicBriefApi.endpoints.getPublicBriefFinalDocuments.initiate({ briefId: 'brief-1', token: 'tok-1' })
    );

    const before = publicBriefApi.endpoints.getPublicBriefFinalDocuments.select({
      briefId: 'brief-1',
      token: 'tok-1',
    })(store.getState());
    expect(before.data?.documents[0].html).toBe('<p>original</p>');

    await store.dispatch(
      publicBriefApi.endpoints.sendPublicBriefChat.initiate({
        briefId: 'brief-1',
        message: 'hello',
        token: 'tok-1',
      })
    );

    const after = publicBriefApi.endpoints.getPublicBriefFinalDocuments.select({
      briefId: 'brief-1',
      token: 'tok-1',
    })(store.getState());
    expect(after.data?.documents[0].html).toBe('<p>updated</p>');
    expect(after.data?.documents[0].updatedAt).toBe('2026-01-01T00:00:00Z');
  });

  it('leaves cache unchanged when updatedDocuments is empty', async () => {
    const store = createTestStore();
    const emptyUpdateResponse: BriefV3ChatResponse = {
      ...makeChatResponse('<p>x</p>'),
      updatedDocuments: [],
    };

    fetchSpy
      .mockResolvedValueOnce(
        new Response(JSON.stringify(initialPackage), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(emptyUpdateResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

    await store.dispatch(
      publicBriefApi.endpoints.getPublicBriefFinalDocuments.initiate({ briefId: 'brief-1', token: 'tok-1' })
    );

    await store.dispatch(
      publicBriefApi.endpoints.sendPublicBriefChat.initiate({
        briefId: 'brief-1',
        message: 'hi',
        token: 'tok-1',
      })
    );

    const after = publicBriefApi.endpoints.getPublicBriefFinalDocuments.select({
      briefId: 'brief-1',
      token: 'tok-1',
    })(store.getState());
    expect(after.data?.documents[0].html).toBe('<p>original</p>');
  });
});
