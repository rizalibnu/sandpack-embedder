/** Utility: escape HTML for rendering code safely */
export function escapeCodeForHTML(code: string): string {
  return code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Utility: build code blocks */
export function buildCodeBlock(code: string, filename: string, language = "sandpack"): string {
  return `
    <div class="code-container">
      <code class="code-${language}">
${escapeCodeForHTML(code)}
      </code>
      <span class="file-path">${filename}</span>
    </div>
  `;
}

export const CODE_CONTAINER_SELECTOR = ".code-container";
export const FILE_PATH_SELECTOR = ".file-path";