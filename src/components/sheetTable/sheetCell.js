import styles from './sheetTable.css';

import React, {PropTypes} from 'react';

import {classNames} from '../../utils/reactUtils';
import {
  isNumber,
  isFormula,
  positivizeRange,
  rangeSize,
  isTopEdgeOfRange,
  isBottomEdgeOfRange,
  isLeftEdgeOfRange,
  isRightEdgeOfRange,
} from '../../utils/sheetUtils';

const SheetCell = props => {
  const isAutofilling = props.selectionMode === 'autofill' && props.isInRange;
  const isInsertingFormulaRange = props.selectionMode === 'formula' && props.isInRange;

  const currentSelectionRange = positivizeRange(props.selectedRange.toJS());

  const cssClass = classNames({
    [styles.selected]: props.isPrimaryCell,
    [styles.editing]: props.isEditing,
    [styles.rangeSelected]: props.isInRange && rangeSize(props.selectedRange.toJS()) > 1,
    [styles.number]: isNumber(props.cellData.get('val')),
    [styles.insertionSelected]: isInsertingFormulaRange,
    [styles.autofillSelected]: isAutofilling,
    [styles.topEdge]: isTopEdgeOfRange(currentSelectionRange, props.cellCoor),
    [styles.bottomEdge]: isBottomEdgeOfRange(currentSelectionRange, props.cellCoor),
    [styles.leftEdge]: isLeftEdgeOfRange(currentSelectionRange, props.cellCoor),
    [styles.rightEdge]: isRightEdgeOfRange(currentSelectionRange, props.cellCoor),
  });

  return (
    props.isEditing ?
      <td className={cssClass}>
        <input
          type="text"
          className={classNames({
            [styles.number]: isNumber(props.cellData.get('val')),
            [styles.formula]: isFormula(props.cellData.get('raw')),
          })}
          value={props.editValue}
          onChange={event => {
            props.updatedInputCellValue(event.target.value);
          }}
          onSelect={event => {
            props.updatedInputCellCaretPos(event.target.selectionStart);
          }}
          // onBlur={event => {}}
          onKeyDown={event => {
            if (event.key === 'Backspace' || event.key === 'Delete') {
              // This prevents the table above from receiving the delete key event, which would
              // attempt to delete the cell
              event.stopPropagation();
            }
          }}
          ref={input => {
            // TODO: might be better to replace this with componentDidMount
            if (input && !props.isEditValueDirty) {
              input.focus();
              if (props.editMode === 'quick') {
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
          // Preventing the event from bubbling keeps the input edit in focus when the user is
          // adding cell refs to a formula
          event.preventDefault();
          if (event.shiftKey) {
            props.cellShiftMouseDown(props.cellCoor);
          } else {
            props.cellMouseDown(props.cellCoor);
          }
        }}
        onMouseUp={() => {
          props.cellMouseUp(props.cellCoor);
        }}
        onMouseOver={() => {
          props.cellMouseOver(props.cellCoor);
        }}
        onDoubleClick={() => {
          props.cellDoubleClick(props.cellCoor);
        }}
      >
        <span>{props.cellData.get('val')}</span>
        {
          props.isPrimaryCell && rangeSize(props.selectedRange.toJS()) === 1 ?
            <div
              className={styles.autofillHandle}
              onMouseDown={event => {
                event.stopPropagation();
                props.autofillMouseDown();
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
};

export default SheetCell;
