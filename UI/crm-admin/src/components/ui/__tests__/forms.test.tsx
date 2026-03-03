import { render } from '@testing-library/react';

describe('Form & Schema Wrappers', () => {
  it('Fieldset renders', async () => {
    const { Fieldset } = await import('../Fieldset');
    const { container } = render(<Fieldset>Content</Fieldset>);
    expect(container).toBeTruthy();
  });

  it('exports DynamicField component', async () => {
    const mod = await import('../DynamicField');
    expect(mod.DynamicField).toBeDefined();
    expect(typeof mod.DynamicField).toBe('function');
  });

  it('exports DynamicForm component', async () => {
    const mod = await import('../DynamicForm');
    expect(mod.DynamicForm).toBeDefined();
    expect(typeof mod.DynamicForm).toBe('function');
  });
});
