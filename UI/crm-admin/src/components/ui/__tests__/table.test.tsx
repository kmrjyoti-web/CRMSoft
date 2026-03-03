describe('Table Wrapper', () => {
  it('exports Table component', async () => {
    const mod = await import('../Table');
    expect(mod.Table).toBeDefined();
    expect(typeof mod.Table).toBe('function');
  });
});
