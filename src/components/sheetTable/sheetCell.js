import styles from './sheetTable.css';

import Immutable from 'immutable';
import React, {PropTypes} from 'react';

import {classNames} from '../../utils/reactUtils';
import {
  isNumber,
  isFormula,
  isMatchingCoors,
  isCoorInRange,
  positivizeRange,
  rangeSize,
  translateCoor,
  isValidFormulaSymbol,
  isTopEdgeOfRange,
  isBottomEdgeOfRange,
  isLeftEdgeOfRange,
  isRightEdgeOfRange,
} from '../../utils/sheetUtils';

const SheetCell = ({
  cellData,
  cellCoor,
  primarySelectedCoor,
  selectedRangeCoors,
  selectedRangeMode,
  isSelectingRange,
  editingCellCoor,
  editingCellValue,
  editMode,
  isEditingValueDirty,
  editingCellCaretPos,

  setEditValue,
  setEditingCellCaretPos,
  setCellValue,
  stopEditing,
  setPrimarySelectedCoor,
  startSelectingRange,
  setSelectedRange,
  stopSelectingRange,
  startEditingCell,
}) => {
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
    [styles.number]: isNumber(cellData.get('val')),
    [styles.insertionSelected]: isInsertingFormulaRange,
    [styles.autofillSelected]: isAutofilling,
    [styles.topEdge]: isTopEdgeOfRange(currentSelectionRange, cellCoor),
    [styles.bottomEdge]: isBottomEdgeOfRange(currentSelectionRange, cellCoor),
    [styles.leftEdge]: isLeftEdgeOfRange(currentSelectionRange, cellCoor),
    [styles.rightEdge]: isRightEdgeOfRange(currentSelectionRange, cellCoor),
  });

  return (
    isEditing ?
      <td className={cssClass}>
        <input
          type="text"
          className={classNames({
            [styles.number]: isNumber(cellData.get('val')),
            [styles.formula]: isFormula(cellData.get('raw')),
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
              if (event.shiftKey) {
                setPrimarySelectedCoor(translateCoor(primarySelectedCoor.toJS(), [0, -1]));
              } else {
                setPrimarySelectedCoor(translateCoor(primarySelectedCoor.toJS(), [0, 1]));
              }
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
          startEditingCell('full', cellCoor);
        }}
      >
        <span>{cellData.get('val')}</span>
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
};

SheetCell.propTypes = {
  cellData: PropTypes.instanceOf(Immutable.Map).isRequired,
  cellCoor: PropTypes.array.isRequired,
  primarySelectedCoor: PropTypes.instanceOf(Immutable.List).isRequired,
  selectedRangeCoors: PropTypes.instanceOf(Immutable.List).isRequired,
  selectedRangeMode: PropTypes.string.isRequired,
  isSelectingRange: PropTypes.bool.isRequired,
  editingCellCoor: PropTypes.instanceOf(Immutable.List).isRequired,
  editingCellValue: PropTypes.string.isRequired,
  editMode: PropTypes.string.isRequired,
  isEditingValueDirty: PropTypes.bool.isRequired,
  editingCellCaretPos: PropTypes.number.isRequired,
  setEditValue: PropTypes.func.isRequired,
  setEditingCellCaretPos: PropTypes.func.isRequired,
  setCellValue: PropTypes.func.isRequired,
  stopEditing: PropTypes.func.isRequired,
  setPrimarySelectedCoor: PropTypes.func.isRequired,
  startSelectingRange: PropTypes.func.isRequired,
  setSelectedRange: PropTypes.func.isRequired,
  stopSelectingRange: PropTypes.func.isRequired,
  startEditingCell: PropTypes.func.isRequired,
};

export default SheetCell;
