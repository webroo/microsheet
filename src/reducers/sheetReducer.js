import Immutable from 'immutable';

const initialState = Immutable.fromJS([
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
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
      return state.setIn(action.coor, action.value);
    default:
      return state;
  }
}
