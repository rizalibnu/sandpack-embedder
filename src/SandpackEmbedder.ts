import React, { useEffect, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import {
  Sandpack,
  type SandpackInternal,
  type SandpackFile,
  type SandpackProps,
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
  sandpackSelector?: string;

  /** Custom Sandpack React component, if you want to override default Sandpack. */
  customComponent?: React.ComponentType<SandpackProps> | React.ComponentType<SandpackProps>[];

  /** CSS class name applied to the mount container created for each embed. */
  playgroundClass?: string;

  /** Default theme used when not specified by props. */
  theme?: SandpackProps['theme'];
}

/**
 * Internal record of mounted Sandpack instances.
 */
interface SandpackInstance {
  root: Root;
  mount: HTMLElement;
}

/**
 * SandpackEmbedder scans the DOM for escaped <Sandpack> blocks,
 * parses their props and code blocks, and renders live Sandpack previews.
 *
 * Example:
 * ```html
 * <code class="code-sandpack">
 * &lt;Sandpack template="react"&gt;
 * ```js /index.js active
 * console.log('Hello Sandpack')
 * ```
 * &lt;/Sandpack&gt;
 * </code>
 * ```
 */

type Component = React.ComponentType<SandpackProps> | SandpackInternal;
export class SandpackEmbedder {
  private sandpackSelector: string;
  private sandpackPlaygroundSelector: string;
  private component: Component[];
  private playgroundClass: string;
  private theme?: SandpackProps['theme'];
  private instances: SandpackInstance[] = [];

  constructor(options: SandpackEmbedderOptions = {}) {
    this.sandpackSelector = options.sandpackSelector ?? '.code-sandpack';
    const customComponent = options.customComponent
      ? Array.isArray(options.customComponent)
        ? options.customComponent
        : [options.customComponent]
      : [];
    this.component = [...customComponent, Sandpack];
    this.playgroundClass = options.playgroundClass ?? 'sandpack-container';
    this.sandpackPlaygroundSelector = this.playgroundClass
      .split(' ')
      .map((cn) => `.${cn}`)
      .join('');
    this.theme = options.theme ?? 'dark';
  }

  /**
   * Scans the DOM for matching code blocks and renders Sandpack components inside them.
   */
  load(): void {
    document.querySelectorAll<HTMLElement>(this.sandpackSelector).forEach((el) => {
      const decoded = this.decodeHTML(el.innerHTML);
      const match = decoded.match(/<([A-Za-z]+)([^>]*)>([\s\S]*?)<\/\1>/);

      if (!match) return;
      const [, componentName, rawProps, inner] = match;
      const Component = this.component.find((component) => component.name === componentName);
      if (!Component) return;

      const props = this.parseProps(rawProps);
      const files = this.parseFiles(inner);

      // Create mount container
      const mount = document.createElement('div');
      mount.className = this.playgroundClass;
      el.style.display = 'none';
      el.after(mount);

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
          return () => document.body.removeEventListener(EVENTS.THEME_CHANGE, handleThemeChange);
        }, []);

        return React.createElement(Component, {
          ...props,
          files,
          theme: props.theme ?? theme,
        });
      };

      /** Mount React */
      const root = createRoot(mount);
      root.render(React.createElement(SandpackApp));
      this.instances.push({ root, mount });
    });
  }

  /**
   * Parses attribute-style props from a raw HTML-like tag.
   * Automatically converts JSON-like strings into objects or primitives.
   * @param raw Raw props string, e.g. `template="react" options='{"editorHeight":"400px"}'`
   */
  private parseProps(raw: string): SandpackProps {
    const props: Record<string, unknown> = {};

    // Split safely by spaces that are outside quotes
    const parts = raw.match(/(?:[^\s'"]+|'[^']*'|"[^"]*")+/g) ?? [];

    for (const part of parts) {
      const [key, ...valueParts] = part.split('=');
      if (!key || !valueParts.length) continue;

      let value = valueParts.join('=').trim();

      // Remove surrounding quotes
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      // Try to parse JSON, booleans, or numbers
      try {
        if (value.startsWith('{') || value.startsWith('[')) {
          props[key] = JSON.parse(value);
        } else if (value === 'true' || value === 'false') {
          props[key] = value === 'true';
        } else if (!isNaN(Number(value))) {
          props[key] = Number(value);
        } else {
          props[key] = value;
        }
      } catch {
        props[key] = value;
      }
    }

    return props as SandpackProps;
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
    this.instances.forEach(({ root }) => root.unmount());
    this.instances = [];
    const sandpacks = document.querySelectorAll(this.sandpackPlaygroundSelector);
    sandpacks.forEach((el) => el.remove());
  }
}
