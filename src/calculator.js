'use strict';

function evaluateExpression(expr) {
  if (!expr || typeof expr !== 'string') {
    throw new TypeError('Expression must be a non-empty string');
  }

  expr = expr.replace(/\s+/g, '');
  let pos = 0;

  function peek() {
    return expr[pos];
  }

  function get() {
    return expr[pos++];
  }

  function parseExpression() {
    let value = parseTerm();
    while (pos < expr.length) {
      const op = peek();
      if (op === '+' || op === '-') {
        get();
        const term = parseTerm();
        value = op === '+' ? value + term : value - term;
      } else {
        break;
      }
    }
    return value;
  }

  function parseTerm() {
    let value = parseFactor();
    while (pos < expr.length) {
      const op = peek();
      if (op === '*' || op === '/') {
        get();
        const factor = parseFactor();
        if (op === '/' && factor === 0) {
          throw new Error('Division by zero');
        }
        value = op === '*' ? value * factor : value / factor;
      } else {
        break;
      }
    }
    return value;
  }

  function parseFactor() {
    let value = parseUnary();
    while (pos < expr.length && peek() === '^') {
      get();
      const exponent = parseUnary();
      value = Math.pow(value, exponent);
    }
    return value;
  }

  function parseUnary() {
    const op = peek();
    if (op === '+' || op === '-') {
      get();
      const val = parseUnary();
      return op === '+' ? val : -val;
    }
    return parsePrimary();
  }

  function parsePrimary() {
    const ch = peek();
    if (ch === '(') {
      get();
      const val = parseExpression();
      if (peek() !== ')') {
        throw new Error('Missing closing parenthesis');
      }
      get();
      return val;
    }

    let numStr = '';
    let hasDot = false;
    while (pos < expr.length) {
      const c = peek();
      if (c === '.') {
        if (hasDot) break;
        hasDot = true;
        numStr += get();
      } else if (/\d/.test(c)) {
        numStr += get();
      } else {
        break;
      }
    }

    if (numStr === '' || numStr === '.') {
      throw new Error('Unexpected character: ' + (ch || 'end of input'));
    }

    return Number.parseFloat(numStr);
  }

  const result = parseExpression();
  if (pos !== expr.length) {
    throw new Error('Unexpected character at position ' + pos);
  }
  if (!Number.isFinite(result)) {
    throw new TypeError('Result is not finite');
  }
  return result;
}

function toSignificantFigures(num, sigFigs) {
  if (typeof num !== 'number' || !Number.isFinite(num) || num === 0) {
    return num;
  }
  if (!Number.isInteger(sigFigs) || sigFigs < 1) {
    throw new TypeError('Significant figures must be a positive integer');
  }

  const absVal = Math.abs(num);
  const d = Math.floor(Math.log10(absVal));
  const scale = Math.pow(10, sigFigs - 1 - d);
  return Math.round(num * scale) / scale;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { evaluateExpression, toSignificantFigures };
}