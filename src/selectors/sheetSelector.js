import {createSelector} from 'reselect';

import {ALPHABET} from '../utils/coordinateUtils';

const sheetSelector = sheet => sheet;

export const rowHeaderSelector = createSelector(
  [sheetSelector],
  sheet => sheet.getIn(['data', 0]).map((cell, cellIndex) => ALPHABET[cellIndex])
);

export const colHeaderSelector = createSelector(
  [sheetSelector],
  sheet => sheet.get('data').map((row, rowIndex) => (rowIndex + 1).toString())
);
