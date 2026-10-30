import { describe, expect, it } from 'vitest';
import { specificity } from './css-demos';

describe('specificity()', () => {
  it.each<[string, [number, number, number]]>([
    ['ul li a', [0, 0, 3]],
    ['.nav .item.active', [0, 3, 0]],
    ['#main .card', [1, 1, 0]],
    ['input[type="text"]:focus', [0, 2, 1]],
    ['#app .menu > li:hover a::before', [1, 2, 3]],
    [':where(.x) .y', [0, 1, 0]],
    ['div:not(.a)', [0, 1, 1]],
  ])('%s → %j', (selector, expected) => {
    expect(specificity(selector)).toEqual(expected);
  });
});
