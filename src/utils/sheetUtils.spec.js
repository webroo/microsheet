import Immutable from 'immutable';
import {expect} from 'chai';

import {
  canCoerceToNumber,
  coerceToNumber,
  isFormula,
  canInsertCellRefAfterChar,
  capitalizeExpression,
  sanitizeExpression,
  computeSheet,
  autofillSheet,
  getSheetExtent,
} from './sheetUtils';

describe('sheetUtils', () => {
  describe('canCoerceToNumber()', () => {
    it('should return true if a valid number', () => {
      expect(canCoerceToNumber('0')).to.be.true;
      expect(canCoerceToNumber('-0')).to.be.true;
      expect(canCoerceToNumber('+0')).to.be.true;
      expect(canCoerceToNumber('1')).to.be.true;
      expect(canCoerceToNumber('-1')).to.be.true;
      expect(canCoerceToNumber('0.1')).to.be.true;
      expect(canCoerceToNumber('-0.1')).to.be.true;
      expect(canCoerceToNumber('.1')).to.be.true;
      expect(canCoerceToNumber('-.1')).to.be.true;
    });

    it('should return false if not a valid number', () => {
      expect(canCoerceToNumber('')).to.be.false;
      expect(canCoerceToNumber('a')).to.be.false;
      expect(canCoerceToNumber('0a')).to.be.false;
      expect(canCoerceToNumber('.a')).to.be.false;
      expect(canCoerceToNumber('-a')).to.be.false;
      expect(canCoerceToNumber('-1a')).to.be.false;
      expect(canCoerceToNumber('a1')).to.be.false;
    });
  });

  describe('coerceToNumber()', () => {
    it('should change a string that represent a number into an actual number', () => {
      expect(coerceToNumber('0')).to.equal(0);
      expect(coerceToNumber('-0')).to.equal(0);
      expect(coerceToNumber('+0')).to.equal(0);
      expect(coerceToNumber('1')).to.equal(1);
      expect(coerceToNumber('-1')).to.equal(-1);
      expect(coerceToNumber('0.1')).to.equal(0.1);
      expect(coerceToNumber('-0.1')).to.equal(-0.1);
      expect(coerceToNumber('.1')).to.equal(0.1);
      expect(coerceToNumber('-.1')).to.equal(-0.1);
    });

    it('should not change a string if it can\t be coerced into a numer', () => {
      expect(coerceToNumber('')).to.equal('');
      expect(coerceToNumber('a')).to.equal('a');
      expect(coerceToNumber('0a')).to.equal('0a');
      expect(coerceToNumber('.a')).to.equal('.a');
      expect(coerceToNumber('-a')).to.equal('-a');
      expect(coerceToNumber('-1a')).to.equal('-1a');
      expect(coerceToNumber('a1')).to.equal('a1');
    });
  });

  describe('isFormula()', () => {
    it('should return true if the value begins with a `=` sign', () => {
      expect(isFormula('=')).to.be.true;
      expect(isFormula('=a')).to.be.true;
    });

    it('should return false if the value does not begin with a `=` sign', () => {
      expect(isFormula('a')).to.be.false;
      expect(isFormula('a=')).to.be.false;
    });
  });

  describe('canInsertCellRefAfterChar()', () => {
    it('should return true if the char is valid', () => {
      expect(canInsertCellRefAfterChar('+')).to.be.true;
      expect(canInsertCellRefAfterChar('-')).to.be.true;
      expect(canInsertCellRefAfterChar('*')).to.be.true;
      expect(canInsertCellRefAfterChar('/')).to.be.true;
      expect(canInsertCellRefAfterChar('(')).to.be.true;
      expect(canInsertCellRefAfterChar(')')).to.be.true;
      expect(canInsertCellRefAfterChar('=')).to.be.true;
      expect(canInsertCellRefAfterChar(',')).to.be.true;
    });

    it('should return false if the char is invalid', () => {
      expect(canInsertCellRefAfterChar('a')).to.be.false;
      expect(canInsertCellRefAfterChar('0')).to.be.false;
      expect(canInsertCellRefAfterChar('!')).to.be.false;
      expect(canInsertCellRefAfterChar('@')).to.be.false;
      expect(canInsertCellRefAfterChar('#')).to.be.false;
      expect(canInsertCellRefAfterChar('$')).to.be.false;
      expect(canInsertCellRefAfterChar('%')).to.be.false;
      expect(canInsertCellRefAfterChar('^')).to.be.false;
    });
  });

  describe('capitalizeExpression()', () => {
    it('should capitalize valid cell addresses', () => {
      expect(capitalizeExpression('a1')).to.equal('A1');
      expect(capitalizeExpression('a12')).to.equal('A12');
    });

    it('should not capitalize invalid cell addresses', () => {
      expect(capitalizeExpression('aa1')).not.to.equal('AA1');
    });

    it('should capitalize multiple valid cell addresses in one string', () => {
      expect(capitalizeExpression('a1+b2*(c3-d4)')).to.equal('A1+B2*(C3-D4)');
    });

    it('should capitalize only valid cell addresses in a string', () => {
      expect(capitalizeExpression('a1+hellow2*(c3-d4world)')).to.equal('A1+helloW2*(C3-D4world)');
    });
  });

  describe('sanitizeExpression()', () => {
    it('should allow basic arithmetic expression symbols', () => {
      expect(sanitizeExpression('+-*/()')).to.equal('+-*/()');
    });

    it('should remove other common symbols', () => {
      expect(sanitizeExpression('~!@#$%^&={}[]|;"<>?\'\\')).to.equal('');
    });

    it('should remove any sequence of A-Z chars of 2 or greater', () => {
      expect(sanitizeExpression('A')).to.equal('A');
      expect(sanitizeExpression('AZ')).to.equal('');
    });

    it('should expand compact address ranges (A1:B2) into a list of individual addresses', () => {
      expect(sanitizeExpression('A1:B2')).to.equal('A1,B1,A2,B2');
    });
  });

  describe('computeSheet()', () => {
    it('should copy over non-formula values verbatim', () => {
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
      expect(computeSheet(inputSheet)).to.eql(outputSheet);
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
      expect(computeSheet(inputSheet)).to.eql(outputSheet);
    });

    it('should evaluate the results of expressions that refer to other cells', () => {
      const inputSheet = Immutable.fromJS([
        [
          {raw: 2}, // A1
          {raw: '=A1*2'}, // B1
          {raw: '=B1'}, // C1
          {raw: '=B1+C1'}, // D1
        ],
      ]);
      const outputSheet = Immutable.fromJS([
        [
          {raw: 2, val: '2'}, // A1
          {raw: '=A1*2', val: '4'}, // B1
          {raw: '=B1', val: '4'}, // C1
          {raw: '=B1+C1', val: '8'}, // D1
        ],
      ]);
      expect(computeSheet(inputSheet)).to.eql(outputSheet);
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
      expect(computeSheet(inputSheet)).to.eql(outputSheet);
    });

    it('should sum up a range of cells', () => {
      const inputSheet = Immutable.fromJS([
        [
          {raw: 2}, // A1
          {raw: 4}, // B1
          {raw: 6}, // C1
          {raw: '=SUM(A1:C1)'}, // D1
        ],
      ]);
      const outputSheet = Immutable.fromJS([
        [
          {raw: 2, val: '2'}, // A1
          {raw: 4, val: '4'}, // B1
          {raw: 6, val: '6'}, // C1
          {raw: '=SUM(A1:C1)', val: '12'}, // D1
        ],
      ]);
      expect(computeSheet(inputSheet)).to.eql(outputSheet);
    });

    it('should ignore non-numbers when summing a range of cells', () => {
      const inputSheet = Immutable.fromJS([
        [
          {raw: 2}, // A1
          {raw: 'foo'}, // B1
          {raw: ''}, // C1
          {raw: '=SUM(A1:C1)'}, // D1
        ],
      ]);
      const outputSheet = Immutable.fromJS([
        [
          {raw: 2, val: '2'}, // A1
          {raw: 'foo', val: 'foo'}, // B1
          {raw: '', val: ''}, // C1
          {raw: '=SUM(A1:C1)', val: '2'}, // D1
        ],
      ]);
      expect(computeSheet(inputSheet)).to.eql(outputSheet);
    });

    it('should replace the cell value with an error if a bad formula is used', () => {
      const inputSheet = Immutable.fromJS([
        [
          {raw: '=a'}, // A1
        ],
      ]);
      const outputSheet = Immutable.fromJS([
        [
          {raw: '=a', val: '#ERROR!'}, // A1
        ],
      ]);
      expect(computeSheet(inputSheet)).to.eql(outputSheet);
    });
  });

  describe('autofillSheet()', () => {
    it('should copy over non-formula values verbatim in a horizontal range', () => {
      const inputSheet = Immutable.fromJS([
        [
          {raw: 100},
          {raw: ''},
          {raw: ''},
          {raw: ''},
        ],
      ]);
      const outputSheet = Immutable.fromJS([
        [
          {raw: 100},
          {raw: 100},
          {raw: 100},
          {raw: 100},
        ],
      ]);
      expect(autofillSheet(inputSheet, [[0, 0], [0, 3]])).to.eql(outputSheet);
    });

    it('should copy over non-formula values verbatim in a vertical range', () => {
      const inputSheet = Immutable.fromJS([
        [{raw: 100}],
        [{raw: ''}],
        [{raw: ''}],
        [{raw: ''}],
      ]);
      const outputSheet = Immutable.fromJS([
        [{raw: 100}],
        [{raw: 100}],
        [{raw: 100}],
        [{raw: 100}],
      ]);
      expect(autofillSheet(inputSheet, [[0, 0], [3, 0]])).to.eql(outputSheet);
    });

    it('should increment formula cell refs when autofilling horizontally', () => {
      const inputSheet = Immutable.fromJS([
        [
          {raw: '=A1+B1'},
          {raw: ''},
          {raw: ''},
          {raw: ''},
        ],
      ]);
      const outputSheet = Immutable.fromJS([
        [
          {raw: '=A1+B1'},
          {raw: '=B1+C1'},
          {raw: '=C1+D1'},
          {raw: '=D1+E1'},
        ],
      ]);
      expect(autofillSheet(inputSheet, [[0, 0], [0, 3]])).to.eql(outputSheet);
    });

    it('should copy over non-formula values verbatim in a vertical range', () => {
      const inputSheet = Immutable.fromJS([
        [{raw: '=A1+B2'}],
        [{raw: ''}],
        [{raw: ''}],
        [{raw: ''}],
      ]);
      const outputSheet = Immutable.fromJS([
        [{raw: '=A1+B2'}],
        [{raw: '=A2+B3'}],
        [{raw: '=A3+B4'}],
        [{raw: '=A4+B5'}],
      ]);
      expect(autofillSheet(inputSheet, [[0, 0], [3, 0]])).to.eql(outputSheet);
    });
  });

  describe('getSheetExtent()', () => {
    it('should return the size of the sheet as a range', () => {
      const inputSheet = Immutable.fromJS([
        [{}, {}, {}],
        [{}, {}, {}],
        [{}, {}, {}],
      ]);
      expect(getSheetExtent(inputSheet)).to.eql([[0, 0], [2, 2]]);
    });
  });
});
