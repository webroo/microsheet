import Immutable from 'immutable';

import {coerceStringToNumber} from '../utils/sheetUtils';

const initialState = Immutable.fromJS([
  [{raw: 1, val: 1}, {raw: 2, val: 2}, {raw: 3, val: 3}],
  [{raw: 4, val: 4}, {raw: 5, val: 5}, {raw: 6, val: 6}],
  [{raw: 7, val: 7}, {raw: 8, val: 8}, {raw: 9, val: 9}],
]);

export const UPDATE_CELL_VALUE = 'UPDATE_CELL_VALUE';

export const updateCellValue = (coor, value) => ({
  type: UPDATE_CELL_VALUE,
  coor,
  value,
});

export default function sheetReducer(state = initialState, action) {
  switch (action.type) {
    case UPDATE_CELL_VALUE:
      return state
        .setIn([...action.coor, 'raw'], coerceStringToNumber(action.value))
        .setIn([...action.coor, 'val'], coerceStringToNumber(action.value));
    default:
      return state;
  }
}
