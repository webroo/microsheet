import styles from './sheetTable.css';

import Immutable from 'immutable';
import React, {PropTypes} from 'react';

const SheetTable = ({sheetData, rowHeaderData, colHeaderData}) => {
  return (
    <table className={styles.sheetTable}>
      <tbody>
        <tr>
          <th></th>
          {
            rowHeaderData.map((cell, cellIndex) => (
              <th scope="col" key={cellIndex}>{cell}</th>
            ))
          }
        </tr>
        {
          sheetData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <th scope="row">{colHeaderData.get(rowIndex)}</th>
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
  rowHeaderData: PropTypes.instanceOf(Immutable.List).isRequired,
  colHeaderData: PropTypes.instanceOf(Immutable.List).isRequired,
};

export default SheetTable;
