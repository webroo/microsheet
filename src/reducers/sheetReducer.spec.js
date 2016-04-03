import Immutable from 'immutable';
import {expect} from 'chai';

import sheetReducer, * as sheetReducerActions from './sheetReducer';

describe('updateCellValue action', () => {
  const {UPDATE_CELL_VALUE, updateCellValue} = sheetReducerActions;

  it('should return an object with a coordinate and new value', () => {
    const action = updateCellValue([1, 1], 'foo');
    expect(action).to.eql({
      type: UPDATE_CELL_VALUE,
      coor: [1, 1],
      value: 'foo',
    });
  });
});

describe('changeEditingCoor action', () => {
  const {CHANGE_EDITING_COOR, changeEditingCoor} = sheetReducerActions;

  it('should return an object with a coordinate and new value', () => {
    const action = changeEditingCoor([1, 1]);
    expect(action).to.eql({
      type: CHANGE_EDITING_COOR,
      coor: [1, 1],
    });
  });
});

describe('changeSelectedCoor action', () => {
  const {CHANGE_SELECTED_COOR, changeSelectedCoor} = sheetReducerActions;

  it('should return an object with a coordinate and new value', () => {
    const action = changeSelectedCoor([1, 1]);
    expect(action).to.eql({
      type: CHANGE_SELECTED_COOR,
      coor: [1, 1],
    });
  });
});

describe('sheetReducer', () => {
  it('should return the initial state', () => {
    const initialState = sheetReducer(undefined, {});
    expect(initialState).to.equal(Immutable.fromJS({
      data: [
        [{raw: 1, val: '1'}, {raw: 2, val: '2'}, {raw: 3, val: '3'}],
        [{raw: 4, val: '4'}, {raw: 5, val: '5'}, {raw: 6, val: '6'}],
        [{raw: 7, val: '7'}, {raw: 8, val: '8'}, {raw: 9, val: '9'}],
      ],
      editingCoor: [null, null],
      selectedCoor: [null, null],
    }));
  });
});

describe('sheetReducer updateCellValue action', () => {
  const {updateCellValue} = sheetReducerActions;

  it('should update `raw` with a number and `val` with a string representation of it', () => {
    const state = sheetReducer(undefined, updateCellValue([0, 0], 100));
    expect(state.getIn(['data', 0, 0, 'raw'])).to.equal(100);
    expect(state.getIn(['data', 0, 0, 'val'])).to.equal('100');
  });

  it('should update `raw` with a string and `val` with the same string', () => {
    const state = sheetReducer(undefined, updateCellValue([0, 0], 'foo'));
    expect(state.getIn(['data', 0, 0, 'raw'])).to.equal('foo');
    expect(state.getIn(['data', 0, 0, 'val'])).to.equal('foo');
  });

  it('should attemp to cast a string into a number for the raw value', () => {
    const state = sheetReducer(undefined, updateCellValue([0, 0], '100'));
    expect(state.getIn(['data', 0, 0, 'raw'])).to.equal(100);
    expect(state.getIn(['data', 0, 0, 'val'])).to.equal('100');
  });

  it('should update `raw` with a formula and `val` with the computed value', () => {
    const state = sheetReducer(undefined, updateCellValue([0, 0], '=2+2'));
    expect(state.getIn(['data', 0, 0, 'raw'])).to.equal('=2+2');
    expect(state.getIn(['data', 0, 0, 'val'])).to.equal('4');
  });

  it('should update `raw` with a cell-ref formula and `val` with the computed value', () => {
    const state = sheetReducer(undefined, updateCellValue([0, 0], '=B1*C2'));
    expect(state.getIn(['data', 0, 0, 'raw'])).to.equal('=B1*C2');
    expect(state.getIn(['data', 0, 0, 'val'])).to.equal('12');
  });
});

describe('sheetReducer changeEditingCoor action', () => {
  const {changeEditingCoor} = sheetReducerActions;

  it('should update the editingCoor state with the new coordinate', () => {
    const state = sheetReducer(undefined, changeEditingCoor([1, 1]));
    expect(state.get('editingCoor')).to.equal(new Immutable.List([1, 1]));
  });
});

describe('sheetReducer changeSelectedCoor action', () => {
  const {changeSelectedCoor} = sheetReducerActions;

  it('should update the editingCoor state with the new coordinate', () => {
    const state = sheetReducer(undefined, changeSelectedCoor([1, 1]));
    expect(state.get('selectedCoor')).to.equal(new Immutable.List([1, 1]));
  });
});
