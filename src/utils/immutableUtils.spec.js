import Immutable from 'immutable';
import {expect} from 'chai';
import {spy} from 'sinon';

import {combineImmutableReducers} from './immutableUtils';

describe('immutableUtils', () => {
  describe('combineImmutableReducers()', () => {
    let reducer1;
    let reducer2;
    let combinedReducer;

    beforeEach(() => {
      reducer1 = spy((state = 1) => state);
      reducer2 = spy((state = 2) => state);
      combinedReducer = combineImmutableReducers({
        reducer1,
        reducer2,
      });
    });

    it('should combine the child reducers into a function that returns an Immutable Map', () => {
      expect(combinedReducer).to.be.function;
      expect(combinedReducer()).to.be.instanceOf(Immutable.Map);
    });

    it('should pass through the state slice and action to the child reducers', () => {
      combinedReducer(undefined, {type: 'FOO'});
      expect(reducer1.calledWith(undefined, {type: 'FOO'})).to.be.true;
      expect(reducer2.calledWith(undefined, {type: 'FOO'})).to.be.true;
    });

    it('should return the default states for each child reducer when initialised', () => {
      const result = combinedReducer(undefined, {type: 'FOO'});
      expect(result).to.eql(Immutable.fromJS({
        reducer1: 1,
        reducer2: 2,
      }));
    });
  });
});
