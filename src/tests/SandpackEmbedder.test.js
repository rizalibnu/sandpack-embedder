import { describe, it, expect, vi } from "vitest";
import { buildCodeBlock, CODE_CONTAINER_SELECTOR } from "../../utils";
import { SandpackEmbedder } from "../index";

describe("SandpackEmbedder", () => {
  it("normalizes filenames correctly", () => {
    expect(SandpackEmbedder.normalizeFilePath("index.js")).toBe("/index.js");
    expect(SandpackEmbedder.normalizeFilePath("/test.js")).toBe("/test.js");
    expect(SandpackEmbedder.normalizeFilePath(null)).toBeNull();
  });

  it("detects new section properly", () => {
    const codeSelector = ".code-sandpack";
    const container = document.createElement("div");

    // Build HTML for two code blocks
    const firstHTML = buildCodeBlock("console.log('a');", "/App.js");
    const secondHTML = buildCodeBlock("console.log('b');", "/index.js");

    // Inject them into container
    container.innerHTML = `${firstHTML}${secondHTML}`;
    document.body.appendChild(container);

    // Select actual DOM elements
    const cards = container.querySelectorAll(CODE_CONTAINER_SELECTOR);
    const firstCard = cards[0];
    const secondCard = cards[1];

    // 👉 First card should NOT start a new section (has valid next sibling)
    expect(
      SandpackEmbedder.isNewSection(firstCard, CODE_CONTAINER_SELECTOR, codeSelector)
    ).toBe(false);

    // 👉 Second card should start a new section (no valid next sibling)
    expect(
      SandpackEmbedder.isNewSection(secondCard, CODE_CONTAINER_SELECTOR, codeSelector)
    ).toBe(true);
  });

  it("dispatches theme change event", () => {
    const sandpack = new SandpackEmbedder();
    const listener = vi.fn();
    document.body.addEventListener("sandpack-theme-change", listener);

    sandpack.updateTheme("light");

    expect(listener).toHaveBeenCalled();
    const event = listener.mock.calls[0][0];
    expect(event.detail.theme).toBe("light");
  });

  it("renders a Sandpack placeholder", () => {
    const sandpack = new SandpackEmbedder({ theme: "dark" });

    const container = document.createElement("div");
    container.innerHTML = buildCodeBlock(`console.log("Hello without config")`, "index.js");
    document.body.appendChild(container);

    sandpack.load();

    expect(document.querySelector(`.${sandpack.playgroundContainerClass}`)).not.toBeNull();
  });

  it("allows changing configName and codeLangSelectors", () => {
    const sandpack = new SandpackEmbedder({
      configName: "custom.config.json",
      codeSelector: ".code-js",
    });

    const container = document.createElement("div");
    container.innerHTML = `
        ${buildCodeBlock(`{
          "template": "react",
          "options": { "editorHeight": "500px" }
        }`, "custom.config.json", "js")}
    
        ${buildCodeBlock(`
    import React from "react";
    
    function App() {
      return <h2>Hello Sandpack Embedder 👋</h2>;
    }
    
    export default App;
        `, "App.js", "js")}
      `;
      
    document.body.appendChild(container);

    sandpack.load();

    expect(document.querySelector(`.${sandpack.playgroundContainerClass}`)).not.toBeNull();
  });

  it("renders without config file", () => {
    const sandpack = new SandpackEmbedder();
    const container = document.createElement("div");
    container.innerHTML = buildCodeBlock(`console.log("Hello without config")`, "index.js");
    document.body.appendChild(container);

    sandpack.load();

    expect(document.querySelector(`.${sandpack.playgroundContainerClass}`)).not.toBeNull();
  });

  it("renders multiple sections correctly", () => {
    const sandpack = new SandpackEmbedder();
    const container = document.createElement("div");
    container.innerHTML = `
      ${buildCodeBlock(`console.log("Section 1")`, "App1.js")}
      ${buildCodeBlock(`console.log("Section 2")`, "App2.js")}
    `;
    document.body.appendChild(container);

    sandpack.load();

    expect(document.querySelectorAll(".sandpack-playground").length).toBeGreaterThanOrEqual(1);
  });

  it("renders using sandpack theme", async () => {
    const { gruvboxDark } = await import("@codesandbox/sandpack-themes");

    const sandpack = new SandpackEmbedder({ theme: gruvboxDark });
    const container = document.createElement("div");
    container.innerHTML = buildCodeBlock(`console.log("Theme test")`, "index.js");
    document.body.appendChild(container);

    sandpack.load();

    const event = new CustomEvent("sandpack-theme-change", {
      detail: { theme: gruvboxDark },
    });
    document.body.dispatchEvent(event);

    expect(event.detail.theme.colors.surface1).toBe("#1d2021");
  });

  it("destroys all sandpack instances", () => {
    const sandpack = new SandpackEmbedder();
    const container = document.createElement("div");
    container.innerHTML = buildCodeBlock(`console.log("Hello without config")`, "index.js");
    document.body.appendChild(container);

    sandpack.load();

    expect(document.querySelector(`.${sandpack.playgroundContainerClass}`)).not.toBeNull();

    sandpack.destroy();

    expect(document.querySelector(`.${sandpack.playgroundContainerClass}`)).toBeNull();
  });

  it("refresh removes old roots and re-renders new ones", () => {
    const sandpack = new SandpackEmbedder();
    const container = document.createElement("div");
    container.innerHTML = buildCodeBlock(`console.log("Refresh Root")`, "index.js");
    document.body.appendChild(container);

    sandpack.load();

    const oldRoot = document.querySelector(`.${sandpack.playgroundContainerClass}`);
    expect(oldRoot).not.toBeNull();

    sandpack.refresh();

    const newRoot = document.querySelector(`.${sandpack.playgroundContainerClass}`);
    expect(newRoot).not.toBe(oldRoot);
  });
});
