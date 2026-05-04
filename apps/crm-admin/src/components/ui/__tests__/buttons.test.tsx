import { render } from '@testing-library/react';

describe('Button Wrappers', () => {
  it('Button renders', async () => {
    const { Button } = await import('../Button');
    const { container } = render(<Button>Click</Button>);
    expect(container).toBeTruthy();
  });

  it('SmartButton renders', async () => {
    const { SmartButton } = await import('../SmartButton');
    const { container } = render(<SmartButton />);
    expect(container).toBeTruthy();
  });

  it('ButtonControl renders', async () => {
    const { ButtonControl } = await import('../ButtonControl');
    const { container } = render(<ButtonControl options={[]} />);
    expect(container).toBeTruthy();
  });

  it('DialogButton renders', async () => {
    const { DialogButton } = await import('../DialogButton');
    const { container } = render(<DialogButton />);
    expect(container).toBeTruthy();
  });
});
