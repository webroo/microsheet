import Immutable from 'immutable';
import {expect} from 'chai';

import {rowHeaderSelector, colHeaderSelector} from './sheetSelector';

describe('rowHeaderSelector', () => {
  it('should return a List of alphabetized chars for each sheet column', () => {
    const state = Immutable.fromJS({
      data: [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
      ],
    });
    const expectedResult = Immutable.fromJS(['A', 'B', 'C']);
    const result = rowHeaderSelector(state);
    expect(result).to.eql(expectedResult);
  });
});

describe('colHeaderSelector', () => {
  it('should return a List of numerals for each sheet row', () => {
    const state = Immutable.fromJS({
      data: [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
      ],
    });
    const expectedResult = Immutable.fromJS(['1', '2', '3']);
    const result = colHeaderSelector(state);
    expect(result).to.eql(expectedResult);
  });
});
