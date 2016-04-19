/**
 * Creates a reducer function with the given initial state and action handlers. The action handlers
 * must correspond to the `type` value of the action objects.
 *
 * @example
 *   const reducer = createReducer(0, {
 *     INCREMENT: (state, action) => state + action.amount
 *   });
 *
 * @param  {*}      initialState   Initial reducer state
 * @param  {Object} actionHandlers Map of action handler functions
 * @return {Function}              A regular reducer function
 */
export function createReducer(initialState, actionHandlers) {
  return (state = initialState, action) => (
    actionHandlers[action.type] ? actionHandlers[action.type](state, action) : state
  );
}
