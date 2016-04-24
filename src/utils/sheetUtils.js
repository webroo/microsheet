import {ALPHABET, expandAddrRange, getAddrFromCoor, absoluteRange} from './coordinateUtils';

/**
 * Returns true if the value can be coerced into a Number
 * @param  {*}       n Any value, but usually a string
 * @return {Boolean}
 */
export const canCoerceToNumber = n => !isNaN(parseFloat(n)) && isFinite(n);

/**
 * Coerces the value into a Number
 * @param  {*}      n Any value, but usually a string
 * @return {Number}
 */
export const coerceToNumber = n => (canCoerceToNumber(n) ? parseFloat(n) : n);

/**
 * Returns true if the string value is a formula (e.g. starts with a `=` symbol)
 * @param  {String} value String value
 * @return {Boolean}
 */
export const isFormula = value => (
  typeof value === 'string' && value.charAt(0) === '='
);

/**
 * Returns true if the character is allowed to have a cell ref inserted after it.
 * Used when inserting cell refs into formulas.
 * @param  {String}  char String with a length of 1
 * @return {Boolean}
 */
export const canInsertCellRefAfterChar = char => {
  return /[+\-*/()=,]/.test(char);
};

/**
 * Converts any formula function names (SUM, AVERAGE) and cell addresses (A1, B2) found within the
 * string to uppercase.
 * @param  {String} expr The string expression, e.g. '=sum(a1:b2)*100'
 * @return {String}      The capitalized string, e.g. '=SUM(A1:B2)*100'
 */
export const capitalizeExpression = expr => (
  // Only capitalize formula function names and cell addresses (eg: a1, b22, etc)
  expr.replace(/sum|average|[a-z]\d{1,2}/gi, match => match.toUpperCase())
);

/**
 * Sanitizes the expression by removing any sequence of characters that are not determined to be
 * valid in a formula.
 * @param  {String} expr The string expression, e.g. '=A1+20*alert("hello")'
 * @return {String}      The sanitized expression, e.g. '=A1+20*()'
 */
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

/**
 * Computes the `raw` properties in the sheet and sets the `val` properties. Non-formula raw values
 * are copied over verbatim, and formulas are computed.
 * @param  {Immutable.List} sheet Sheet data
 * @return {Immutable.List}       Computed sheet data
 */
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
          const newCellVal = evalFunc(cellMap, expr);

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

      // We keep track of when we're computing a formula so that we can ignore string values
      // and return 0 instead, this allows empty cells to be ignored when summing ranges.
      isComputingFormula = isFormula(cell.get('raw'));

      try {
        computedVal = cellMap[getAddrFromCoor([rowIndex, cellIndex])];
      } catch (error) {
        // Circular references in forumlas will throw a stack overflow error from the recursive getters
        computedVal = '#ERROR!';
      }

      // Reset the flag for the next cell calculation
      isComputingFormula = false;

      return cell.set('val', computedVal.toString());
    });
  });

  return newSheet;
};

/**
 * Autofills the given range on the sheet. Non-formula values are copied verbatim, and forumlas
 * are modified so that cell references are sequentially transformed.
 * @param  {Immutable.List} sheet Sheet data
 * @param  {Array}          range Autofill range, with the first range coor acting as the source
 * @return {Immutable.List}       Autofilled sheet data
 */
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

/**
 * Returns the size of the sheet as a range, e.g. a 3x3 sheet would be [[0, 0], [2, 2]]
 * @param  {Immutable.List} sheetData Sheet data
 * @return {Array}                    Extent as a range
 */
export const getSheetExtent = sheetData => {
  const maxRows = sheetData.size - 1;
  const maxCols = sheetData.get(0).size - 1;
  return [[0, 0], [maxRows, maxCols]];
};
