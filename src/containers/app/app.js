import Immutable from 'immutable';
import {connect} from 'react-redux';
import React, {PropTypes} from 'react';

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
} from '../../reducers/sheetReducer';

import {rowHeaderSelector, colHeaderSelector} from '../../selectors/sheetSelector';
import SheetTable from '../../components/sheetTable/sheetTable';

const App = props => {
  return (
    <SheetTable {...props} />
  );
};

App.propTypes = {
  sheetData: PropTypes.instanceOf(Immutable.List).isRequired,
  rowHeaderData: PropTypes.instanceOf(Immutable.List).isRequired,
  colHeaderData: PropTypes.instanceOf(Immutable.List).isRequired,
  isEditingCell: PropTypes.bool,
  isQuickEditing: PropTypes.bool,
  editingCellCoor: PropTypes.instanceOf(Immutable.List).isRequired,
  editingCellValue: PropTypes.any,
  isEditingValueDirty: PropTypes.bool,
  isCellSelected: PropTypes.bool,
  selectedCellCoor: PropTypes.instanceOf(Immutable.List).isRequired,
  setCellValue: PropTypes.func.isRequired,
  setEditValue: PropTypes.func.isRequired,
  startEditingCell: PropTypes.func.isRequired,
  stopEditing: PropTypes.func.isRequired,
  clearCell: PropTypes.func.isRequired,
  setSelectedCell: PropTypes.func.isRequired,
  moveSelectedCellUp: PropTypes.func.isRequired,
  moveSelectedCellDown: PropTypes.func.isRequired,
  moveSelectedCellLeft: PropTypes.func.isRequired,
  moveSelectedCellRight: PropTypes.func.isRequired,
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
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
