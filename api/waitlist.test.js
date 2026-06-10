import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const insert = vi.fn();
const from = vi.fn(() => ({ insert }));
const createClient = vi.fn(() => ({ from }));

vi.mock('@supabase/supabase-js', () => ({ createClient }));

const { default: handler } = await import('./waitlist.js');

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
}

describe('waitlist API', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    insert.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('inserts a valid waitlist entry with the anon client', async () => {
    const res = createResponse();

    await handler({
      method: 'POST',
      body: { name: ' Gavin ', email: 'GAVIN@example.com', interest: 'body-reset' }
    }, res);

    expect(createClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'anon-key',
      expect.any(Object)
    );
    expect(from).toHaveBeenCalledWith('waitlist');
    expect(insert).toHaveBeenCalledWith({
      name: 'Gavin',
      email: 'gavin@example.com',
      interest: 'body-reset',
      source: 'chart-navigator'
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ ok: true });
  });

  it('rejects invalid submissions before contacting Supabase', async () => {
    const res = createResponse();

    await handler({ method: 'POST', body: { name: '', email: 'bad', interest: 'unknown' } }, res);

    expect(createClient).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(400);
  });

  it('only allows POST requests', async () => {
    const res = createResponse();

    await handler({ method: 'GET' }, res);

    expect(res.statusCode).toBe(405);
    expect(res.headers.Allow).toBe('POST');
  });
});
