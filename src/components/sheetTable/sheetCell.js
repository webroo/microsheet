import React, {PropTypes} from 'react';

// prefer-stateless-function
const SheetCell = ({
  value,
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
          defaultValue={value}
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
        <span onDoubleClick={() => onEditFocus(coor)}>{value}</span>
      }
    </td>
  );
};

SheetCell.propTypes = {
  value: PropTypes.string.isRequired,
  coor: PropTypes.array.isRequired,
  isEditing: PropTypes.bool.isRequired,
  onEditFocus: PropTypes.func.isRequired,
  onLoseFocus: PropTypes.func.isRequired,
  onValueChange: PropTypes.func.isRequired,
};

export default SheetCell;
