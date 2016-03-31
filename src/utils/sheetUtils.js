export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const isNumber = n => !isNaN(parseFloat(n)) && isFinite(n);

export const coerceStringToNumber = n => (isNumber(n) ? parseFloat(n) : n);

export const getCellAddrFromCoor = coor => `${ALPHABET[coor[1]]}${coor[0] + 1}`;

export const capitalizeCellAddresses = expr => (
  // Only capitalizes sequences with one lowercase letter and 1 or 2 numbers, eg: a1 or a11
  expr.replace(/([a-z]\d{1,2})/g, match => match.toUpperCase())
);

export const sanitizeExpression = expr => (
  // The first regex removes anything that isn't a valid operator symbol or A-Z character
  // The second removes any sequence of A-Z chars greater than 1 (a cell address can only have one letter)
  expr.replace(/[^+\-*/().:\^\dA-Z]/g, '').replace(/[A-Z]{2,}/g, '')
);

export const computeSheet = (sheet) => {
  // Reduces the nested Immutable List down to an object map where the keys are cell addresses.
  // Cell addresses are prefixed with an underscore symbol. This allows us to create non-underscore
  // counterparts as getters, which will compute expressions.
  const cellMap = sheet.reduce((acc, row, rowIndex) => (
    row.reduce((acc, cell, cellIndex) => {
      acc['_' + getCellAddrFromCoor([rowIndex, cellIndex])] = cell.get('raw');
      return acc;
    }, acc)
  ), {});

  /* eslint-disable no-new-func */
  const evalFunc = new Function('object', 'expression', 'with (object) {return eval(expression)}');
  /* eslint-enable no-new-func */

  // Create getters for each cell address on the map (without the underscore prefix). The getters
  // will eval the contents of the cell if it's an expression (ie. begins with a '='). This allows
  // forumlas to be computed directly against the cellMap.
  Object.keys(cellMap).forEach(cellKey => {
    Object.defineProperty(cellMap, cellKey.substring(1), {
      get: () => {
        const cellVal = cellMap[cellKey];
        // Only eval cell contents that start with '=', which denotes a formula expression
        if (typeof cellVal === 'string' && cellVal.charAt(0) === '=') {
          // Remember to remove the starting '=' symbol before evaluating the expression
          return evalFunc(cellMap, sanitizeExpression(cellVal.substring(1)));
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
        computedVal = cellMap[getCellAddrFromCoor([rowIndex, cellIndex])];
      } catch (error) {
        // Circular references in forumlas will throw a stack overflow error from the getters
        computedVal = '#ERROR!';
      }
      return cell.set('val', computedVal);
    });
  });

  return newSheet;
};
