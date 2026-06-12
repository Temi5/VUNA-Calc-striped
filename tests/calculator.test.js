const { evaluateExpression, toSignificantFigures } = require('../src/calculator');

describe('evaluateExpression', () => {
  it('adds', () => expect(evaluateExpression('2+3')).toBe(5));
  it('subtracts', () => expect(evaluateExpression('10-4')).toBe(6));
  it('multiplies', () => expect(evaluateExpression('3*4')).toBe(12));
  it('divides', () => expect(evaluateExpression('8/2')).toBe(4));
  it('precedence', () => expect(evaluateExpression('2+3*4')).toBe(14));
  it('parentheses', () => expect(evaluateExpression('(2+3)*4')).toBe(20));
  it('exponents', () => expect(evaluateExpression('2^3')).toBe(8));
  it('unary minus', () => expect(evaluateExpression('-5+3')).toBe(-2));
  it('decimals', () => expect(evaluateExpression('0.1+0.2')).toBeCloseTo(0.3, 10));
  it('rejects empty', () => expect(() => evaluateExpression('')).toThrow());
  it('rejects invalid chars', () => expect(() => evaluateExpression('2&3')).toThrow());
  it('rejects div by zero', () => expect(() => evaluateExpression('5/0')).toThrow());
  it('rejects unbalanced parens', () => expect(() => evaluateExpression('(2+3')).toThrow());
});

describe('toSignificantFigures', () => {
  it('1 s.f. - large number', () => expect(toSignificantFigures(1234, 1)).toBe(1000));
  it('1 s.f. - small decimal', () => expect(toSignificantFigures(0.00456, 1)).toBe(0.005));
  it('1 s.f. - rounding up', () => expect(toSignificantFigures(9.99, 1)).toBe(10));

  it('2 s.f. - large number', () => expect(toSignificantFigures(1234, 2)).toBe(1200));
  it('2 s.f. - small decimal', () => expect(toSignificantFigures(0.00456, 2)).toBe(0.0046));
  it('2 s.f. - boundary', () => expect(toSignificantFigures(99.9, 2)).toBe(100));

  it('3 s.f. - large number', () => expect(toSignificantFigures(1234, 3)).toBe(1230));
  it('3 s.f. - small decimal', () => expect(toSignificantFigures(0.00456, 3)).toBe(0.00456));
  it('3 s.f. - rounding up', () => expect(toSignificantFigures(9.876, 3)).toBe(9.88));

  it('handles negatives', () => expect(toSignificantFigures(-1234, 2)).toBe(-1200));
  it('returns zero', () => expect(toSignificantFigures(0, 2)).toBe(0));
  it('returns infinity', () => expect(toSignificantFigures(Infinity, 2)).toBe(Infinity));
  it('throws on invalid s.f.', () => expect(() => toSignificantFigures(123, 0)).toThrow());
});