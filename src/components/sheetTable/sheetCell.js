import Immutable from 'immutable';
import React, {PropTypes} from 'react';

const SheetCell = ({
  cellData,
  coor,
  isEditing,
  onEditFocus,
  onLoseFocus,
  onValueChange,
}) => {
  return (
    <td>
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
              // input.focus();
              input.select();
            }
          }}
        />
        :
        <span onDoubleClick={() => onEditFocus(coor)}>{cellData.get('val')}</span>
      }
    </td>
  );
};

SheetCell.propTypes = {
  cellData: PropTypes.instanceOf(Immutable.Map).isRequired,
  coor: PropTypes.array.isRequired,
  isEditing: PropTypes.bool.isRequired,
  onEditFocus: PropTypes.func.isRequired,
  onLoseFocus: PropTypes.func.isRequired,
  onValueChange: PropTypes.func.isRequired,
};

export default SheetCell;
