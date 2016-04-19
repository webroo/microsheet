import {expect} from 'chai';

import * as reactUtils from './reactUtils';

describe('reactUtils', () => {
  describe('.classNames()', () => {
    const {classNames} = reactUtils;

    it('should return an empty string if the object is empty', () => {
      const nameMap = {};
      expect(classNames(nameMap)).to.equal('');
    });

    it('should return an empty string if all values are falsy', () => {
      const nameMap = {
        two: false,
        four: 0,
        six: '',
      };
      expect(classNames(nameMap)).to.equal('');
    });

    it('should return a string of class names if all values are truthy', () => {
      const nameMap = {
        one: true,
        three: 1,
        five: 'yes',
      };
      expect(classNames(nameMap)).to.equal('one three five');
    });

    it('should include truthy values and exclude falsy values', () => {
      const nameMap = {
        one: true,
        two: false,
        three: 1,
        four: 0,
        five: 'yes',
        six: '',
      };
      expect(classNames(nameMap)).to.equal('one three five');
    });

    it('should be able to use computed key values', () => {
      const number1 = 'one';
      const number2 = 'two';
      const number3 = 'three';
      const nameMap = {
        [number1]: true,
        [number2]: false,
        [`${number3}`]: true,
      };
      expect(classNames(nameMap)).to.equal('one three');
    });
  });
});
