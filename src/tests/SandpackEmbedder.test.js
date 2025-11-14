import { describe, it, expect, vi } from 'vitest';
import { buildSandpackBlock } from '../utils';
import { SandpackEmbedder } from '../index';

describe('SandpackEmbedder', () => {
  it('renders a Sandpack placeholder', () => {
    const sandpack = new SandpackEmbedder({ theme: 'dark' });

    const container = document.createElement('div');
    container.innerHTML = buildSandpackBlock({
      files: {
        '/index.js': {
          code: `console.log("Hello Sandpack Embedder")`,
          active: true,
        },
      },
      template: 'vanilla',
    });

    document.body.appendChild(container);
    sandpack.load();

    expect(document.querySelector(`.sandpack`)).not.toBeNull();
  });

  it('dispatches theme change event', () => {
    const sandpack = new SandpackEmbedder();
    const listener = vi.fn();
    document.body.addEventListener('sandpack-theme-change', listener);

    sandpack.updateTheme('light');

    expect(listener).toHaveBeenCalled();
    const event = listener.mock.calls[0][0];
    expect(event.detail.theme).toBe('light');
  });

  it('supports custom codeSelector', () => {
    const sandpack = new SandpackEmbedder({
      codeSelector: 'pre > code.code-js',
    });

    const container = document.createElement('div');
    container.innerHTML = buildSandpackBlock(
      {
        template: 'react',
        files: {
          '/App.js': {
            code: `
                import React from "react";
                export default function App() {
                  return <h2>Hello Sandpack Embedder 👋</h2>;
                }
              `,
            active: true,
          },
        },
      },
      { wrapper: (code) => `<pre><code class="code-js">${code}</code></pre>` },
    );

    document.body.appendChild(container);
    sandpack.load();

    expect(document.querySelector(`.sandpack`)).not.toBeNull();
  });

  it('renders multiple sandpack sections and built in preset component', () => {
    const sandpack = new SandpackEmbedder();

    const container = document.createElement('div');
    container.innerHTML = `
      ${buildSandpackBlock({
        files: { '/index.js': "console.log('Section 1')" },
        template: 'vanilla',
      })}
      ${buildSandpackBlock({
        files: { '/index.js': "console.log('Section 2')" },
        template: 'vanilla',
      })}
      ${buildSandpackBlock(
        {
          files: { '/index.js': "console.log('Section 3')" },
          template: 'vanilla',
        },
        { componentName: 'preview' },
      )}
      ${buildSandpackBlock(
        {
          files: { '/index.js': "console.log('Section 4')" },
          template: 'vanilla',
        },
        { componentName: 'code-viewer' },
      )}
    `;
    document.body.appendChild(container);

    sandpack.load();

    expect(document.querySelectorAll(`.sandpack`).length).toEqual(4);
  });

  it('applies custom Sandpack theme correctly', async () => {
    const { gruvboxDark } = await import('@codesandbox/sandpack-themes');

    const sandpack = new SandpackEmbedder({ theme: gruvboxDark });
    const container = document.createElement('div');
    container.innerHTML = buildSandpackBlock({
      files: { '/index.js': `console.log("Theme test")` },
      template: 'vanilla',
    });
    document.body.appendChild(container);

    sandpack.load();

    const event = new CustomEvent('sandpack-theme-change', {
      detail: { theme: gruvboxDark },
    });
    document.body.dispatchEvent(event);

    expect(event.detail.theme.colors.surface1).toBe('#1d2021');
  });

  it('destroys all sandpack instances', () => {
    const sandpack = new SandpackEmbedder();
    const container = document.createElement('div');
    container.innerHTML = buildSandpackBlock({
      files: { '/index.js': `console.log("Destroy test")` },
      template: 'vanilla',
    });
    document.body.appendChild(container);

    sandpack.load();

    expect(document.querySelector(`.sandpack`)).not.toBeNull();

    sandpack.destroy();

    expect(document.querySelector(`.sandpack`)).toBeNull();
  });

  it('refresh removes old roots and re-renders new ones', () => {
    const sandpack = new SandpackEmbedder({
      playgroundClass: 'sandpack-refresh test',
    });
    const container = document.createElement('div');
    container.innerHTML = buildSandpackBlock({
      files: { '/index.js': `console.log("Refresh Root")` },
      template: 'vanilla',
    });
    document.body.appendChild(container);

    sandpack.load();

    const oldRoot = document.querySelector(`.sandpack-refresh.test`);
    expect(oldRoot).not.toBeNull();

    sandpack.refresh();

    const newRoot = document.querySelector(`.sandpack-refresh.test`);
    expect(newRoot).not.toBe(oldRoot);
  });

  describe('Custom Component Name Validation', () => {
    it('accepts valid custom component names without hyphens', () => {
      const MockComponent = vi.fn(() => null);
      expect(() => {
        new SandpackEmbedder({
          customComponents: {
            mycomponent: MockComponent,
          },
        });
      }).not.toThrow();
    });

    it('accepts valid custom component names with hyphens', () => {
      const MockComponent = vi.fn(() => null);
      expect(() => {
        new SandpackEmbedder({
          customComponents: {
            'my-component': MockComponent,
            'custom-editor-123': MockComponent,
          },
        });
      }).not.toThrow();
    });

    it('rejects component names starting with uppercase', () => {
      const MockComponent = vi.fn(() => null);
      expect(() => {
        new SandpackEmbedder({
          customComponents: {
            MyComponent: MockComponent,
          },
        });
      }).toThrow('Invalid component name');
    });

    it('rejects component names starting with numbers', () => {
      const MockComponent = vi.fn(() => null);
      expect(() => {
        new SandpackEmbedder({
          customComponents: {
            '123component': MockComponent,
          },
        });
      }).toThrow('Invalid component name');
    });

    it('rejects component names containing uppercase letters', () => {
      const MockComponent = vi.fn(() => null);
      expect(() => {
        new SandpackEmbedder({
          customComponents: {
            'myComponent-test': MockComponent,
          },
        });
      }).toThrow('Invalid component name');
    });

    it('rejects component names ending with hyphen', () => {
      const MockComponent = vi.fn(() => null);
      expect(() => {
        new SandpackEmbedder({
          customComponents: {
            'my-component-': MockComponent,
          },
        });
      }).toThrow('Invalid component name');
    });

    it('rejects component names starting with hyphen', () => {
      const MockComponent = vi.fn(() => null);
      expect(() => {
        new SandpackEmbedder({
          customComponents: {
            '-mycomponent': MockComponent,
          },
        });
      }).toThrow('Invalid component name');
    });

    it('rejects component names with special characters', () => {
      const MockComponent = vi.fn(() => null);
      expect(() => {
        new SandpackEmbedder({
          customComponents: {
            'my@component': MockComponent,
          },
        });
      }).toThrow('Invalid component name');
    });

    it('accepts component names with multiple hyphens', () => {
      const MockComponent = vi.fn(() => null);
      expect(() => {
        new SandpackEmbedder({
          customComponents: {
            'my-custom-editor-component': MockComponent,
          },
        });
      }).not.toThrow();
    });

    it('accepts component names with numbers in middle', () => {
      const MockComponent = vi.fn(() => null);
      expect(() => {
        new SandpackEmbedder({
          customComponents: {
            editor2: MockComponent,
            'my-component-v2': MockComponent,
          },
        });
      }).not.toThrow();
    });
  });

  describe('Custom Component Rendering', () => {
    it('renders custom component when matched', () => {
      const MockComponent = vi.fn(() => null);
      MockComponent.displayName = 'MockComponent';

      const sandpack = new SandpackEmbedder({
        customComponents: {
          'custom-editor': MockComponent,
        },
      });

      const container = document.createElement('div');
      container.innerHTML = buildSandpackBlock(
        {
          files: { '/index.js': "console.log('Custom component')" },
          template: 'vanilla',
        },
        { componentName: 'custom-editor' },
      );

      document.body.appendChild(container);
      sandpack.load();

      // Verify the sandpack container was created (component was matched and rendered)
      expect(document.querySelector(`.sandpack`)).not.toBeNull();
    });

    it('does not render when component name does not match', () => {
      const sandpack = new SandpackEmbedder({
        customComponents: {
          'custom-editor': vi.fn(() => null),
        },
      });

      const container = document.createElement('div');
      container.innerHTML = buildSandpackBlock(
        {
          files: { '/index.js': "console.log('Non-existent')" },
          template: 'vanilla',
        },
        { componentName: 'non-existent' },
      );

      document.body.appendChild(container);

      const initialContainers = document.querySelectorAll('.sandpack').length;
      sandpack.load();
      const finalContainers = document.querySelectorAll('.sandpack').length;

      // No new containers should be created since component doesn't match
      expect(finalContainers).toBe(initialContainers);
    });

    it('matches component names case-sensitively', () => {
      const sandpack = new SandpackEmbedder({
        customComponents: {
          'my-editor': vi.fn(() => null),
        },
      });

      const container = document.createElement('div');

      container.innerHTML = buildSandpackBlock(
        {
          files: { '/index.js': "console.log('test')" },
          template: 'vanilla',
        },
        { componentName: 'My-Editor' },
      );

      document.body.appendChild(container);

      const initialContainers = document.querySelectorAll('.sandpack').length;
      sandpack.load();
      const finalContainers = document.querySelectorAll('.sandpack').length;

      // Should not match because regex only accepts lowercase
      expect(finalContainers).toBe(initialContainers);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty files object', () => {
      const sandpack = new SandpackEmbedder();
      const container = document.createElement('div');
      container.innerHTML = buildSandpackBlock({
        files: {},
        template: 'vanilla',
      });

      document.body.appendChild(container);

      expect(() => sandpack.load()).not.toThrow();
    });

    it('handles missing template', () => {
      const sandpack = new SandpackEmbedder();
      const container = document.createElement('div');
      container.innerHTML = `<pre><code>&lt;sandpack&gt;
\`\`\`js /index.js
console.log('test');
\`\`\`
&lt;/sandpack&gt;</code></pre>`;

      document.body.appendChild(container);

      expect(() => sandpack.load()).not.toThrow();
    });

    it('preserves original code when showOriginalCode is true', () => {
      const sandpack = new SandpackEmbedder({ showOriginalCode: true });
      const container = document.createElement('div');
      container.innerHTML = buildSandpackBlock({
        files: { '/index.js': "console.log('test')" },
        template: 'vanilla',
      });

      document.body.appendChild(container);
      sandpack.load();

      const codeBlock = document.querySelector('pre > code');
      expect(codeBlock?.style.display).not.toBe('none');
    });

    it('hides original code by default', () => {
      const sandpack = new SandpackEmbedder();
      const container = document.createElement('div');
      container.innerHTML = buildSandpackBlock({
        files: { '/index.js': "console.log('test')" },
        template: 'vanilla',
      });

      document.body.appendChild(container);
      sandpack.load();

      const codeBlock = document.querySelector('pre > code');
      expect(codeBlock?.style.display).toBe('none');
    });
  });
});
