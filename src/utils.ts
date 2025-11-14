import type { SandpackFile, SandpackFiles, SandpackProps } from '@codesandbox/sandpack-react';

/**
 * Escape code content for embedding into HTML safely.
 * @param code - The raw code string to escape.
 * @returns Escaped HTML string safe for innerHTML.
 */
export function escapeCodeForHTML(code: string): string {
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
 * convert a string from camelCase to kebab-case
 */
function camelCaseToKebabCase(str: string): string {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Combine everything into escaped code HTML block
 */
export function buildSandpackCode(
  props: SandpackProps & { showOriginalCode: boolean },
  options?: { customComponentName?: string },
): string {
  const { files = {}, ...rest } = props;
  const sandpackComponent = options?.customComponentName || 'sandpack';

  // Build Sandpack attributes (theme, template, options, etc.)
  const attrString = Object.entries(rest)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `${camelCaseToKebabCase(key)}='${serializeAttrValue(value)}'`)
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

  return `<${sandpackComponent}${attrString ? ' ' + attrString : ''}>\n${fileBlocks}\n\n</${sandpackComponent}>`;
}

/**
 * Build an HTML code block that embeds a Sandpack instance.
 */
export function buildSandpackBlock(
  props: SandpackProps & { showOriginalCode: boolean },
  options?: {
    customComponentName?: string;
    wrapper?: (code: string) => string;
  },
): string {
  const defaultWrapper = (code: string) => `<pre><code>${code}</code></pre>`;
  const wrapper = options?.wrapper ?? defaultWrapper;

  // Combine everything into escaped code HTML block
  const sandpackCode = buildSandpackCode(props, options);

  return wrapper(escapeCodeForHTML(sandpackCode)).trim();
}
