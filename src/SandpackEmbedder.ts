import React, { useEffect, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import {
  Sandpack,
  type SandpackInternal,
  type SandpackFile,
  type SandpackProps,
  type DeepPartial,
  type SandpackTheme,
  type SandpackPredefinedTheme,
} from '@codesandbox/sandpack-react';

/**
 * Custom event names used by the Sandpack embedder.
 */
const EVENTS = {
  THEME_CHANGE: 'sandpack-theme-change',
};

/**
 * Options used to configure the SandpackEmbedder instance.
 */
export interface SandpackEmbedderOptions {
  /** CSS selector used to find code elements containing escaped <Sandpack> markup. */
  codeSelector?: string;

  /** CSS class name applied to the mount container created for each playground embed. */
  playgroundClass?: string;

  /** Custom Sandpack React components (keyed by name, e.g. "Sandpack"). */
  customComponents?: Record<string, React.ComponentType<SandpackProps>>;

  /** Default theme used when not specified by props. */
  theme?: string | SandpackProps['theme'];

  /** Custom Sandpack Theme (keyed by name, e.g. "amethyst").  */
  customThemes?: Record<string, DeepPartial<SandpackTheme>>;

  /**
   * Selector or callback that determines where to inject the Sandpack playground.
   * - If string → resolved via `closest(selector)` from code block
   * - If function → return a DOM element relative to the code block
   */
  injectTarget?: string | ((codeEl: HTMLElement) => HTMLElement | null);

  /** Controls where the mount node is injected relative to injectTarget. */
  injectPosition?: 'before' | 'after' | 'replace' | 'inside';
}

/**
 * Internal record of mounted Sandpack instances.
 */
interface SandpackInstance {
  root: Root;
  mount: HTMLElement;
}

type Component = React.ComponentType<SandpackProps> | SandpackInternal;

/**
 * SandpackEmbedder scans the DOM for escaped <Sandpack> blocks,
 * parses their props and code blocks, and renders live Sandpack previews.
 */
export class SandpackEmbedder {
  private codeSelector: string;
  private components: Record<string, Component>;
  private playgroundClass: string;
  private theme?: string | SandpackProps['theme'];
  private customThemes?: Record<string, DeepPartial<SandpackTheme>>;
  private injectTarget?: SandpackEmbedderOptions['injectTarget'];
  private injectPosition: NonNullable<SandpackEmbedderOptions['injectPosition']>;
  private instances: SandpackInstance[] = [];

  constructor(options: SandpackEmbedderOptions = {}) {
    this.codeSelector = options.codeSelector ?? '.code-sandpack';
    this.components = { sandpack: Sandpack, ...options.customComponents };
    this.playgroundClass = options.playgroundClass ?? 'sandpack-container';
    this.injectTarget = options.injectTarget;
    this.injectPosition = options.injectPosition ?? 'after';
    this.customThemes = options.customThemes;
    this.theme = options.theme;
  }

  /**
   * Scans the DOM for matching code blocks and renders Sandpack components inside them.
   */
  load(): void {
    document.querySelectorAll<HTMLElement>(this.codeSelector).forEach((el) => {
      const decoded = this.decodeHTML(el.innerHTML);
      const match = decoded.match(/<([A-Za-z]+)([^>]*)>([\s\S]*?)<\/\1>/);

      if (!match) return;
      const [, componentName, rawProps, inner] = match;
      const Component = this.components[componentName];
      if (!Component) return;

      const props = this.parseProps(rawProps);
      const files = this.parseFiles(inner);

      /** Create mount container */
      const mount = document.createElement('div');
      mount.className = this.playgroundClass;
      el.style.display = 'none';

      /** Find injection target */
      const target =
        typeof this.injectTarget === 'string'
          ? el.closest(this.injectTarget)
          : typeof this.injectTarget === 'function'
            ? this.injectTarget(el)
            : el;

      const parent = target ?? el.parentElement;
      if (!parent) return;

      /** Inject mount element relative to target */
      switch (this.injectPosition) {
        case 'before':
          parent.before(mount);
          break;
        case 'after':
          parent.after(mount);
          break;
        case 'replace':
          parent.replaceWith(mount);
          break;
        case 'inside':
          parent.appendChild(mount);
          break;
        default:
          parent.after(mount);
      }

      /** React component wrapper */
      const SandpackApp: React.FC = () => {
        const [theme, setTheme] = useState(this.theme);

        useEffect(() => {
          if (props.theme) return;
          const handleThemeChange = (e: Event) => {
            if (e instanceof CustomEvent && e.detail?.theme) {
              setTheme(e.detail.theme);
            }
          };
          document.body.addEventListener(EVENTS.THEME_CHANGE, handleThemeChange);
          return () => {
            document.body.removeEventListener(EVENTS.THEME_CHANGE, handleThemeChange);
          };
        }, []);

        const getTheme = React.useCallback(
          (
            theme: string | DeepPartial<SandpackTheme> | undefined,
          ): SandpackPredefinedTheme | DeepPartial<SandpackTheme> | undefined => {
            if (typeof theme === 'string') {
              if (['light', 'dark', 'auto'].includes(theme))
                return theme as SandpackPredefinedTheme;
              return this.customThemes ? this.customThemes[theme] : undefined;
            }
            return theme;
          },
          [],
        );

        return React.createElement(Component, {
          ...props,
          files,
          theme: getTheme(props.theme ?? theme),
        });
      };

      /** Mount React app */
      const root = createRoot(mount);
      root.render(React.createElement(SandpackApp));
      this.instances.push({ root, mount });
    });
  }

  /**
   * Parses attribute-style props from a raw HTML-like tag.
   * Supports JSON, JSX-like props (`{{ ... }}`), kebab-case keys, and nested quotes.
   * Example:
   * <sandpack template="react" custom-setup="{ \"dependencies\": { \"react\": \"19.2.0\" } }">
   */
  private parseProps(raw: string): SandpackProps {
    const props: Record<string, unknown> = {};

    // Split attributes safely by spaces outside quotes
    const attrRegex = /([^\s=]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
    let match: RegExpExecArray | null;

    while ((match = attrRegex.exec(raw))) {
      // eslint-disable-next-line prefer-const
      let [, key, doubleQuoted, singleQuoted, unquoted] = match;
      let value = doubleQuoted ?? singleQuoted ?? unquoted ?? true;

      // Convert kebab-case → camelCase
      key = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

      // Parse booleans / numbers / JSON-like objects
      if (typeof value === 'string') {
        value = value.trim();
        if (value === 'true' || value === 'false') {
          props[key] = value === 'true';
          continue;
        }
        if (!isNaN(Number(value)) && value !== '') {
          props[key] = Number(value);
          continue;
        }

        // Detect JSON-like or JSX-like
        if (/^{{.*}}$/.test(value)) {
          value = value.slice(1, -1); // remove one layer of braces
        }

        if (/^{[\s\S]*}$/.test(value) || /^\[.*\]$/.test(value)) {
          const parsed = this.safeJsonParse(value);
          props[key] = parsed;
        } else {
          props[key] = value;
        }
      } else {
        props[key] = value;
      }
    }

    return props as SandpackProps;
  }

  /**
   * Safely parses a JSON-like string into an object.
   * Fixes common mistakes like unquoted keys or single quotes.
   */
  private safeJsonParse(value: string) {
    try {
      return JSON.parse(value);
    } catch {
      try {
        // Fix missing quotes on keys and single quotes
        const fixed = value.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/'/g, '"');
        return JSON.parse(fixed);
      } catch {
        console.warn('⚠️ Failed to parse JSON-like value:', value);
        return value;
      }
    }
  }

  /**
   * Parses code blocks within ``` fences into Sandpack file objects.
   * @param content Content inside the <Sandpack>...</Sandpack> block
   */
  private parseFiles(content: string): Record<string, SandpackFile> {
    const fileBlocks = [...content.matchAll(/```(\w+)\s+([^\n]+)\n([\s\S]*?)```/g)];
    const files: Record<string, SandpackFile> = {};

    for (const [, , header, code] of fileBlocks) {
      const [path, ...flags] = header.split(' ');
      files[path] = {
        code: code.trim(),
        ...(flags.includes('active') && { active: true }),
        ...(flags.includes('hidden') && { hidden: true }),
        ...(flags.includes('readOnly') && { readOnly: true }),
      };
    }

    return files;
  }

  /**
   * Decodes escaped HTML entities like &lt; &gt; &amp; into actual characters.
   */
  private decodeHTML(html: string): string {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }

  /**
   * Broadcasts a theme change event to all mounted Sandpack instances.
   * @param theme New theme to apply ("light", "dark", or a custom theme object)
   */
  updateTheme(theme: SandpackProps['theme']): void {
    document.body.dispatchEvent(new CustomEvent(EVENTS.THEME_CHANGE, { detail: { theme } }));
  }

  /**
   * Fully re-initializes all embedded Sandpack instances.
   */
  refresh(): void {
    this.destroy();
    this.load();
  }

  /**
   * Destroys all mounted Sandpack instances and removes their containers from the DOM.
   */
  destroy(): void {
    this.instances.forEach(({ root, mount }) => {
      root.unmount();
      mount.remove();
    });
    this.instances = [];
  }
}
