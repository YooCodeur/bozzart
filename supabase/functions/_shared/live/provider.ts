// ═══════════════════════════════════════════════
// Live streaming provider interface
// ═══════════════════════════════════════════════

export interface CreateStreamInput {
  title: string;
  description?: string;
  scheduledAt?: string | null;
}

export interface CreatedStream {
  providerStreamId: string;
  providerPlaybackId: string;
  streamKey: string;
  rtmpIngestUrl: string;
}

export interface LiveStreamProvider {
  createStream(input: CreateStreamInput): Promise<CreatedStream>;
  getPlaybackUrl(providerPlaybackId: string): string;
  endStream(providerStreamId: string): Promise<{ recordingUrl?: string | null }>;
}

// ─── Mux stub ──────────────────────────────────
// TODO: implement real Mux API calls using MUX_TOKEN_ID / MUX_TOKEN_SECRET
// Docs: https://docs.mux.com/api-reference#video/operation/create-live-stream
export class MuxProvider implements LiveStreamProvider {
  private readonly tokenId: string;
  private readonly tokenSecret: string;

  constructor() {
    this.tokenId = Deno.env.get("MUX_TOKEN_ID") ?? "";
    this.tokenSecret = Deno.env.get("MUX_TOKEN_SECRET") ?? "";
  }

  async createStream(_input: CreateStreamInput): Promise<CreatedStream> {
    // TODO: POST https://api.mux.com/video/v1/live-streams with Basic auth
    // For now return a deterministic stub so the rest of the pipeline works.
    const id = crypto.randomUUID();
    return await Promise.resolve({
      providerStreamId: `mux_stub_${id}`,
      providerPlaybackId: `mux_playback_${id}`,
      streamKey: `sk_${id.replaceAll("-", "")}`,
      rtmpIngestUrl: "rtmps://global-live.mux.com:443/app",
    });
  }

  getPlaybackUrl(providerPlaybackId: string): string {
    return `https://stream.mux.com/${providerPlaybackId}.m3u8`;
  }

  async endStream(_providerStreamId: string): Promise<{ recordingUrl?: string | null }> {
    // TODO: call Mux `complete` endpoint + fetch asset for recording URL
    return await Promise.resolve({ recordingUrl: null });
  }
}

export function getDefaultProvider(): LiveStreamProvider {
  return new MuxProvider();
}
