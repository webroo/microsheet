export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const isNumber = n => !isNaN(parseFloat(n)) && isFinite(n);

export const coerceStringToNumber = n => (isNumber(n) ? parseFloat(n) : n);

export const getCellAddrFromCoor = coor => `${ALPHABET[coor[1]]}${coor[0] + 1}`;

export const computeSheet = (sheet) => {
  // Reduces the nested Immutable List down to an object map where the keys are cell addresses
  // The cell addresses are prefixed with an underscore because we'll make getters for them later
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
  // will eval the contents of the cell if it begins with a '=', allowing forumlas to be computed
  // directly against the cellMap.
  Object.keys(cellMap).forEach(cellKey => {
    Object.defineProperty(cellMap, cellKey.substring(1), {
      get: () => {
        const cellVal = cellMap[cellKey];
        // Only eval cell contents that starts with '=', denoting a formula expression
        if (typeof cellVal === 'string' && cellVal.charAt(0) === '=') {
          return evalFunc(cellMap, cellVal.substring(1));
        }
        return cellVal;
      },
    });
  });

  // Copy the computed values into the exiting sheet
  const newSheet = sheet.map((row, rowIndex) => {
    return row.map((cell, cellIndex) => {
      let computedVal;
      try {
        computedVal = cellMap[getCellAddrFromCoor([rowIndex, cellIndex])];
      } catch (error) {
        // Circular references in forumlas will throw a stack overflow error from the getters
        computedVal = '#REF!';
      }
      return cell.set('val', computedVal);
    });
  });

  return newSheet;
};
