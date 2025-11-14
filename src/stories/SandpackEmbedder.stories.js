import React from 'react';
import { gruvboxDark } from '@codesandbox/sandpack-themes';
import { Sandpack } from '@codesandbox/sandpack-react';
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
   Refresh / Destroy Lifecycle Demo
-------------------------------------------------- */
export const RefreshAndDestroy = () => {
  reset();
  const container = document.createElement('div');

  container.innerHTML = buildSandpackBlock({
    template: 'vanilla',
    files: {
      '/index.js': {
        code: `console.log("Testing refresh and destroy");`,
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
  refreshBtn.onclick = () => embedder.refresh();

  const destroyBtn = document.createElement('button');
  destroyBtn.textContent = '🧨 Destroy';
  destroyBtn.style.marginLeft = '1rem';
  destroyBtn.onclick = () => embedder.destroy();

  controls.append(refreshBtn, destroyBtn);
  container.prepend(controls);

  return container;
};
