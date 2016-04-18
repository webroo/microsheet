import styles from './app.css';

import {connect} from 'react-redux';
import React from 'react';

import * as sheetActions from '../../reducers/sheetReducer';
import * as sheetThunks from '../../reducers/sheetReducerThunks';

import {rowHeaderSelector, colHeaderSelector} from '../../selectors/sheetSelector';
import SheetTable from '../../components/sheetTable/sheetTable';

const App = props => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>microsheet</h1>
      <SheetTable {...props} />
    </div>
  );
};

const mapStateToProps = state => ({
  sheet: state.present.get('sheet'),
  rowHeaderData: rowHeaderSelector(state.present.get('sheet')),
  colHeaderData: colHeaderSelector(state.present.get('sheet')),
});

const mapDispatchToProps = {
  cellMouseDown: sheetThunks.cellMouseDown,
  cellMouseOver: sheetThunks.cellMouseOver,
  cellMouseUp: sheetThunks.cellMouseUp,
  cellShiftMouseDown: sheetThunks.cellShiftMouseDown,
  cellDoubleClick: sheetThunks.cellDoubleClick,
  autofillMouseDown: sheetThunks.autofillMouseDown,
  autofillMouseUp: sheetThunks.autofillMouseUp,
  documentMouseUp: sheetThunks.documentMouseUp,

  tableKeyEnter: sheetThunks.tableKeyEnter,
  tableKeyShiftEnter: sheetThunks.tableKeyShiftEnter,
  tableKeyTab: sheetThunks.tableKeyTab,
  tableKeyShiftTab: sheetThunks.tableKeyShiftTab,
  tableKeyEsc: sheetThunks.tableKeyEsc,
  tableKeyDelete: sheetThunks.tableKeyDelete,

  tableKeyUp: sheetThunks.tableKeyUp,
  tableKeyDown: sheetThunks.tableKeyDown,
  tableKeyLeft: sheetThunks.tableKeyLeft,
  tableKeyRight: sheetThunks.tableKeyRight,

  tableKeyShiftUp: sheetThunks.tableKeyShiftUp,
  tableKeyShiftDown: sheetThunks.tableKeyShiftDown,
  tableKeyShiftLeft: sheetThunks.tableKeyShiftLeft,
  tableKeyShiftRight: sheetThunks.tableKeyShiftRight,

  tableKeyCmdA: sheetThunks.tableKeyCmdA,

  tableKeyCmdUp: sheetThunks.tableKeyCmdUp,
  tableKeyCmdDown: sheetThunks.tableKeyCmdDown,
  tableKeyCmdLeft: sheetThunks.tableKeyCmdLeft,
  tableKeyCmdRight: sheetThunks.tableKeyCmdRight,
  tableKeyCmdShiftUp: sheetThunks.tableKeyCmdShiftUp,
  tableKeyCmdShiftDown: sheetThunks.tableKeyCmdShiftDown,
  tableKeyCmdShiftLeft: sheetThunks.tableKeyCmdShiftLeft,
  tableKeyCmdShiftRight: sheetThunks.tableKeyCmdShiftRight,

  tableKeyOther: sheetThunks.tableKeyOther,

  tableUndo: sheetThunks.tableUndo,
  tableRedo: sheetThunks.tableRedo,

  updatedEditValue: sheetActions.updatedEditValue,
  updatedEditValueCaretPos: sheetActions.updatedEditValueCaretPos,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
