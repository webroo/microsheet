import Immutable from 'immutable';

import {createReducer} from '../utils/reduxUtils';
import * as sheetUtils from '../utils/sheetUtils';

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
    [{raw: '', val: ''}, {raw: '', val: ''}, {raw: '', val: ''}],
    [{raw: '', val: ''}, {raw: '', val: ''}, {raw: '', val: ''}],
  ],

  primarySelectedCoor: sheetUtils.createEmptyCoor(),

  selectionMode: 'none', // none/basic/formula/autofill
  selectedRange: sheetUtils.createEmptyCoorRange(),
  isSelectingRange: false,

  editMode: 'none', // none/full/quick
  editCoor: [null, null],
  editValue: '',
  editValueCaretPos: 0,
  isEditValueDirty: false,

  formulaValue: '',
  formulaValueInsertPos: 0,
});

export const changedPrimarySelectedCoor = coor => ({type: 'CHANGED_PRIMARY_SELECTED_COOR', coor});
export const startedSelectingRange = (mode, coor) => ({type: 'STARTED_SELECTING_RANGE', mode, coor});
export const stoppedSelectingRange = () => ({type: 'STOPPED_SELECTING_RANGE'});
export const changedSelectedRangeStart = coor => ({type: 'CHANGED_SELECTED_RANGE_START', coor});
export const changedSelectedRangeEnd = coor => ({type: 'CHANGED_SELECTED_RANGE_END', coor});
export const changedSelectedRange = (mode, range) => ({type: 'CHANGED_SELECTED_RANGE', mode, range});
export const startedEditingCell = (mode, coor) => ({type: 'STARTED_EDITING_CELL', mode, coor});
export const committedEditValue = () => ({type: 'COMMITTED_EDIT_VALUE'});
export const discardedEditValue = () => ({type: 'DISCARDED_EDIT_VALUE'});
export const deletedRange = range => ({type: 'DELETED_RANGE', range});
export const updatedEditValue = value => ({type: 'UPDATED_EDIT_VALUE', value});
export const updatedEditValueCaretPos = pos => ({type: 'UPDATED_EDIT_VALUE_CARET_POS', pos});

function setBasicRange(state, range) {
  const extent = sheetUtils.getSheetExtentRange(state.get('data'));
  const clampedRange = sheetUtils.clampRangeToRange(range, extent);

  return state
    .set('selectionMode', 'basic')
    .set('selectedRange', Immutable.fromJS(clampedRange));
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
    .set('selectionMode', 'autofill')
    .set('selectedRange', Immutable.fromJS(range));
}

function setFormulaRange(state, range) {
  const caretPos = state.get('formulaValueInsertPos');
  let cellAddr;
  if (sheetUtils.rangeSize(range) === 1) {
    cellAddr = sheetUtils.getAddrFromCoor(range[0]);
  } else {
    cellAddr = sheetUtils.getAddrRangeFromCoorRange(range);
  }
  const editingValue = state.get('formulaValue');
  const newValue = editingValue.substring(0, caretPos) + cellAddr + editingValue.substring(caretPos);

  return state
    .set('editValue', newValue)
    .set('selectionMode', 'formula')
    .set('selectedRange', Immutable.fromJS(range));
}

function setSelectedRange(state, mode, range) {
  if (mode === 'basic') {
    return setBasicRange(state, range);
  } else if (mode === 'autofill') {
    return setAutofillRange(state, range);
  } else if (mode === 'formula') {
    return setFormulaRange(state, range);
  }
  return state;
}

function setCellValue(state, coor, value) {
  let data = state.get('data');
  let newValue = value;

  if (sheetUtils.isFormula(value)) {
    newValue = sheetUtils.capitalizeExpression(value);
  } else if (sheetUtils.isNumber(value)) {
    newValue = sheetUtils.coerceStringToNumber(value);
  } else {
    newValue = value.trim();
  }

  data = data.setIn([...coor, 'raw'], newValue);
  data = sheetUtils.computeSheet(data);
  return state.set('data', data);
}

function stopEditing(state) {
  return state
    .set('editMode', 'none')
    .set('editCoor', Immutable.fromJS(sheetUtils.createEmptyCoor()))
    .set('editValue', '')
    .set('isEditValueDirty', false);
}

export const actionHandlers = {
  CHANGED_PRIMARY_SELECTED_COOR(state, {coor}) {
    const extent = sheetUtils.getSheetExtentRange(state.get('data'));
    const newCoor = sheetUtils.clampCoorToRange(coor, extent);
    return setBasicRange(state, [newCoor, newCoor])
      .set('primarySelectedCoor', Immutable.fromJS(newCoor));
  },

  STARTED_SELECTING_RANGE(state, {mode, coor}) {
    let newState = state;

    if (mode === 'formula') {
      // Take a snapshot of the editing value
      newState = newState
        .set('formulaValue', newState.get('editValue'))
        .set('formulaValueInsertPos', newState.get('editValueCaretPos'));
    }

    return setSelectedRange(newState, mode, [coor, coor])
      .set('isSelectingRange', true)
      .set('selectionMode', mode);
  },

  STOPPED_SELECTING_RANGE(state) {
    let newState = state.set('isSelectingRange', false);

    if (newState.get('selectionMode') === 'autofill') {
      let data = newState.get('data');
      data = sheetUtils.autofillSheet(data, newState.get('selectedRange').toJS());
      data = sheetUtils.computeSheet(data);
      // Swap the autofill range over to a basic range so the filled cells are highlighted
      newState = setBasicRange(state, newState.get('selectedRange').toJS())
        .set('data', data);
    }

    return newState;
  },

  CHANGED_SELECTED_RANGE(state, {mode, range}) {
    return setSelectedRange(state, mode, range);
  },

  CHANGED_SELECTED_RANGE_START(state, {coor}) {
    return setSelectedRange(
      state,
      state.get('selectionMode'),
      [
        coor,
        state.getIn(['selectedRange', 1]).toJS(),
      ]
    );
  },

  CHANGED_SELECTED_RANGE_END(state, {coor}) {
    return setSelectedRange(
      state,
      state.get('selectionMode'),
      [
        state.getIn(['selectedRange', 0]).toJS(),
        coor,
      ]
    );
  },

  STARTED_EDITING_CELL(state, {mode, coor}) {
    return setBasicRange(state, [coor, coor])
      .set('editMode', mode)
      .set('editCoor', new Immutable.List(coor))
      .set('editValue', state.getIn(['data', ...coor, 'raw']))
      .set('isEditValueDirty', false);
  },

  COMMITTED_EDIT_VALUE(state) {
    let newState = state;
    newState = setCellValue(newState, newState.get('editCoor'), newState.get('editValue'));
    newState = stopEditing(newState);
    return newState;
  },

  DISCARDED_EDIT_VALUE(state) {
    return stopEditing(state);
  },

  DELETED_RANGE(state, {range}) {
    let data = state.get('data');
    sheetUtils.expandCoorRange(range).forEach(coor => {
      data = data.setIn([...coor, 'raw'], '');
    });
    data = sheetUtils.computeSheet(data);
    return state.set('data', data);
  },

  UPDATED_EDIT_VALUE(state, {value}) {
    return state
      .set('editValue', value)
      .set('isEditValueDirty', true);
  },

  UPDATED_EDIT_VALUE_CARET_POS(state, {pos}) {
    return state
      .set('editValueCaretPos', pos)
      .set('isEditValueDirty', true);
  },
};

export default createReducer(initialState, actionHandlers);
