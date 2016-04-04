import styles from './sheetTable.css';

import Immutable from 'immutable';
import React, {PropTypes} from 'react';

import SheetCell from './sheetCell';

const SheetTable = ({
  sheetData,
  rowHeaderData,
  colHeaderData,
  selectedCoor,
  editingCoor,
  onEditingCoorChange,
  onSelectCoorChange,
  onMoveSelectedCoor,
  onCellValueChange,
}) => {
  return (
    <table
      tabIndex="0"
      className={styles.sheetTable}
      onKeyDown={event => {
        const directions = {ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right'};
        if (Object.keys(directions).includes(event.key)) {
          onMoveSelectedCoor(directions[event.key]);
        } else if (event.key === 'Enter') {
          onEditingCoorChange(selectedCoor.toJS());
        } else if (event.key === 'Backspace' || event.key === 'Delete') {
          event.preventDefault();
          onCellValueChange(selectedCoor.toJS(), '');
        } else {
          // Turn on quick edit mode, so the user can move to the next cell by simply pressing the arrow keys
          onEditingCoorChange(selectedCoor.toJS(), true);
        }
      }}
      ref={table => {
        if (table && (editingCoor.get(0) === null && editingCoor.get(1) === null)) {
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
                    isSelected={rowIndex === selectedCoor.get(0) && cellIndex === selectedCoor.get(1)}
                    isEditing={rowIndex === editingCoor.get(0) && cellIndex === editingCoor.get(1)}
                    onEditFocus={onEditingCoorChange}
                    onSelectFocus={onSelectCoorChange}
                    onLoseFocus={type => {
                      onEditingCoorChange([null, null]);
                      if (type === 'enter') {
                        onMoveSelectedCoor('down');
                      } else if (type === 'tab') {
                        onMoveSelectedCoor('right');
                      } else if (type === 'up') {
                        onMoveSelectedCoor('up');
                      } else if (type === 'down') {
                        onMoveSelectedCoor('down');
                      } else if (type === 'left') {
                        onMoveSelectedCoor('left');
                      } else if (type === 'right') {
                        onMoveSelectedCoor('right');
                      }
                    }}
                    onValueChange={onCellValueChange}
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
  selectedCoor: PropTypes.instanceOf(Immutable.List).isRequired,
  editingCoor: PropTypes.instanceOf(Immutable.List).isRequired,
  onEditingCoorChange: PropTypes.func.isRequired,
  onSelectCoorChange: PropTypes.func.isRequired,
  onMoveSelectedCoor: PropTypes.func.isRequired,
  onCellValueChange: PropTypes.func.isRequired,
};

export default SheetTable;
