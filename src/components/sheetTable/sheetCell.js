import styles from './sheetTable.css';

import React, {PropTypes} from 'react';

import {classNames} from '../../utils/reactUtils';
import {
  isNumber,
  isFormula,
  absoluteRange,
  rangeSize,
  isCoorAtTopEdgeOfRange,
  isCoorAtBottomEdgeOfRange,
  isCoorAtLeftEdgeOfRange,
  isCoorAtRightEdgeOfRange,
} from '../../utils/sheetUtils';

const SheetCell = props => {
  const isAutofilling = props.selectionMode === 'autofill' && props.isInRange;
  const isInsertingFormulaRange = props.selectionMode === 'formula' && props.isInRange;

  const currentSelectionRange = absoluteRange(props.selectedRange.toJS());

  const cssClass = classNames({
    [styles.selected]: props.isPrimaryCell,
    [styles.editing]: props.isEditing,
    [styles.rangeSelected]: props.isInRange && rangeSize(props.selectedRange.toJS()) > 1,
    [styles.number]: isNumber(props.cellData.get('val')),
    [styles.insertionSelected]: isInsertingFormulaRange,
    [styles.autofillSelected]: isAutofilling,
    [styles.topEdge]: isCoorAtTopEdgeOfRange(props.cellCoor, currentSelectionRange),
    [styles.bottomEdge]: isCoorAtBottomEdgeOfRange(props.cellCoor, currentSelectionRange),
    [styles.leftEdge]: isCoorAtLeftEdgeOfRange(props.cellCoor, currentSelectionRange),
    [styles.rightEdge]: isCoorAtRightEdgeOfRange(props.cellCoor, currentSelectionRange),
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
            props.updatedEditValue(event.target.value);
          }}
          onSelect={event => {
            props.updatedEditValueCaretPos(event.target.selectionStart);
          }}
          // onBlur={event => {}}
          onKeyDown={event => {
            // This only allows the following keys to bubble up to the table above
            if (
              event.key !== 'ArrowUp' &&
              event.key !== 'ArrowDown' &&
              event.key !== 'ArrowLeft' &&
              event.key !== 'ArrowRight' &&
              event.key !== 'Enter' &&
              event.key !== 'Tab' &&
              event.key !== 'Escape'
            ) {
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
};

export default SheetCell;
