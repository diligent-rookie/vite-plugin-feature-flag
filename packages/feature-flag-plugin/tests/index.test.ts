import { describe, it, expect } from 'vitest';
import featureFlagPlugin from '../src/index';

describe('featureFlagPlugin', () => {
  it('should create a plugin with default options', () => {
    const plugin = featureFlagPlugin();

    expect(plugin).toBeDefined();
    expect(plugin.name).toBe('vite-plugin-feature-flag');
    expect(plugin.enforce).toBe('pre');
    expect(typeof plugin.transform).toBe('function');
  });

  it('should create a plugin with custom options', () => {
    const customRules = [
      {
        rule: true,
        start: '/* custom-start */',
        end: '/* custom-end */',
        fileTypes: ['js', 'ts'],
      },
    ];

    const plugin = featureFlagPlugin({
      include: ['js', 'ts'],
      exclude: ['node_modules'],
      rules: customRules,
    });

    expect(plugin).toBeDefined();
    expect(plugin.name).toBe('vite-plugin-feature-flag');
  });

  it('should transform code and remove feature flag comments', () => {
    const plugin = featureFlagPlugin();
    const testCode = `
      console.log('before');
      // @delete-start
      console.log('this should be removed');
      // @delete-end
      console.log('after');
    `;

    const result = (
      plugin.transform as unknown as (
        code: string,
        id: string
      ) => { code: string } | null
    )(testCode, 'test.js');

    expect(result).toBeDefined();
    expect(result!.code).toContain("console.log('before');");
    expect(result!.code).toContain("console.log('after');");
    expect(result!.code).not.toContain('this should be removed');
  });

  it('should not transform files that are excluded', () => {
    const plugin = featureFlagPlugin({
      exclude: /excluded/,
    });

    const testCode = `
      // @delete-start
      console.log('this should not be removed');
      // @delete-end
    `;

    const result = (
      plugin.transform as unknown as (
        code: string,
        id: string
      ) => { code: string } | null
    )(testCode, 'excluded.js');

    expect(result).toBeNull();
  });

  it('should handle multiple feature flag blocks', () => {
    const plugin = featureFlagPlugin();
    const testCode = `
      console.log('before');
      // @delete-start
      console.log('block1');
      // @delete-end
      console.log('middle');
      // @delete-start
      console.log('block2');
      // @delete-end
      console.log('after');
    `;

    const result = (
      plugin.transform as unknown as (
        code: string,
        id: string
      ) => { code: string } | null
    )(testCode, 'test.js');

    expect(result).toBeDefined();
    expect(result!.code).toContain("console.log('before');");
    expect(result!.code).toContain("console.log('middle');");
    expect(result!.code).toContain("console.log('after');");
    expect(result!.code).not.toContain('block1');
    expect(result!.code).not.toContain('block2');
  });

  it('should handle custom rule markers', () => {
    const customRules = [
      {
        rule: true,
        start: '<!-- FEATURE:START -->',
        end: '<!-- FEATURE:END -->',
        fileTypes: ['html'],
      },
    ];

    const plugin = featureFlagPlugin({ rules: customRules });
    const testCode = `
      <div>before</div>
      <!-- FEATURE:START -->
      <div>this should be removed</div>
      <!-- FEATURE:END -->
      <div>after</div>
    `;

    const result = (
      plugin.transform as unknown as (
        code: string,
        id: string
      ) => { code: string } | null
    )(testCode, 'test.html');

    expect(result).toBeDefined();
    expect(result!.code).toContain('<div>before</div>');
    expect(result!.code).toContain('<div>after</div>');
    expect(result!.code).not.toContain('this should be removed');
  });

  it('should respect rule.enabled flag', () => {
    const disabledRules = [
      {
        rule: false,
        start: '// @delete-start',
        end: '// @delete-end',
        fileTypes: ['js'],
      },
    ];

    const plugin = featureFlagPlugin({ rules: disabledRules });
    const testCode = `
      console.log('before');
      // @delete-start
      console.log('this should not be removed');
      // @delete-end
      console.log('after');
    `;

    const result = (
      plugin.transform as unknown as (
        code: string,
        id: string
      ) => { code: string } | null
    )(testCode, 'test.js');

    expect(result).toBeDefined();
    expect(result!.code).toContain('this should not be removed');
  });

  it('should handle file type filtering', () => {
    const rules = [
      {
        rule: true,
        start: '// @delete-start',
        end: '// @delete-end',
        fileTypes: ['js'], // Only for .js files
      },
    ];

    const plugin = featureFlagPlugin({ rules });
    const testCode = `
      // @delete-start
      console.log('this should not be removed in ts file');
      // @delete-end
    `;

    const result = (
      plugin.transform as unknown as (
        code: string,
        id: string
      ) => { code: string } | null
    )(testCode, 'test.ts');

    expect(result).toBeDefined();
    expect(result!.code).toContain('this should not be removed in ts file');
  });
});
