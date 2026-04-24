'use client';

import { forwardRef } from 'react';

import { AICTagsInput } from '@coreui/ui-react';

type TagsInputProps = React.ComponentProps<typeof AICTagsInput>;

export const TagsInput = forwardRef<HTMLElement, TagsInputProps>((props, ref) => {
  return <AICTagsInput ref={ref as any} {...props} />;
});
TagsInput.displayName = 'TagsInput';
