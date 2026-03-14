import { PluginHandlerRegistry } from '../handlers/handler-registry';
import type { PluginHandler } from '../handlers/handler-registry';

describe('PluginHandlerRegistry', () => {
  let registry: PluginHandlerRegistry;

  const mockHandler: PluginHandler = {
    pluginCode: 'test_plugin',
    handle: jest.fn().mockResolvedValue({ success: true }),
    testConnection: jest.fn().mockResolvedValue({ success: true, message: 'OK' }),
  };

  beforeEach(() => {
    registry = new PluginHandlerRegistry();
  });

  it('should register a handler', () => {
    registry.register(mockHandler);

    expect(registry.has('test_plugin')).toBe(true);
    expect(registry.get('test_plugin')).toBe(mockHandler);
  });

  it('should return undefined for unregistered plugin', () => {
    expect(registry.get('unknown')).toBeUndefined();
    expect(registry.has('unknown')).toBe(false);
  });

  it('should list all registered codes', () => {
    registry.register(mockHandler);
    registry.register({ ...mockHandler, pluginCode: 'another_plugin' });

    const codes = registry.getCodes();
    expect(codes).toContain('test_plugin');
    expect(codes).toContain('another_plugin');
    expect(codes).toHaveLength(2);
  });

  it('should overwrite handler for same plugin code', () => {
    const updatedHandler: PluginHandler = {
      pluginCode: 'test_plugin',
      handle: jest.fn().mockResolvedValue({ v2: true }),
      testConnection: jest.fn(),
    };

    registry.register(mockHandler);
    registry.register(updatedHandler);

    expect(registry.get('test_plugin')).toBe(updatedHandler);
    expect(registry.getCodes()).toHaveLength(1);
  });
});
