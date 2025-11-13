import type { SandpackFile, SandpackFiles, SandpackProps } from '@codesandbox/sandpack-react';

/**
 * Escape code content for embedding into HTML safely.
 * @param code - The raw code string to escape.
 * @returns Escaped HTML string safe for innerHTML.
 */
function escapeCodeForHTML(code: string): string {
  return code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Safely serialize Sandpack props (stringify objects, keep strings as-is).
 */
function serializeAttrValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

/**
 * Build an HTML code block that embeds a Sandpack instance.
 */
export function buildSandpackBlock(
  props: SandpackProps,
  options?: { codeElClass?: string; customComponentName?: string },
): string {
  const { files = {}, ...rest } = props;
  const codeElClass = options?.codeElClass || 'code-sandpack';
  const SandpackComponent = options?.customComponentName || 'Sandpack';

  // Build Sandpack attributes (theme, template, options, etc.)
  const attrString = Object.entries(rest)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `${key}='${serializeAttrValue(value)}'`)
    .join(' ');

  // Build file code blocks
  const fileBlocks = Object.entries(files as SandpackFiles)
    .map(([path, file]) => {
      const f: SandpackFile = typeof file === 'string' ? { code: file } : file;

      const flags = [
        f.active ? 'active' : '',
        f.hidden ? 'hidden' : '',
        f.readOnly ? 'readOnly' : '',
      ]
        .filter(Boolean)
        .join(' ');

      return [`\`\`\`js ${path}${flags ? ' ' + flags : ''}`, f.code.trim(), '```'].join('\n');
    })
    .join('\n\n');

  // Combine everything into escaped code HTML block
  const sandpackCode = `<${SandpackComponent}${attrString ? ' ' + attrString : ''}>\n${fileBlocks}\n\n</${SandpackComponent}>`;

  return `
<div class="code-container">
  <code class="${codeElClass}">
${escapeCodeForHTML(sandpackCode)}
  </code>
</div>
  `.trim();
}
