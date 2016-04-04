import styles from './sheetTable.css';

import Immutable from 'immutable';
import React, {PropTypes} from 'react';

import {classNames} from '../../utils/reactUtils';

const SheetCell = ({
  cellData,
  coor,
  isSelected,
  isEditing,
  onEditFocus,
  onSelectFocus,
  onLoseFocus,
  onValueChange,
}) => {
  return (
    <td
      className={classNames({
        [styles.selected]: isSelected,
        [styles.editing]: isEditing,
      })}
    >
      {
        isEditing
        ?
        <input
          type="text"
          defaultValue={cellData.get('raw')}
          onBlur={event => {
            onValueChange(coor, event.target.value);
            onLoseFocus('blur', coor);
          }}
          onKeyDown={event => {
            event.stopPropagation();
            if (event.key === 'Enter') {
              onValueChange(coor, event.target.value);
              onLoseFocus('enter', coor);
            } else if (event.key === 'Escape') {
              onLoseFocus('escape', coor);
            } else if (event.key === 'Tab') {
              event.preventDefault();
              onValueChange(coor, event.target.value);
              onLoseFocus('tab', coor);
            } else if (event.key === 'ArrowUp') {
              onValueChange(coor, event.target.value);
              onLoseFocus('up', coor);
            } else if (event.key === 'ArrowDown') {
              onValueChange(coor, event.target.value);
              onLoseFocus('down', coor);
            } else if (event.key === 'ArrowLeft') {
              onValueChange(coor, event.target.value);
              onLoseFocus('left', coor);
            } else if (event.key === 'ArrowRight') {
              onValueChange(coor, event.target.value);
              onLoseFocus('right', coor);
            }
          }}
          ref={input => {
            if (input && isEditing) {
              input.focus();
              input.select();
            }
          }}
        />
        :
        <div
          onMouseDown={() => onSelectFocus(coor)}
          onDoubleClick={() => onEditFocus(coor)}
        >
          {
            cellData.get('val')
          }
        </div>
      }
    </td>
  );
};

SheetCell.propTypes = {
  cellData: PropTypes.instanceOf(Immutable.Map).isRequired,
  coor: PropTypes.array.isRequired,
  isSelected: PropTypes.bool.isRequired,
  isEditing: PropTypes.bool.isRequired,
  onEditFocus: PropTypes.func.isRequired,
  onSelectFocus: PropTypes.func.isRequired,
  onLoseFocus: PropTypes.func.isRequired,
  onValueChange: PropTypes.func.isRequired,
};

export default SheetCell;
