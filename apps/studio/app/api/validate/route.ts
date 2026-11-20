import { FlowDefinitionSchema } from '@fluidkit/contracts';
export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host') ?? new URL(request.url).host;
  if (origin) {
    try { if (new URL(origin).host !== host) return Response.json({ error: 'Origin rejected' }, { status: 403 }); }
    catch { return Response.json({ error: 'Invalid origin' }, { status: 403 }); }
  }
  if (Number(request.headers.get('content-length') ?? 0) > 500000) return Response.json({ error: 'Flow too large' }, { status: 413 });
  let input: unknown;
  try { input = JSON.parse(await request.text()); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const result = FlowDefinitionSchema.safeParse(input);
  if (!result.success) return Response.json({ error: result.error.message }, { status: 422 });
  const states = Object.keys(result.data.states).length;
  const transitions = Object.values(result.data.states).reduce((sum, state) => sum + Object.keys(state.on).length, 0);
  return Response.json({ valid: true, states, transitions, message: `Flow-Vertrag gültig.\n${states} Zustände · ${transitions} erlaubte Übergänge.\nDeine Eingabe bleibt in allen Formen erhalten.` });
}
