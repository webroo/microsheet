import styles from './sheetTable.css';

import Immutable from 'immutable';
import React, {PropTypes} from 'react';

const SheetTable = ({sheetData}) => {
  return (
    <table className={styles.sheetTable}>
      <tbody>
        {
          sheetData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {
                row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))
              }
            </tr>
          ))
        }
      </tbody>
    </table>
  );
};

SheetTable.propTypes = {
  sheetData: PropTypes.instanceOf(Immutable.List).isRequired,
};

export default SheetTable;
