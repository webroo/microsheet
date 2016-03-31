import Immutable from 'immutable';
import {expect} from 'chai';

import * as sheetUtils from './sheetUtils';

describe('isNumber()', () => {
  const {isNumber} = sheetUtils;

  it('should return true if a valid number', () => {
    expect(isNumber('0')).to.equal(true);
    expect(isNumber('-0')).to.equal(true);
    expect(isNumber('+0')).to.equal(true);
    expect(isNumber('1')).to.equal(true);
    expect(isNumber('-1')).to.equal(true);
    expect(isNumber('0.1')).to.equal(true);
    expect(isNumber('-0.1')).to.equal(true);
    expect(isNumber('.1')).to.equal(true);
    expect(isNumber('-.1')).to.equal(true);
  });

  it('should return false if not a valid number', () => {
    expect(isNumber('')).to.equal(false);
    expect(isNumber('a')).to.equal(false);
    expect(isNumber('0a')).to.equal(false);
    expect(isNumber('.a')).to.equal(false);
    expect(isNumber('-a')).to.equal(false);
    expect(isNumber('-1a')).to.equal(false);
    expect(isNumber('a1')).to.equal(false);
  });
});

describe('coerceStringToNumber()', () => {
  const {coerceStringToNumber} = sheetUtils;

  it('should change a string that represent a number into an actual number', () => {
    expect(coerceStringToNumber('0')).to.equal(0);
    expect(coerceStringToNumber('-0')).to.equal(0);
    expect(coerceStringToNumber('+0')).to.equal(0);
    expect(coerceStringToNumber('1')).to.equal(1);
    expect(coerceStringToNumber('-1')).to.equal(-1);
    expect(coerceStringToNumber('0.1')).to.equal(0.1);
    expect(coerceStringToNumber('-0.1')).to.equal(-0.1);
    expect(coerceStringToNumber('.1')).to.equal(0.1);
    expect(coerceStringToNumber('-.1')).to.equal(-0.1);
  });

  it('should not change a string if it can\t be coerced into a numer', () => {
    expect(coerceStringToNumber('')).to.equal('');
    expect(coerceStringToNumber('a')).to.equal('a');
    expect(coerceStringToNumber('0a')).to.equal('0a');
    expect(coerceStringToNumber('.a')).to.equal('.a');
    expect(coerceStringToNumber('-a')).to.equal('-a');
    expect(coerceStringToNumber('-1a')).to.equal('-1a');
    expect(coerceStringToNumber('a1')).to.equal('a1');
  });
});

describe('capitalizeCellAddresses()', () => {
  const {capitalizeCellAddresses} = sheetUtils;

  it('should capitalize valid cell addresses', () => {
    expect(capitalizeCellAddresses('a1')).to.equal('A1');
    expect(capitalizeCellAddresses('a12')).to.equal('A12');
  });

  it('should not capitalize invalid cell addresses', () => {
    expect(capitalizeCellAddresses('aa1')).not.to.equal('AA1');
  });

  it('should capitalize multiple valid cell addresses in one string', () => {
    expect(capitalizeCellAddresses('a1+b2*(c3-d4)')).to.equal('A1+B2*(C3-D4)');
  });

  it('should capitalize only valid cell addresses in a string', () => {
    expect(capitalizeCellAddresses('a1+hellow2*(c3-d4world)')).to.equal('A1+helloW2*(C3-D4world)');
  });
});

describe('sanitizeExpression()', () => {
  const {sanitizeExpression} = sheetUtils;

  it('should allow basic arithmetic expression symbols', () => {
    expect(sanitizeExpression('+-*/()')).to.equal('+-*/()');
  });

  it('should remove other common symbols', () => {
    expect(sanitizeExpression('~!@#$%^&={}[]|;"<>,?\'\\')).to.equal('');
  });

  it('should remove any sequence of A-Z chars of 2 or greater', () => {
    expect(sanitizeExpression('A')).to.equal('A');
    expect(sanitizeExpression('AZ')).to.equal('');
  });
});

describe('computeSheet()', () => {
  const {computeSheet} = sheetUtils;

  it('should copy over non-expression values verbatim', () => {
    const inputSheet = Immutable.fromJS([
      [
        {raw: 123},
        {raw: 'hello'},
      ],
    ]);
    const outputSheet = Immutable.fromJS([
      [
        {raw: 123, val: '123'},
        {raw: 'hello', val: 'hello'},
      ],
    ]);
    expect(computeSheet(inputSheet)).to.equal(outputSheet);
  });

  it('should evaluate the results of arithmetic expressions', () => {
    const inputSheet = Immutable.fromJS([
      [
        {raw: '=2*2'},
        {raw: '=5-1.5'},
        {raw: '=5*2'},
        {raw: '=5/2'},
      ],
    ]);
    const outputSheet = Immutable.fromJS([
      [
        {raw: '=2*2', val: '4'},
        {raw: '=5-1.5', val: '3.5'},
        {raw: '=5*2', val: '10'},
        {raw: '=5/2', val: '2.5'},
      ],
    ]);
    expect(computeSheet(inputSheet)).to.equal(outputSheet);
  });

  it('should evaluate the results of expressions that refer to other cells', () => {
    const inputSheet = Immutable.fromJS([
      [
        {raw: '2'}, // A1
        {raw: '=A1*2'}, // B1
        {raw: '=B1'}, // C1
        {raw: '=B1+C1'}, // D1
      ],
    ]);
    const outputSheet = Immutable.fromJS([
      [
        {raw: '2', val: '2'}, // A1
        {raw: '=A1*2', val: '4'}, // B1
        {raw: '=B1', val: '4'}, // C1
        {raw: '=B1+C1', val: '8'}, // D1
      ],
    ]);
    expect(computeSheet(inputSheet)).to.equal(outputSheet);
  });

  it('should replace the cell value with an error if a circular dependency is detected', () => {
    const inputSheet = Immutable.fromJS([
      [
        {raw: '=B1*2'}, // A1
        {raw: '=A1*2'}, // B1
      ],
    ]);
    const outputSheet = Immutable.fromJS([
      [
        {raw: '=B1*2', val: '#ERROR!'}, // A1
        {raw: '=A1*2', val: '#ERROR!'}, // B1
      ],
    ]);
    expect(computeSheet(inputSheet)).to.equal(outputSheet);
  });
});
