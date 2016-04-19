import {expect} from 'chai';
import {spy} from 'sinon';

import {createReducer} from './reduxUtils';

describe('reduxUtils', () => {
  describe('createReducer()', () => {
    const initialState = 1;
    const actionHandlers = {
      FOO: () => {},
      BAR: () => {},
    };
    const fooSpy = spy(actionHandlers, 'FOO');
    const barSpy = spy(actionHandlers, 'BAR');
    let reducer;

    beforeEach(() => {
      reducer = createReducer(initialState, actionHandlers);
      fooSpy.reset();
      barSpy.reset();
    });

    it('should return a reducer function', () => {
      expect(reducer).to.be.function;
    });

    it('should return the default state when called with undefined', () => {
      const result = reducer(undefined, {});
      expect(result).to.equal(1);
    });

    it('should call the relevant handler when given an action object with the matching type', () => {
      const result = reducer(undefined, {type: 'FOO'});
      expect(fooSpy.called).to.be.true;
      expect(barSpy.called).to.be.false;
    });

    it('should not call any of the handlers when given an action object without the matching type', () => {
      const result = reducer(undefined, {type: 'QUX'});
      expect(fooSpy.called).to.be.false;
      expect(barSpy.called).to.be.false;
    });
  });
});
