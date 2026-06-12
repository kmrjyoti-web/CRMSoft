import { render } from '@testing-library/react';

describe('Display Wrappers', () => {
  it('Badge renders', async () => {
    const { Badge } = await import('../Badge');
    const { container } = render(<Badge>New</Badge>);
    expect(container).toBeTruthy();
  });

  it('Avatar renders', async () => {
    const { Avatar } = await import('../Avatar');
    const { container } = render(<Avatar />);
    expect(container).toBeTruthy();
  });

  it('Typography renders', async () => {
    const { Typography } = await import('../Typography');
    const { container } = render(<Typography>Text</Typography>);
    expect(container).toBeTruthy();
  });

  it('SyncIndicator renders', async () => {
    const { SyncIndicator } = await import('../SyncIndicator');
    const { container } = render(<SyncIndicator status="synced" />);
    expect(container).toBeTruthy();
  });
});
