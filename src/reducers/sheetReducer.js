import Immutable from 'immutable';

const initialState = Immutable.fromJS([
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
]);

export default function sheetReducer(state = initialState, action) {
  switch (action.type) {
    default:
      return state;
  }
}
