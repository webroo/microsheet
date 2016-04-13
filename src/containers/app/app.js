import styles from './app.css';

import {connect} from 'react-redux';
import React from 'react';

import * as actions from '../../reducers/sheetReducer';

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
  sheet: state.get('sheet'),
  rowHeaderData: rowHeaderSelector(state.get('sheet')),
  colHeaderData: colHeaderSelector(state.get('sheet')),
});

const mapDispatchToProps = {
  cellMouseDown: actions.cellMouseDown,
  cellMouseOver: actions.cellMouseOver,
  cellMouseUp: actions.cellMouseUp,
  cellShiftMouseDown: actions.cellShiftMouseDown,
  cellDoubleClick: actions.cellDoubleClick,

  autofillMouseDown: actions.autofillMouseDown,
  autofillMouseUp: actions.autofillMouseUp,

  documentMouseUp: actions.documentMouseUp,

  tableKeyEnter: actions.tableKeyEnter,
  tableKeyShiftEnter: actions.tableKeyShiftEnter,
  tableKeyTab: actions.tableKeyTab,
  tableKeyShiftTab: actions.tableKeyShiftTab,
  tableKeyEsc: actions.tableKeyEsc,
  tableKeyDelete: actions.tableKeyDelete,

  tableKeyUp: actions.tableKeyUp,
  tableKeyDown: actions.tableKeyDown,
  tableKeyLeft: actions.tableKeyLeft,
  tableKeyRight: actions.tableKeyRight,

  tableKeyShiftUp: actions.tableKeyShiftUp,
  tableKeyShiftDown: actions.tableKeyShiftDown,
  tableKeyShiftLeft: actions.tableKeyShiftLeft,
  tableKeyShiftRight: actions.tableKeyShiftRight,

  tableKeyOther: actions.tableKeyOther,

  updateInputCellValue: actions.updateInputCellValue,
  updateInputCellCaretPos: actions.updateInputCellCaretPos,



  setCellValue: actions.setCellValue,
  setEditValue: actions.setEditValue,
  startEditingCell: actions.startEditingCell,
  stopEditing: actions.stopEditing,
  deleteRange: actions.deleteRange,
  seteditValueCaretPos: actions.seteditValueCaretPos,
  setPrimarySelectedCoor: actions.setPrimarySelectedCoor,
  setSelectedRange: actions.setSelectedRange,
  stopSelectingRange: actions.stopSelectingRange,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
