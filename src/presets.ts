import React from 'react';
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeViewer,
  SandpackPreview,
  type SandpackProps,
} from '@codesandbox/sandpack-react';

interface PreviewProps extends Omit<SandpackProps, 'options'> {
  options?: SandpackProps['options'] & { viewerHeight: React.CSSProperties['height'] };
}

export const Preview = (props: PreviewProps) => {
  const { options } = props;
  const style = { height: options?.viewerHeight ?? options?.editorHeight };

  return React.createElement(
    SandpackProvider,
    { ...props },
    React.createElement(
      SandpackLayout,
      null,
      React.createElement(SandpackPreview, {
        showNavigator: options?.showNavigator,
        showRefreshButton: options?.showRefreshButton,
        style,
      }),
    ),
  );
};

type Decorators = Array<{
  className?: string;
  line: number;
  startColumn?: number;
  endColumn?: number;
  elementAttributes?: Record<string, string>;
}>;

interface CodeViewerProps extends Omit<SandpackProps, 'options'> {
  options?: SandpackProps['options'] & {
    viewerHeight: React.CSSProperties['height'];
    decorators: Decorators;
  };
}

export const CodeViewer = (props: CodeViewerProps) => {
  const { options } = props;
  const style = { height: options?.viewerHeight ?? options?.editorHeight };

  return React.createElement(
    SandpackProvider,
    { ...props },
    React.createElement(
      SandpackLayout,
      null,
      React.createElement(SandpackCodeViewer, {
        initMode: options?.initMode,
        showTabs: options?.showTabs,
        showLineNumbers: options?.showLineNumbers,
        wrapContent: options?.wrapContent,
        additionalLanguages: options?.codeEditor?.additionalLanguages,
        decorators: options?.decorators,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        style,
      }),
    ),
  );
};
