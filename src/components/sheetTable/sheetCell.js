import styles from './sheetTable.css';

import React, {PropTypes} from 'react';

import {classNames} from '../../utils/reactUtils';
import {canCoerceToNumber, isFormula} from '../../utils/sheetUtils';
import {
  absoluteRange,
  rangeSize,
  isCoorAtTopEdgeOfRange,
  isCoorAtBottomEdgeOfRange,
  isCoorAtLeftEdgeOfRange,
  isCoorAtRightEdgeOfRange,
} from '../../utils/coordinateUtils';

const SheetCell = props => {
  const isAutofilling = props.selectionMode === 'autofill' && props.isInRange;
  const isInsertingFormulaRange = props.selectionMode === 'formula' && props.isInRange;
  const currentSelectionRange = absoluteRange(props.selectedRange.toJS());

  const cssClass = classNames({
    [styles.primary]: props.isPrimaryCell,
    [styles.editing]: props.isEditing,
    [styles.rangeSelected]: props.isInRange && rangeSize(props.selectedRange.toJS()) > 1,
    [styles.number]: canCoerceToNumber(props.cellData.get('val')),
    [styles.insertionSelected]: isInsertingFormulaRange,
    [styles.autofillSelected]: isAutofilling,
    [styles.topEdge]: isCoorAtTopEdgeOfRange(props.cellCoor, currentSelectionRange),
    [styles.bottomEdge]: isCoorAtBottomEdgeOfRange(props.cellCoor, currentSelectionRange),
    [styles.leftEdge]: isCoorAtLeftEdgeOfRange(props.cellCoor, currentSelectionRange),
    [styles.rightEdge]: isCoorAtRightEdgeOfRange(props.cellCoor, currentSelectionRange),
  });

  let cellElement;

  if (props.isEditing) {
    cellElement = (
      <td className={cssClass}>
        <input
          type="text"
          value={props.editValue}
          className={classNames({
            [styles.number]: canCoerceToNumber(props.cellData.get('val')),
            [styles.formula]: isFormula(props.cellData.get('raw')),
          })}
          onChange={event => props.updatedEditValue(event.target.value)}
          onSelect={event => props.updatedEditValueCaretPos(event.target.selectionStart)}
          onKeyDown={event => {
            // The following keys allow the user to break out of cell edit mode, all other key events must be trapped
            if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Tab', 'Escape'].some(key => key === event.key)) {
              event.stopPropagation();
            }
          }}
          ref={input => {
            // This changes the way existing text in the cell is handled as we enter edit mode
            if (input && !props.isEditValueDirty) {
              input.focus();
              if (props.editMode === 'quick') {
                // Select all the text in the input field so that's it's immediately overwritten by the new text
                input.select();
              } else {
                // Put the caret at the end of the text so it can be appended to
                input.setSelectionRange(input.value.length, input.value.length);
              }
            }
          }}
        />
      </td>
    );
  } else {
    cellElement = (
      <td
        className={cssClass}
        onMouseDown={event => {
          // preventDefault keeps the currently editable cell in focus as the user adds cell refs to a formula
          event.preventDefault();
          if (event.shiftKey) {
            props.cellShiftMouseDown(props.cellCoor);
          } else {
            props.cellMouseDown(props.cellCoor);
          }
        }}
        onMouseUp={() => props.cellMouseUp(props.cellCoor)}
        onMouseOver={() => props.cellMouseOver(props.cellCoor)}
        onDoubleClick={() => props.cellDoubleClick(props.cellCoor)}
      >
        <span>{props.cellData.get('val')}</span>
        {
          /* Add an autofill icon if it's the primary cell and no range is selected */
          props.isPrimaryCell && rangeSize(props.selectedRange.toJS()) === 1 ?
            <div
              className={styles.autofillHandle}
              onMouseDown={event => {
                event.stopPropagation();
                props.autofillMouseDown(props.cellCoor);
              }}
              onMouseUp={event => {
                event.stopPropagation();
                props.autofillMouseUp();
              }}
            ></div>
          :
            null
        }
      </td>
    );
  }

  return cellElement;
};

export default SheetCell;
