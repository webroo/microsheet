import styles from './app.css';

import {connect} from 'react-redux';
import React from 'react';

import {
  setCellValue,
  setEditValue,
  startEditingCell,
  stopEditing,
  deleteRange,
  setEditingCellCaretPos,
  setPrimarySelectedCoor,
  setSelectedRange,
  startSelectingRange,
  stopSelectingRange,
} from '../../reducers/sheetReducer';

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
  sheetData: state.getIn(['sheet', 'data']),
  rowHeaderData: rowHeaderSelector(state.get('sheet')),
  colHeaderData: colHeaderSelector(state.get('sheet')),
  selectedRangeMode: state.getIn(['sheet', 'selectedRangeMode']),
  editMode: state.getIn(['sheet', 'editMode']),
  isQuickEditing: state.getIn(['sheet', 'isQuickEditing']),
  editingCellCoor: state.getIn(['sheet', 'editingCellCoor']),
  editingCellValue: state.getIn(['sheet', 'editingCellValue']),
  editingCellCaretPos: state.getIn(['sheet', 'editingCellCaretPos']),
  isEditingValueDirty: state.getIn(['sheet', 'isEditingValueDirty']),
  primarySelectedCoor: state.getIn(['sheet', 'primarySelectedCoor']),
  isSelectingRange: state.getIn(['sheet', 'isSelectingRange']),
  selectedRangeCoors: state.getIn(['sheet', 'selectedRangeCoors']),
});

const mapDispatchToProps = {
  setCellValue,
  setEditValue,
  startEditingCell,
  stopEditing,
  deleteRange,
  setEditingCellCaretPos,
  setPrimarySelectedCoor,
  setSelectedRange,
  startSelectingRange,
  stopSelectingRange,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
