import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import type { SandpackFile, SandpackProps } from "@codesandbox/sandpack-react";
import { Sandpack } from "@codesandbox/sandpack-react";

/** --- Constants --- */
export const DEFAULT_CONFIG_FILE_PATH = "sandpack.config.json";

export const SELECTORS = {
  CODE: ".code-sandpack",
  CODE_CONTAINER: ".code-container",
  FILE_PATH: ".file-path",
};

export const CLASSNAMES = {
  PLAYGROUND_CONTAINER: "sandpack-playground",
};

const EVENTS = {
  THEME_CHANGE: "sandpack-theme-change",
};

/** --- Type Definitions --- */

export interface SandpackEmbedderOptions {
  /** CSS selector for code blocks to include (default: `".code-sandpack"`) */
  codeSelector?: string;
  /** CSS selector for code block container */
  codeContainerSelector?: string;
  /** CSS selector for file path */
  filePathSelector?: string;
  /** Optional additional class name for the playground container */
  playgroundContainerClass?: string;
  /** Filename of the configuration JSON block (default: `"sandpack.config.json"`) */
  configFilePath?: string;
  /** Optional custom React component replacing default Sandpack */
  customSandpack?: React.ComponentType<SandpackProps>;
  /** Initial theme to apply */
  theme?: SandpackProps["theme"];
}

interface SandpackConfig {
  template?: SandpackProps["template"];
  customSetup?: SandpackProps["customSetup"];
  options?: SandpackProps["options"];
  teamId?: SandpackProps["teamId"];
  files?: Record<
    string,
    string | Omit<SandpackFile, "code"> & { code?: string }
  >;
}

export class SandpackEmbedder {
  private readonly codeSelector: string;
  private readonly codeContainerSelector: string;
  private readonly filePathSelector: string;
  private readonly playgroundContainerClass: string;
  private readonly playgroundContainerSelector: string;
  private readonly configFilePath: string | null;
  private readonly CustomSandpack?: React.ComponentType<SandpackProps>;
  private readonly initialTheme?: SandpackProps["theme"];
  private initialized = false;

  constructor(options: SandpackEmbedderOptions = {}) {
    this.codeSelector = options.codeSelector ?? SELECTORS.CODE;
    this.codeContainerSelector = options.codeContainerSelector ?? SELECTORS.CODE_CONTAINER;
    this.filePathSelector = options.filePathSelector ?? SELECTORS.FILE_PATH;
    this.playgroundContainerClass = options.playgroundContainerClass ?? CLASSNAMES.PLAYGROUND_CONTAINER;
    this.playgroundContainerSelector = this.playgroundContainerClass.split(" ").map((cn) => `.${cn}`).join("");
    this.configFilePath = SandpackEmbedder.normalizeFilePath(options.configFilePath ?? DEFAULT_CONFIG_FILE_PATH);
    this.CustomSandpack = options.customSandpack;
    this.initialTheme = options.theme;
  }

  /** Normalize filepath to start with "/" */
  static normalizeFilePath(path?: string | null): string | null {
    if (!path) return null;
    return path.startsWith("/") ? path : `/${path}`;
  }

  /**
   * Determines whether the given code block starts a new Sandpack section,
   * based on its *next* sibling element.
   *
   * A "new section" begins when the next sibling is not another valid code container.
   */
  static isNewSection(currentEl: Element | null, codeContainerSelector: string, codeSelector: string): boolean {
    if (!currentEl) return false;

    const nextEl = currentEl.nextElementSibling;
    if (!nextEl) return true; // End of content → new section boundary

    // If next sibling is another valid code block container,
    // and it directly contains a matching code element → same section continues.
    if (nextEl.matches(codeContainerSelector)) {
      const hasCodeChild = nextEl.querySelector(codeSelector) !== null;
      if (hasCodeChild) return false;
    }

    return true;
  }

  /** Mount Sandpack instance for a group of code blocks */
  #renderSandpack(groupBlocks: HTMLElement[], insertAfterEl: HTMLElement, configJson: string | null): void {
    const { configFilePath, codeContainerSelector, filePathSelector, initialTheme, CustomSandpack } = this;

    /** --- Parse config JSON --- */
    let parsedConfig: SandpackConfig = {};
    if (configJson) {
      try {
        parsedConfig = JSON.parse(configJson) as SandpackConfig;
      } catch (err) {
        console.error(`Invalid ${configFilePath}:`, err);
      }
    }

    const { template, customSetup, options, teamId, files: declaredFiles } = parsedConfig;
    const files: NonNullable<SandpackProps["files"]> = {};

    /** --- Collect files --- */
    if (declaredFiles) {
      for (const [path, fileConfig] of Object.entries(declaredFiles)) {
        const normalizedPath = SandpackEmbedder.normalizeFilePath(path);
        if (!normalizedPath) continue;

        if (typeof fileConfig === "string") {
          files[normalizedPath] = fileConfig;
        } else if (fileConfig.code !== undefined) {
          files[normalizedPath] = { code: fileConfig.code, ...fileConfig };
        } else {
          const matchingBlock = groupBlocks.find((block) => {
            const filePath = block
              .closest(codeContainerSelector)
              ?.querySelector(filePathSelector)
              ?.textContent?.trim();
            return SandpackEmbedder.normalizeFilePath(filePath) === normalizedPath;
          });

          files[normalizedPath] = {
            code: matchingBlock?.textContent?.trim() ?? `// Missing code for ${normalizedPath}`,
            ...fileConfig,
          };
        }
      }
    } else {
      groupBlocks.forEach((block) => {
        const filePath = block.closest(codeContainerSelector)?.querySelector(filePathSelector)?.textContent?.trim();
        const normalizedPath = SandpackEmbedder.normalizeFilePath(filePath);
        if (normalizedPath && !files[normalizedPath]) {
          files[normalizedPath] = { code: block.textContent?.trim() ?? "" };
        }
      });
    }

    /** --- Create container for Sandpack --- */
    const sandpackRootEl = document.createElement("div");
    sandpackRootEl.className = this.playgroundContainerClass;
    insertAfterEl.after(sandpackRootEl);

    /** --- Sandpack React Component --- */
    const sandpackProps: SandpackProps = { files, template, customSetup, options, teamId };

    const SandpackApp: React.FC = () => {
      const [theme, setTheme] = useState(initialTheme);
      useEffect(() => {
        const handleThemeChange = (e: Event) => {
          if (!(e instanceof CustomEvent)) return;
          setTheme(e.detail.theme);
        };
        document.body.addEventListener(EVENTS.THEME_CHANGE, handleThemeChange);
        return () => document.body.removeEventListener(EVENTS.THEME_CHANGE, handleThemeChange);
      }, []);

      const Component = CustomSandpack ?? Sandpack;
      return React.createElement(Component, { ...sandpackProps, theme });
    };

    /** --- Mount React --- */
    const root = createRoot(sandpackRootEl);
    root.render(React.createElement(SandpackApp));
  }

  /** Broadcast theme change */
  updateTheme(theme: SandpackProps["theme"]): void {
    document.body.dispatchEvent(new CustomEvent(EVENTS.THEME_CHANGE, { detail: { theme } }));
  }

  /** Group blocks by section based on next sibling logic */
  load(): this {
    if (this.initialized) this.destroy();
    this.initialized = true;

    const { codeSelector, codeContainerSelector, filePathSelector, configFilePath } = this;
    const codeBlocks = Array.from(document.querySelectorAll<HTMLElement>(codeSelector));
    if (!codeBlocks.length) return this;

    const groups: HTMLElement[][] = [];
    let currentGroup: HTMLElement[] = [];

    codeBlocks.forEach((block, index) => {
      const codeContainerEl = block.closest(codeContainerSelector) as HTMLElement | null;
      if (!codeContainerEl) return;

      let filePath = codeContainerEl.querySelector(filePathSelector)?.textContent?.trim() ?? null;
      filePath = SandpackEmbedder.normalizeFilePath(filePath);
      const isConfigFile = filePath === configFilePath;

      currentGroup.push(block);

      const isBoundary = SandpackEmbedder.isNewSection(codeContainerEl, codeContainerSelector, codeSelector);
      if ((isConfigFile && isBoundary) || isBoundary || index === codeBlocks.length - 1) {
        groups.push(currentGroup);
        currentGroup = [];
      }
    });

    groups.forEach((groupBlocks) => {
      // Hide original code blocks
      groupBlocks.forEach((block) => {
        const container = block.closest(codeContainerSelector) as HTMLElement | null;
        if (container) container.style.display = "none";
      });

      // Extract config
      const configBlock = groupBlocks.find((block) => {
        const filePath = SandpackEmbedder.normalizeFilePath(
          block.closest(codeContainerSelector)?.querySelector(filePathSelector)?.textContent?.trim()
        );
        return filePath === configFilePath;
      });

      let configCode: string | null = null;
      if (configBlock) {
        configCode = configBlock.textContent?.trim() ?? null;
      }

      const insertAfterEl = groupBlocks[groupBlocks.length - 1]?.closest(codeContainerSelector) as HTMLElement | null;

      if (insertAfterEl) {
        if (configBlock) {
          // Remove config block from group
          groupBlocks.splice(groupBlocks.indexOf(configBlock), 1);
        }
        this.#renderSandpack(groupBlocks, insertAfterEl, configCode);
      }
    });

    return this;
  }

  /** Destroy all Sandpack instances */
  destroy(): void {
    const roots = document.querySelectorAll(this.playgroundContainerSelector);
    roots.forEach((el) => el.remove());
  }

  /** Refresh (destroy + reload) */
  refresh(): this {
    this.destroy();
    return this.load();
  }
}
