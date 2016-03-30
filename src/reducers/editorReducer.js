import Immutable from 'immutable';

const initialState = Immutable.fromJS({
  editingCoor: [null, null],
});

export const CHANGE_EDITING_COOR = 'CHANGE_EDITING_COOR';

export const changeEditingCoor = coor => ({
  type: CHANGE_EDITING_COOR,
  coor,
});

export default function editorReducer(state = initialState, action) {
  switch (action.type) {
    case CHANGE_EDITING_COOR:
      return state.set('editingCoor', new Immutable.List(action.coor));
    default:
      return state;
  }
}
