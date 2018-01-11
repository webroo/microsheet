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
      <div className={styles.footer}>
        <a href="https://github.com/webroo/microsheet">github</a>
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  sheet: state.present.get('sheet'),
  rowHeaderData: rowHeaderSelector(state.present.get('sheet')),
  colHeaderData: colHeaderSelector(state.present.get('sheet')),
});

const mapDispatchToProps = {
  updatedEditValue: sheetActions.updatedEditValue,
  updatedEditValueCaretPos: sheetActions.updatedEditValueCaretPos,
  ...sheetThunks
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
