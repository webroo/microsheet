import styles from './sheetTable.css';

import Immutable from 'immutable';
import React, {PropTypes} from 'react';

import {
  isNumber,
  isMatchingCoors,
  isCoorInRange,
  isFormula,
  isValidFormulaSymbol,
  positivizeRange,
  isTopEdgeOfRange,
  isBottomEdgeOfRange,
  isLeftEdgeOfRange,
  isRightEdgeOfRange,
  translateCoor,
  translateRange,
  rangeSize,
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
      selectedRangeMode,
      editMode,
      editingCellCoor,
      editingCellValue,
      editingCellCaretPos,
      isEditingValueDirty,
      primarySelectedCoor,
      setCellValue,
      setEditValue,
      startEditingCell,
      stopEditing,
      deleteRange,
      setEditingCellCaretPos,
      setPrimarySelectedCoor,
      selectedRangeCoors,
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
            startEditingCell('full', primarySelectedCoor.toJS());
          } else if (event.key === 'Tab') {
            event.preventDefault();
            if (event.shiftKey) {
              setPrimarySelectedCoor(translateCoor(primarySelectedCoor.toJS(), [0, -1]));
            } else {
              setPrimarySelectedCoor(translateCoor(primarySelectedCoor.toJS(), [0, 1]));
            }
          } else if (event.key === 'Backspace' || event.key === 'Delete') {
            event.preventDefault();
            if (selectedRangeMode === 'basic') {
              deleteRange(selectedRangeCoors.toJS());
            } else {
              deleteRange([primarySelectedCoor.toJS(), primarySelectedCoor.toJS()]);
            }
          } else if (event.key === 'ArrowUp') {
            if (event.shiftKey) {
              setSelectedRange(selectedRangeMode, translateRange(selectedRangeCoors.toJS(), [[0, 0], [-1, 0]]));
            } else {
              setPrimarySelectedCoor(translateCoor(primarySelectedCoor.toJS(), [-1, 0]));
            }
          } else if (event.key === 'ArrowDown') {
            if (event.shiftKey) {
              setSelectedRange(selectedRangeMode, translateRange(selectedRangeCoors.toJS(), [[0, 0], [1, 0]]));
            } else {
              setPrimarySelectedCoor(translateCoor(primarySelectedCoor.toJS(), [1, 0]));
            }
          } else if (event.key === 'ArrowLeft') {
            if (event.shiftKey) {
              setSelectedRange(selectedRangeMode, translateRange(selectedRangeCoors.toJS(), [[0, 0], [0, -1]]));
            } else {
              setPrimarySelectedCoor(translateCoor(primarySelectedCoor.toJS(), [0, -1]));
            }
          } else if (event.key === 'ArrowRight') {
            if (event.shiftKey) {
              setSelectedRange(selectedRangeMode, translateRange(selectedRangeCoors.toJS(), [[0, 0], [0, 1]]));
            } else {
              setPrimarySelectedCoor(translateCoor(primarySelectedCoor.toJS(), [0, 1]));
            }
          } else if (
            event.key !== 'Control' &&
            event.key !== 'Alt' &&
            event.key !== 'Shift' &&
            !event.metaKey
          ) {
            startEditingCell('quick', primarySelectedCoor.toJS());
          }
        }}
        ref={table => {
          if (table && editMode === 'none') {
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
                    const isSelected = isMatchingCoors(cellCoor, primarySelectedCoor.toJS());
                    const isEditing = isMatchingCoors(cellCoor, editingCellCoor.toJS());
                    const isInRange = isCoorInRange(cellCoor, positivizeRange(selectedRangeCoors.toJS()));
                    const isAutofilling = selectedRangeMode === 'autofill' && isInRange;
                    const isInsertingFormulaRange = selectedRangeMode === 'formula' && isInRange;

                    const currentSelectionRange = positivizeRange(selectedRangeCoors.toJS());

                    const cssClass = classNames({
                      [styles.selected]: isSelected,
                      [styles.editing]: isEditing,
                      [styles.rangeSelected]: isInRange && rangeSize(selectedRangeCoors.toJS()) > 1,
                      [styles.number]: isNumber(cell.get('val')),
                      [styles.insertionSelected]: isInsertingFormulaRange,
                      [styles.autofillSelected]: isAutofilling,
                      [styles.topEdge]: isTopEdgeOfRange(currentSelectionRange, cellCoor),
                      [styles.bottomEdge]: isBottomEdgeOfRange(currentSelectionRange, cellCoor),
                      [styles.leftEdge]: isLeftEdgeOfRange(currentSelectionRange, cellCoor),
                      [styles.rightEdge]: isRightEdgeOfRange(currentSelectionRange, cellCoor),
                    });

                    return (
                      isEditing ?
                        <td key={cellIndex} className={cssClass}>
                          <input
                            type="text"
                            className={classNames({
                              [styles.number]: isNumber(cell.get('val')),
                              [styles.formula]: isFormula(cell.get('raw')),
                            })}
                            value={editingCellValue}
                            onChange={event => {
                              setEditValue(event.target.value);
                            }}
                            onSelect={event => {
                              setEditingCellCaretPos(event.target.selectionStart);
                            }}
                            onBlur={event => {
                              setCellValue(cellCoor, event.target.value);
                              stopEditing();
                            }}
                            onKeyDown={event => {
                              event.stopPropagation();
                              if (event.key === 'Enter') {
                                setCellValue(cellCoor, event.target.value);
                                stopEditing();
                                if (event.shiftKey) {
                                  setPrimarySelectedCoor(translateCoor(primarySelectedCoor.toJS(), [-1, 0]));
                                } else {
                                  setPrimarySelectedCoor(translateCoor(primarySelectedCoor.toJS(), [1, 0]));
                                }
                              } else if (event.key === 'Escape') {
                                event.preventDefault();
                                stopEditing();
                              } else if (event.key === 'Tab') {
                                event.preventDefault();
                                setCellValue(cellCoor, event.target.value);
                                stopEditing();
                                setPrimarySelectedCoor(translateCoor(primarySelectedCoor.toJS(), [0, 1]));
                              }

                              if (editMode === 'quick') {
                                if (event.key === 'ArrowUp') {
                                  setCellValue(cellCoor, event.target.value);
                                  stopEditing();
                                  setPrimarySelectedCoor(translateCoor(primarySelectedCoor.toJS(), [-1, 0]));
                                } else if (event.key === 'ArrowDown') {
                                  setCellValue(cellCoor, event.target.value);
                                  stopEditing();
                                  setPrimarySelectedCoor(translateCoor(primarySelectedCoor.toJS(), [1, 0]));
                                } else if (event.key === 'ArrowLeft') {
                                  setCellValue(cellCoor, event.target.value);
                                  stopEditing();
                                  setPrimarySelectedCoor(translateCoor(primarySelectedCoor.toJS(), [0, -1]));
                                } else if (event.key === 'ArrowRight') {
                                  setCellValue(cellCoor, event.target.value);
                                  stopEditing();
                                  setPrimarySelectedCoor(translateCoor(primarySelectedCoor.toJS(), [0, 1]));
                                }
                              }
                            }}
                            ref={input => {
                              if (input && !isEditingValueDirty) {
                                input.focus();
                                if (editMode === 'quick') {
                                  // Select all the text
                                  input.select();
                                } else {
                                  // Put the caret at the end of the text
                                  input.setSelectionRange(input.value.length, input.value.length);
                                }
                              }
                            }}
                          />
                        </td>
                        :
                        <td
                          key={cellIndex}
                          className={cssClass}
                          onMouseDown={event => {
                            if (
                              editMode !== 'none' &&
                              isFormula(editingCellValue) &&
                              isValidFormulaSymbol(editingCellValue.charAt(editingCellCaretPos - 1))
                            ) {
                              event.preventDefault();
                              startSelectingRange('formula');
                              setSelectedRange('formula', [cellCoor, cellCoor]);
                            } else if (event.shiftKey) {
                              setSelectedRange(selectedRangeMode, [selectedRangeCoors.toJS()[0], cellCoor]);
                            } else {
                              setPrimarySelectedCoor(cellCoor);
                              startSelectingRange('basic');
                            }
                          }}
                          onMouseUp={() => {
                            if (isSelectingRange) {
                              stopSelectingRange();
                            }
                          }}
                          onMouseOver={() => {
                            if (isSelectingRange) {
                              setSelectedRange(selectedRangeMode, [selectedRangeCoors.toJS()[0], cellCoor]);
                            }
                          }}
                          onDoubleClick={() => {
                            startEditingCell(cellCoor);
                          }}
                        >
                          <span>{cell.get('val')}</span>
                          {
                            isSelected && rangeSize(selectedRangeCoors.toJS()) === 1 ?
                              <div
                                className={styles.autofillHandle}
                                onMouseDown={event => {
                                  event.stopPropagation();
                                  startSelectingRange('autofill');
                                }}
                                onMouseUp={event => {
                                  event.stopPropagation();
                                  stopSelectingRange();
                                }}
                              ></div>
                            :
                              null
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
  selectedRangeMode: PropTypes.string.isRequired,
  editMode: PropTypes.string.isRequired,
  editingCellCoor: PropTypes.instanceOf(Immutable.List).isRequired,
  editingCellValue: PropTypes.any,
  editingCellCaretPos: PropTypes.number,
  isEditingValueDirty: PropTypes.bool,
  primarySelectedCoor: PropTypes.instanceOf(Immutable.List).isRequired,
  setCellValue: PropTypes.func.isRequired,
  setEditValue: PropTypes.func.isRequired,
  startEditingCell: PropTypes.func.isRequired,
  stopEditing: PropTypes.func.isRequired,
  deleteRange: PropTypes.func.isRequired,
  setEditingCellCaretPos: PropTypes.func.isRequired,
  setPrimarySelectedCoor: PropTypes.func.isRequired,
  selectedRangeCoors: PropTypes.instanceOf(Immutable.List).isRequired,
  isSelectingRange: PropTypes.bool.isRequired,
  setSelectedRange: PropTypes.func.isRequired,
  startSelectingRange: PropTypes.func.isRequired,
  stopSelectingRange: PropTypes.func.isRequired,
};

export default SheetTable;
