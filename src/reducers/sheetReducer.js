import Immutable from 'immutable';

import {createReducer} from '../utils/reduxUtils';
import {
  computeSheet,
  coerceStringToNumber,
  capitalizeCellAddresses,
  isFormula,
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
  isQuickEditing: false,

  isCellSelected: false,
  selectedCellCoor: [null, null],
});

export const SET_CELL_VALUE = 'SET_CELL_VALUE';
export const START_EDITING_CELL = 'START_EDITING_CELL';
export const SET_EDIT_VALUE = 'SET_EDIT_VALUE';
export const STOP_EDITING = 'STOP_EDITING';
export const CLEAR_CELL = 'CLEAR_CELL';

export const SET_SELECTED_CELL = 'SET_SELECTED_CELL';
export const MOVE_SELECTED_CELL_UP = 'MOVE_SELECTED_CELL_UP';
export const MOVE_SELECTED_CELL_DOWN = 'MOVE_SELECTED_CELL_DOWN';
export const MOVE_SELECTED_CELL_LEFT = 'MOVE_SELECTED_CELL_LEFT';
export const MOVE_SELECTED_CELL_RIGHT = 'MOVE_SELECTED_CELL_RIGHT';

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

export const clearCell = coor => ({
  type: CLEAR_CELL,
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

const actionHandlers = {
  SET_CELL_VALUE(state, action) {
    let value = action.value;
    let data = state.get('data');

    if (isFormula(value)) {
      value = capitalizeCellAddresses(action.value);
    } else {
      value = coerceStringToNumber(action.value);
    }

    data = data.setIn([...action.coor, 'raw'], value);
    data = computeSheet(data);
    return state.set('data', data);
  },

  SET_EDIT_VALUE(state, action) {
    return state.set('editingCellValue', action.value);
  },

  START_EDITING_CELL(state, action) {
    return state
      .set('isEditingCell', true)
      .set('isQuickEditing', action.isQuick || false)
      .set('editingCellCoor', new Immutable.List(action.coor))
      .set('editingCellValue', state.getIn(['data', ...action.coor, 'raw']));
  },

  STOP_EDITING(state) {
    return state
      .set('isEditingCell', false)
      .set('isQuickEditing', false)
      .set('editingCellCoor', new Immutable.List([null, null]))
      .set('editingCellValue', '');
  },

  CLEAR_CELL(state, action) {
    return actionHandlers.SET_CELL_VALUE(state, {
      coor: action.coor,
      value: '',
    });
  },

  SET_SELECTED_CELL(state, action) {
    return state.set('selectedCellCoor', new Immutable.List(action.coor));
  },

  MOVE_SELECTED_CELL_UP(state) {
    return state.setIn(
      ['selectedCellCoor', 0],
      Math.max(0, state.getIn(['selectedCellCoor', 0]) - 1)
    );
  },

  MOVE_SELECTED_CELL_DOWN(state) {
    const maxCols = state.getIn(['data', 0]).size - 1;
    return state.setIn(
      ['selectedCellCoor', 0],
      Math.min(maxCols, state.getIn(['selectedCellCoor', 0]) + 1)
    );
  },

  MOVE_SELECTED_CELL_LEFT(state) {
    return state.setIn(
      ['selectedCellCoor', 1],
      Math.max(0, state.getIn(['selectedCellCoor', 1]) - 1)
    );
  },

  MOVE_SELECTED_CELL_RIGHT(state) {
    const maxRows = state.get('data').size - 1;
    return state.setIn(
      ['selectedCellCoor', 1],
      Math.min(maxRows, state.getIn(['selectedCellCoor', 1]) + 1)
    );
  },
};

export default createReducer(initialState, actionHandlers);
