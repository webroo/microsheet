import Immutable from 'immutable';
import {expect} from 'chai';

import sheetReducer from './sheetReducer';

describe('sheetReducer', () => {
  it('should return the initial state', () => {
    const newState = sheetReducer(undefined, {});
    expect(newState).to.equal(Immutable.fromJS({
      data: [
        [{raw: 1, val: '1'}, {raw: 2, val: '2'}, {raw: 3, val: '3'}],
        [{raw: 4, val: '4'}, {raw: 5, val: '5'}, {raw: 6, val: '6'}],
        [{raw: 7, val: '7'}, {raw: 8, val: '8'}, {raw: 9, val: '9'}],
      ],
      editingCoor: [null, null],
    }));
  });
});
