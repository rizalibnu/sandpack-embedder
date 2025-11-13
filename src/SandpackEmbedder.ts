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
  sandpackSelector: string;

  /** CSS class name applied to the mount container created for each embed. */
  playgroundClass?: string;

  /** Custom Sandpack React components (keyed by name, e.g. "Sandpack"). */
  customComponent?: Record<string, React.ComponentType<SandpackProps>>;

  /** Default theme used when not specified by props. */
  theme?: SandpackProps['theme'];

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

/**
 * SandpackEmbedder scans the DOM for escaped <Sandpack> blocks,
 * parses their props and code blocks, and renders live Sandpack previews.
 */
type Component = React.ComponentType<SandpackProps> | SandpackInternal;

export class SandpackEmbedder {
  private sandpackSelector: string;
  private sandpackPlaygroundSelector: string;
  private component: Record<string, Component>;
  private playgroundClass: string;
  private theme?: SandpackProps['theme'];
  private injectTarget?: SandpackEmbedderOptions['injectTarget'];
  private injectPosition: NonNullable<SandpackEmbedderOptions['injectPosition']>;
  private instances: SandpackInstance[] = [];

  constructor(options: SandpackEmbedderOptions) {
    this.sandpackSelector = options.sandpackSelector;
    this.component = { Sandpack, ...options.customComponent };
    this.playgroundClass = options.playgroundClass ?? 'sandpack-container';
    this.sandpackPlaygroundSelector = this.playgroundClass
      .split(' ')
      .map((cn) => `.${cn}`)
      .join('');
    this.theme = options.theme ?? 'dark';
    this.injectTarget = options.injectTarget;
    this.injectPosition = options.injectPosition ?? 'after';
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
      const Component = this.component[componentName];
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

        return React.createElement(Component, {
          ...props,
          files,
          theme: props.theme ?? theme,
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
   */
  private parseProps(raw: string): SandpackProps {
    const props: Record<string, unknown> = {};
    const parts = raw.match(/(?:[^\s'"]+|'[^']*'|"[^"]*")+/g) ?? [];

    for (const part of parts) {
      const [key, ...valueParts] = part.split('=');
      if (!key || !valueParts.length) continue;

      let value = valueParts.join('=').trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

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

  private decodeHTML(html: string): string {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }

  updateTheme(theme: SandpackProps['theme']): void {
    document.body.dispatchEvent(new CustomEvent(EVENTS.THEME_CHANGE, { detail: { theme } }));
  }

  refresh(): void {
    this.destroy();
    this.load();
  }

  destroy(): void {
    this.instances.forEach(({ root }) => root.unmount());
    this.instances = [];
    const sandpacks = document.querySelectorAll(this.sandpackPlaygroundSelector);
    sandpacks.forEach((el) => el.remove());
  }
}
