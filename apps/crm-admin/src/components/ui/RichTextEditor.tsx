'use client';

import { forwardRef } from 'react';

import { AICRichTextEditor } from '@coreui/ui-react';

type RichTextEditorProps = React.ComponentProps<typeof AICRichTextEditor>;

export const RichTextEditor = forwardRef<HTMLElement, RichTextEditorProps>((props, ref) => {
  return <AICRichTextEditor ref={ref as any} {...props} />;
});
RichTextEditor.displayName = 'RichTextEditor';
