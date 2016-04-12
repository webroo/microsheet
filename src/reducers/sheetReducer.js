import Immutable from 'immutable';

import {createReducer} from '../utils/reduxUtils';
import {
  computeSheet,
  coerceStringToNumber,
  getAddrFromCoor,
  capitalizeExpression,
  isFormula,
  rangeSize,
  expandCoorRange,
  getAddrRangeFromCoorRange,
  autofillSheet,
  createEmptyCoor,
  createEmptyCoorRange,
  clampCoorToRange,
  clampRangeToRange,
} from '../utils/sheetUtils';

// The `raw` property is the underlying user input, and `val` is the evaluated (displayed) output.
// `val` is always a string as it's just a displayable value in the UI
const initialState = Immutable.fromJS({
  data: [
    [{raw: '', val: ''}, {raw: '', val: ''}, {raw: '', val: ''}],
    [{raw: '', val: ''}, {raw: '', val: ''}, {raw: '', val: ''}],
    [{raw: '', val: ''}, {raw: '', val: ''}, {raw: '', val: ''}],
    [{raw: '', val: ''}, {raw: '', val: ''}, {raw: '', val: ''}],
    [{raw: '', val: ''}, {raw: '', val: ''}, {raw: '', val: ''}],
    [{raw: '', val: ''}, {raw: '', val: ''}, {raw: '', val: ''}],
    [{raw: '', val: ''}, {raw: '', val: ''}, {raw: '', val: ''}],
    [{raw: '', val: ''}, {raw: '', val: ''}, {raw: '', val: ''}],
    [{raw: '', val: ''}, {raw: '', val: ''}, {raw: '', val: ''}],
    [{raw: '', val: ''}, {raw: '', val: ''}, {raw: '', val: ''}],
  ],

  primarySelectedCoor: createEmptyCoor(),

  selectedRangeMode: 'none', // none/basic/formula/autofill
  selectedRangeCoors: createEmptyCoorRange(),
  isSelectingRange: false,

  editMode: 'none', // none/full/quick
  editingCellCoor: [null, null],
  editingCellValue: '',
  editingCellCaretPos: 0,
  isEditingValueDirty: false,

  inserteeValue: '',
  inserteePos: 0,
});

export const SET_CELL_VALUE = 'SET_CELL_VALUE';
export const START_EDITING_CELL = 'START_EDITING_CELL';
export const SET_EDIT_VALUE = 'SET_EDIT_VALUE';
export const STOP_EDITING = 'STOP_EDITING';
export const DELETE_RANGE = 'DELETE_RANGE';
export const SET_EDITING_CELL_CARET_POS = 'SET_EDITING_CELL_CARET_POS';

export const SET_PRIMARY_SELECTED_COOR = 'SET_PRIMARY_SELECTED_COOR';

export const START_SELECTING_RANGE = 'START_SELECTING_RANGE';
export const STOP_SELECTING_RANGE = 'STOP_SELECTING_RANGE';
export const SET_SELECTED_RANGE = 'SET_SELECTED_RANGE';

export const setCellValue = (coor, value) => ({
  type: SET_CELL_VALUE,
  coor,
  value,
});
export const setEditValue = value => ({
  type: SET_EDIT_VALUE,
  value,
});
export const startEditingCell = (mode, coor) => ({
  type: START_EDITING_CELL,
  mode,
  coor,
});
export const stopEditing = () => ({
  type: STOP_EDITING,
});
export const deleteRange = range => ({
  type: DELETE_RANGE,
  range,
});
export const setEditingCellCaretPos = pos => ({
  type: SET_EDITING_CELL_CARET_POS,
  pos,
});
export const setPrimarySelectedCoor = coor => ({
  type: SET_PRIMARY_SELECTED_COOR,
  coor,
});
export const startSelectingRange = mode => ({
  type: START_SELECTING_RANGE,
  mode,
});
export const stopSelectingRange = () => ({
  type: STOP_SELECTING_RANGE,
});
export const setSelectedRange = (mode, range) => ({
  type: SET_SELECTED_RANGE,
  mode,
  range,
});

function clearRangeSelection(state) {
  return state
    .set('selectedRangeMode', 'none')
    .set('isSelectingRange', false)
    .set('selectedRangeCoors', Immutable.fromJS([
      state.get('primarySelectedCoor').toJS(),
      state.get('primarySelectedCoor').toJS(),
    ]));
}

function setBasicRange(state, range) {
  const maxRows = state.get('data').size - 1;
  const maxCols = state.getIn(['data', 0]).size - 1;
  const clampedRange = clampRangeToRange(range, [[0, 0], [maxRows, maxCols]]);

  return state
    .set('selectedRangeMode', 'basic')
    .set('selectedRangeCoors', Immutable.fromJS(clampedRange));
}

function setAutofillRange(state, range) {
  const rangeMagnitude = [
    Math.abs(range[0][0] - range[1][0]),
    Math.abs(range[0][1] - range[1][1]),
  ];

  if (rangeMagnitude[1] > rangeMagnitude[0]) {
    range[1] = [
      range[0][0],
      range[1][1],
    ];
  } else {
    range[1] = [
      range[1][0],
      range[0][1],
    ];
  }

  return state
    .set('selectedRangeMode', 'autofill')
    .set('selectedRangeCoors', Immutable.fromJS(range));
}

function setFormulaRange(state, range) {
  const caretPos = state.get('inserteePos');
  let cellAddr;
  if (rangeSize(range) === 1) {
    cellAddr = getAddrFromCoor(range[0]);
  } else {
    cellAddr = getAddrRangeFromCoorRange(range);
  }
  const editingValue = state.get('inserteeValue');
  const newValue = editingValue.substring(0, caretPos) + cellAddr + editingValue.substring(caretPos);

  return state
    .set('editingCellValue', newValue)
    .set('selectedRangeMode', 'formula')
    .set('selectedRangeCoors', Immutable.fromJS(range));
}

const actionHandlers = {
  SET_CELL_VALUE(state, action) {
    // TODO: ensure this also handles number values
    let value = action.value.trim();
    let data = state.get('data');

    if (isFormula(value)) {
      value = capitalizeExpression(value);
    } else {
      value = coerceStringToNumber(value);
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
      .set('editMode', action.mode)
      .set('editingCellCoor', new Immutable.List(action.coor))
      .set('editingCellValue', state.getIn(['data', ...action.coor, 'raw']))
      .set('isEditingValueDirty', false);
  },

  STOP_EDITING(state) {
    return clearRangeSelection(state)
      .set('editMode', 'none')
      .set('editingCellCoor', new Immutable.List([null, null]))
      .set('editingCellValue', '')
      .set('isEditingValueDirty', false);
  },

  DELETE_RANGE(state, action) {
    let data = state.get('data');
    expandCoorRange(action.range).forEach(coor => {
      data = data.setIn([...coor, 'raw'], '');
    });
    data = computeSheet(data);
    return state.set('data', data);
  },

  SET_EDITING_CELL_CARET_POS(state, action) {
    return state
      .set('editingCellCaretPos', action.pos)
      .set('isEditingValueDirty', true);
  },

  SET_PRIMARY_SELECTED_COOR(state, action) {
    const maxRows = state.get('data').size - 1;
    const maxCols = state.getIn(['data', 0]).size - 1;
    const coor = clampCoorToRange(action.coor, [[0, 0], [maxRows, maxCols]]);

    return state
      .set('primarySelectedCoor', Immutable.fromJS(coor))
      .set('selectedRangeMode', 'basic')
      .set('selectedRangeCoors', Immutable.fromJS([coor, coor]));
  },

  START_SELECTING_RANGE(state, action) {
    let newState = state
      .set('selectedRangeMode', action.mode)
      .set('isSelectingRange', true);

    if (action.mode === 'formula') {
      newState = newState
        .set('inserteeValue', state.get('editingCellValue'))
        .set('inserteePos', state.get('editingCellCaretPos'));
    }

    return newState;
  },

  STOP_SELECTING_RANGE(state) {
    let newState = state.set('isSelectingRange', false);

    if (newState.get('selectedRangeMode') === 'autofill') {
      let data = newState.get('data');
      data = autofillSheet(data, newState.get('selectedRangeCoors').toJS());
      data = computeSheet(data);
      newState = newState
        .set('data', data)
        .set('selectedRangeMode', 'none')
        .set('selectedRangeCoors', Immutable.fromJS([
          newState.get('primarySelectedCoor').toJS(),
          newState.getIn(['selectedRangeCoors', 1]).toJS(),
        ]));
    }

    return newState;
  },

  SET_SELECTED_RANGE(state, action) {
    if (action.mode === 'basic') {
      return setBasicRange(state, action.range);
    } else if (action.mode === 'autofill') {
      return setAutofillRange(state, action.range);
    } else if (action.mode === 'formula') {
      return setFormulaRange(state, action.range);
    }
    return state;
  },
};

export default createReducer(initialState, actionHandlers);
