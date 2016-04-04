import styles from './sheetTable.css';

import Immutable from 'immutable';
import React, {PropTypes} from 'react';

import {isMatchingCoors} from '../../utils/sheetUtils';
import {classNames} from '../../utils/reactUtils';

const SheetTable = ({
  sheetData,
  rowHeaderData,
  colHeaderData,
  isEditingCell,
  isQuickEditing,
  editingCellCoor,
  editingCellValue,
  isEditingValueDirty,
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
        // Key events don't reach here from within the editable cell input field
        if (event.key === 'Enter') {
          startEditingCell(selectedCellCoor.toJS());
        } else if (event.key === 'Tab') {
          event.preventDefault();
          moveSelectedCellRight();
        } else if (event.key === 'Backspace' || event.key === 'Delete') {
          event.preventDefault();
          clearCell(selectedCellCoor.toJS());
        } else if (event.key === 'ArrowUp') {
          moveSelectedCellUp();
        } else if (event.key === 'ArrowDown') {
          moveSelectedCellDown();
        } else if (event.key === 'ArrowLeft') {
          moveSelectedCellLeft();
        } else if (event.key === 'ArrowRight') {
          moveSelectedCellRight();
        } else {
          startEditingCell(selectedCellCoor.toJS(), true);
        }
      }}
      ref={table => {
        if (table && !isEditingCell) {
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
                row.map((cell, cellIndex) => {
                  const cellCoor = [rowIndex, cellIndex];
                  const isSelected = isMatchingCoors(cellCoor, selectedCellCoor.toJS());
                  const isEditing = isMatchingCoors(cellCoor, editingCellCoor.toJS());
                  const cssClass = classNames({
                    [styles.selected]: isSelected,
                    [styles.editing]: isEditing,
                  });

                  return (
                    <td key={cellIndex} className={cssClass}>
                      {
                        isEditing ?
                          <input
                            type="text"
                            value={editingCellValue}
                            onChange={event => setEditValue(event.target.value)}
                            onBlur={() => {
                              setCellValue(cellCoor, editingCellValue);
                              stopEditing();
                            }}
                            onKeyDown={event => {
                              event.stopPropagation();
                              if (event.key === 'Enter') {
                                setCellValue(cellCoor, editingCellValue);
                                stopEditing();
                                moveSelectedCellDown();
                              } else if (event.key === 'Escape') {
                                event.preventDefault();
                                stopEditing();
                              } else if (event.key === 'Tab') {
                                event.preventDefault();
                                setCellValue(cellCoor, editingCellValue);
                                stopEditing();
                                moveSelectedCellRight();
                              }

                              if (isQuickEditing) {
                                if (event.key === 'ArrowUp') {
                                  setCellValue(cellCoor, editingCellValue);
                                  stopEditing();
                                  moveSelectedCellUp();
                                } else if (event.key === 'ArrowDown') {
                                  setCellValue(cellCoor, editingCellValue);
                                  stopEditing();
                                  moveSelectedCellDown();
                                } else if (event.key === 'ArrowLeft') {
                                  setCellValue(cellCoor, editingCellValue);
                                  stopEditing();
                                  moveSelectedCellLeft();
                                } else if (event.key === 'ArrowRight') {
                                  setCellValue(cellCoor, editingCellValue);
                                  stopEditing();
                                  moveSelectedCellRight();
                                }
                              }
                            }}
                            ref={input => {
                              if (input && !isEditingValueDirty) {
                                input.focus();
                                input.select();
                              }
                            }}
                          />
                        :
                        <div
                          onMouseDown={() => setSelectedCell(cellCoor)}
                          onDoubleClick={() => startEditingCell(cellCoor)}
                        >
                          {cell.get('val')}
                        </div>
                      }
                    </td>
                  );
                })
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

export default SheetTable;
