import Immutable from 'immutable';
import {connect} from 'react-redux';
import React, {PropTypes} from 'react';

import SheetTable from '../../components/sheetTable/sheetTable';

const App = ({sheetData}) => (
  <SheetTable sheetData={sheetData} />
);

App.propTypes = {
  sheetData: PropTypes.instanceOf(Immutable.List).isRequired,
};

const mapStateToProps = state => ({
  sheetData: state.get('sheet'),
});

export default connect(mapStateToProps)(App);
