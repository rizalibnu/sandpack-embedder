import React from 'react';
import { gruvboxDark, githubLight, nightOwl } from '@codesandbox/sandpack-themes';
import { Sandpack, SandpackPreview, SandpackProvider } from '@codesandbox/sandpack-react';
import { SandpackEmbedder } from '../index';
import { buildSandpackBlock } from '../utils';

export default {
  title: 'SandpackEmbedder',
};

/* -------------------------------------------------
   Helper: Reset all sandpack DOMs
-------------------------------------------------- */
function reset() {
  document.querySelectorAll('.sandpack').forEach((el) => el.remove());
}

/* -------------------------------------------------
   Basic Example (React Template + Single File)
-------------------------------------------------- */
export const Basic = () => {
  reset();
  const container = document.createElement('div');

  container.innerHTML = buildSandpackBlock({
    template: 'react',
    files: {
      '/App.js': {
        code: `
export default function App() {
  return <h2>Hello Sandpack Embedder 👋</h2>;
}`,
        active: true,
      },
    },
    options: { editorHeight: '400px' },
    customSetup: {
      dependencies: {
        react: '19.2.0',
        'react-dom': '19.2.0',
      },
    },
  });

  document.body.appendChild(container);

  const embedder = new SandpackEmbedder({ theme: 'dark' });
  embedder.load();

  return container;
};

/* -------------------------------------------------
   Dynamic Theme Update
-------------------------------------------------- */
export const UpdateTheme = () => {
  reset();
  const container = document.createElement('div');

  container.innerHTML = buildSandpackBlock({
    template: 'react',
    files: {
      '/App.js': {
        code: `
export default function App() {
  return <div>Dark / Light theme toggle test 🌗</div>;
}`,
        active: true,
      },
    },
  });

  document.body.appendChild(container);

  const embedder = new SandpackEmbedder({ theme: 'dark' });
  embedder.load();

  const button = document.createElement('button');
  button.textContent = 'Toggle Theme';
  button.style.margin = '1rem';
  button.dataset.theme = 'dark';
  button.onclick = () => {
    const newTheme = button.dataset.theme === 'dark' ? 'light' : 'dark';
    embedder.updateTheme(newTheme);
    button.dataset.theme = newTheme;
    button.textContent = `Switch to ${newTheme === 'dark' ? 'Light' : 'Dark'} Theme`;
  };

  container.prepend(button);

  return container;
};

/* -------------------------------------------------
   Custom Theme Example (GruvboxDark)
-------------------------------------------------- */
export const CustomTheme = () => {
  reset();
  const container = document.createElement('div');

  container.innerHTML = buildSandpackBlock({
    template: 'vanilla',
    files: {
      '/index.js': {
        code: `document.body.innerHTML = '<h2>Hello! I am using GruvboxDark theme</h2>';`,
        active: true,
      },
    },
  });

  document.body.appendChild(container);

  const embedder = new SandpackEmbedder({ theme: gruvboxDark });
  embedder.load();

  return container;
};

/* -------------------------------------------------
   Multiple Themes Showcase
-------------------------------------------------- */
export const MultipleThemes = () => {
  reset();
  const container = document.createElement('div');

  const themes = [
    { name: 'Gruvbox Dark', theme: gruvboxDark },
    { name: 'GitHub Light', theme: githubLight },
    { name: 'Night Owl', theme: nightOwl },
  ];

  themes.forEach(({ name, theme }) => {
    const section = document.createElement('div');
    section.style.marginBottom = '2rem';

    const title = document.createElement('h3');
    title.textContent = name;
    section.appendChild(title);

    section.innerHTML += buildSandpackBlock({
      template: 'react',
      files: {
        '/App.js': {
          code: `export default function App() {
  return <div><h2>${name}</h2><p>Theme showcase</p></div>;
}`,
          active: true,
        },
      },
      theme,
    });

    container.appendChild(section);
  });

  document.body.appendChild(container);

  const embedder = new SandpackEmbedder({ theme: gruvboxDark });
  embedder.load();

  return container;
};

/* -------------------------------------------------
   Multiple Sandpack Sections
-------------------------------------------------- */
export const MultipleSections = () => {
  reset();
  const container = document.createElement('div');

  container.innerHTML = `
    ${buildSandpackBlock({
      template: 'react',
      files: {
        '/App.js': {
          code: `
export default function App() {
  return <h2>Section 1 - Hello!</h2>;
}`,
          active: true,
        },
      },
    })}
    <hr />
    ${buildSandpackBlock({
      template: 'vanilla',
      files: {
        '/index.js': {
          code: `document.body.innerHTML = '<h2>Section 2 - Vanilla JS</h2>';`,
          active: true,
        },
      },
    })}
  `;

  document.body.appendChild(container);

  const embedder = new SandpackEmbedder();
  embedder.load();

  return container;
};

/* -------------------------------------------------
   Multiple Files
-------------------------------------------------- */
export const MultipleFiles = () => {
  reset();
  const container = document.createElement('div');

  container.innerHTML = buildSandpackBlock({
    template: 'react',
    files: {
      '/App.js': {
        code: `
import React from "react";
import { Hello } from "./Hello";
import Button from "./components/Button";

export default function App() {
  const [text, setText] = React.useState("You haven't clicked the button.");
  return (
    <div>
      <Hello />
      <p>{text}</p>
      <Button onClick={() => setText('Excellent! You clicked the button')} />
    </div>
  );
}`,
        active: true,
      },
      '/components/Button.tsx': {
        code: `
import React from "react";

const Button = (props) => <button onClick={props.onClick}>Click Me!</button>;
export default Button;
`,
      },
      '/Hello.tsx': {
        code: `export const Hello = () => <h1>Hello Sandpack Embedder</h1>;`,
      },
    },
  });

  document.body.appendChild(container);

  const embedder = new SandpackEmbedder();
  embedder.load();

  return container;
};

/* -------------------------------------------------
   Built-in Preview Preset
-------------------------------------------------- */
export const PreviewPreset = () => {
  reset();
  const container = document.createElement('div');

  container.innerHTML = buildSandpackBlock(
    {
      template: 'react',
      files: {
        '/App.js': {
          code: `
export default function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Preview Only Mode</h1>
      <p>This shows only the preview, no code editor.</p>
      <button onClick={() => alert('Button clicked!')}>Click Me</button>
    </div>
  );
}`,
        },
      },
    },
    { componentName: 'preview' },
  );

  document.body.appendChild(container);

  const embedder = new SandpackEmbedder();
  embedder.load();

  return container;
};

/* -------------------------------------------------
   Built-in Code Viewer Preset
-------------------------------------------------- */
export const CodeViewerPreset = () => {
  reset();
  const container = document.createElement('div');

  container.innerHTML = buildSandpackBlock(
    {
      template: 'vanilla',
      files: {
        '/index.js': {
          code: `// This is a code viewer only mode
// No preview or execution, just syntax highlighting

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log('Fibonacci sequence:');
for (let i = 0; i < 10; i++) {
  console.log(\`F(\${i}) = \${fibonacci(i)}\`);
}`,
          active: true,
        },
      },
    },
    { componentName: 'code-viewer' },
  );

  document.body.appendChild(container);

  const embedder = new SandpackEmbedder();
  embedder.load();

  return container;
};

/* -------------------------------------------------
   Custom Sandpack Component
-------------------------------------------------- */
export const CustomSandpack = () => {
  reset();
  const container = document.createElement('div');

  container.innerHTML = buildSandpackBlock(
    {
      template: 'vanilla',
      files: {
        '/index.js': {
          code: `document.body.innerHTML = '<h2>Hello! I am using Custom Sandpack</h2>';`,
          active: true,
        },
      },
    },
    {
      componentName: 'sandpack-enhanced',
    },
  );

  document.body.appendChild(container);

  const SandpackEnhanced = (props) =>
    React.createElement(Sandpack, {
      ...props,
      template: props.template || 'react',
    });

  const embedder = new SandpackEmbedder({
    customComponents: { 'sandpack-enhanced': SandpackEnhanced },
  });

  embedder.load();

  return container;
};

/* -------------------------------------------------
   Custom Component - Preview Only with Custom Layout
-------------------------------------------------- */
export const CustomPreviewComponent = () => {
  reset();
  const container = document.createElement('div');

  container.innerHTML = buildSandpackBlock(
    {
      template: 'react',
      files: {
        '/App.js': {
          code: `
export default function App() {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Custom Preview Component</h2>
      <p>This uses a custom SandpackProvider setup</p>
    </div>
  );
}`,
        },
      },
    },
    { componentName: 'custom-preview' },
  );

  document.body.appendChild(container);

  const CustomPreview = (props) =>
    React.createElement(
      SandpackProvider,
      { ...props },
      React.createElement(
        'div',
        { style: { border: '2px solid #646cff', borderRadius: '8px', overflow: 'hidden' } },
        React.createElement(SandpackPreview, { showOpenInCodeSandbox: false }),
      ),
    );

  const embedder = new SandpackEmbedder({
    customComponents: { 'custom-preview': CustomPreview },
  });

  embedder.load();

  return container;
};

/* -------------------------------------------------
   Show Original Code Option
-------------------------------------------------- */
export const ShowOriginalCode = () => {
  reset();
  const container = document.createElement('div');

  const title = document.createElement('h3');
  title.textContent = 'With Original Code Visible';
  container.appendChild(title);

  container.innerHTML += buildSandpackBlock({
    template: 'react',
    showOriginalCode: true,
    files: {
      '/App.js': {
        code: `
export default function App() {
  return <h2>Original code block is visible above! 👆</h2>;
}`,
        active: true,
      },
    },
  });

  document.body.appendChild(container);

  const embedder = new SandpackEmbedder({ showOriginalCode: true });
  embedder.load();

  return container;
};

/* -------------------------------------------------
   Different Templates Showcase
-------------------------------------------------- */
export const TemplatesShowcase = () => {
  reset();
  const container = document.createElement('div');

  const templates = [
    {
      name: 'React',
      template: 'react',
      code: `export default function App() {
  return <h2>React Template</h2>;
}`,
    },
    {
      name: 'Vanilla JS',
      template: 'vanilla',
      code: `document.body.innerHTML = '<h2>Vanilla JS Template</h2>';`,
    },
    {
      name: 'Vue 3',
      template: 'vue3',
      code: `<script setup>
import { ref } from 'vue'
const msg = ref('Vue 3 Template')
</script>

<template>
  <h2>{{ msg }}</h2>
</template>`,
    },
    {
      name: 'Angular',
      template: 'angular',
      code: `import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<h2>Angular Template</h2>',
})
export class AppComponent {}`,
    },
  ];

  templates.forEach(({ name, template, code }) => {
    const section = document.createElement('div');
    section.style.marginBottom = '2rem';

    const heading = document.createElement('h3');
    heading.textContent = name;
    section.appendChild(heading);

    const file =
      template === 'vue3'
        ? '/src/App.vue'
        : template === 'angular'
          ? '/src/app/app.component.ts'
          : '/App.js';

    section.innerHTML += buildSandpackBlock({
      template,
      files: {
        [file]: {
          code,
          active: true,
        },
      },
    });

    container.appendChild(section);
  });

  document.body.appendChild(container);

  const embedder = new SandpackEmbedder();
  embedder.load();

  return container;
};

/* -------------------------------------------------
   Custom Setup with Dependencies
-------------------------------------------------- */
export const CustomDependencies = () => {
  reset();
  const container = document.createElement('div');

  container.innerHTML = buildSandpackBlock({
    template: 'react',
    customSetup: {
      dependencies: {
        lodash: 'latest',
        'date-fns': '2.30.0',
      },
    },
    files: {
      '/App.js': {
        code: `
import { format } from 'date-fns';
import _ from 'lodash';

export default function App() {
  const today = format(new Date(), 'PPPP');
  const items = _.chunk([1, 2, 3, 4, 5, 6], 2);
  
  return (
    <div>
      <h2>Custom Dependencies Demo</h2>
      <p>Today is: {today}</p>
      <p>Chunked array: {JSON.stringify(items)}</p>
    </div>
  );
}`,
        active: true,
      },
    },
  });

  document.body.appendChild(container);

  const embedder = new SandpackEmbedder();
  embedder.load();

  return container;
};

/* -------------------------------------------------
   Hidden and ReadOnly Files
-------------------------------------------------- */
export const FileFlags = () => {
  reset();
  const container = document.createElement('div');

  container.innerHTML = buildSandpackBlock({
    template: 'react',
    files: {
      '/App.js': {
        code: `
import { Button } from './Button';
import { SECRET } from './secret';

export default function App() {
  return (
    <div>
      <h2>File Flags Demo</h2>
      <p>Try editing the files!</p>
      <Button />
      <p>Secret: {SECRET}</p>
    </div>
  );
}`,
        active: true,
      },
      '/Button.js': {
        code: `export const Button = () => <button>Click Me (ReadOnly)</button>;`,
        readOnly: true,
      },
      '/secret.js': {
        code: `export const SECRET = "This file is hidden in the editor!";`,
        hidden: true,
      },
    },
  });

  document.body.appendChild(container);

  const embedder = new SandpackEmbedder();
  embedder.load();

  return container;
};

/* -------------------------------------------------
   Refresh / Destroy Lifecycle Demo
-------------------------------------------------- */
export const RefreshAndDestroy = () => {
  reset();
  const container = document.createElement('div');

  container.innerHTML = buildSandpackBlock({
    template: 'vanilla',
    files: {
      '/index.js': {
        code: `console.log("Testing refresh and destroy");
document.body.innerHTML = '<h2>Lifecycle Demo</h2><p>Check console for logs</p>';`,
        active: true,
      },
    },
  });

  document.body.appendChild(container);

  const embedder = new SandpackEmbedder();
  embedder.load();

  const controls = document.createElement('div');
  controls.style.margin = '1rem';

  const refreshBtn = document.createElement('button');
  refreshBtn.textContent = '🔄 Refresh';
  refreshBtn.onclick = () => {
    console.log('Refreshing embedder...');
    embedder.refresh();
  };

  const destroyBtn = document.createElement('button');
  destroyBtn.textContent = '🧨 Destroy';
  destroyBtn.style.marginLeft = '1rem';
  destroyBtn.onclick = () => {
    console.log('Destroying embedder...');
    embedder.destroy();
  };

  const reloadBtn = document.createElement('button');
  reloadBtn.textContent = '♻️ Reload';
  reloadBtn.style.marginLeft = '1rem';
  reloadBtn.onclick = () => {
    console.log('Reloading embedder...');
    embedder.load();
  };

  controls.append(refreshBtn, destroyBtn, reloadBtn);
  container.prepend(controls);

  return container;
};

/* -------------------------------------------------
   Custom Code Selector
-------------------------------------------------- */
export const CustomCodeSelector = () => {
  reset();
  const container = document.createElement('div');

  // Create custom code block with specific class
  const customBlock = document.createElement('div');
  customBlock.innerHTML = buildSandpackBlock(
    {
      template: 'react',
      files: {
        '/App.js': {
          code: `export default function App() {
  return <h2>Found with custom selector! 🎯</h2>;
}`,
          active: true,
        },
      },
    },
    {
      wrapper: (code) => `<pre><code class="language-sandpack">${code}</code></pre>`,
    },
  );

  container.appendChild(customBlock);
  document.body.appendChild(container);

  const embedder = new SandpackEmbedder({
    codeSelector: 'pre > code.language-sandpack',
  });
  embedder.load();

  return container;
};

/* -------------------------------------------------
   All Presets Side by Side
-------------------------------------------------- */
export const AllPresets = () => {
  reset();
  const container = document.createElement('div');
  container.style.display = 'grid';
  container.style.gridTemplateColumns = 'repeat(auto-fit, minmax(400px, 1fr))';
  container.style.gap = '2rem';

  const presets = [
    { name: 'Full Sandpack', component: 'sandpack' },
    { name: 'Preview Only', component: 'preview' },
    { name: 'Code Viewer', component: 'code-viewer' },
  ];

  presets.forEach(({ name, component }) => {
    const section = document.createElement('div');

    const title = document.createElement('h3');
    title.textContent = name;
    section.appendChild(title);

    section.innerHTML += buildSandpackBlock(
      {
        template: 'react',
        files: {
          '/App.js': {
            code: `export default function App() {
  return (
    <div style={{ padding: '1rem' }}>
      <h2>${name}</h2>
      <p>Component: &lt;${component}&gt;</p>
    </div>
  );
}`,
            active: true,
          },
        },
      },
      { componentName: component },
    );

    container.appendChild(section);
  });

  document.body.appendChild(container);

  const embedder = new SandpackEmbedder();
  embedder.load();

  return container;
};
