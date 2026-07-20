// Vercel serverless function (Node runtime). This is the ONLY place the
// Anthropic API key exists - it lives in this function's server-side
// environment (ANTHROPIC_API_KEY, set in the Vercel project's environment
// variables), never in the client bundle. The browser calls POST /api/claude
// with the same shape as Anthropic's Messages API and this just forwards it.
import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured on the server' });
    return;
  }

  const { model, system, messages, tools, tool_choice, max_tokens, temperature } = req.body || {};

  if (!model || !messages) {
    res.status(400).json({ error: 'Request body must include at least "model" and "messages"' });
    return;
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model,
      system,
      messages,
      tools,
      tool_choice,
      max_tokens: max_tokens || 4096,
      temperature: temperature ?? 0,
    });
    res.status(200).json(response);
  } catch (error: any) {
    console.error('Claude proxy request failed:', error);
    res.status(500).json({ error: error?.message || 'Claude request failed' });
  }
}
