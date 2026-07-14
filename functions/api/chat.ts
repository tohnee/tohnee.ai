// functions/api/chat.ts
//
// MiniMax proxy endpoint. Frontend calls /api/chat, server reads MINIMAX_API_KEY
// from Cloudflare env variable, forwards to MiniMax API. Key never exposed to browser.
//
// Deploy: Cloudflare Pages automatically maps files under functions/ to routes.
// Secret: wrangler pages secret put MINIMAX_API_KEY --project-name=tohnee-ai

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequestBody {
  messages?: ChatMessage[];
  model?: string;
}

interface MiniMaxResponse {
  choices?: Array<{ message?: { content?: string } }>;
  base_resp?: { status_msg?: string };
  error?: { message?: string };
}

interface Env {
  MINIMAX_API_KEY: string;
}

const MINIMAX_ENDPOINT = 'https://api.minimax.chat/v1/text/chat/completions';
const DEFAULT_MODEL = 'MiniMax-Text-01';
const SYSTEM_PROMPT =
  'You are Tohnee-7B, a helpful AI assistant created by Tohnee AI Research Lab. You are helpful, creative, and concise.';

const MAX_MESSAGES = 50;
const MAX_CONTENT_LENGTH = 8000;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

function validateMessages(messages: unknown): ChatMessage[] {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('messages must be a non-empty array');
  }
  if (messages.length > MAX_MESSAGES) {
    throw new Error(`too many messages (max ${MAX_MESSAGES})`);
  }
  return messages.map((m) => {
    if (typeof m !== 'object' || m === null) throw new Error('invalid message');
    const msg = m as Record<string, unknown>;
    if (msg.role !== 'user' && msg.role !== 'assistant' && msg.role !== 'system') {
      throw new Error('invalid message role');
    }
    if (typeof msg.content !== 'string' || msg.content.length === 0) {
      throw new Error('message content must be a non-empty string');
    }
    if (msg.content.length > MAX_CONTENT_LENGTH) {
      throw new Error(`message too long (max ${MAX_CONTENT_LENGTH} chars)`);
    }
    return { role: msg.role, content: msg.content } as ChatMessage;
  });
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  if (!env?.MINIMAX_API_KEY) {
    console.error('[chat] MINIMAX_API_KEY not configured');
    return jsonResponse({ error: 'Server not configured' }, 500);
  }

  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  let messages: ChatMessage[];
  try {
    messages = validateMessages(body.messages);
  } catch (e) {
    return jsonResponse({ error: e instanceof Error ? e.message : 'Invalid messages' }, 400);
  }

  const model = typeof body.model === 'string' ? body.model : DEFAULT_MODEL;

  const payload = {
    model,
    messages: [{ role: 'system' as const, content: SYSTEM_PROMPT }, ...messages],
    stream: false,
  };

  try {
    const upstream = await fetch(MINIMAX_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.MINIMAX_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await upstream.text();

    if (!upstream.ok) {
      let errMsg = `Upstream error: ${upstream.status}`;
      try {
        const errData = JSON.parse(text) as MiniMaxResponse;
        errMsg = errData.base_resp?.status_msg || errData.error?.message || errMsg;
      } catch {
        // non-JSON error
      }
      return jsonResponse({ error: errMsg }, upstream.status);
    }

    let data: MiniMaxResponse;
    try {
      data = JSON.parse(text) as MiniMaxResponse;
    } catch {
      return jsonResponse({ error: 'Invalid upstream response' }, 502);
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return jsonResponse({ error: 'Empty response from model' }, 502);
    }

    return jsonResponse({ content });
  } catch (e) {
    console.error('[chat] upstream fetch failed:', e);
    return jsonResponse({ error: 'Failed to connect to model provider' }, 502);
  }
};
