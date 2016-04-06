import Immutable from 'immutable';

import {createReducer} from '../utils/reduxUtils';
import {
  computeSheet,
  coerceStringToNumber,
  getCellAddrFromCoor,
  capitalizeExpression,
  isFormula,
  positivizeRange,
  rangeSize,
} from '../utils/sheetUtils';

// The `raw` property is the underlying user input, and `val` is the evaluated (displayed) output.
// `val` is always a string as it's just a displayable value in the UI
const initialState = Immutable.fromJS({
  data: [
    [{raw: 1, val: '1'}, {raw: 2, val: '2'}, {raw: 3, val: '3'}],
    [{raw: 4, val: '4'}, {raw: 5, val: '5'}, {raw: 6, val: '6'}],
    [{raw: 7, val: '7'}, {raw: 8, val: '8'}, {raw: 9, val: '9'}],
  ],

  isEditingCell: false,
  editingCellCoor: [null, null],
  editingCellValue: '',
  editingCellCaretPos: 0,
  isEditingValueDirty: false,
  isQuickEditing: false,

  isCellSelected: false,
  selectedCellCoor: [null, null],

  isRangeSelected: false,
  isSelectingRange: false,
  selectedRangeCoors: [[null, null], [null, null]],
});

export const SET_CELL_VALUE = 'SET_CELL_VALUE';
export const START_EDITING_CELL = 'START_EDITING_CELL';
export const SET_EDIT_VALUE = 'SET_EDIT_VALUE';
export const STOP_EDITING = 'STOP_EDITING';
export const CLEAR_CELL_RANGE = 'CLEAR_CELL_RANGE';
export const SET_EDITING_CELL_CARET_POS = 'SET_EDITING_CELL_CARET_POS';
export const INSERT_CELL_REF_INTO_EDIT_VALUE = 'INSERT_CELL_REF_INTO_EDIT_VALUE';

export const SET_SELECTED_CELL = 'SET_SELECTED_CELL';
export const MOVE_SELECTED_CELL_UP = 'MOVE_SELECTED_CELL_UP';
export const MOVE_SELECTED_CELL_DOWN = 'MOVE_SELECTED_CELL_DOWN';
export const MOVE_SELECTED_CELL_LEFT = 'MOVE_SELECTED_CELL_LEFT';
export const MOVE_SELECTED_CELL_RIGHT = 'MOVE_SELECTED_CELL_RIGHT';

export const START_SELECTING_RANGE = 'START_SELECTING_RANGE';
export const STOP_SELECTING_RANGE = 'STOP_SELECTING_RANGE';
export const SET_SELECTED_RANGE = 'SET_SELECTED_RANGE';
export const MOVE_RANGE_END_UP = 'MOVE_RANGE_END_UP';
export const MOVE_RANGE_END_DOWN = 'MOVE_RANGE_END_DOWN';
export const MOVE_RANGE_END_LEFT = 'MOVE_RANGE_END_LEFT';
export const MOVE_RANGE_END_RIGHT = 'MOVE_RANGE_END_RIGHT';

export const setCellValue = (coor, value) => ({
  type: SET_CELL_VALUE,
  coor,
  value,
});

export const setEditValue = value => ({
  type: SET_EDIT_VALUE,
  value,
});

export const startEditingCell = (coor, isQuick) => ({
  type: START_EDITING_CELL,
  coor,
  isQuick,
});

export const stopEditing = () => ({
  type: STOP_EDITING,
});

export const clearCellRange = range => ({
  type: CLEAR_CELL_RANGE,
  range,
});

export const setEditingCellCaretPos = pos => ({
  type: SET_EDITING_CELL_CARET_POS,
  pos,
});

export const insertCellRefIntoEditValue = coor => ({
  type: INSERT_CELL_REF_INTO_EDIT_VALUE,
  coor,
});

export const setSelectedCell = coor => ({
  type: SET_SELECTED_CELL,
  coor,
});

export const moveSelectedCellUp = () => ({
  type: MOVE_SELECTED_CELL_UP,
});

export const moveSelectedCellDown = () => ({
  type: MOVE_SELECTED_CELL_DOWN,
});

export const moveSelectedCellLeft = () => ({
  type: MOVE_SELECTED_CELL_LEFT,
});

export const moveSelectedCellRight = () => ({
  type: MOVE_SELECTED_CELL_RIGHT,
});

export const setSelectedRange = range => ({
  type: SET_SELECTED_RANGE,
  range,
});

export const startSelectingRange = () => ({
  type: START_SELECTING_RANGE,
});

export const stopSelectingRange = () => ({
  type: STOP_SELECTING_RANGE,
});

export const moveRangeEndUp = () => ({
  type: MOVE_RANGE_END_UP,
});

export const moveRangeEndDown = () => ({
  type: MOVE_RANGE_END_DOWN,
});

export const moveRangeEndLeft = () => ({
  type: MOVE_RANGE_END_LEFT,
});

export const moveRangeEndRight = () => ({
  type: MOVE_RANGE_END_RIGHT,
});

function clearRangeSelection(state) {
  return state
    .set('isRangeSelected', false)
    .set('isSelectingRange', false)
    .set('selectedRangeCoors', Immutable.fromJS([[null, null], [null, null]]));
}

const actionHandlers = {
  SET_CELL_VALUE(state, action) {
    let value = action.value;
    let data = state.get('data');

    if (isFormula(value)) {
      value = capitalizeExpression(action.value);
    } else {
      value = coerceStringToNumber(action.value);
    }

    data = data.setIn([...action.coor, 'raw'], value);
    data = computeSheet(data);
    return state.set('data', data);
  },

  SET_EDIT_VALUE(state, action) {
    return state
      .set('editingCellValue', action.value)
      .set('isEditingValueDirty', true);
  },

  START_EDITING_CELL(state, action) {
    return clearRangeSelection(state)
      .set('isEditingCell', true)
      .set('isQuickEditing', action.isQuick || false)
      .set('editingCellCoor', new Immutable.List(action.coor))
      .set('editingCellValue', state.getIn(['data', ...action.coor, 'raw']))
      .set('isEditingValueDirty', false);
  },

  STOP_EDITING(state) {
    return state
      .set('isEditingCell', false)
      .set('isQuickEditing', false)
      .set('editingCellCoor', new Immutable.List([null, null]))
      .set('editingCellValue', '')
      .set('isEditingValueDirty', false);
  },

  CLEAR_CELL_RANGE(state, action) {
    const range = positivizeRange(action.range);
    let data = state.get('data');
    for (let rowIndex = range[0][0]; rowIndex <= range[1][0]; rowIndex++) {
      for (let cellIndex = range[0][1]; cellIndex <= range[1][1]; cellIndex++) {
        data = data.setIn([rowIndex, cellIndex, 'raw'], '');
      }
    }
    data = computeSheet(data);
    return state.set('data', data);
  },

  SET_EDITING_CELL_CARET_POS(state, action) {
    return state
      .set('editingCellCaretPos', action.pos)
      .set('isEditingValueDirty', true);
  },

  INSERT_CELL_REF_INTO_EDIT_VALUE(state, action) {
    const caretPos = state.get('editingCellCaretPos');
    const cellAddr = getCellAddrFromCoor(action.coor);
    const editingValue = state.get('editingCellValue');
    const newValue = editingValue.substring(0, caretPos) + cellAddr + editingValue.substring(caretPos);
    return state.set('editingCellValue', newValue);
  },

  SET_SELECTED_CELL(state, action) {
    return clearRangeSelection(state)
      .set('isCellSelected', true)
      .set('selectedCellCoor', new Immutable.List(action.coor))
      .set('isRangeSelected', false)
      .set('selectedRangeCoors', Immutable.fromJS([action.coor, action.coor]));
  },

  MOVE_SELECTED_CELL_UP(state) {
    let coor = state.get('selectedCellCoor');
    coor = coor.set(0, Math.max(0, coor.get(0) - 1));
    return actionHandlers.SET_SELECTED_CELL(state, {coor: coor.toJS()});
  },

  MOVE_SELECTED_CELL_DOWN(state) {
    const maxRows = state.get('data').size - 1;
    let coor = state.get('selectedCellCoor');
    coor = coor.set(0, Math.min(maxRows, coor.get(0) + 1));
    return actionHandlers.SET_SELECTED_CELL(state, {coor: coor.toJS()});
  },

  MOVE_SELECTED_CELL_LEFT(state) {
    let coor = state.get('selectedCellCoor');
    coor = coor.set(1, Math.max(0, coor.get(1) - 1));
    return actionHandlers.SET_SELECTED_CELL(state, {coor: coor.toJS()});
  },

  MOVE_SELECTED_CELL_RIGHT(state) {
    const maxCols = state.getIn(['data', 0]).size - 1;
    let coor = state.get('selectedCellCoor');
    coor = coor.set(1, Math.min(maxCols, coor.get(1) + 1));
    return actionHandlers.SET_SELECTED_CELL(state, {coor: coor.toJS()});
  },

  START_SELECTING_RANGE(state) {
    return state.set('isSelectingRange', true);
  },

  STOP_SELECTING_RANGE(state) {
    return state.set('isSelectingRange', false);
  },

  SET_SELECTED_RANGE(state, action) {
    return state
      .set('isRangeSelected', rangeSize(action.range) > 1)
      .set('selectedRangeCoors', Immutable.fromJS(action.range));
  },

  MOVE_RANGE_END_UP(state) {
    let endCoor = state.getIn(['selectedRangeCoors', 1]);
    endCoor = endCoor.set(0, Math.max(0, endCoor.get(0) - 1));
    const newRange = state.get('selectedRangeCoors').set(1, endCoor);
    return actionHandlers.SET_SELECTED_RANGE(state, {range: newRange.toJS()});
  },

  MOVE_RANGE_END_DOWN(state) {
    const maxRows = state.get('data').size - 1;
    let endCoor = state.getIn(['selectedRangeCoors', 1]);
    endCoor = endCoor.set(0, Math.min(maxRows, endCoor.get(0) + 1));
    const newRange = state.get('selectedRangeCoors').set(1, endCoor);
    return actionHandlers.SET_SELECTED_RANGE(state, {range: newRange.toJS()});
  },

  MOVE_RANGE_END_LEFT(state) {
    let endCoor = state.getIn(['selectedRangeCoors', 1]);
    endCoor = endCoor.set(1, Math.max(0, endCoor.get(1) - 1));
    const newRange = state.get('selectedRangeCoors').set(1, endCoor);
    return actionHandlers.SET_SELECTED_RANGE(state, {range: newRange.toJS()});
  },

  MOVE_RANGE_END_RIGHT(state) {
    const maxCols = state.getIn(['data', 0]).size - 1;
    let endCoor = state.getIn(['selectedRangeCoors', 1]);
    endCoor = endCoor.set(1, Math.min(maxCols, endCoor.get(1) + 1));
    const newRange = state.get('selectedRangeCoors').set(1, endCoor);
    return actionHandlers.SET_SELECTED_RANGE(state, {range: newRange.toJS()});
  },
};

export default createReducer(initialState, actionHandlers);
