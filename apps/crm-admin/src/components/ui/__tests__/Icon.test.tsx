import { render } from '@testing-library/react';

import { Icon } from '../Icon';

describe('Icon', () => {
  it('renders mail icon', () => {
    const { container } = render(<Icon name="mail" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('applies size prop', () => {
    const { container } = render(<Icon name="mail" size={24} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
  });

  it('returns null for unknown icon', () => {
    const { container } = render(<Icon name={"nonexistent" as any} />);
    expect(container.firstChild).toBeNull();
  });
});
