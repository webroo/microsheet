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
            onLoseFocus(coor);
          }}
          onKeyUp={event => {
            if (event.keyCode === 13) {
              onValueChange(coor, event.target.value);
              onLoseFocus(coor);
            } else if (event.keyCode === 27) {
              onLoseFocus(coor);
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
        <span
          onClick={() => onSelectFocus(coor)}
          onDoubleClick={() => onEditFocus(coor)}
        >
          {
            cellData.get('val')
          }
        </span>
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
