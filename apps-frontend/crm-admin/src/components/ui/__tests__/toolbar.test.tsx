import { render } from '@testing-library/react';

describe('Toolbar Wrappers', () => {
  it('Toolbar renders', async () => {
    const { Toolbar } = await import('../Toolbar');
    const { container } = render(<Toolbar actions={[]} />);
    expect(container).toBeTruthy();
  });

  it('ToolbarButton renders', async () => {
    const { ToolbarButton } = await import('../ToolbarButton');
    const { container } = render(<ToolbarButton>Act</ToolbarButton>);
    expect(container).toBeTruthy();
  });

  it('exports ToolbarButtonGroup component', async () => {
    const mod = await import('../ToolbarButtonGroup');
    expect(mod.ToolbarButtonGroup).toBeDefined();
    expect(typeof mod.ToolbarButtonGroup).toBe('function');
  });
});
