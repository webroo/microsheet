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

import {translateCoor, translationIdentities, isFormula} from '../utils/sheetUtils';

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
    dispatch(changedSelectedRangeEnd(coor));
  }
};

export const cellMouseUp = () => dispatch => {
  dispatch(stoppedSelectingRange());
};

export const cellShiftMouseDown = coor => dispatch => {
  dispatch(changedSelectedRangeEnd(coor));
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
export const tableKeyEnter = shiftKey => (dispatch, getState) => {
  const sheet = getState().getIn(['sheet']);
  if (sheet.get('editMode') === 'none') {
    dispatch(startedEditingCell('full', sheet.get('primarySelectedCoor')));
  } else {
    const translationIdentity = shiftKey ? translationIdentities.up : translationIdentities.down;
    const newCoor = translateCoor(sheet.get('primarySelectedCoor').toJS(), translationIdentity);
    dispatch(committedEditValue());
    dispatch(changedPrimarySelectedCoor(newCoor));
  }
};

export const tableKeyShiftEnter = () => dispatch => {
  dispatch(tableKeyEnter(true));
};

// TODO this is almost identical to the action below
export const tableKeyTab = shiftKey => (dispatch, getState) => {
  const sheet = getState().getIn(['sheet']);
  const translationIdentity = shiftKey ? translationIdentities.left : translationIdentities.right;
  const newCoor = translateCoor(sheet.get('primarySelectedCoor').toJS(), translationIdentity);
  if (sheet.get('editMode') === 'none') {
    dispatch(changedPrimarySelectedCoor(newCoor));
  } else {
    dispatch(committedEditValue());
    dispatch(changedPrimarySelectedCoor(newCoor));
  }
};

export const tableKeyShiftTab = () => dispatch => {
  dispatch(tableKeyTab(true));
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

export const tableKeyArrow = direction => (dispatch, getState) => {
  const sheet = getState().getIn(['sheet']);
  if (sheet.get('editMode') === 'quick') {
    dispatch(committedEditValue());
  }
  if (sheet.get('editMode') !== 'full') {
    const currentCoor = sheet.get('primarySelectedCoor').toJS();
    const translationIdentity = translationIdentities[direction];
    const newCoor = translateCoor(currentCoor, translationIdentity);
    dispatch(changedPrimarySelectedCoor(newCoor));
  }
};

export const tableKeyUp = () => dispatch => {
  dispatch(tableKeyArrow('up'));
};

export const tableKeyDown = () => dispatch => {
  dispatch(tableKeyArrow('down'));
};

export const tableKeyLeft = () => dispatch => {
  dispatch(tableKeyArrow('left'));
};

export const tableKeyRight = () => dispatch => {
  dispatch(tableKeyArrow('right'));
};

export const tableKeyShiftArrow = direction => (dispatch, getState) => {
  const sheet = getState().getIn(['sheet']);
  if (sheet.get('editMode') === 'quick') {
    dispatch(committedEditValue());
  } else if (sheet.get('editMode') === 'none') {
    const currentEndCoor = sheet.getIn(['selectedRange', 1]).toJS();
    const translationIdentity = translationIdentities[direction];
    const newCoor = translateCoor(currentEndCoor, translationIdentity);
    dispatch(changedSelectedRangeEnd(newCoor));
  }
};

export const tableKeyShiftUp = () => dispatch => {
  dispatch(tableKeyShiftArrow('up'));
};

export const tableKeyShiftDown = () => dispatch => {
  dispatch(tableKeyShiftArrow('down'));
};

export const tableKeyShiftLeft = () => dispatch => {
  dispatch(tableKeyShiftArrow('left'));
};

export const tableKeyShiftRight = () => dispatch => {
  dispatch(tableKeyShiftArrow('right'));
};

export const tableKeyOther = () => (dispatch, getState) => {
  const sheet = getState().getIn(['sheet']);
  if (sheet.get('editMode') === 'none') {
    dispatch(startedEditingCell('quick', sheet.get('primarySelectedCoor').toJS()));
  }
};
