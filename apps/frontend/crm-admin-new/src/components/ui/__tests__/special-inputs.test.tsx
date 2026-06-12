import { render } from '@testing-library/react';

// Signature uses ResizeObserver (not in jsdom)
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any;
});

describe('Special Input Wrappers', () => {
  it('Rating renders', async () => {
    const { Rating } = await import('../Rating');
    const { container } = render(<Rating />);
    expect(container).toBeTruthy();
  });

  it('Slider renders', async () => {
    const { Slider } = await import('../Slider');
    const { container } = render(<Slider />);
    expect(container).toBeTruthy();
  });

  it('ColorPicker renders', async () => {
    const { ColorPicker } = await import('../ColorPicker');
    const { container } = render(<ColorPicker />);
    expect(container).toBeTruthy();
  });

  it('FileUpload renders', async () => {
    const { FileUpload } = await import('../FileUpload');
    const { container } = render(<FileUpload />);
    expect(container).toBeTruthy();
  });

  it('Signature renders', async () => {
    const { Signature } = await import('../Signature');
    const { container } = render(<Signature />);
    expect(container).toBeTruthy();
  });

  it('CheckboxInput renders', async () => {
    const { CheckboxInput } = await import('../CheckboxInput');
    const { container } = render(<CheckboxInput />);
    expect(container).toBeTruthy();
  });

  it('ListCheckbox renders', async () => {
    const { ListCheckbox } = await import('../ListCheckbox');
    const { container } = render(<ListCheckbox options={[]} />);
    expect(container).toBeTruthy();
  });

  it('SegmentedControl renders', async () => {
    const { SegmentedControl } = await import('../SegmentedControl');
    const { container } = render(<SegmentedControl options={[]} />);
    expect(container).toBeTruthy();
  });

  it('ToggleButton renders', async () => {
    const { ToggleButton } = await import('../ToggleButton');
    const { container } = render(<ToggleButton />);
    expect(container).toBeTruthy();
  });
});
