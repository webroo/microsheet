import Immutable from 'immutable';
import {connect} from 'react-redux';
import React, {PropTypes} from 'react';

import {updateCellValue, changeEditingCoor} from '../../reducers/sheetReducer';
import {rowHeaderSelector, colHeaderSelector} from '../../selectors/sheetSelector';
import SheetTable from '../../components/sheetTable/sheetTable';

const App = ({
  sheetData,
  rowHeaderData,
  colHeaderData,
  editingCoor,
  changeEditingCoor,
  updateCellValue,
}) => {
  return (
    <SheetTable
      sheetData={sheetData}
      rowHeaderData={rowHeaderData}
      colHeaderData={colHeaderData}
      editingCoor={editingCoor}
      onEditingCoorChange={changeEditingCoor}
      onCellValueChange={updateCellValue}
    />
  );
};

App.propTypes = {
  sheetData: PropTypes.instanceOf(Immutable.List).isRequired,
  rowHeaderData: PropTypes.instanceOf(Immutable.List).isRequired,
  colHeaderData: PropTypes.instanceOf(Immutable.List).isRequired,
  editingCoor: PropTypes.instanceOf(Immutable.List).isRequired,
  changeEditingCoor: PropTypes.func.isRequired,
  updateCellValue: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  sheetData: state.getIn(['sheet', 'data']),
  rowHeaderData: rowHeaderSelector(state.get('sheet')),
  colHeaderData: colHeaderSelector(state.get('sheet')),
  editingCoor: state.getIn(['sheet', 'editingCoor']),
});

const mapDispatchToProps = {
  changeEditingCoor,
  updateCellValue,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
