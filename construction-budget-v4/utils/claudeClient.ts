// Client-side replacement for the old `new GoogleGenAI(...) / ai.models.generateContent(...)`
// pattern. The browser never talks to Anthropic directly or holds an API key -
// it POSTs to /api/claude (see api/claude.ts), which holds the real key
// server-side. Structured output is done via a forced tool call, Claude's
// equivalent of Gemini's responseSchema/responseMimeType: "application/json".

export type ClaudeContentBlock =
  | { type: 'text'; text: string }
  | { type: 'image'; source: { type: 'base64'; media_type: string; data: string } }
  | { type: 'document'; source: { type: 'base64'; media_type: 'application/pdf'; data: string } };

// Maps a Gemini-style {mimeType, base64Data} file part to the Claude content
// block it corresponds to. Images and PDFs are the only file types any
// migrated feature actually sends (CSV/XLSX are converted to plain text
// before reaching this point, same as they were for Gemini).
export function toClaudeContentBlock(mimeType: string, base64Data: string): ClaudeContentBlock {
  if (mimeType.startsWith('image/')) {
    return { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64Data } };
  }
  if (mimeType === 'application/pdf') {
    return { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64Data } };
  }
  throw new Error(`Unsupported file type for Claude: ${mimeType}`);
}

export interface ClaudeStructuredOutputOptions {
  model: string;
  system?: string;
  content: ClaudeContentBlock[];
  toolName: string;
  toolDescription: string;
  inputSchema: object;
  maxTokens?: number;
  temperature?: number;
}

// Sends a single-turn message with a forced tool call and returns the parsed
// tool_use input directly - no JSON.parse(response.text) needed, since the
// tool's input_schema already guarantees the shape.
export async function callClaudeForStructuredOutput(opts: ClaudeStructuredOutputOptions): Promise<any> {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: opts.model,
      max_tokens: opts.maxTokens ?? 8192,
      temperature: opts.temperature ?? 0,
      system: opts.system,
      messages: [{ role: 'user', content: opts.content }],
      tools: [{ name: opts.toolName, description: opts.toolDescription, input_schema: opts.inputSchema }],
      tool_choice: { type: 'tool', name: opts.toolName },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Claude request failed (${res.status}): ${detail}`);
  }

  const data = await res.json();
  const toolUse = (data.content || []).find((block: any) => block.type === 'tool_use');
  if (!toolUse) {
    throw new Error('Claude did not return a tool call result');
  }
  return toolUse.input;
}
