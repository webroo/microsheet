import {
  changedPrimarySelectedCoor,
  startedSelectingRange,
  stoppedSelectingRange,
  changedSelectedRange,
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
      // TODO: swapping the two lines below breaks the formula cell ref insertion code
      // this because the edit value is only copied in startedSelectingRange()
      // Perhaps change to: startSelectingRange(mode, startCoor) and changeSelectedRangeEnd(coor)
      dispatch(startedSelectingRange('formula'));
      dispatch(changedSelectedRange('formula', [coor, coor]));
      return;
    }
    dispatch(committedEditValue());
  }
  dispatch(startedSelectingRange('basic'));
  dispatch(changedPrimarySelectedCoor(coor));
};

export const cellMouseOver = coor => (dispatch, getState) => {
  const sheet = getState().getIn(['sheet']);
  if (sheet.get('isSelectingRange')) {
    // TODO: changing just the end coor of a range is duplicated everywhere
    dispatch(changedSelectedRange(
      sheet.get('selectionMode'),
      [
        sheet.getIn(['selectedRange', 0]).toJS(),
        coor,
      ]
    ));
  }
};

export const cellMouseUp = () => dispatch => {
  dispatch(stoppedSelectingRange());
};

export const cellShiftMouseDown = coor => (dispatch, getState) => {
  // TODO: changing just the end coor of a range is duplicated everywhere
  dispatch(changedSelectedRange(
    getState().getIn(['sheet', 'selectionMode']),
    [
      getState().getIn(['sheet', 'selectedRange', 0]).toJS(),
      coor,
    ]
  ));
};

export const cellDoubleClick = coor => dispatch => {
  dispatch(startedEditingCell('full', coor));
};

export const autofillMouseDown = () => dispatch => {
  dispatch(startedSelectingRange('autofill'));
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
    // TODO: changing just the end coor of a range is duplicated everywhere
    const newEndCoor = translateCoor(sheet.getIn(['selectedRange', 1]).toJS(), [-1, 0]);
    dispatch(changedSelectedRange(
      sheet.get('selectionMode'),
      [
        sheet.getIn(['selectedRange', 0]).toJS(),
        newEndCoor,
      ]
    ));
  }
};

export const tableKeyShiftDown = () => (dispatch, getState) => {
  const sheet = getState().getIn(['sheet']);
  if (sheet.get('editMode') === 'quick') {
    dispatch(committedEditValue());
  } else if (sheet.get('editMode') === 'none') {
    // TODO: changing just the end coor of a range is duplicated everywhere
    const newEndCoor = translateCoor(sheet.getIn(['selectedRange', 1]).toJS(), [1, 0]);
    dispatch(changedSelectedRange(
      sheet.get('selectionMode'),
      [
        sheet.getIn(['selectedRange', 0]).toJS(),
        newEndCoor,
      ]
    ));
  }
};

export const tableKeyShiftLeft = () => (dispatch, getState) => {
  const sheet = getState().getIn(['sheet']);
  if (sheet.get('editMode') === 'quick') {
    dispatch(committedEditValue());
  } else if (sheet.get('editMode') === 'none') {
    // TODO: changing just the end coor of a range is duplicated everywhere
    const newEndCoor = translateCoor(sheet.getIn(['selectedRange', 1]).toJS(), [0, -1]);
    dispatch(changedSelectedRange(
      sheet.get('selectionMode'),
      [
        sheet.getIn(['selectedRange', 0]).toJS(),
        newEndCoor,
      ]
    ));
  }
};

export const tableKeyShiftRight = () => (dispatch, getState) => {
  const sheet = getState().getIn(['sheet']);
  if (sheet.get('editMode') === 'quick') {
    dispatch(committedEditValue());
  } else if (sheet.get('editMode') === 'none') {
    // TODO: changing just the end coor of a range is duplicated everywhere
    const newEndCoor = translateCoor(sheet.getIn(['selectedRange', 1]).toJS(), [0, 1]);
    dispatch(changedSelectedRange(
      sheet.get('selectionMode'),
      [
        sheet.getIn(['selectedRange', 0]).toJS(),
        newEndCoor,
      ]
    ));
  }
};

export const tableKeyOther = () => (dispatch, getState) => {
  const sheet = getState().getIn(['sheet']);
  if (sheet.get('editMode') === 'none') {
    dispatch(startedEditingCell('quick', sheet.get('primarySelectedCoor').toJS()));
  }
};
