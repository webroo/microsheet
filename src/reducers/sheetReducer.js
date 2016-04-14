import Immutable from 'immutable';

import {createReducer} from '../utils/reduxUtils';
import {
  computeSheet,
  coerceStringToNumber,
  getAddrFromCoor,
  capitalizeExpression,
  rangeSize,
  expandCoorRange,
  getAddrRangeFromCoorRange,
  autofillSheet,
  createEmptyCoor,
  createEmptyCoorRange,
  clampRangeToRange,
} from '../utils/sheetUtils';

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
  ],

  primarySelectedCoor: createEmptyCoor(),

  selectionMode: 'none', // none/basic/formula/autofill
  selectedRange: createEmptyCoorRange(),
  isSelectingRange: false,

  editMode: 'none', // none/full/quick
  editCoor: [null, null],
  editValue: '',
  editValueCaretPos: 0,
  isEditValueDirty: false,

  formulaValue: '',
  formulaValueInsertPos: 0,
});

// --------------------------------------------------------------------------

export const cellMouseDown = coor => ({type: 'CELL_MOUSE_DOWN', coor});
export const cellMouseOver = coor => ({type: 'CELL_MOUSE_OVER', coor});
export const cellMouseUp = coor => ({type: 'CELL_MOUSE_UP', coor});
export const cellShiftMouseDown = coor => ({type: 'CELL_SHIFT_MOUSE_DOWN', coor});
export const cellDoubleClick = coor => ({type: 'CELL_DOUBLE_CLICK', coor});

export const autofillMouseDown = coor => ({type: 'AUTOFILL_MOUSE_DOWN', coor});
export const autofillMouseUp = coor => ({type: 'AUTOFILL_MOUSE_UP', coor});

export const documentMouseUp = () => ({type: 'DOCUMENT_MOUSE_UP'});

export const tableKeyEnter = () => ({type: 'TABLE_KEY_ENTER'});
export const tableKeyShiftEnter = () => ({type: 'TABLE_KEY_SHIFT_ENTER'});
export const tableKeyTab = () => ({type: 'TABLE_KEY_TAB'});
export const tableKeyShiftTab = () => ({type: 'TABLE_KEY_SHIFT_TAB'});
export const tableKeyEsc = () => ({type: 'TABLE_KEY_ESC'});
export const tableKeyDelete = () => ({type: 'TABLE_KEY_DELETE'});

// TODO: can these be handled up the actions above?
// export const inputCellKeyEnter = () => ({type: 'INPUT_CELL_KEY_ENTER'});
// export const inputCellKeyShiftEnter = () => ({type: 'INPUT_CELL_KEY_SHIFT_ENTER'});
// export const inputCellKeyTab = () => ({type: 'INPUT_CELL_KEY_TAB'});
// export const inputCellKeyShiftTab = () => ({type: 'INPUT_CELL_KEY_SHIFT_TAB'});
// export const inputCellKeyEsc = () => ({type: 'INPUT_CELL_KEY_ESC'});

export const tableKeyUp = () => ({type: 'TABLE_KEY_UP'});
export const tableKeyDown = () => ({type: 'TABLE_KEY_DOWN'});
export const tableKeyLeft = () => ({type: 'TABLE_KEY_LEFT'});
export const tableKeyRight = () => ({type: 'TABLE_KEY_RIGHT'});

export const tableKeyShiftUp = () => ({type: 'TABLE_KEY_SHIFT_UP'});
export const tableKeyShiftDown = () => ({type: 'TABLE_KEY_SHIFT_DOWN'});
export const tableKeyShiftLeft = () => ({type: 'TABLE_KEY_SHIFT_LEFT'});
export const tableKeyShiftRight = () => ({type: 'TABLE_KEY_SHIFT_RIGHT'});

export const tableKeyOther = () => ({type: 'TABLE_KEY_OTHER'});

export const updateInputCellValue = value => ({type: 'UPDATE_INPUT_CELL_VALUE', value});
export const updateInputCellCaretPos = pos => ({type: 'UPDATE_INPUT_CELL_CARET_POS', pos});

// --------------------------------------------------------------------------

function setBasicRange(state, range) {
  const maxRows = state.get('data').size - 1;
  const maxCols = state.getIn(['data', 0]).size - 1;
  const clampedRange = clampRangeToRange(range, [[0, 0], [maxRows, maxCols]]);

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
  if (rangeSize(range) === 1) {
    cellAddr = getAddrFromCoor(range[0]);
  } else {
    cellAddr = getAddrRangeFromCoorRange(range);
  }
  const editingValue = state.get('formulaValue');
  const newValue = editingValue.substring(0, caretPos) + cellAddr + editingValue.substring(caretPos);

  return state
    .set('editValue', newValue)
    .set('selectionMode', 'formula')
    .set('selectedRange', Immutable.fromJS(range));
}

function setCellValue(state, coor, value) {
  let data = state.get('data');
  let newValue = value;

  if (sheetUtils.isFormula(value)) {
    newValue = capitalizeExpression(value);
  } else if (sheetUtils.isNumber(value)) {
    newValue = coerceStringToNumber(value);
  } else {
    newValue = value.trim();
  }

  data = data.setIn([...coor, 'raw'], newValue);
  data = computeSheet(data);
  return state.set('data', data);
}

function stopEditing(state) {
  return state
    .set('editMode', 'none')
    .set('editCoor', Immutable.fromJS(createEmptyCoor()))
    .set('editValue', '')
    .set('isEditValueDirty', false);
}

// --------------------------------------------------------------------------

const oldActionHandlers = {
  SET_PRIMARY_SELECTED_COOR(state, action) {
    const maxRows = state.get('data').size - 1;
    const maxCols = state.getIn(['data', 0]).size - 1;
    const newCoor = sheetUtils.clampCoorToRange(action.coor, [[0, 0], [maxRows, maxCols]]);
    return state.set('primarySelectedCoor', Immutable.fromJS(newCoor));
  },

  START_SELECTING_RANGE(state, action) {
    let newState = state;

    if (action.mode === 'formula') {
      // Take a snapshot of the editing value
      newState = newState
        .set('formulaValue', newState.get('editValue'))
        .set('formulaValueInsertPos', newState.get('editValueCaretPos'));
    }

    return newState
      .set('isSelectingRange', true)
      .set('selectionMode', action.mode);
  },

  STOP_SELECTING_RANGE(state) {
    let newState = state.set('isSelectingRange', false);

    if (newState.get('selectionMode') === 'autofill') {
      let data = newState.get('data');
      data = autofillSheet(data, newState.get('selectedRange').toJS());
      data = computeSheet(data);
      newState = newState
        .set('data', data)
        .set('selectionMode', 'none')
        .set('selectedRange', Immutable.fromJS([
          newState.get('primarySelectedCoor').toJS(),
          newState.getIn(['selectedRange', 1]).toJS(),
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

  START_EDITING_CELL(state, action) {
    return state
      .set('editMode', action.mode)
      .set('editCoor', new Immutable.List(action.coor))
      .set('editValue', state.getIn(['data', ...action.coor, 'raw']))
      .set('isEditValueDirty', false);
  },

  COMMIT_EDIT_VALUE(state) {
    let newState = state;
    newState = setCellValue(newState, newState.get('editCoor'), newState.get('editValue'));
    newState = stopEditing(newState);
    return newState;
  },

  DISCARD_EDIT_VALUE(state) {
    return stopEditing(state);
  },

  DELETE_RANGE(state, action) {
    let data = state.get('data');
    expandCoorRange(action.range).forEach(coor => {
      data = data.setIn([...coor, 'raw'], '');
    });
    data = computeSheet(data);
    return state.set('data', data);
  },
};

// --------------------------------------------------------------------------

const newActionHandlers = {
  CELL_MOUSE_DOWN(state, action) {
    let newState = state;
    if (state.get('editMode') !== 'none') {
      newState = oldActionHandlers.START_SELECTING_RANGE(newState, {
        mode: 'formula',
      });
      // TODO: can this be combined with START_SELECTING_RANGE so that you pass the starting coor to it?
      newState = oldActionHandlers.SET_SELECTED_RANGE(newState, {
        mode: 'formula',
        range: [action.coor, action.coor],
      });
    } else {
      newState = oldActionHandlers.SET_PRIMARY_SELECTED_COOR(newState, action);
      newState = oldActionHandlers.SET_SELECTED_RANGE(newState, {
        mode: 'basic',
        range: [action.coor, action.coor],
      });
      newState = oldActionHandlers.START_SELECTING_RANGE(newState, {
        mode: 'basic',
      });
    }
    return newState;
  },

  CELL_MOUSE_OVER(state, action) {
    if (state.get('isSelectingRange')) {
      return oldActionHandlers.SET_SELECTED_RANGE(state, {
        mode: state.get('selectionMode'),
        range: [
          state.getIn(['selectedRange', 0]).toJS(),
          action.coor,
        ],
      });
    }
    return state;
  },

  CELL_MOUSE_UP(state) {
    return oldActionHandlers.STOP_SELECTING_RANGE(state);
  },

  CELL_SHIFT_MOUSE_DOWN(state, action) {
    return oldActionHandlers.SET_SELECTED_RANGE(state, {
      mode: state.get('selectionMode'),
      range: [
        state.get('primarySelectedCoor').toJS(),
        action.coor,
      ],
    });
  },

  CELL_DOUBLE_CLICK(state, action) {
    return oldActionHandlers.START_EDITING_CELL(state, {
      mode: 'full',
      coor: action.coor,
    });
  },

  AUTOFILL_MOUSE_DOWN(state, action) {
    return oldActionHandlers.START_SELECTING_RANGE(state, {
      mode: 'autofill',
    });
  },

  AUTOFILL_MOUSE_UP(state, action) {
    return oldActionHandlers.STOP_SELECTING_RANGE(state);
  },

  DOCUMENT_MOUSE_UP(state) {
    if (state.get('isSelectingRange')) {
      return state.set('isSelectingRange', false);
    }
    return state;
  },

  // TODO: this is a duplicate of the action below, but moves the primary cell down
  TABLE_KEY_ENTER(state) {
    let newState = state;
    if (newState.get('editMode') === 'none') {
      newState = oldActionHandlers.START_EDITING_CELL(newState, {
        mode: 'full',
        coor: newState.get('primarySelectedCoor').toJS(),
      });
    } else {
      newState = oldActionHandlers.COMMIT_EDIT_VALUE(newState);
      // TODO: this is also used in TABLE_KEY_TAB and TABLE_KEY_UP
      const primarySelectedCoor = newState.get('primarySelectedCoor').toJS();
      const newCoor = sheetUtils.translateCoor(primarySelectedCoor, [1, 0]);
      newState = oldActionHandlers.SET_PRIMARY_SELECTED_COOR(newState, {
        coor: newCoor,
      });
      newState = oldActionHandlers.SET_SELECTED_RANGE(newState, {
        mode: 'basic',
        range: [newCoor, newCoor],
      });
    }
    return newState;
  },

  // TODO: this is a duplicate of the action above, but moves the primary cell up
  TABLE_KEY_SHIFT_ENTER(state) {
    let newState = state;
    if (newState.get('editMode') === 'none') {
      newState = oldActionHandlers.START_EDITING_CELL(newState, {
        mode: 'full',
        coor: newState.get('primarySelectedCoor').toJS(),
      });
    } else {
      newState = oldActionHandlers.COMMIT_EDIT_VALUE(newState);
      // TODO: this is also used in TABLE_KEY_TAB and TABLE_KEY_UP
      const primarySelectedCoor = newState.get('primarySelectedCoor').toJS();
      const newCoor = sheetUtils.translateCoor(primarySelectedCoor, [-1, 0]);
      newState = oldActionHandlers.SET_PRIMARY_SELECTED_COOR(newState, {
        coor: newCoor,
      });
      newState = oldActionHandlers.SET_SELECTED_RANGE(newState, {
        mode: 'basic',
        range: [newCoor, newCoor],
      });
    }
    return newState;
  },

  TABLE_KEY_TAB(state) {
    let newState = state;
    if (newState.get('editMode') === 'none') {
      // TODO: this is a duplicate of TABLE_KEY_RIGHT
      const primarySelectedCoor = newState.get('primarySelectedCoor').toJS();
      const newCoor = sheetUtils.translateCoor(primarySelectedCoor, [0, 1]);
      newState = oldActionHandlers.SET_PRIMARY_SELECTED_COOR(newState, {
        coor: newCoor,
      });
      newState = oldActionHandlers.SET_SELECTED_RANGE(newState, {
        mode: 'basic',
        range: [newCoor, newCoor],
      });
    } else {
      newState = oldActionHandlers.COMMIT_EDIT_VALUE(newState);
      // TODO: this is also used in TABLE_KEY_ENTER and TABLE_KEY_RIGHT
      const primarySelectedCoor = newState.get('primarySelectedCoor').toJS();
      const newCoor = sheetUtils.translateCoor(primarySelectedCoor, [0, 1]);
      newState = oldActionHandlers.SET_PRIMARY_SELECTED_COOR(newState, {
        coor: newCoor,
      });
      newState = oldActionHandlers.SET_SELECTED_RANGE(newState, {
        mode: 'basic',
        range: [newCoor, newCoor],
      });
    }
    return newState;
  },

  TABLE_KEY_SHIFT_TAB(state) {
    let newState = state;
    if (newState.get('editMode') === 'none') {
      // TODO: this is a duplicate of TABLE_KEY_LEFT
      const primarySelectedCoor = newState.get('primarySelectedCoor').toJS();
      const newCoor = sheetUtils.translateCoor(primarySelectedCoor, [0, -1]);
      newState = oldActionHandlers.SET_PRIMARY_SELECTED_COOR(newState, {
        coor: newCoor,
      });
      newState = oldActionHandlers.SET_SELECTED_RANGE(newState, {
        mode: 'basic',
        range: [newCoor, newCoor],
      });
    } else {
      newState = oldActionHandlers.COMMIT_EDIT_VALUE(newState);
      // TODO: this is also used in TABLE_KEY_SHIFT_ENTER and TABLE_KEY_LEFT
      const primarySelectedCoor = newState.get('primarySelectedCoor').toJS();
      const newCoor = sheetUtils.translateCoor(primarySelectedCoor, [0, -1]);
      newState = oldActionHandlers.SET_PRIMARY_SELECTED_COOR(newState, {
        coor: newCoor,
      });
      newState = oldActionHandlers.SET_SELECTED_RANGE(newState, {
        mode: 'basic',
        range: [newCoor, newCoor],
      });
    }
    return newState;
  },

  TABLE_KEY_ESC(state) {
    return oldActionHandlers.DISCARD_EDIT_VALUE(state);
  },

  TABLE_KEY_DELETE(state) {
    if (state.get('editMode') === 'none') {
      return oldActionHandlers.DELETE_RANGE(state, {
        range: state.get('selectedRange').toJS(),
      });
    }
    return state;
  },

  TABLE_KEY_UP(state) {
    let newState = state;
    if (newState.get('editMode') === 'quick') {
      newState = oldActionHandlers.COMMIT_EDIT_VALUE(newState);
    }
    if (newState.get('editMode') !== 'full') {
      // TODO: this is also used in TABLE_KEY_ENTER
      const primarySelectedCoor = newState.get('primarySelectedCoor').toJS();
      const newCoor = sheetUtils.translateCoor(primarySelectedCoor, [-1, 0]);
      newState = oldActionHandlers.SET_PRIMARY_SELECTED_COOR(newState, {
        coor: newCoor,
      });
      newState = oldActionHandlers.SET_SELECTED_RANGE(newState, {
        mode: 'basic',
        range: [newCoor, newCoor],
      });
    }
    return newState;
  },

  TABLE_KEY_DOWN(state) {
    let newState = state;
    if (newState.get('editMode') === 'quick') {
      newState = oldActionHandlers.COMMIT_EDIT_VALUE(newState);
    }
    if (newState.get('editMode') !== 'full') {
      // TODO: this is also used in TABLE_KEY_ENTER
      const primarySelectedCoor = newState.get('primarySelectedCoor').toJS();
      const newCoor = sheetUtils.translateCoor(primarySelectedCoor, [1, 0]);
      newState = oldActionHandlers.SET_PRIMARY_SELECTED_COOR(newState, {
        coor: newCoor,
      });
      newState = oldActionHandlers.SET_SELECTED_RANGE(newState, {
        mode: 'basic',
        range: [newCoor, newCoor],
      });
    }
    return newState;
  },

  TABLE_KEY_LEFT(state) {
    let newState = state;
    if (newState.get('editMode') === 'quick') {
      newState = oldActionHandlers.COMMIT_EDIT_VALUE(newState);
    }
    if (newState.get('editMode') !== 'full') {
      // TODO: this is also used in TABLE_KEY_ENTER
      const primarySelectedCoor = newState.get('primarySelectedCoor').toJS();
      const newCoor = sheetUtils.translateCoor(primarySelectedCoor, [0, -1]);
      newState = oldActionHandlers.SET_PRIMARY_SELECTED_COOR(newState, {
        coor: newCoor,
      });
      newState = oldActionHandlers.SET_SELECTED_RANGE(newState, {
        mode: 'basic',
        range: [newCoor, newCoor],
      });
    }
    return newState;
  },

  TABLE_KEY_RIGHT(state) {
    let newState = state;
    if (newState.get('editMode') === 'quick') {
      newState = oldActionHandlers.COMMIT_EDIT_VALUE(newState);
    }
    if (newState.get('editMode') !== 'full') {
      // TODO: this is also used in TABLE_KEY_ENTER
      const primarySelectedCoor = newState.get('primarySelectedCoor').toJS();
      const newCoor = sheetUtils.translateCoor(primarySelectedCoor, [0, 1]);
      newState = oldActionHandlers.SET_PRIMARY_SELECTED_COOR(newState, {
        coor: newCoor,
      });
      newState = oldActionHandlers.SET_SELECTED_RANGE(newState, {
        mode: 'basic',
        range: [newCoor, newCoor],
      });
    }
    return newState;
  },

  TABLE_KEY_SHIFT_UP(state) {
    // TODO: some of this complexity might be aleviated by trapping key events inside
    // the input element
    let newState = state;
    if (newState.get('editMode') === 'quick') {
      newState = oldActionHandlers.COMMIT_EDIT_VALUE(newState);
    } else if (newState.get('editMode') === 'none') {
      // TODO: this is also used in TABLE_KEY_ENTER
      const selectedRange = newState.get('selectedRange').toJS();
      newState = oldActionHandlers.SET_SELECTED_RANGE(newState, {
        mode: 'basic',
        range: sheetUtils.translateRange(selectedRange, [[0, 0], [-1, 0]]),
      });
    }
    return newState;
  },

  TABLE_KEY_SHIFT_DOWN(state) {
    // TODO: some of this complexity might be aleviated by trapping key events inside
    // the input element
    let newState = state;
    if (newState.get('editMode') === 'quick') {
      newState = oldActionHandlers.COMMIT_EDIT_VALUE(newState);
    } else if (newState.get('editMode') === 'none') {
      // TODO: this is also used in TABLE_KEY_ENTER
      const selectedRange = newState.get('selectedRange').toJS();
      newState = oldActionHandlers.SET_SELECTED_RANGE(newState, {
        mode: 'basic',
        range: sheetUtils.translateRange(selectedRange, [[0, 0], [1, 0]]),
      });
    }
    return newState;
  },

  TABLE_KEY_SHIFT_LEFT(state) {
    // TODO: some of this complexity might be aleviated by trapping key events inside
    // the input element
    let newState = state;
    if (newState.get('editMode') === 'quick') {
      newState = oldActionHandlers.COMMIT_EDIT_VALUE(newState);
    } else if (newState.get('editMode') === 'none') {
      // TODO: this is also used in TABLE_KEY_ENTER
      const selectedRange = newState.get('selectedRange').toJS();
      newState = oldActionHandlers.SET_SELECTED_RANGE(newState, {
        mode: 'basic',
        range: sheetUtils.translateRange(selectedRange, [[0, 0], [0, -1]]),
      });
    }
    return newState;
  },

  TABLE_KEY_SHIFT_RIGHT(state) {
    // TODO: some of this complexity might be aleviated by trapping key events inside
    // the input element
    let newState = state;
    if (newState.get('editMode') === 'quick') {
      newState = oldActionHandlers.COMMIT_EDIT_VALUE(newState);
    } else if (newState.get('editMode') === 'none') {
      // TODO: this is also used in TABLE_KEY_ENTER
      const selectedRange = newState.get('selectedRange').toJS();
      newState = oldActionHandlers.SET_SELECTED_RANGE(newState, {
        mode: 'basic',
        range: sheetUtils.translateRange(selectedRange, [[0, 0], [0, 1]]),
      });
    }
    return newState;
  },

  UPDATE_INPUT_CELL_VALUE(state, action) {
    return state
      .set('editValue', action.value)
      .set('isEditValueDirty', true);
  },

  UPDATE_INPUT_CELL_CARET_POS(state, action) {
    return state
      .set('editValueCaretPos', action.pos)
      .set('isEditValueDirty', true);
  },

  TABLE_KEY_OTHER(state) {
    if (state.get('editMode') === 'none') {
      return oldActionHandlers.START_EDITING_CELL(state, {
        mode: 'quick',
        coor: state.get('primarySelectedCoor').toJS(),
      });
    }
    return state;
  },
};

export default createReducer(initialState, Object.assign({}, oldActionHandlers, newActionHandlers));
