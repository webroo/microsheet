import Immutable from 'immutable';

import {computeSheet, coerceValueToNumber, capitalizeCellAddresses} from '../utils/sheetUtils';

// The `raw` property is the underlying user input, and `val` is the evaluated (displayed) output.
// `val` is always a string as it's just a displayable value in the UI
const initialState = Immutable.fromJS({
  data: [
    [{raw: 1, val: '1'}, {raw: 2, val: '2'}, {raw: 3, val: '3'}],
    [{raw: 4, val: '4'}, {raw: 5, val: '5'}, {raw: 6, val: '6'}],
    [{raw: 7, val: '7'}, {raw: 8, val: '8'}, {raw: 9, val: '9'}],
  ],
  editingCoor: [null, null],
  selectedCoor: [null, null],
});

// Action types
export const UPDATE_CELL_VALUE = 'UPDATE_CELL_VALUE';
export const CHANGE_EDITING_COOR = 'CHANGE_EDITING_COOR';
export const CHANGE_SELECTED_COOR = 'CHANGE_SELECTED_COOR';
export const MOVE_SELECTED_COOR = 'MOVE_SELECTED_COOR';

export const updateCellValue = (coor, value) => ({
  type: UPDATE_CELL_VALUE,
  coor,
  value,
});

export const changeEditingCoor = coor => ({
  type: CHANGE_EDITING_COOR,
  coor,
});

export const changeSelectedCoor = coor => ({
  type: CHANGE_SELECTED_COOR,
  coor,
});

export const moveSelectedCoor = direction => ({
  type: MOVE_SELECTED_COOR,
  direction,
});

function reduceNewCellValue(state, cellCoor, cellValue) {
  let newCellValue;
  let newState;

  if (typeof cellValue === 'string' && cellValue.charAt(0) === '=') {
    // Attempts to capitalize cell addresses in expressions, eg: '=a1+b2' becomes '=A1+B2'
    newCellValue = capitalizeCellAddresses(cellValue);
  } else {
    // Attempts to cast the string value from the input field to a number, otherwise keeps as string
    newCellValue = coerceValueToNumber(cellValue);
  }

  // cellCoor is an array of two numbers (eg: [2,3]) so we can use it directly with Immutable's setIn()
  newState = state.setIn(['data', ...cellCoor, 'raw'], newCellValue);

  // Evaluates every cell's `raw` property and sets the corresponding `val` property
  newState = state.set('data', computeSheet(newState.get('data')));

  return newState;
}

function reduceMoveSelectedCoor(state, direction) {
  if (state.getIn(['selectedCoor', 0]) === null || state.getIn(['selectedCoor', 1]) === null) {
    return state;
  }

  const maxCols = state.getIn(['data', 0]).size - 1;
  const maxRows = state.get('data').size - 1;

  switch (direction) {
    case 'up':
      return state.setIn(['selectedCoor', 0], Math.max(0, state.getIn(['selectedCoor', 0]) - 1));
    case 'down':
      return state.setIn(['selectedCoor', 0], Math.min(maxCols, state.getIn(['selectedCoor', 0]) + 1));
    case 'left':
      return state.setIn(['selectedCoor', 1], Math.max(0, state.getIn(['selectedCoor', 1]) - 1));
    case 'right':
      return state.setIn(['selectedCoor', 1], Math.min(maxRows, state.getIn(['selectedCoor', 1]) + 1));
    default:
      return state;
  }
}

export default function sheetReducer(state = initialState, action) {
  switch (action.type) {
    case UPDATE_CELL_VALUE:
      return reduceNewCellValue(state, action.coor, action.value);
    case CHANGE_EDITING_COOR:
      return state.set('editingCoor', new Immutable.List(action.coor));
    case CHANGE_SELECTED_COOR:
      return state.set('selectedCoor', new Immutable.List(action.coor));
    case MOVE_SELECTED_COOR:
      return reduceMoveSelectedCoor(state, action.direction);
    default:
      return state;
  }
}
