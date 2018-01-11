import styles from './sheetTable.css';

import React, {PropTypes} from 'react';

import {isMatchingCoors, isCoorInRange, absoluteRange} from '../../utils/coordinateUtils';
import handleKeys, {isModifierKey} from '../../utils/handleKeys';
import SheetCell from './sheetCell';

class SheetTable extends React.Component {
  constructor(props) {
    super(props);

    this.onDocumentMouseUp = this.onDocumentMouseUp.bind(this);

    // A key press can have multiple side-effects on the table depending on it's current state.
    // The sheetReducerThunks are responsible for making the right decision and dispatching the appropriate actions.
    this.hotkeyHandler = handleKeys({
      'enter': props.tableKeyEnter,
      'shift+enter': props.tableKeyShiftEnter,
      'tab': {callback: props.tableKeyTab, preventDefault: true},
      'shift+tab': {callback: props.tableKeyShiftTab, preventDefault: true},
      'backspace': {callback: props.tableKeyDelete, preventDefault: true},
      'del': props.tableKeyDelete,
      'esc': props.tableKeyEsc,
      'up': props.tableKeyUp,
      'shift+up': props.tableKeyShiftUp,
      'mod+up': props.tableKeyCmdUp,
      'mod+shift+up': props.tableKeyCmdShiftUp,
      'down': props.tableKeyDown,
      'shift+down': props.tableKeyShiftDown,
      'mod+down': props.tableKeyCmdDown,
      'mod+shift+down': props.tableKeyCmdShiftDown,
      'left': props.tableKeyLeft,
      'shift+left': props.tableKeyShiftLeft,
      'mod+left': {callback: props.tableKeyCmdLeft, preventDefault: true},
      'mod+shift+left': props.tableKeyCmdShiftLeft,
      'right': props.tableKeyRight,
      'shift+right': props.tableKeyShiftRight,
      'mod+right': {callback: props.tableKeyCmdRight, preventDefault: true},
      'mod+shift+right': props.tableKeyCmdShiftRight,
      'mod+a': {callback: props.tableSelectAll, preventDefault: true},
      'mod+z': props.tableUndo,
      'mod+shift+z': props.tableRedo,
    });
  }

  componentDidMount() {
    document.addEventListener('mouseup', this.onDocumentMouseUp);
  }

  componentWillUnmount() {
    document.removeEventListener('mouseup', this.onDocumentMouseUp);
  }

  onDocumentMouseUp() {
    this.props.documentMouseUp();
  }

  onTableKeyDown(event) {
    const handled = this.hotkeyHandler(event);

    // If the keypress wasn't a hotkey then we want to start quick editing the cell, but only if
    // the key press wasn't a modifier or escape key.
    if (!handled && !isModifierKey(event) && !event.metaKey && !event.ctrlKey && event.key !== 'Escape') {
      this.props.tableKeyOther();
    }
  }

  onUpdateTableRef(table) {
    // Everytime the table is re-rendered we ensure it's given DOM focus so the hotkeys will work.
    // The only exception is when we're in edit mode, in which case the cell's input field has focus.
    if (table && this.props.sheet.get('editMode') === 'none') {
      table.focus();
    }
  }

  render() {
    const props = this.props;

    return (
      <table
        tabIndex="0"
        className={styles.sheetTable}
        onKeyDown={event => this.onTableKeyDown(event)}
        ref={table => this.onUpdateTableRef(table)}
      >
        <tbody>
          <tr>
            <th></th>
            {
              props.rowHeaderData.map((cellLabel, cellIndex) => (
                <th scope="col" key={cellIndex}>{cellLabel}</th>
              ))
            }
          </tr>
          {
            props.sheet.get('data').map((row, rowIndex) => (
              <tr key={rowIndex}>
                <th scope="row">{props.colHeaderData.get(rowIndex)}</th>
                {
                  row.map((cellData, cellIndex) => {
                    const cellCoor = [rowIndex, cellIndex];
                    return (
                      <SheetCell
                        key={cellIndex}
                        cellData={cellData}
                        cellCoor={cellCoor}

                        isPrimaryCell={isMatchingCoors(cellCoor, props.sheet.get('primarySelectedCoor').toJS())}
                        isEditing={isMatchingCoors(cellCoor, props.sheet.get('editCoor').toJS())}
                        isInRange={isCoorInRange(cellCoor, absoluteRange(props.sheet.get('selectedRange').toJS()))}
                        selectionMode={props.sheet.get('selectionMode')}
                        selectedRange={props.sheet.get('selectedRange')}
                        editMode={props.sheet.get('editMode')}
                        editValue={props.sheet.get('editValue')}
                        isEditValueDirty={props.sheet.get('isEditValueDirty')}

                        cellMouseDown={props.cellMouseDown}
                        cellMouseOver={props.cellMouseOver}
                        cellMouseUp={props.cellMouseUp}
                        cellShiftMouseDown={props.cellShiftMouseDown}
                        cellDoubleClick={props.cellDoubleClick}
                        autofillMouseDown={props.autofillMouseDown}
                        autofillMouseUp={props.autofillMouseUp}
                        updatedEditValue={props.updatedEditValue}
                        updatedEditValueCaretPos={props.updatedEditValueCaretPos}
                      />
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

export default SheetTable;
