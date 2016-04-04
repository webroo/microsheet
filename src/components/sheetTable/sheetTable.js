import styles from './sheetTable.css';

import Immutable from 'immutable';
import React, {PropTypes} from 'react';

import SheetCell from './sheetCell';

const SheetTable = ({
  sheetData,
  rowHeaderData,
  colHeaderData,
  isEditingCell,
  isQuickEditing,
  editingCellCoor,
  editingCellValue,
  isCellSelected,
  selectedCellCoor,
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
}) => {
  return (
    <table
      tabIndex="0"
      className={styles.sheetTable}
      onKeyDown={event => {
        if (event.key === 'ArrowUp') {
          moveSelectedCellUp();
        } else if (event.key === 'ArrowDown') {
          moveSelectedCellDown();
        } else if (event.key === 'ArrowLeft') {
          moveSelectedCellLeft();
        } else if (event.key === 'ArrowRight') {
          moveSelectedCellRight();
        } else if (event.key === 'Enter') {
          startEditingCell(selectedCellCoor.toJS());
        } else if (event.key === 'Backspace' || event.key === 'Delete') {
          event.preventDefault();
          console.log('clearCell:', clearCell);
          console.log('selectedCellCoor:', selectedCellCoor.toJS());
          clearCell(selectedCellCoor.toJS());
        } else {
          // Turn on quick edit mode, so the user can move to the next cell by simply pressing the arrow keys
          startEditingCell(selectedCellCoor.toJS(), true);
        }
      }}
      ref={table => {
        if (table && (editingCellCoor.get(0) === null && editingCellCoor.get(1) === null)) {
          table.focus();
        }
      }}
    >
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
                  <SheetCell
                    key={cellIndex}
                    cellData={cell}
                    coor={[rowIndex, cellIndex]}
                    isSelected={rowIndex === selectedCellCoor.get(0) && cellIndex === selectedCellCoor.get(1)}
                    isEditing={rowIndex === editingCellCoor.get(0) && cellIndex === editingCellCoor.get(1)}
                    onEditFocus={startEditingCell}
                    onSelectFocus={setSelectedCell}
                    onLoseFocus={type => {
                      stopEditing();
                      if (type === 'enter') {
                        moveSelectedCellDown();
                      } else if (type === 'tab') {
                        moveSelectedCellRight();
                      } else if (type === 'up') {
                        moveSelectedCellUp();
                      } else if (type === 'down') {
                        moveSelectedCellDown();
                      } else if (type === 'left') {
                        moveSelectedCellLeft();
                      } else if (type === 'right') {
                        moveSelectedCellRight();
                      }
                    }}
                    onValueChange={setCellValue}
                  />
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
  isEditingCell: PropTypes.bool,
  isQuickEditing: PropTypes.bool,
  editingCellCoor: PropTypes.instanceOf(Immutable.List).isRequired,
  editingCellValue: PropTypes.any,
  isCellSelected: PropTypes.bool,
  selectedCellCoor: PropTypes.instanceOf(Immutable.List).isRequired,
  setCellValue: PropTypes.func.isRequired,
  setEditValue: PropTypes.func.isRequired,
  startEditingCell: PropTypes.func.isRequired,
  stopEditing: PropTypes.func.isRequired,
  setSelectedCell: PropTypes.func.isRequired,
  moveSelectedCellUp: PropTypes.func.isRequired,
  moveSelectedCellDown: PropTypes.func.isRequired,
  moveSelectedCellLeft: PropTypes.func.isRequired,
  moveSelectedCellRight: PropTypes.func.isRequired,
};

export default SheetTable;
