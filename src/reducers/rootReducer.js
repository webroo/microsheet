import {combineImmutableReducers} from '../utils/immutableUtils';
import undoable, {includeAction} from 'redux-undo';

import sheetReducer, {STARTED_EDITING_CELL} from './sheetReducer';

// This is the top level reducer for the app, given to the store in main.js
const rootReducer = combineImmutableReducers({
  sheet: sheetReducer,
});

export default undoable(rootReducer, {
  filter: includeAction(STARTED_EDITING_CELL),
});
