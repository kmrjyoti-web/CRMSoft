import { render } from '@testing-library/react';

describe('Overlay Wrappers', () => {
  it('Modal renders', async () => {
    const { Modal } = await import('../Modal');
    const { container } = render(<Modal open={false} onClose={() => {}} />);
    expect(container).toBeTruthy();
  });

  it('Drawer renders', async () => {
    const { Drawer } = await import('../Drawer');
    const { container } = render(<Drawer open={false} onClose={() => {}} />);
    expect(container).toBeTruthy();
  });

  it('Tooltip renders', async () => {
    const { Tooltip } = await import('../Tooltip');
    const { container } = render(<Tooltip content="tip"><span>hover</span></Tooltip>);
    expect(container).toBeTruthy();
  });

  it('Popover renders', async () => {
    const { Popover } = await import('../Popover');
    const { container } = render(<Popover content={<div>pop</div>}><span>click</span></Popover>);
    expect(container).toBeTruthy();
  });

  it('ConfirmDialog renders', async () => {
    const { ConfirmDialog } = await import('../ConfirmDialog');
    const { container } = render(<ConfirmDialog open={false} onConfirm={() => {}} onCancel={() => {}} />);
    expect(container).toBeTruthy();
  });

  it('SmartToast renders', async () => {
    const { SmartToast } = await import('../SmartToast');
    const { container } = render(<SmartToast messages={[]} />);
    expect(container).toBeTruthy();
  });
});
