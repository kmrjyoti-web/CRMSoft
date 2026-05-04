import { render } from '@testing-library/react';

describe('Form Input Wrappers', () => {
  it('Input renders', async () => {
    const { Input } = await import('../Input');
    const { container } = render(<Input />);
    expect(container).toBeTruthy();
  });

  it('Checkbox renders', async () => {
    const { Checkbox } = await import('../Checkbox');
    const { container } = render(<Checkbox />);
    expect(container).toBeTruthy();
  });

  it('CheckboxGroup renders', async () => {
    const { CheckboxGroup } = await import('../CheckboxGroup');
    const { container } = render(<CheckboxGroup />);
    expect(container).toBeTruthy();
  });

  it('Radio renders', async () => {
    const { Radio } = await import('../Radio');
    const { container } = render(<Radio />);
    expect(container).toBeTruthy();
  });

  it('RadioGroup renders', async () => {
    const { RadioGroup } = await import('../RadioGroup');
    const { container } = render(<RadioGroup />);
    expect(container).toBeTruthy();
  });

  it('Switch renders', async () => {
    const { Switch } = await import('../Switch');
    const { container } = render(<Switch />);
    expect(container).toBeTruthy();
  });

  it('SwitchInput renders', async () => {
    const { SwitchInput } = await import('../SwitchInput');
    const { container } = render(<SwitchInput />);
    expect(container).toBeTruthy();
  });

  it('Select renders', async () => {
    const { Select } = await import('../Select');
    const { container } = render(<Select options={[]} />);
    expect(container).toBeTruthy();
  });

  it('SelectInput renders', async () => {
    const { SelectInput } = await import('../SelectInput');
    const { container } = render(<SelectInput />);
    expect(container).toBeTruthy();
  });

  it('MultiSelectInput renders', async () => {
    const { MultiSelectInput } = await import('../MultiSelectInput');
    const { container } = render(<MultiSelectInput />);
    expect(container).toBeTruthy();
  });

  it('NumberInput renders', async () => {
    const { NumberInput } = await import('../NumberInput');
    const { container } = render(<NumberInput />);
    expect(container).toBeTruthy();
  });

  it('CurrencyInput renders', async () => {
    const { CurrencyInput } = await import('../CurrencyInput');
    const { container } = render(<CurrencyInput />);
    expect(container).toBeTruthy();
  });

  it('MobileInput renders', async () => {
    const { MobileInput } = await import('../MobileInput');
    const { container } = render(<MobileInput />);
    expect(container).toBeTruthy();
  });

  it('InputMask renders', async () => {
    const { InputMask } = await import('../InputMask');
    const { container } = render(<InputMask />);
    expect(container).toBeTruthy();
  });

  it('Autocomplete renders', async () => {
    const { Autocomplete } = await import('../Autocomplete');
    const { container } = render(<Autocomplete />);
    expect(container).toBeTruthy();
  });

  it('TagsInput renders', async () => {
    const { TagsInput } = await import('../TagsInput');
    const { container } = render(<TagsInput />);
    expect(container).toBeTruthy();
  });

  it('OTPInput renders', async () => {
    const { OTPInput } = await import('../OTPInput');
    const { container } = render(<OTPInput />);
    expect(container).toBeTruthy();
  });

  it('DatePicker renders', async () => {
    const { DatePicker } = await import('../DatePicker');
    const { container } = render(<DatePicker />);
    expect(container).toBeTruthy();
  });
});
