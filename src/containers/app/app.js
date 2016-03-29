import Immutable from 'immutable';
import {connect} from 'react-redux';
import React, {PropTypes} from 'react';

import {rowHeaderSelector, colHeaderSelector} from '../../selectors/sheetSelector';
import SheetTable from '../../components/sheetTable/sheetTable';

const App = ({sheetData, rowHeaderData, colHeaderData}) => (
  <SheetTable sheetData={sheetData} rowHeaderData={rowHeaderData} colHeaderData={colHeaderData} />
);

App.propTypes = {
  sheetData: PropTypes.instanceOf(Immutable.List).isRequired,
  rowHeaderData: PropTypes.instanceOf(Immutable.List).isRequired,
  colHeaderData: PropTypes.instanceOf(Immutable.List).isRequired,
};

const mapStateToProps = state => ({
  sheetData: state.get('sheet'),
  rowHeaderData: rowHeaderSelector(state.get('sheet')),
  colHeaderData: colHeaderSelector(state.get('sheet')),
});

export default connect(mapStateToProps)(App);
