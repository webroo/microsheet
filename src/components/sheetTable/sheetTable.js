import styles from './sheetTable.css';

import Immutable from 'immutable';
import React, {PropTypes} from 'react';

import {
  isMatchingCoors,
  isCoorInRange,
  isFormula,
  isValidFormulaSymbol,
} from '../../utils/sheetUtils';
import {classNames} from '../../utils/reactUtils';

class SheetTable extends React.Component {
  constructor(props) {
    super(props);
    this.onDocumentMouseUp = this.onDocumentMouseUp.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mouseup', this.onDocumentMouseUp);
  }

  componentWillUnmount() {
    document.removeEventListener('mouseup', this.onDocumentMouseUp);
  }

  onDocumentMouseUp() {
    if (this.props.isSelectingRange) {
      this.props.stopSelectingRange();
    }
  }

  render() {
    const {
      sheetData,
      rowHeaderData,
      colHeaderData,
      isEditingCell,
      isQuickEditing,
      editingCellCoor,
      editingCellValue,
      editingCellCaretPos,
      isEditingValueDirty,
      selectedCellCoor,
      setCellValue,
      setEditValue,
      startEditingCell,
      stopEditing,
      clearCellRange,
      setEditingCellCaretPos,
      insertCellRefIntoEditValue,
      setSelectedCell,
      moveSelectedCellUp,
      moveSelectedCellDown,
      moveSelectedCellLeft,
      moveSelectedCellRight,
      selectedRangeCoors,
      isRangeSelected,
      isSelectingRange,
      setSelectedRange,
      startSelectingRange,
      stopSelectingRange,
    } = this.props;

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
            if (isRangeSelected) {
              clearCellRange(selectedRangeCoors.toJS());
            } else {
              clearCellRange([selectedCellCoor.toJS(), selectedCellCoor.toJS()]);
            }
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
                    const isInRange = isRangeSelected && isCoorInRange(cellCoor, selectedRangeCoors.toJS());
                    const cssClass = classNames({
                      [styles.selected]: isSelected,
                      [styles.editing]: isEditing,
                      [styles.rangeSelected]: isInRange,
                    });

                    return (
                      <td key={cellIndex} className={cssClass}>
                        {
                          isEditing ?
                            <input
                              type="text"
                              value={editingCellValue}
                              onChange={event => {
                                setEditValue(event.target.value);
                              }}
                              onSelect={event => {
                                setEditingCellCaretPos(event.target.selectionStart);
                              }}
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
                            onMouseDown={event => {
                              if (isEditingCell &&
                                isFormula(editingCellValue) &&
                                isValidFormulaSymbol(editingCellValue.charAt(editingCellCaretPos - 1))
                              ) {
                                event.preventDefault();
                                insertCellRefIntoEditValue(cellCoor);
                              } else {
                                setSelectedCell(cellCoor);
                                startSelectingRange();
                              }
                            }}
                            onMouseUp={() => {
                              if (isSelectingRange) {
                                stopSelectingRange();
                              }
                            }}
                            onMouseOver={() => {
                              if (isSelectingRange) {
                                setSelectedRange([selectedCellCoor.toJS(), cellCoor]);
                              }
                            }}
                            onDoubleClick={() => {
                              startEditingCell(cellCoor);
                            }}
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
  }
}

SheetTable.propTypes = {
  sheetData: PropTypes.instanceOf(Immutable.List).isRequired,
  rowHeaderData: PropTypes.instanceOf(Immutable.List).isRequired,
  colHeaderData: PropTypes.instanceOf(Immutable.List).isRequired,
  isEditingCell: PropTypes.bool,
  isQuickEditing: PropTypes.bool,
  editingCellCoor: PropTypes.instanceOf(Immutable.List).isRequired,
  editingCellValue: PropTypes.any,
  editingCellCaretPos: PropTypes.number,
  isEditingValueDirty: PropTypes.bool,
  isCellSelected: PropTypes.bool,
  selectedCellCoor: PropTypes.instanceOf(Immutable.List).isRequired,
  setCellValue: PropTypes.func.isRequired,
  setEditValue: PropTypes.func.isRequired,
  startEditingCell: PropTypes.func.isRequired,
  stopEditing: PropTypes.func.isRequired,
  clearCellRange: PropTypes.func.isRequired,
  setEditingCellCaretPos: PropTypes.func.isRequired,
  insertCellRefIntoEditValue: PropTypes.func.isRequired,
  setSelectedCell: PropTypes.func.isRequired,
  moveSelectedCellUp: PropTypes.func.isRequired,
  moveSelectedCellDown: PropTypes.func.isRequired,
  moveSelectedCellLeft: PropTypes.func.isRequired,
  moveSelectedCellRight: PropTypes.func.isRequired,
  selectedRangeCoors: PropTypes.instanceOf(Immutable.List).isRequired,
  isRangeSelected: PropTypes.bool.isRequired,
  isSelectingRange: PropTypes.bool.isRequired,
  setSelectedRange: PropTypes.func.isRequired,
  startSelectingRange: PropTypes.func.isRequired,
  stopSelectingRange: PropTypes.func.isRequired,
};

export default SheetTable;
