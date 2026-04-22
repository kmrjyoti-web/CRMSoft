'use client';

import { forwardRef } from 'react';

import { AICFileUpload } from '@coreui/ui-react';

type FileUploadProps = React.ComponentProps<typeof AICFileUpload>;

export const FileUpload = forwardRef<HTMLElement, FileUploadProps>((props, ref) => {
  return <AICFileUpload ref={ref as any} {...props} />;
});
FileUpload.displayName = 'FileUpload';
