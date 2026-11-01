import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { transcribeAudio } from '@/lib/audio/asr-providers';
import { ASR_PROVIDERS } from '@/lib/audio/constants';

const mockFetch = vi.hoisted(() => vi.fn() as Mock);
vi.mock('undici', async (importOriginal) => {
  const actual = await importOriginal<typeof import('undici')>();
  return { ...actual, fetch: mockFetch };
});

describe('Deepgram ASR', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('exposes Nova-3 as default model and expected metadata', () => {
    const provider = ASR_PROVIDERS['deepgram-asr'];
    expect(provider.id).toBe('deepgram-asr');
    expect(provider.name).toBe('Deepgram ASR');
    expect(provider.requiresApiKey).toBe(true);
    expect(provider.defaultModelId).toBe('nova-3');
    expect(provider.models.map((m) => m.id)).toContain('nova-3');
    expect(provider.models.map((m) => m.id)).toContain('nova-2');
  });

  it('requires an API key', async () => {
    await expect(
      transcribeAudio(
        {
          providerId: 'deepgram-asr',
          modelId: 'nova-3',
        },
        Buffer.from('audio'),
      ),
    ).rejects.toThrow('API key required for ASR provider: deepgram-asr');
  });

  it('posts audio to /v1/listen with Token authorization and smart formatting', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: {
          channels: [
            {
              alternatives: [
                {
                  transcript: 'Counter-intelligence debriefing confirmed.',
                },
              ],
            },
          ],
        },
      }),
    });

    const result = await transcribeAudio(
      {
        providerId: 'deepgram-asr',
        apiKey: 'test-deepgram-token',
        modelId: 'nova-3',
        language: 'en',
      },
      Buffer.from('mock-audio-bytes'),
    );

    expect(result.text).toBe('Counter-intelligence debriefing confirmed.');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('https://api.deepgram.com/v1/listen?'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Token test-deepgram-token',
        }),
      }),
    );
  });
});
