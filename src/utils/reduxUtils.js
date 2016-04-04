export function createReducer(initialState, actionHandlers) {
  return (state = initialState, action) => (
    actionHandlers[action.type] ? actionHandlers[action.type](state, action) : state
  );
}
