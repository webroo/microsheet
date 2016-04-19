import Immutable from 'immutable';
import {expect} from 'chai';

import reducer, * as actions from './sheetReducer';

describe('sheetReducer', () => {
  describe('actions', () => {
    it('should create an action to change the primary selected coordinate', () => {
      const expectedAction = {
        type: actions.CHANGED_PRIMARY_SELECTED_COOR,
        coor: [0, 0],
      };
      expect(actions.changedPrimarySelectedCoor([0, 0])).to.eql(expectedAction);
    });

    it('should create an action to start selecting a range', () => {
      const expectedAction = {
        type: actions.STARTED_SELECTING_RANGE,
        mode: 'basic',
        coor: [0, 0],
      };
      expect(actions.startedSelectingRange('basic', [0, 0])).to.eql(expectedAction);
    });

    it('should create an action to stop selecting a range', () => {
      const expectedAction = {
        type: actions.STOPPED_SELECTING_RANGE,
      };
      expect(actions.stoppedSelectingRange('basic', [0, 0])).to.eql(expectedAction);
    });

    it('should create an action to change the start of the selected range', () => {
      const expectedAction = {
        type: actions.CHANGED_SELECTED_RANGE_START,
        coor: [0, 0],
      };
      expect(actions.changedSelectedRangeStart([0, 0])).to.eql(expectedAction);
    });

    it('should create an action to change the end of the selected range', () => {
      const expectedAction = {
        type: actions.CHANGED_SELECTED_RANGE_END,
        coor: [0, 0],
      };
      expect(actions.changedSelectedRangeEnd([0, 0])).to.eql(expectedAction);
    });

    it('should create an action to change the selected range', () => {
      const expectedAction = {
        type: actions.CHANGED_SELECTED_RANGE,
        mode: 'basic',
        range: [[0, 0], [1, 1]],
      };
      expect(actions.changedSelectedRange('basic', [[0, 0], [1, 1]])).to.eql(expectedAction);
    });

    it('should create an action to start editing a cell', () => {
      const expectedAction = {
        type: actions.STARTED_EDITING_CELL,
        mode: 'full',
        coor: [0, 0],
      };
      expect(actions.startedEditingCell('full', [0, 0])).to.eql(expectedAction);
    });

    it('should create an action to commit the edited cell value', () => {
      const expectedAction = {
        type: actions.COMMITTED_EDIT_VALUE,
      };
      expect(actions.committedEditValue()).to.eql(expectedAction);
    });

    it('should create an action to discard the edited cell value', () => {
      const expectedAction = {
        type: actions.DISCARDED_EDIT_VALUE,
      };
      expect(actions.discardedEditValue()).to.eql(expectedAction);
    });

    it('should create an action to delete the range', () => {
      const expectedAction = {
        type: actions.DELETED_RANGE,
        range: [[0, 0], [1, 1]],
      };
      expect(actions.deletedRange([[0, 0], [1, 1]])).to.eql(expectedAction);
    });

    it('should create an action to update the edit value', () => {
      const expectedAction = {
        type: actions.UPDATED_EDIT_VALUE,
        value: 'foo',
      };
      expect(actions.updatedEditValue('foo')).to.eql(expectedAction);
    });

    it('should create an action to update the edit value caret position', () => {
      const expectedAction = {
        type: actions.UPDATED_EDIT_VALUE_CARET_POS,
        pos: 1,
      };
      expect(actions.updatedEditValueCaretPos(1)).to.eql(expectedAction);
    });
  });

  describe('reducer', () => {
    it('should return the initial state', () => {
      const expectedState = Immutable.fromJS({
        data: [
          [{raw: '', val: ''}, {raw: '', val: ''}, {raw: '', val: ''}],
          [{raw: '', val: ''}, {raw: '', val: ''}, {raw: '', val: ''}],
          [{raw: '', val: ''}, {raw: '', val: ''}, {raw: '', val: ''}],
          [{raw: '', val: ''}, {raw: '', val: ''}, {raw: '', val: ''}],
          [{raw: '', val: ''}, {raw: '', val: ''}, {raw: '', val: ''}],
          [{raw: '', val: ''}, {raw: '', val: ''}, {raw: '', val: ''}],
          [{raw: '', val: ''}, {raw: '', val: ''}, {raw: '', val: ''}],
          [{raw: '', val: ''}, {raw: '', val: ''}, {raw: '', val: ''}],
          [{raw: '', val: ''}, {raw: '', val: ''}, {raw: '', val: ''}],
          [{raw: '', val: ''}, {raw: '', val: ''}, {raw: '', val: ''}],
          [{raw: '', val: ''}, {raw: '', val: ''}, {raw: '', val: ''}],
          [{raw: '', val: ''}, {raw: '', val: ''}, {raw: '', val: ''}],
        ],

        primarySelectedCoor: [undefined, undefined],

        selectionMode: 'none',
        selectedRange: [[undefined, undefined], [undefined, undefined]],
        isSelectingRange: false,

        editMode: 'none',
        editCoor: [null, null],
        editValue: '',
        editValueCaretPos: 0,
        isEditValueDirty: false,

        formulaValue: '',
        formulaValueInsertPos: 0,
      });
      const actualState = reducer(undefined, {});
      expect(actualState).to.eql(expectedState);
    });

    describe('CHANGED_PRIMARY_SELECTED_COOR', () => {
      it('should update the primarySelectedCoor', () => {
        const actualState = reducer(undefined, actions.changedPrimarySelectedCoor([2, 2]));
        expect(actualState.get('primarySelectedCoor')).to.eql(Immutable.fromJS([2, 2]));
      });

      it('should clamp the new coordinate within the bounds of the table', () => {
        const actualState = reducer(undefined, actions.changedPrimarySelectedCoor([100, -100]));
        expect(actualState.get('primarySelectedCoor')).to.eql(Immutable.fromJS([11, 0]));
      });
    });

    describe('STARTED_SELECTING_RANGE', () => {
      it('should set the basic mode and range', () => {
        const actualState = reducer(undefined, actions.startedSelectingRange('basic', [2, 2]));
        expect(actualState.get('isSelectingRange')).to.be.true;
        expect(actualState.get('selectionMode')).to.equal('basic');
        expect(actualState.get('selectedRange')).to.eql(Immutable.fromJS([[2, 2], [2, 2]]));
      });

      it('should set the autofill mode and range', () => {
        const actualState = reducer(undefined, actions.startedSelectingRange('autofill', [2, 2]));
        expect(actualState.get('isSelectingRange')).to.be.true;
        expect(actualState.get('selectionMode')).to.equal('autofill');
        expect(actualState.get('selectedRange')).to.eql(Immutable.fromJS([[2, 2], [2, 2]]));
      });

      it('should set the formula mode and range', () => {
        const actualState = reducer(undefined, actions.startedSelectingRange('formula', [2, 2]));
        expect(actualState.get('isSelectingRange')).to.be.true;
        expect(actualState.get('selectionMode')).to.equal('formula');
        expect(actualState.get('selectedRange')).to.eql(Immutable.fromJS([[2, 2], [2, 2]]));
      });

      it('should take a copy of the editValue and editValueCaretPos for formula ranges', () => {
        let actualState = reducer(undefined, {});
        actualState = actualState
          .set('editValue', 'foo')
          .set('editValueCaretPos', 100);
        actualState = reducer(actualState, actions.startedSelectingRange('formula', [2, 2]));
        expect(actualState.get('formulaValue')).to.equal('foo');
        expect(actualState.get('formulaValueInsertPos')).to.equal(100);
      });
    });

    describe('STOPPED_SELECTING_RANGE', () => {
      it('should reset the selection mode', () => {
        const actualState = reducer(undefined, actions.stoppedSelectingRange());
        expect(actualState.get('isSelectingRange')).to.be.false;
      });

      it('should swap an autofilled range to a basic range', () => {
        let actualState = reducer(undefined, actions.startedSelectingRange('autofill', [0, 0]));
        actualState = reducer(actualState, actions.changedSelectedRangeEnd([2, 0]));
        actualState = reducer(actualState, actions.stoppedSelectingRange());
        expect(actualState.get('isSelectingRange')).to.be.false;
        expect(actualState.get('selectionMode')).to.equal('basic');
        expect(actualState.get('selectedRange')).to.eql(Immutable.fromJS([[0, 0], [2, 0]]));
      });
    });

    describe('CHANGED_SELECTED_RANGE', () => {
      it('should change the basic selected mode and range', () => {
        const actualState = reducer(undefined, actions.changedSelectedRange('basic', [[0, 0], [1, 1]]));
        expect(actualState.get('selectionMode')).to.equal('basic');
        expect(actualState.get('selectedRange')).to.eql(Immutable.fromJS([[0, 0], [1, 1]]));
      });

      it('should clamp the basic selected range within the bounds of the table', () => {
        const actualState = reducer(undefined, actions.changedSelectedRange('basic', [[-1, -1], [100, 100]]));
        expect(actualState.get('selectedRange')).to.eql(Immutable.fromJS([[0, 0], [11, 2]]));
      });

      it('should change the formula selected mode and range', () => {
        const actualState = reducer(undefined, actions.changedSelectedRange('formula', [[0, 0], [1, 1]]));
        expect(actualState.get('selectionMode')).to.equal('formula');
        expect(actualState.get('selectedRange')).to.eql(Immutable.fromJS([[0, 0], [1, 1]]));
      });

      it('should clamp the formula selected range within the bounds of the table', () => {
        const actualState = reducer(undefined, actions.changedSelectedRange('formula', [[-1, -1], [100, 100]]));
        expect(actualState.get('selectedRange')).to.eql(Immutable.fromJS([[0, 0], [11, 2]]));
      });

      it('should insert the selected range into the editValue', () => {
        const actualState = reducer(undefined, actions.changedSelectedRange('formula', [[0, 0], [1, 1]]));
        expect(actualState.get('editValue')).to.equal('A1:B2');
      });

      it('should change the autofill selected mode and range', () => {
        const actualState = reducer(undefined, actions.changedSelectedRange('autofill', [[0, 0], [1, 0]]));
        expect(actualState.get('selectionMode')).to.equal('autofill');
        expect(actualState.get('selectedRange')).to.eql(Immutable.fromJS([[0, 0], [1, 0]]));
      });

      it('should clamp the autofill selected range within the bounds of the table', () => {
        const actualState = reducer(undefined, actions.changedSelectedRange('autofill', [[-1, 0], [100, 0]]));
        expect(actualState.get('selectedRange')).to.eql(Immutable.fromJS([[0, 0], [11, 0]]));
      });

      it('should clamp the autofill selected range vertically if more vertical cells are selected', () => {
        const actualState = reducer(undefined, actions.changedSelectedRange('autofill', [[0, 0], [2, 1]]));
        expect(actualState.get('selectedRange')).to.eql(Immutable.fromJS([[0, 0], [2, 0]]));
      });

      it('should clamp the autofill selected range horizontally if more horizontal cells are selected', () => {
        const actualState = reducer(undefined, actions.changedSelectedRange('autofill', [[0, 0], [1, 2]]));
        expect(actualState.get('selectedRange')).to.eql(Immutable.fromJS([[0, 0], [0, 2]]));
      });
    });

    describe('CHANGED_SELECTED_RANGE_START', () => {
      it('should only change the start value of the selected range', () => {
        let actualState = reducer(undefined, actions.changedSelectedRange('basic', [[0, 0], [0, 0]]));
        actualState = reducer(actualState, actions.changedSelectedRangeStart([1, 1]));
        expect(actualState.get('selectedRange')).to.eql(Immutable.fromJS([[1, 1], [0, 0]]));
      });
    });

    describe('CHANGED_SELECTED_RANGE_END', () => {
      it('should only change the end value of the selected range', () => {
        let actualState = reducer(undefined, actions.changedSelectedRange('basic', [[0, 0], [0, 0]]));
        actualState = reducer(actualState, actions.changedSelectedRangeEnd([1, 1]));
        expect(actualState.get('selectedRange')).to.eql(Immutable.fromJS([[0, 0], [1, 1]]));
      });
    });

    describe('STARTED_EDITING_CELL', () => {
      it('should set the edit properties', () => {
        const actualState = reducer(undefined, actions.startedEditingCell('full', [1, 1]));
        expect(actualState.get('editMode')).to.equal('full');
        expect(actualState.get('editCoor')).to.eql(Immutable.fromJS([1, 1]));
        expect(actualState.get('isEditValueDirty')).to.be.false;
      });

      it('should set copy the cell raw value into the editValue', () => {
        let actualState = reducer(undefined, {});
        actualState = actualState.setIn(['data', 0, 0, 'raw'], 'foo');
        actualState = reducer(actualState, actions.startedEditingCell('full', [0, 0]));
        expect(actualState.get('editValue')).to.equal('foo');
      });
    });

    describe('UPDATED_EDIT_VALUE', () => {
      it('should update the edit value and set the dirty flag to true', () => {
        const actualState = reducer(undefined, actions.updatedEditValue('foo'));
        expect(actualState.get('editValue')).to.equal('foo');
        expect(actualState.get('isEditValueDirty')).to.be.true;
      });
    });

    describe('UPDATED_EDIT_VALUE_CARET_POS', () => {
      it('should update the caret position and set the dirty flag to true', () => {
        const actualState = reducer(undefined, actions.updatedEditValueCaretPos(100));
        expect(actualState.get('editValueCaretPos')).to.equal(100);
        expect(actualState.get('isEditValueDirty')).to.be.true;
      });
    });

    describe('COMMITTED_EDIT_VALUE', () => {
      it('should save the editValue into the cell raw value', () => {
        let actualState = reducer(undefined, actions.startedEditingCell('full', [0, 0]));
        actualState = reducer(actualState, actions.updatedEditValue('foo'));
        actualState = reducer(actualState, actions.committedEditValue());
        expect(actualState.getIn(['data', 0, 0, 'raw'])).to.equal('foo');
      });

      it('should unset and clear all the edit properties', () => {
        let actualState = reducer(undefined, actions.startedEditingCell('full', [0, 0]));
        actualState = reducer(actualState, actions.committedEditValue());
        expect(actualState.get('editMode')).to.equal('none');
        expect(actualState.get('editCoor')).to.eql(Immutable.fromJS([undefined, undefined]));
        expect(actualState.get('editValue')).to.equal('');
        expect(actualState.get('isEditValueDirty')).to.be.false;
      });
    });

    describe('DISCARDED_EDIT_VALUE', () => {
      it('should not save the editValue into the cell raw value', () => {
        let actualState = reducer(undefined, actions.startedEditingCell('full', [0, 0]));
        actualState = reducer(actualState, actions.updatedEditValue('foo'));
        actualState = reducer(actualState, actions.discardedEditValue());
        expect(actualState.getIn(['data', 0, 0, 'raw'])).to.equal('');
      });

      it('should unset and clear all the edit properties', () => {
        let actualState = reducer(undefined, actions.startedEditingCell('full', [0, 0]));
        actualState = reducer(actualState, actions.discardedEditValue());
        expect(actualState.get('editMode')).to.equal('none');
        expect(actualState.get('editCoor')).to.eql(Immutable.fromJS([undefined, undefined]));
        expect(actualState.get('editValue')).to.equal('');
        expect(actualState.get('isEditValueDirty')).to.be.false;
      });
    });

    describe('DELETED_RANGE', () => {
      it('should clear the raw cell values from all cells within the range', () => {
        let actualState = reducer(undefined, {});
        actualState = actualState.setIn(['data', 0, 0, 'raw'], 'foo');
        actualState = actualState.setIn(['data', 1, 1, 'raw'], 'bar');
        actualState = actualState.setIn(['data', 2, 2, 'raw'], 'qux'); // outside the deletion range
        actualState = reducer(actualState, actions.deletedRange([[0, 0], [1, 1]]));
        expect(actualState.getIn(['data', 0, 0, 'raw'])).to.equal('');
        expect(actualState.getIn(['data', 1, 1, 'raw'])).to.equal('');
        expect(actualState.getIn(['data', 2, 2, 'raw'])).to.equal('qux');
      });
    });
  });
});
