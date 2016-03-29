import Immutable from 'immutable';
import {expect} from 'chai';

import sheetReducer from './sheetReducer';

describe.only('sheetReducer', () => {
  it('should return the initial state', () => {
    const newState = sheetReducer(undefined, {});
    expect(newState).to.equal(Immutable.fromJS([
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
    ]));
  });
});
