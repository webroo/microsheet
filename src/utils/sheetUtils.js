export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const isNumber = n => !isNaN(parseFloat(n)) && isFinite(n);

export const coerceStringToNumber = n => (isNumber(n) ? parseFloat(n) : n);

export const createEmptyCoor = () => [undefined, undefined];

export const createEmptyCoorRange = () => [[undefined, undefined], [undefined, undefined]];

export const isValidCoor = coor => (
  coor[0] !== undefined && coor[1] !== undefined
);

export const isValidCoorRange = range => (
  isValidCoor(range[0]) && isValidCoor(range[1])
);

// The row address value is one-based, whereas the coordinate is zero-based
export const getAddrFromCoor = coor => `${ALPHABET[coor[1]]}${coor[0] + 1}`;

export const getCoorFromAddr = addr => {
  // The row address value is one-based, whereas the coordinate is zero-based
  const rowIndex = parseInt(addr.substring(1)) - 1;
  const cellIndex = ALPHABET.indexOf(addr.charAt(0)) > -1 ? ALPHABET.indexOf(addr.charAt(0)) : undefined;
  return [rowIndex, cellIndex];
};

export const getAddrRangeFromCoorRange = coorRange => (
  getAddrFromCoor(coorRange[0]) + ':' + getAddrFromCoor(coorRange[1])
);

export const getCoorRangeFromAddrRange = addrRange => {
  const [startAddr, endAddr] = addrRange.split(':');
  return [getCoorFromAddr(startAddr), getCoorFromAddr(endAddr)];
};

export const isMatchingCoors = (coorA, coorB) => (
  coorA[0] === coorB[0] && coorA[1] === coorB[1]
);

export const isCoorInRange = (coor, range) => (
  coor[0] >= range[0][0] &&
  coor[0] <= range[1][0] &&
  coor[1] >= range[0][1] &&
  coor[1] <= range[1][1]
);

export const positivizeRange = range => (
  [
    [Math.min(range[0][0], range[1][0]), Math.min(range[0][1], range[1][1])],
    [Math.max(range[0][0], range[1][0]), Math.max(range[0][1], range[1][1])],
  ]
);

export const rangeSize = range => {
  const pRange = positivizeRange(range);
  return (pRange[1][0] - pRange[0][0] + 1) * // Row size
         (pRange[1][1] - pRange[0][1] + 1);  // Col size
};

export const translateCoor = (coorA, coorB) => (
  [coorA[0] + coorB[0], coorA[1] + coorB[1]]
);

export const translateRange = (rangeA, rangeB) => (
  [translateCoor(rangeA[0], rangeB[0]), translateCoor(rangeA[1], rangeB[1])]
);

export const clampCoorToRange = (coor, range) => {
  const pRange = positivizeRange(range);
  return [
    Math.min(Math.max(coor[0], pRange[0][0]), pRange[1][0]),
    Math.min(Math.max(coor[1], pRange[0][1]), pRange[1][1]),
  ];
};

export const clampRangeToRange = (rangeA, rangeB) => (
  [
    clampCoorToRange(rangeA[0], rangeB),
    clampCoorToRange(rangeA[1], rangeB),
  ]
);

// Expands a coor range into an array of all the coors contained in the range
// eg: [[0,0],[1,1]] --> [[0,0],[0,1],[1,0],[1,1]]
export const expandCoorRange = range => {
  const pRange = positivizeRange(range);
  const expandedRange = [];
  for (let rowIndex = pRange[0][0]; rowIndex <= pRange[1][0]; rowIndex++) {
    for (let cellIndex = pRange[0][1]; cellIndex <= pRange[1][1]; cellIndex++) {
      expandedRange.push([rowIndex, cellIndex]);
    }
  }
  return expandedRange;
};

// Expands an address range into a comma separated string of all the addresses
// eg: A1:B2 --> A1,B1,A2,B2
export const expandAddrRange = addrRange => {
  const coorRange = getCoorRangeFromAddrRange(addrRange);
  const expandedRange = expandCoorRange(coorRange).map(coor => getAddrFromCoor(coor));
  return expandedRange.join(',');
};

export const isFormula = value => (
  typeof value === 'string' && value.charAt(0) === '='
);

export const isValidFormulaSymbol = char => {
  return /[+\-*/()=,]/.test(char);
};

export const capitalizeExpression = expr => (
  // Only capitalize formula function names and cell addresses (eg: a1, b22, etc)
  expr.replace(/sum|average|[a-z]\d{1,2}/gi, match => match.toUpperCase())
);

export const sanitizeExpression = expr => {
  return expr
    // Remove anything that isn't a valid formula symbol or uppercase A-Z character. All valid
    // formula function names and cell address will have already been capitalized.
    .replace(/[^+\-*/().,:\dA-Z]/g, '')
    // Remove any sequence of A-Z chars of 2 or greater, unless it's a valid formula function name.
    // (Remember, a cell address can only have one letter)
    .replace(/[A-Z]{2,}/g, v => (['SUM', 'AVERAGE'].includes(v) ? v : ''))
    // Expand address ranges like A1:B1 into a comma separated string like A1,B2
    .replace(/[A-Z]\d{1,2}:[A-Z]\d{1,2}/g, v => expandAddrRange(v));
};

export const computeSheet = sheet => {
  // Reduces the nested Immutable List down to an object map where the keys are cell addresses.
  // Cell addresses are prefixed with an underscore symbol. This allows us to create non-underscore
  // counterparts as getters, which will compute expressions.
  const cellMap = sheet.reduce((acc, row, rowIndex) => (
    row.reduce((acc, cell, cellIndex) => {
      acc['_' + getAddrFromCoor([rowIndex, cellIndex])] = cell.get('raw');
      return acc;
    }, acc)
  ), {});

  // Add formula functions to the object, which will be called automatically when eval-ing
  cellMap.SUM = (...values) => values.reduce((a, v) => a + v, 0);
  cellMap.AVERAGE = (...values) => values.reduce((a, v) => a + v, 0) / values.length;

  /* eslint-disable no-new-func */
  const evalFunc = new Function('obj', 'expr', 'with (obj) {return eval(expr)}');
  /* eslint-enable no-new-func */

  let isComputingFormula = false;

  // Create getters for each cell address on the map (without the underscore prefix). The getters
  // will eval the contents of the cell if it's an expression (ie. begins with a '='). This allows
  // forumlas to be computed directly against the cellMap.
  Object.keys(cellMap).forEach(cellKey => {
    Object.defineProperty(cellMap, cellKey.substring(1), {
      get: () => {
        const cellVal = cellMap[cellKey];

        if (isFormula(cellVal)) {
          if (cellVal.length === 1) {
            throw new Error('Empty formula');
          }
          // Remove the starting '=' symbol and sanitize the expression before we evaluate it
          const expr = sanitizeExpression(cellVal.substring(1));

          // Keep track of when we're computing a formula - see comment further down for more info
          isComputingFormula = true;
          const newCellVal = evalFunc(cellMap, expr);
          isComputingFormula = false;

          if (typeof newCellVal === 'undefined') {
            throw new Error('Bad formula');
          }

          return newCellVal;
        }

        // We keep track of when we're computing a formula so that we can ignore string values
        // and return 0 instead, this allows empty cells to be ignored when summing ranges.
        if (isComputingFormula && typeof cellVal === 'string') {
          return 0;
        }

        return cellVal;
      },
    });
  });

  // Copy the computed values back into the exiting sheet
  const newSheet = sheet.map((row, rowIndex) => {
    return row.map((cell, cellIndex) => {
      let computedVal;

      try {
        computedVal = cellMap[getAddrFromCoor([rowIndex, cellIndex])];
      } catch (error) {
        // Circular references in forumlas will throw a stack overflow error from the recursive getters
        computedVal = '#ERROR!';
        // The error will have been thrown while computing a formula, so we must reset the flag
        isComputingFormula = false;
      }

      return cell.set('val', computedVal.toString());
    });
  });

  return newSheet;
};

export const autofillSheet = (sheet, range) => {
  const originCoor = range[0];
  const originValue = sheet.getIn([...range[0], 'raw']);
  const pRange = positivizeRange(range);
  let newSheet = sheet;

  for (let rowIndex = pRange[0][0]; rowIndex <= pRange[1][0]; rowIndex++) {
    for (let cellIndex = pRange[0][1]; cellIndex <= pRange[1][1]; cellIndex++) {
      const offset = [
        rowIndex - originCoor[0],
        cellIndex - originCoor[1],
      ];

      let newValue;
      if (isFormula(originValue)) {
        newValue = originValue.replace(/([A-Z])(\d{1,2})/g, (match, colAddr, rowAddr) => {
          const newColAddr = ALPHABET[ALPHABET.indexOf(colAddr) + offset[1]];
          const newRowAddr = (parseInt(rowAddr) + offset[0]);
          return newColAddr + newRowAddr;
        });
      } else {
        newValue = originValue;
      }

      newSheet = newSheet.setIn([rowIndex, cellIndex, 'raw'], newValue);
    }
  }

  return newSheet;
};

export const isTopEdgeOfRange = (rangeCoors, coor) => (
  coor[0] === rangeCoors[0][0]
);

export const isBottomEdgeOfRange = (rangeCoors, coor) => (
  coor[0] === rangeCoors[1][0]
);

export const isLeftEdgeOfRange = (rangeCoors, coor) => (
  coor[1] === rangeCoors[0][1]
);

export const isRightEdgeOfRange = (rangeCoors, coor) => (
  coor[1] === rangeCoors[1][1]
);
