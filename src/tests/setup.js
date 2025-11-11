import { beforeEach, vi } from "vitest";

vi.mock("react", () => ({
  createElement: vi.fn((type, props, ...children) => children),
  useState: vi.fn(),
  useEffect: vi.fn(),
  useRef: vi.fn(),
  Fragment: vi.fn(({ children }) => children),
  default: {
    createElement: vi.fn((type, props, ...children) => children),
  },
}));

vi.mock("react-dom", () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn(),
    unmount: vi.fn(),
  })),
}));

vi.mock("@codesandbox/sandpack-react", () => ({
  SandpackProvider: vi.fn(({ children }) => children),
  SandpackLayout: vi.fn(({ children }) => children),
  SandpackCodeEditor: vi.fn(() => null),
  SandpackPreview: vi.fn(() => null),
  SandpackThemeProvider: vi.fn(({ children }) => children),
}));

vi.mock("@codesandbox/sandpack-themes", () => ({
  gruvboxDark: { colors: { surface1: "#1d2021" } },
}));


beforeEach(() => {
  // reset DOM
  document.body.innerHTML = "";
  vi.clearAllMocks();
});