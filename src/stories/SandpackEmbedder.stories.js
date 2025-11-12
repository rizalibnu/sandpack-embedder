import { gruvboxDark } from "@codesandbox/sandpack-themes";
import React from "react";
import { Sandpack } from "@codesandbox/sandpack-react";
import { SandpackEmbedder } from "../index";
import { buildCodeBlock, CODE_CONTAINER_SELECTOR } from "../../utils";

export default {
  title: "SandpackEmbedder",
};

function resetBeforeStory() {
  document.querySelectorAll(CODE_CONTAINER_SELECTOR).forEach((el) => el.remove());
}

/* -------------------------------------------------
   Basic Example (React Template + Single File)
-------------------------------------------------- */
export const Basic = () => {
  resetBeforeStory();
  const container = document.createElement("div");
  container.innerHTML = `
    ${buildCodeBlock(`{
      "template": "react",
      "options": { "editorHeight": "500px" }
    }`, "sandpack.config.json")}

    ${buildCodeBlock(`
import React from "react";

function App() {
  return <h2>Hello Sandpack Embedder 👋</h2>;
}

export default App;
    `, "App.js")}
  `;

  document.body.appendChild(container);

  const instance = new SandpackEmbedder({ theme: "dark" });
  instance.load();

  return container;
};

/* -------------------------------------------------
   Update Theme Dynamically
-------------------------------------------------- */
export const UpdateTheme = () => {
  resetBeforeStory();
  const container = document.createElement("div");
  container.innerHTML = `
    ${buildCodeBlock(`{
      "template": "react"
    }`, "sandpack.config.json")}
    ${buildCodeBlock(`
export default function App() {
  return <div>Dark / Light theme toggle test 🌗</div>;
}`, "App.js")}
  `;

  document.body.appendChild(container);

  const instance = new SandpackEmbedder({ theme: "dark" });
  instance.load();

  // Add a theme toggle button
  const button = document.createElement("button");
  button.textContent = "Toggle Theme";
  button.style.margin = "1rem";
  button.onclick = () => {
    const newTheme = button.dataset.theme === "dark" ? "light" : "dark";
    instance.updateTheme(newTheme);
    button.dataset.theme = newTheme;
    button.textContent = `Switch to ${newTheme === "dark" ? "Light" : "Dark"} Theme`;
  };
  button.dataset.theme = "dark";

  container.prepend(button);

  return container;
};

/* -------------------------------------------------
   Without Config (auto-detect files only)
-------------------------------------------------- */
export const SandpackTheme = () => {
  resetBeforeStory();
  const container = document.createElement("div");

  container.innerHTML = `
    ${buildCodeBlock(`{
      "template": "vanilla"
    }`, "sandpack.config.json")}
    ${buildCodeBlock(`
document.body.innerHTML = '<h2>Hello! I am using GruvboxDark theme</h2>';
`, "index.js")}
  `;

  document.body.appendChild(container);

  const instance = new SandpackEmbedder({ theme: gruvboxDark });
  instance.load();

  return container;
};

/* -------------------------------------------------
   Story 3: Multiple Sections (Two Sandpacks in One Page)
-------------------------------------------------- */
export const MultipleSections = () => {
  resetBeforeStory();
  const container = document.createElement("div");

  container.innerHTML = `
    ${buildCodeBlock(`{
      "template": "react"
    }`, "sandpack.config.json")}
    ${buildCodeBlock(`
export default function App() {
  return <h2>Section 1 - Hello!</h2>;
}`, "App.js")}

    <!-- Section Separator -->
    <hr />

    ${buildCodeBlock(`{
      "template": "vanilla"
    }`, "sandpack.config.json")}
    ${buildCodeBlock(`
document.body.innerHTML = '<h2>Section 2 - Vanilla JS</h2>';
`, "index.js")}
  `;

  document.body.appendChild(container);

  const instance = new SandpackEmbedder();
  instance.load();

  return container;
};

/* -------------------------------------------------
   With Config Files (multiple files + options)
-------------------------------------------------- */
export const WithConfigFiles = () => {
  resetBeforeStory();
  const container = document.createElement("div");
  container.style.margin = "2rem";

  container.innerHTML = `
    ${buildCodeBlock(`{
      "files": {
        "/App.js": {
          "hidden": false,
          "active": true,
          "readOnly": false
        },
        "/components/Button.tsx": {},
        "/Hello.tsx": {
          "code": "export const Hello = () => <h1>Hello Sandpack Embedder</h1>;",
          "readOnly": true
        }
      },
      "template": "react"
    }`, "sandpack.config.json")}

    ${buildCodeBlock(`
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
}
    `, "App.js")}

    ${buildCodeBlock(`
import React from "react";

const Button = (props) => {
  return <button onClick={props.onClick}>Click Me!</button>;
};

export default Button;
    `, "components/Button.tsx")}
  `;

  document.body.appendChild(container);

  const instance = new SandpackEmbedder();
  instance.load();

  return container;
};

/* -------------------------------------------------
   Without Config (auto-detect files only)
-------------------------------------------------- */
export const WithoutConfig = () => {
  resetBeforeStory();
  const container = document.createElement("div");

  container.innerHTML = `
    ${buildCodeBlock(`
console.log("Hello from default Sandpack setup!");
`, "index.js")}
  `;

  document.body.appendChild(container);

  const instance = new SandpackEmbedder();
  instance.load();

  return container;
};

/* -------------------------------------------------
   Custom Sandpack Component
-------------------------------------------------- */
export const CustomSandpack = () => {
  resetBeforeStory();
  const container = document.createElement("div");

  container.innerHTML = `
    ${buildCodeBlock(`{
      "template": "vanilla"
    }`, "sandpack.config.json")}
    ${buildCodeBlock(`
document.body.innerHTML = '<h2>Hello! I am using Custom Sandpack</h2>';
`, "index.js")}
  `;

  document.body.appendChild(container);

  const instance = new SandpackEmbedder({
    customSandpack: (props) => React.createElement(Sandpack, {...props, template: props.template || 'react'})
  });
  instance.load();

  return container;
};