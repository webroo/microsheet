import {createSelector} from 'reselect';

import {ALPHABET} from '../utils/sheetUtils';

const sheetSelector = sheet => sheet;

export const rowHeaderSelector = createSelector(
  [sheetSelector],
  sheet => sheet.get(0).map((cell, cellIndex) => ALPHABET[cellIndex])
);

export const colHeaderSelector = createSelector(
  [sheetSelector],
  sheet => sheet.map((row, rowIndex) => (rowIndex + 1).toString())
);
