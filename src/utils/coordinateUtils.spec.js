import {expect} from 'chai';

import {
  createEmptyCoor,
  createEmptyRange,
  isValidCoor,
  isValidRange,
  isMatchingCoors,
  isCoorInRange,
  getAddrFromCoor,
  getCoorFromAddr,
  absoluteRange,
  rangeSize,
  getAddrRangeFromCoorRange,
  getCoorRangeFromAddrRange,
  clampCoorToRange,
  clampRangeToRange,
  expandCoorRange,
  expandAddrRange,
  isCoorAtTopEdgeOfRange,
  isCoorAtBottomEdgeOfRange,
  isCoorAtLeftEdgeOfRange,
  isCoorAtRightEdgeOfRange,
} from './coordinateUtils';

describe('coordinateUtils', () => {
  describe('.createEmptyCoor()', () => {
    it('should return an empty coor', () => {
      expect(createEmptyCoor()).to.eql([undefined, undefined]);
    });
  });

  describe('.createEmptyRange()', () => {
    it('should return an empty coor', () => {
      expect(createEmptyRange()).to.eql([
        [undefined, undefined],
        [undefined, undefined],
      ]);
    });
  });

  describe('.isValidCoor()', () => {
    it('should return false for a valid coor', () => {
      expect(isValidCoor([0, 0])).to.be.true;
      expect(isValidCoor([1, -1])).to.be.true;
    });

    it('should return false for a valid coor', () => {
      expect(isValidCoor([undefined, undefined])).to.be.false;
      expect(isValidCoor([0, undefined])).to.be.false;
      expect(isValidCoor([undefined, 1])).to.be.false;
    });
  });

  describe('.isValidRange()', () => {
    it('should return false for a valid range', () => {
      expect(isValidRange([[0, 0], [0, 0]])).to.be.true;
      expect(isValidRange([[1, -1], [1, -1]])).to.be.true;
    });

    it('should return false for a valid range', () => {
      expect(isValidRange([
        [undefined, undefined],
        [undefined, undefined],
      ])).to.be.false;

      expect(isValidRange([
        [0, undefined],
        [0, undefined],
      ])).to.be.false;

      expect(isValidRange([
        [undefined, 1],
        [undefined, 1],
      ])).to.be.false;
    });
  });

  describe('.isMatchingCoors()', () => {
    it('should return true for mathcing coordinates', () => {
      expect(isMatchingCoors([0, 0], [0, 0])).to.be.true;
      expect(isMatchingCoors([2, 2], [2, 2])).to.be.true;
    });

    it('should return false for non mathcing coordinates', () => {
      expect(isMatchingCoors([0, 0], [1, 0])).to.be.false;
      expect(isMatchingCoors([2, 1], [2, 2])).to.be.false;
    });
  });

  describe('.isCoorInRange()', () => {
    it('should return true if the coordinate is within the range', () => {
      expect(isCoorInRange(
        [0, 0],
        [[0, 0], [0, 0]])
      ).to.be.true;

      expect(isCoorInRange(
        [2, 4],
        [[1, 3], [3, 6]])
      ).to.be.true;
    });

    it('should return false if the coordinate is outside the range', () => {
      expect(isCoorInRange(
        [1, 0],
        [[0, 0], [0, 0]])
      ).to.be.false;

      expect(isCoorInRange(
        [2, 2],
        [[1, 3], [3, 6]])
      ).to.be.false;
    });
  });

  describe('.getAddrFromCoor()', () => {
    it('should return an address from a coordinate', () => {
      expect(getAddrFromCoor([0, 0])).to.equal('A1');
      expect(getAddrFromCoor([11, 2])).to.equal('C12');
    });
  });

  describe('.getCoorFromAddr()', () => {
    it('should return a coordinate from an address', () => {
      expect(getCoorFromAddr('A1')).to.eql([0, 0]);
      expect(getCoorFromAddr('C12')).to.eql([11, 2]);
    });
  });

  describe('.absoluteRange()', () => {
    it('should return a positively oriented range when given a negative range', () => {
      expect(absoluteRange([[2, 2], [0, 0]])).to.eql([[0, 0], [2, 2]]);
    });

    it('should return a positively oriented range when given a positive range', () => {
      expect(absoluteRange([[0, 0], [2, 2]])).to.eql([[0, 0], [2, 2]]);
    });
  });

  describe('.rangeSize()', () => {
    it('should return the number of cells in a range', () => {
      expect(rangeSize([[0, 0], [0, 0]])).to.equal(1);
      expect(rangeSize([[0, 0], [2, 2]])).to.equal(9);
    });

    it('should return the number of cells in a negative range', () => {
      expect(rangeSize([[2, 2], [0, 0]])).to.equal(9);
    });
  });

  describe('.getAddrRangeFromCoorRange()', () => {
    it('should return a single address from a coordinate range with a size of 1', () => {
      expect(getAddrRangeFromCoorRange([[0, 0], [0, 0]])).to.equal('A1');
      expect(getAddrRangeFromCoorRange([[2, 2], [2, 2]])).to.equal('C3');
    });

    it('should return an address range from a coordinate range with a size > 1', () => {
      expect(getAddrRangeFromCoorRange([[1, 1], [11, 2]])).to.equal('B2:C12');
      expect(getAddrRangeFromCoorRange([[11, 2], [1, 1]])).to.equal('C12:B2');
    });
  });

  describe('.getCoorRangeFromAddrRange()', () => {
    it('should return a coordinate range from a single address', () => {
      expect(getCoorRangeFromAddrRange('A1')).to.eql([[0, 0], [0, 0]]);
      expect(getCoorRangeFromAddrRange('C3')).to.eql([[2, 2], [2, 2]]);
    });

    it('should return a coordinate range from an address range', () => {
      expect(getCoorRangeFromAddrRange('B2:C12')).to.eql([[1, 1], [11, 2]]);
      expect(getCoorRangeFromAddrRange('C12:B2')).to.eql([[11, 2], [1, 1]]);
    });
  });

  describe('.clampCoorToRange()', () => {
    it('should clamp an out-of-bounds coordinate to within the nearest bounds of the range', () => {
      expect(clampCoorToRange(
        [0, 3],
        [[1, 1], [2, 2]]
      )).to.eql([1, 2]);

      expect(clampCoorToRange(
        [3, 0],
        [[1, 1], [2, 2]]
      )).to.eql([2, 1]);
    });

    it('should not change a coordinate that is within the bounds of the range', () => {
      expect(clampCoorToRange(
        [1, 2],
        [[1, 1], [2, 2]]
      )).to.eql([1, 2]);

      expect(clampCoorToRange(
        [1, 1],
        [[0, 0], [3, 3]]
      )).to.eql([1, 1]);
    });
  });

  describe('.clampRangeToRange()', () => {
    it('should clamp an out-of-bounds range to within the nearest bounds of the range', () => {
      expect(clampRangeToRange(
        [[0, 0], [3, 3]],
        [[1, 1], [2, 2]]
      )).to.eql([[1, 1], [2, 2]]);

      expect(clampRangeToRange(
        [[2, 2], [3, 3]],
        [[1, 1], [2, 2]]
      )).to.eql([[2, 2], [2, 2]]);
    });

    it('should not change a range that is within the bounds of the range', () => {
      expect(clampRangeToRange(
        [[1, 1], [1, 1]],
        [[1, 1], [2, 2]]
      )).to.eql([[1, 1], [1, 1]]);

      expect(clampRangeToRange(
        [[2, 2], [2, 2]],
        [[1, 1], [2, 2]]
      )).to.eql([[2, 2], [2, 2]]);
    });
  });

  describe('.expandCoorRange()', () => {
    it('should expand a range into an array of all coordinates inside the range', () => {
      expect(expandCoorRange([[0, 0], [1, 1]]))
        .to.eql([[0, 0], [0, 1], [1, 0], [1, 1]]);
    });

    it('should expand a range with a size of 1 into a array of 1', () => {
      expect(expandCoorRange([[1, 1], [1, 1]]))
        .to.eql([[1, 1]]);
    });
  });

  describe('.expandAddrRange()', () => {
    it('should expand an address range into a string of all the addresses inside the range', () => {
      expect(expandAddrRange('A1:B2'))
        .to.eql('A1,B1,A2,B2');
    });
  });

  describe('.isCoorAtTopEdgeOfRange()', () => {
    it('should return true if the coordinate is at the top edge of the range', () => {
      expect(isCoorAtTopEdgeOfRange([0, 0], [[0, 0], [2, 2]]))
        .to.be.true;
    });

    it('should return false if the coordinate is not at the top edge of the range', () => {
      expect(isCoorAtTopEdgeOfRange([1, 0], [[0, 0], [2, 2]]))
        .to.be.false;
    });

    it('should return false if the coordinate is outside the range', () => {
      expect(isCoorAtTopEdgeOfRange([3, 3], [[0, 0], [2, 2]]))
        .to.be.false;
    });
  });

  describe('.isCoorAtBottomEdgeOfRange()', () => {
    it('should return true if the coordinate is at the top edge of the range', () => {
      expect(isCoorAtBottomEdgeOfRange([2, 0], [[0, 0], [2, 2]]))
        .to.be.true;
    });

    it('should return false if the coordinate is not at the top edge of the range', () => {
      expect(isCoorAtBottomEdgeOfRange([1, 0], [[0, 0], [2, 2]]))
        .to.be.false;
    });

    it('should return false if the coordinate is outside the range', () => {
      expect(isCoorAtBottomEdgeOfRange([3, 3], [[0, 0], [2, 2]]))
        .to.be.false;
    });
  });

  describe('.isCoorAtLeftEdgeOfRange()', () => {
    it('should return true if the coordinate is at the top edge of the range', () => {
      expect(isCoorAtLeftEdgeOfRange([0, 0], [[0, 0], [2, 2]]))
        .to.be.true;
    });

    it('should return false if the coordinate is not at the top edge of the range', () => {
      expect(isCoorAtLeftEdgeOfRange([0, 1], [[0, 0], [2, 2]]))
        .to.be.false;
    });

    it('should return false if the coordinate is outside the range', () => {
      expect(isCoorAtLeftEdgeOfRange([3, 3], [[0, 0], [2, 2]]))
        .to.be.false;
    });
  });

  describe('.isCoorAtRightEdgeOfRange()', () => {
    it('should return true if the coordinate is at the top edge of the range', () => {
      expect(isCoorAtRightEdgeOfRange([0, 2], [[0, 0], [2, 2]]))
        .to.be.true;
    });

    it('should return false if the coordinate is not at the top edge of the range', () => {
      expect(isCoorAtRightEdgeOfRange([0, 1], [[0, 0], [2, 2]]))
        .to.be.false;
    });

    it('should return false if the coordinate is outside the range', () => {
      expect(isCoorAtRightEdgeOfRange([3, 3], [[0, 0], [2, 2]]))
        .to.be.false;
    });
  });
});
