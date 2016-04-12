import styles from './sheetTable.css';

import Immutable from 'immutable';
import React, {PropTypes} from 'react';

import {translateCoor, translateRange} from '../../utils/sheetUtils';
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
    if (this.props.isSelectingRange) {
      this.props.stopSelectingRange();
    }
  }

  render() {
    const {
      sheetData,
      rowHeaderData,
      colHeaderData,
      selectedRangeMode,
      editMode,
      editingCellCoor,
      editingCellValue,
      editingCellCaretPos,
      isEditingValueDirty,
      primarySelectedCoor,
      setCellValue,
      setEditValue,
      startEditingCell,
      stopEditing,
      deleteRange,
      setEditingCellCaretPos,
      setPrimarySelectedCoor,
      selectedRangeCoors,
      isSelectingRange,
      setSelectedRange,
      startSelectingRange,
      stopSelectingRange,
    } = this.props;

    return (
      <table
        tabIndex="0"
        className={styles.sheetTable}
        onKeyDown={event => {
          // Key events don't reach here from within the editable cell input field
          if (event.key === 'Enter') {
            startEditingCell('full', primarySelectedCoor.toJS());
          } else if (event.key === 'Tab') {
            event.preventDefault();
            if (event.shiftKey) {
              setPrimarySelectedCoor(translateCoor(primarySelectedCoor.toJS(), [0, -1]));
            } else {
              setPrimarySelectedCoor(translateCoor(primarySelectedCoor.toJS(), [0, 1]));
            }
          } else if (event.key === 'Backspace' || event.key === 'Delete') {
            event.preventDefault();
            if (selectedRangeMode === 'basic') {
              deleteRange(selectedRangeCoors.toJS());
            } else {
              deleteRange([primarySelectedCoor.toJS(), primarySelectedCoor.toJS()]);
            }
          } else if (event.key === 'ArrowUp') {
            if (event.shiftKey) {
              setSelectedRange(selectedRangeMode, translateRange(selectedRangeCoors.toJS(), [[0, 0], [-1, 0]]));
            } else {
              setPrimarySelectedCoor(translateCoor(primarySelectedCoor.toJS(), [-1, 0]));
            }
          } else if (event.key === 'ArrowDown') {
            if (event.shiftKey) {
              setSelectedRange(selectedRangeMode, translateRange(selectedRangeCoors.toJS(), [[0, 0], [1, 0]]));
            } else {
              setPrimarySelectedCoor(translateCoor(primarySelectedCoor.toJS(), [1, 0]));
            }
          } else if (event.key === 'ArrowLeft') {
            if (event.shiftKey) {
              setSelectedRange(selectedRangeMode, translateRange(selectedRangeCoors.toJS(), [[0, 0], [0, -1]]));
            } else {
              setPrimarySelectedCoor(translateCoor(primarySelectedCoor.toJS(), [0, -1]));
            }
          } else if (event.key === 'ArrowRight') {
            if (event.shiftKey) {
              setSelectedRange(selectedRangeMode, translateRange(selectedRangeCoors.toJS(), [[0, 0], [0, 1]]));
            } else {
              setPrimarySelectedCoor(translateCoor(primarySelectedCoor.toJS(), [0, 1]));
            }
          } else if (
            event.key !== 'Control' &&
            event.key !== 'Alt' &&
            event.key !== 'Shift' &&
            event.key !== 'Escape' &&
            !event.metaKey
          ) {
            startEditingCell('quick', primarySelectedCoor.toJS());
          }
        }}
        ref={table => {
          if (table && editMode === 'none') {
            table.focus();
          }
        }}
      >
        <tbody>
          <tr>
            <th></th>
            {
              rowHeaderData.map((cell, cellIndex) => (
                <th scope="col" key={cellIndex}>{cell}</th>
              ))
            }
          </tr>
          {
            sheetData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <th scope="row">{colHeaderData.get(rowIndex)}</th>
                {
                  row.map((cellData, cellIndex) => (
                    <SheetCell
                      key={cellIndex}
                      cellData={cellData}
                      cellCoor={[rowIndex, cellIndex]}
                      primarySelectedCoor={primarySelectedCoor}
                      selectedRangeCoors={selectedRangeCoors}
                      selectedRangeMode={selectedRangeMode}
                      isSelectingRange={isSelectingRange}
                      editingCellCoor={editingCellCoor}
                      editingCellValue={editingCellValue}
                      editMode={editMode}
                      isEditingValueDirty={isEditingValueDirty}
                      editingCellCaretPos={editingCellCaretPos}

                      setEditValue={setEditValue}
                      setEditingCellCaretPos={setEditingCellCaretPos}
                      setCellValue={setCellValue}
                      stopEditing={stopEditing}
                      setPrimarySelectedCoor={setPrimarySelectedCoor}
                      startSelectingRange={startSelectingRange}
                      setSelectedRange={setSelectedRange}
                      stopSelectingRange={stopSelectingRange}
                      startEditingCell={startEditingCell}
                    />
                  ))
                }
              </tr>
            ))
          }
        </tbody>
      </table>
    );
  }
}

SheetTable.propTypes = {
  sheetData: PropTypes.instanceOf(Immutable.List).isRequired,
  rowHeaderData: PropTypes.instanceOf(Immutable.List).isRequired,
  colHeaderData: PropTypes.instanceOf(Immutable.List).isRequired,
  selectedRangeMode: PropTypes.string.isRequired,
  editMode: PropTypes.string.isRequired,
  editingCellCoor: PropTypes.instanceOf(Immutable.List).isRequired,
  editingCellValue: PropTypes.any,
  editingCellCaretPos: PropTypes.number,
  isEditingValueDirty: PropTypes.bool,
  primarySelectedCoor: PropTypes.instanceOf(Immutable.List).isRequired,
  setCellValue: PropTypes.func.isRequired,
  setEditValue: PropTypes.func.isRequired,
  startEditingCell: PropTypes.func.isRequired,
  stopEditing: PropTypes.func.isRequired,
  deleteRange: PropTypes.func.isRequired,
  setEditingCellCaretPos: PropTypes.func.isRequired,
  setPrimarySelectedCoor: PropTypes.func.isRequired,
  selectedRangeCoors: PropTypes.instanceOf(Immutable.List).isRequired,
  isSelectingRange: PropTypes.bool.isRequired,
  setSelectedRange: PropTypes.func.isRequired,
  startSelectingRange: PropTypes.func.isRequired,
  stopSelectingRange: PropTypes.func.isRequired,
};

export default SheetTable;
