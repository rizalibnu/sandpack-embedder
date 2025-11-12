import { beforeEach, vi } from 'vitest';

vi.mock('react', () => ({
  createElement: vi.fn((type, props, ...children) => children),
  useState: vi.fn(),
  useEffect: vi.fn(),
  useRef: vi.fn(),
  Fragment: vi.fn(({ children }) => children),
  default: {
    createElement: vi.fn((type, props, ...children) => children),
  },
}));

vi.mock('react-dom', () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn(),
    unmount: vi.fn(),
  })),
}));

vi.mock('@codesandbox/sandpack-react', () => {
  /** Named mock components with displayName set for React DevTools and introspection */
  function Sandpack({ children }) {
    return children;
  }
  Sandpack.displayName = 'Sandpack';

  function SandpackProvider({ children }) {
    return children;
  }
  SandpackProvider.displayName = 'SandpackProvider';

  function SandpackLayout({ children }) {
    return children;
  }
  SandpackLayout.displayName = 'SandpackLayout';

  function SandpackCodeEditor() {
    return null;
  }
  SandpackCodeEditor.displayName = 'SandpackCodeEditor';

  function SandpackPreview() {
    return null;
  }
  SandpackPreview.displayName = 'SandpackPreview';

  function SandpackThemeProvider({ children }) {
    return children;
  }
  SandpackThemeProvider.displayName = 'SandpackThemeProvider';

  return {
    Sandpack: vi.fn(Sandpack),
    SandpackProvider: vi.fn(SandpackProvider),
    SandpackLayout: vi.fn(SandpackLayout),
    SandpackCodeEditor: vi.fn(SandpackCodeEditor),
    SandpackPreview: vi.fn(SandpackPreview),
    SandpackThemeProvider: vi.fn(SandpackThemeProvider),
  };
});

vi.mock('@codesandbox/sandpack-themes', () => ({
  gruvboxDark: { colors: { surface1: '#1d2021' } },
}));

beforeEach(() => {
  // reset DOM
  document.body.innerHTML = '';
  vi.clearAllMocks();
});
