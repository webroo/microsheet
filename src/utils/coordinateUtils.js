export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Creates an empty coordinate, with undefined for both values.
 * @return {Array}
 */
export const createEmptyCoor = () => [undefined, undefined];

/**
 * Creates an empty range, with undefined for all values.
 * @return {Array}
 */
export const createEmptyRange = () => [[undefined, undefined], [undefined, undefined]];

/**
 * Returns true if the coordinate is valid (i.e. not empty)
 * @param  {Array}   coor Coordinate
 * @return {Boolean}
 */
export const isValidCoor = coor => (
  coor[0] !== undefined && coor[1] !== undefined
);

/**
 * Returns true if the range is valid (i.e. not empty)
 * @param  {Array}   range Range
 * @return {Boolean}
 */
export const isValidRange = range => (
  isValidCoor(range[0]) && isValidCoor(range[1])
);

/**
 * Returns true if the two coordinates match
 * @param  {Array}   coorA First coordinate
 * @param  {Array}   coorB Second coordinate
 * @return {Boolean}
 */
export const isMatchingCoors = (coorA, coorB) => (
  coorA[0] === coorB[0] && coorA[1] === coorB[1]
);

/**
 * Returns true if the coordinate is within the range
 * @param  {Array}   coor  Coordinate
 * @param  {Array}   range Range
 * @return {Boolean}
 */
export const isCoorInRange = (coor, range) => (
  coor[0] >= range[0][0] &&
  coor[0] <= range[1][0] &&
  coor[1] >= range[0][1] &&
  coor[1] <= range[1][1]
);

/**
 * Returns an address from a coordinate, eg: [0, 0] --> 'A1'
 * Note: the row address is one-based, whereas the row coordinate is zero-based
 * @param  {Array}  coor Coordinate, eg [0, 0]
 * @return {String}      Address, eg 'A1'
 */
export const getAddrFromCoor = coor => `${ALPHABET[coor[1]]}${coor[0] + 1}`;

/**
 * Returns a coordinate from an address, eg: 'A1' -- > [0, 0]
 * Note: the row address is one-based, whereas the row coordinate is zero-based
 * @param  {String} addr Address, eg: 'A1'
 * @return {Array}       Coordinate, eg: [0, 0]
 */
export const getCoorFromAddr = addr => {
  const rowIndex = parseInt(addr.substring(1)) - 1;
  const cellIndex = ALPHABET.indexOf(addr.charAt(0)) > -1 ? ALPHABET.indexOf(addr.charAt(0)) : undefined;
  return [rowIndex, cellIndex];
};

/**
 * Returns a positive version of the range, eg: [[2, 2], [0, 0]] --> [[0, 0], [2, 2]]
 * @param  {Array} range Range
 * @return {Array}
 */
export const absoluteRange = range => (
  [
    [Math.min(range[0][0], range[1][0]), Math.min(range[0][1], range[1][1])],
    [Math.max(range[0][0], range[1][0]), Math.max(range[0][1], range[1][1])],
  ]
);

/**
 * Returns the size of the range, defined by the number of cells within it.
 * @param  {Array}  range Range
 * @return {Number}
 */
export const rangeSize = range => {
  const absRange = absoluteRange(range);
  return (absRange[1][0] - absRange[0][0] + 1) * // Row size
         (absRange[1][1] - absRange[0][1] + 1);  // Col size
};

/**
 * Returns an address range from a coordinate range, eg: [[0, 0], [1, 1]] --> 'A1:B2'
 * Note: ranges with a size of zero are returned as a single address.
 * @param  {Array} coorRange Range
 * @return {String}
 */
export const getAddrRangeFromCoorRange = coorRange => (
  rangeSize(coorRange) === 1
    ? getAddrFromCoor(coorRange[0])
    : getAddrFromCoor(coorRange[0]) + ':' + getAddrFromCoor(coorRange[1])
);

/**
 * Returns a coordinate range from an address range, eg: 'A1:B2' --> [[0, 0], [1, 1]]
 * @param  {Array} coorRange Range
 * @return {String}
 */
export const getCoorRangeFromAddrRange = addrRange => {
  if (addrRange.indexOf(':') === -1) {
    return [getCoorFromAddr(addrRange), getCoorFromAddr(addrRange)];
  }
  const [startAddr, endAddr] = addrRange.split(':');
  return [getCoorFromAddr(startAddr), getCoorFromAddr(endAddr)];
};

/**
 * Moves the coordinate to within the closest bounds of the given range
 * @param  {Array} coor  Coordinate
 * @param  {Array} range Range
 * @return {Array}       The new clamped coordinate
 */
export const clampCoorToRange = (coor, range) => {
  const absRange = absoluteRange(range);
  return [
    Math.min(Math.max(coor[0], absRange[0][0]), absRange[1][0]),
    Math.min(Math.max(coor[1], absRange[0][1]), absRange[1][1]),
  ];
};

/**
 * Moves the range within the closest bounds of the other range
 * @param  {Array} range Range to clamp
 * @param  {Array} range Boundary range
 * @return {Array}       The new clamped range
 */
export const clampRangeToRange = (rangeA, rangeB) => (
  [
    clampCoorToRange(rangeA[0], rangeB),
    clampCoorToRange(rangeA[1], rangeB),
  ]
);

/**
 * Expands a range into an array of all the coordinates contained within the range
 * eg: [[0,0], [1,1]] --> [[0,0], [0,1], [1,0], [1,1]]
 * This is useful for iterating over all coordinates within a range.
 * @param  {Array} range Range
 * @return {Array}
 */
export const expandCoorRange = range => {
  const absRange = absoluteRange(range);
  const expandedRange = [];
  for (let rowIndex = absRange[0][0]; rowIndex <= absRange[1][0]; rowIndex++) {
    for (let cellIndex = absRange[0][1]; cellIndex <= absRange[1][1]; cellIndex++) {
      expandedRange.push([rowIndex, cellIndex]);
    }
  }
  return expandedRange;
};

/**
 * Expands an address into a string of all the addresses contained within the range
 * eg: 'A1:B2' --> 'A1,B1,A2,B2'
 * @param  {Array} range Range
 * @return {Array}
 */
export const expandAddrRange = addrRange => {
  const coorRange = getCoorRangeFromAddrRange(addrRange);
  const expandedRange = expandCoorRange(coorRange).map(coor => getAddrFromCoor(coor));
  return expandedRange.join(',');
};

export const isCoorAtTopEdgeOfRange = (coor, range) => (
  isCoorInRange(coor, range) && coor[0] === range[0][0]
);

export const isCoorAtBottomEdgeOfRange = (coor, range) => (
  isCoorInRange(coor, range) && coor[0] === range[1][0]
);

export const isCoorAtLeftEdgeOfRange = (coor, range) => (
  isCoorInRange(coor, range) && coor[1] === range[0][1]
);

export const isCoorAtRightEdgeOfRange = (coor, range) => (
  isCoorInRange(coor, range) && coor[1] === range[1][1]
);

export const translateCoor = (coorA, coorB) => (
  [coorA[0] + coorB[0], coorA[1] + coorB[1]]
);

export const translationIdentities = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1],
};
