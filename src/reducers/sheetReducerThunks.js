import {
  changedPrimarySelectedCoor,
  startedSelectingRange,
  stoppedSelectingRange,
  changedSelectedRangeEnd,
  startedEditingCell,
  committedEditValue,
  discardedEditValue,
  deletedRange,
} from './sheetReducer';

import {translateCoor, isFormula} from '../utils/sheetUtils';

export const cellMouseDown = coor => (dispatch, getState) => {
  const sheet = getState().getIn(['sheet']);
  if (sheet.get('editMode') !== 'none') {
    if (isFormula(sheet.get('editValue'))) {
      dispatch(startedSelectingRange('formula', coor));
      return;
    }
    dispatch(committedEditValue());
  }
  dispatch(startedSelectingRange('basic', coor));
  dispatch(changedPrimarySelectedCoor(coor));
};

export const cellMouseOver = coor => (dispatch, getState) => {
  const sheet = getState().getIn(['sheet']);
  if (sheet.get('isSelectingRange')) {
    dispatch(changedSelectedRangeEnd(sheet.get('selectionMode'), coor));
  }
};

export const cellMouseUp = () => dispatch => {
  dispatch(stoppedSelectingRange());
};

export const cellShiftMouseDown = coor => (dispatch, getState) => {
  const sheet = getState().getIn(['sheet']);
  dispatch(changedSelectedRangeEnd(sheet.get('selectionMode'), coor));
};

export const cellDoubleClick = coor => dispatch => {
  dispatch(startedEditingCell('full', coor));
};

export const autofillMouseDown = coor => dispatch => {
  dispatch(startedSelectingRange('autofill', coor));
};

export const autofillMouseUp = () => dispatch => {
  dispatch(stoppedSelectingRange());
};

export const documentMouseUp = () => (dispatch, getState) => {
  if (getState().getIn(['sheet', 'isSelectingRange'])) {
    dispatch(stoppedSelectingRange());
  }
};

// TODO this is almost identical to the action below
export const tableKeyEnter = () => (dispatch, getState) => {
  const sheet = getState().getIn(['sheet']);
  if (sheet.get('editMode') === 'none') {
    dispatch(startedEditingCell('full', sheet.get('primarySelectedCoor')));
  } else {
    const newCoor = translateCoor(sheet.get('primarySelectedCoor').toJS(), [1, 0]);
    dispatch(committedEditValue());
    dispatch(changedPrimarySelectedCoor(newCoor));
  }
};

export const tableKeyShiftEnter = () => (dispatch, getState) => {
  const sheet = getState().getIn(['sheet']);
  if (sheet.get('editMode') === 'none') {
    dispatch(startedEditingCell('full', sheet.get('primarySelectedCoor')));
  } else {
    const newCoor = translateCoor(sheet.get('primarySelectedCoor').toJS(), [-1, 0]);
    dispatch(committedEditValue());
    dispatch(changedPrimarySelectedCoor(newCoor));
  }
};

// TODO this is almost identical to the action below
export const tableKeyTab = () => (dispatch, getState) => {
  const sheet = getState().getIn(['sheet']);
  const newCoor = translateCoor(sheet.get('primarySelectedCoor').toJS(), [0, 1]);
  if (sheet.get('editMode') === 'none') {
    dispatch(changedPrimarySelectedCoor(newCoor));
  } else {
    dispatch(committedEditValue());
    dispatch(changedPrimarySelectedCoor(newCoor));
  }
};

export const tableKeyShiftTab = () => (dispatch, getState) => {
  const sheet = getState().getIn(['sheet']);
  const newCoor = translateCoor(sheet.get('primarySelectedCoor').toJS(), [0, -1]);
  if (sheet.get('editMode') === 'none') {
    dispatch(changedPrimarySelectedCoor(newCoor));
  } else {
    dispatch(committedEditValue());
    dispatch(changedPrimarySelectedCoor(newCoor));
  }
};

export const tableKeyEsc = () => dispatch => {
  dispatch(discardedEditValue());
};

export const tableKeyDelete = () => (dispatch, getState) => {
  const sheet = getState().getIn(['sheet']);
  if (sheet.get('editMode') === 'none') {
    dispatch(deletedRange(sheet.get('selectedRange').toJS()));
  }
};

// TODO: this is almost identical to the other key actions
// Either abstract into a common function, or create a generic arrowKey(direction) action?
export const tableKeyUp = () => (dispatch, getState) => {
  const sheet = getState().getIn(['sheet']);
  if (sheet.get('editMode') === 'quick') {
    dispatch(committedEditValue());
  }
  if (sheet.get('editMode') !== 'full') {
    const newCoor = translateCoor(sheet.get('primarySelectedCoor').toJS(), [-1, 0]);
    dispatch(changedPrimarySelectedCoor(newCoor));
  }
};

export const tableKeyDown = () => (dispatch, getState) => {
  const sheet = getState().getIn(['sheet']);
  if (sheet.get('editMode') === 'quick') {
    dispatch(committedEditValue());
  }
  if (sheet.get('editMode') !== 'full') {
    const newCoor = translateCoor(sheet.get('primarySelectedCoor').toJS(), [1, 0]);
    dispatch(changedPrimarySelectedCoor(newCoor));
  }
};

export const tableKeyLeft = () => (dispatch, getState) => {
  const sheet = getState().getIn(['sheet']);
  if (sheet.get('editMode') === 'quick') {
    dispatch(committedEditValue());
  }
  if (sheet.get('editMode') !== 'full') {
    const newCoor = translateCoor(sheet.get('primarySelectedCoor').toJS(), [0, -1]);
    dispatch(changedPrimarySelectedCoor(newCoor));
  }
};

export const tableKeyRight = () => (dispatch, getState) => {
  const sheet = getState().getIn(['sheet']);
  if (sheet.get('editMode') === 'quick') {
    dispatch(committedEditValue());
  }
  if (sheet.get('editMode') !== 'full') {
    const newCoor = translateCoor(sheet.get('primarySelectedCoor').toJS(), [0, 1]);
    dispatch(changedPrimarySelectedCoor(newCoor));
  }
};

// TODO: this is almost identical to the other key actions
// Either abstract into a common function, or create a generic arrowKey(direction) action?
export const tableKeyShiftUp = () => (dispatch, getState) => {
  const sheet = getState().getIn(['sheet']);
  if (sheet.get('editMode') === 'quick') {
    dispatch(committedEditValue());
  } else if (sheet.get('editMode') === 'none') {
    const newEndCoor = translateCoor(sheet.getIn(['selectedRange', 1]).toJS(), [-1, 0]);
    dispatch(changedSelectedRangeEnd(sheet.get('selectionMode'), newEndCoor));
  }
};

export const tableKeyShiftDown = () => (dispatch, getState) => {
  const sheet = getState().getIn(['sheet']);
  if (sheet.get('editMode') === 'quick') {
    dispatch(committedEditValue());
  } else if (sheet.get('editMode') === 'none') {
    const newEndCoor = translateCoor(sheet.getIn(['selectedRange', 1]).toJS(), [1, 0]);
    dispatch(changedSelectedRangeEnd(sheet.get('selectionMode'), newEndCoor));
  }
};

export const tableKeyShiftLeft = () => (dispatch, getState) => {
  const sheet = getState().getIn(['sheet']);
  if (sheet.get('editMode') === 'quick') {
    dispatch(committedEditValue());
  } else if (sheet.get('editMode') === 'none') {
    const newEndCoor = translateCoor(sheet.getIn(['selectedRange', 1]).toJS(), [0, -1]);
    dispatch(changedSelectedRangeEnd(sheet.get('selectionMode'), newEndCoor));
  }
};

export const tableKeyShiftRight = () => (dispatch, getState) => {
  const sheet = getState().getIn(['sheet']);
  if (sheet.get('editMode') === 'quick') {
    dispatch(committedEditValue());
  } else if (sheet.get('editMode') === 'none') {
    const newEndCoor = translateCoor(sheet.getIn(['selectedRange', 1]).toJS(), [0, 1]);
    dispatch(changedSelectedRangeEnd(sheet.get('selectionMode'), newEndCoor));
  }
};

export const tableKeyOther = () => (dispatch, getState) => {
  const sheet = getState().getIn(['sheet']);
  if (sheet.get('editMode') === 'none') {
    dispatch(startedEditingCell('quick', sheet.get('primarySelectedCoor').toJS()));
  }
};
