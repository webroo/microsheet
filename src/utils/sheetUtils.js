import {ALPHABET, expandAddrRange, getAddrFromCoor, absoluteRange} from './coordinateUtils';

export const isNumber = n => !isNaN(parseFloat(n)) && isFinite(n);

export const coerceStringToNumber = n => (isNumber(n) ? parseFloat(n) : n);

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
  const pRange = absoluteRange(range);
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
          // TODO: we can use getAddrFromCoor here
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

export const getSheetExtentRange = sheetData => {
  const maxRows = sheetData.size - 1;
  const maxCols = sheetData.get(0).size - 1;
  return [[0, 0], [maxRows, maxCols]];
};
