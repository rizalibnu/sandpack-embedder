# 🧩 Sandpack Embedder

A lightweight, universal **Sandpack embedder** for any HTML document — including **Ghost blogs**, **static sites**, and **custom CMSes**.  
It automatically groups code snippets into interactive Sandpack playgrounds using HTML selectors.

---

## 📦 Installation

Use **pnpm** (recommended):

```bash
pnpm add @rizalibnu/sandpack-embedder
```

or via npm:

```bash
npm install @rizalibnu/sandpack-embedder
```

---

## 🧰 Usage

You can use `SandpackEmbedder` on **any web page** that includes HTML code blocks.

### Example: Simple HTML Integration

```html
<div class="code-container">
  <code class="code-sandpack">console.log("Hello Sandpack!");</code>
  <span class="file-path">/index.js</span>
</div>

<script type="importmap">
  {
    "imports": {
      "react": "https://esm.sh/react@19.2.0",
      "react-dom/client": "https://esm.sh/react-dom@19.2.0/client",
      "@codesandbox/sandpack-react": "https://esm.sh/@codesandbox/sandpack-react@2.20.0",
      "@rizalibnu/sandpack-embedder": "https://esm.sh/@rizalibnu/sandpack-embedder"
    }
  }
</script>
<script type="module">
  import SandpackEmbedder from "@rizalibnu/sandpack-embedder";

  const embedder = new SandpackEmbedder({
    codeSelector: ".code-sandpack",
    codeContainerSelector: ".code-container",
    filePathSelector: ".file-path",
    theme: "dark",
  });

  embedder.load();
</script>
```

This automatically:

* Detects `.code-sandpack` code blocks.
* Groups consecutive ones into a single Sandpack playground.
* Uses filenames from `span.file-path`.
* Renders a React Sandpack instance below the code group.

---

## ⚙️ Options

You can customize selectors, theme, or even replace the Sandpack component.

```ts
new SandpackEmbedder({
  codeSelector: ".code-sandpack",               // Selector for code blocks
  codeContainerSelector: ".code-container",     // Container element
  filePathSelector: ".file-path",               // File path element
  configFilePath: "sandpack.config.json",       // Config file
  playgroundContainerClass: "sandpack-playground", // Output wrapper class
  customSandpack: MyCustomSandpack,             // Optional React component
  theme: "light",                               // Initial Sandpack theme
});
```

---

## 🧩 Config File Support

You can define a JSON config block in your HTML to control template, files, and settings:

```html
<div class="code-container">
  <code class="code-sandpack">
{
  "template": "react",
  "files": {
    "/App.js": { "active": true },
    "/index.js": { "hidden": true }
  }
}
  </code>
  <span class="file-path">sandpack.config.json</span>
</div>
```

Any code block **following** this config will use its setup.

---

## 🎨 Updating Embedder

You can change the Sandpack theme dynamically via:

```js
embedder.updateTheme("light");
```

Later when DOM updates or navigation changes:

```js
embedder.refresh();
```

Completely clean up:
```js
embedder.destroy();
```

---

## 🧪 Testing

Run unit tests with Vitest:

```bash
pnpm test
```

---

## 📚 Storybook

To explore and test UI behaviors interactively:

```bash
pnpm storybook
```

You can use **Storybook Actions** to trigger live theme updates.

---

## 🏗️ Build Commands

| Command          | Description                                                      |
| ---------------- | ---------------------------------------------------------------- |
| `pnpm build`     | Builds both light (external deps) and full bundles using esbuild |
| `pnpm test`      | Runs Vitest unit tests                                           |
| `pnpm storybook` | Runs Storybook in HTML mode                                      |
| `pnpm release`   | Triggers semantic release for version bump and changelog         |

---

## 🧱 Example: Custom Sandpack Component

You can provide your own React component that receives the same props as `Sandpack`:

```tsx
import { Sandpack } from "@codesandbox/sandpack-react";

function MyCustomSandpack(props) {
  return <Sandpack {...props} template="vanilla" />;
}

new SandpackEmbedder({
  customSandpack: MyCustomSandpack,
}).load();
```

---

## 🔍 How It Works

1. Scans the DOM for `codeSelector` elements.
2. Groups consecutive code containers.
3. Looks for optional config JSON (`sandpack.config.json`).
4. Replaces them with a React-based Sandpack playground.

---

## 🧾 License

MIT © [Rizal Ibnu](https://github.com/rizalibnu)

---

**Made with ❤️ by Rizal Ibnu**
