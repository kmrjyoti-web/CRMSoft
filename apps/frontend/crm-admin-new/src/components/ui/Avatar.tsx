'use client';

import { AICAvatar, AICAvatarGroup } from '@coreui/ui-react';

type AvatarProps = React.ComponentProps<typeof AICAvatar>;
type AvatarGroupProps = React.ComponentProps<typeof AICAvatarGroup>;

export function Avatar(props: AvatarProps) {
  return <AICAvatar {...props} />;
}

export function AvatarGroup(props: AvatarGroupProps) {
  return <AICAvatarGroup {...props} />;
}
