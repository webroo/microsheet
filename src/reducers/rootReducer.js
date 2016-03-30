import {combineImmutableReducers} from '../utils/immutableUtils';

import sheetReducer from './sheetReducer';
import editorReducer from './editorReducer';

// This is the top level reducer for the app, given to the store in main.js
export default combineImmutableReducers({
  sheet: sheetReducer,
  editor: editorReducer,
});
