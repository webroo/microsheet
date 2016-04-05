import {connect} from 'react-redux';
import React from 'react';

import {
  setCellValue,
  setEditValue,
  startEditingCell,
  stopEditing,
  clearCell,
  setSelectedCell,
  moveSelectedCellUp,
  moveSelectedCellDown,
  moveSelectedCellLeft,
  moveSelectedCellRight,
  setSelectedRange,
  startSelectingRange,
  stopSelectingRange,
} from '../../reducers/sheetReducer';

import {rowHeaderSelector, colHeaderSelector} from '../../selectors/sheetSelector';
import SheetTable from '../../components/sheetTable/sheetTable';

const App = props => {
  return (
    <SheetTable {...props} />
  );
};

const mapStateToProps = state => ({
  sheetData: state.getIn(['sheet', 'data']),
  rowHeaderData: rowHeaderSelector(state.get('sheet')),
  colHeaderData: colHeaderSelector(state.get('sheet')),
  isEditingCell: state.getIn(['sheet', 'isEditingCell']),
  isQuickEditing: state.getIn(['sheet', 'isQuickEditing']),
  editingCellCoor: state.getIn(['sheet', 'editingCellCoor']),
  editingCellValue: state.getIn(['sheet', 'editingCellValue']),
  isEditingValueDirty: state.getIn(['sheet', 'isEditingValueDirty']),
  isCellSelected: state.getIn(['sheet', 'isCellSelected']),
  selectedCellCoor: state.getIn(['sheet', 'selectedCellCoor']),
  isRangeSelected: state.getIn(['sheet', 'isRangeSelected']),
  isSelectingRange: state.getIn(['sheet', 'isSelectingRange']),
  selectedRangeCoors: state.getIn(['sheet', 'selectedRangeCoors']),
});

const mapDispatchToProps = {
  setCellValue,
  setEditValue,
  startEditingCell,
  stopEditing,
  clearCell,
  setSelectedCell,
  moveSelectedCellUp,
  moveSelectedCellDown,
  moveSelectedCellLeft,
  moveSelectedCellRight,
  setSelectedRange,
  startSelectingRange,
  stopSelectingRange,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
