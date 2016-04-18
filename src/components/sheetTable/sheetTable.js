import styles from './sheetTable.css';

import React, {PropTypes} from 'react';

import {isMatchingCoors, isCoorInRange, positivizeRange} from '../../utils/sheetUtils';
import SheetCell from './sheetCell';

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
    this.props.documentMouseUp();
  }

  render() {
    const props = this.props;

    return (
      <table
        tabIndex="0"
        className={styles.sheetTable}
        onKeyDown={event => {
          // Key events don't reach here from within the editable cell input field
          if (event.key === 'Enter') {
            if (event.shiftKey) {
              props.tableKeyShiftEnter();
            } else {
              props.tableKeyEnter();
            }
          } else if (event.key === 'Tab') {
            event.preventDefault();
            if (event.shiftKey) {
              props.tableKeyShiftTab();
            } else {
              props.tableKeyTab();
            }
          } else if (event.key === 'Backspace' || event.key === 'Delete') {
            event.preventDefault();
            props.tableKeyDelete();
          } else if (event.key === 'Escape') {
            props.tableKeyEsc();
          } else if (event.key === 'ArrowUp') {
            if ((event.metaKey || event.ctrlKey) && event.shiftKey) {
              props.tableKeyCmdShiftUp();
            } else if (event.metaKey || event.ctrlKey) {
              props.tableKeyCmdUp();
            } else if (event.shiftKey) {
              props.tableKeyShiftUp();
            } else {
              props.tableKeyUp();
            }
          } else if (event.key === 'ArrowDown') {
            if ((event.metaKey || event.ctrlKey) && event.shiftKey) {
              props.tableKeyCmdShiftDown();
            } else if (event.metaKey || event.ctrlKey) {
              props.tableKeyCmdDown();
            } else if (event.shiftKey) {
              props.tableKeyShiftDown();
            } else {
              props.tableKeyDown();
            }
          } else if (event.key === 'ArrowLeft') {
            if ((event.metaKey || event.ctrlKey) && event.shiftKey) {
              props.tableKeyCmdShiftLeft();
            } else if (event.metaKey || event.ctrlKey) {
              event.preventDefault();
              props.tableKeyCmdLeft();
            } else if (event.shiftKey) {
              props.tableKeyShiftLeft();
            } else {
              props.tableKeyLeft();
            }
          } else if (event.key === 'ArrowRight') {
            if ((event.metaKey || event.ctrlKey) && event.shiftKey) {
              props.tableKeyCmdShiftRight();
            } else if (event.metaKey || event.ctrlKey) {
              event.preventDefault();
              props.tableKeyCmdRight();
            } else if (event.shiftKey) {
              props.tableKeyShiftRight();
            } else {
              props.tableKeyRight();
            }
          } else if (event.keyCode === 65 && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            props.tableKeyCmdA();
          } else if (
            event.key !== 'Control' &&
            event.key !== 'Alt' &&
            event.key !== 'Shift' &&
            event.key !== 'Escape' &&
            !event.metaKey
          ) {
            props.tableKeyOther();
          }
        }}
        ref={table => {
          if (table && props.sheet.get('editMode') === 'none') {
            table.focus();
          }
        }}
      >
        <tbody>
          <tr>
            <th></th>
            {
              props.rowHeaderData.map((cell, cellIndex) => (
                <th scope="col" key={cellIndex}>{cell}</th>
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
                        isInRange={isCoorInRange(cellCoor, positivizeRange(props.sheet.get('selectedRange').toJS()))}
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
