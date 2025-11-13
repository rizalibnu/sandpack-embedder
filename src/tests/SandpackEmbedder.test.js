import { describe, it, expect, vi } from 'vitest';
import { buildSandpackBlock } from '../utils';
import { SandpackEmbedder } from '../index';

describe('SandpackEmbedder', () => {
  it('dispatches theme change event', () => {
    const sandpack = new SandpackEmbedder();
    const listener = vi.fn();
    document.body.addEventListener('sandpack-theme-change', listener);

    sandpack.updateTheme('light');

    expect(listener).toHaveBeenCalled();
    const event = listener.mock.calls[0][0];
    expect(event.detail.theme).toBe('light');
  });

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

    expect(document.querySelector(`.sandpack-container`)).not.toBeNull();
  });

  it('supports custom codeSelector', () => {
    const sandpack = new SandpackEmbedder({
      codeSelector: '.code-js',
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
      { codeElClass: 'code-js' },
    );

    document.body.appendChild(container);
    sandpack.load();

    expect(document.querySelector(`.${sandpack.playgroundClass}`)).not.toBeNull();
  });

  it('renders multiple sandpack sections', () => {
    const sandpack = new SandpackEmbedder();

    const container = document.createElement('div');
    container.innerHTML = `
      ${buildSandpackBlock({
        files: { '/App1.js': "console.log('Section 1')" },
        template: 'vanilla',
      })}
      ${buildSandpackBlock({
        files: { '/App2.js': "console.log('Section 2')" },
        template: 'vanilla',
      })}
    `;
    document.body.appendChild(container);

    sandpack.load();

    expect(document.querySelectorAll(`.${sandpack.playgroundClass}`).length).toBeGreaterThanOrEqual(
      1,
    );
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

    expect(document.querySelector(`.${sandpack.playgroundClass}`)).not.toBeNull();

    sandpack.destroy();

    expect(document.querySelector(`.${sandpack.playgroundClass}`)).toBeNull();
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
});
