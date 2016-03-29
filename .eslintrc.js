module.exports = {
  'extends': 'airbnb',
  'env': {
    // Allow mocha globals like "describe" and "it"
    'mocha': true
  },
  'parserOptions': {
    'ecmaFeatures': {
      // Allow object rest spread eg: {...thing}
      'experimentalObjectRestSpread': true
    }
  },
  // Relax a few rules for personal preference
  'rules': {
    // Allow single statements inside the curly braces of an arrow function
    'arrow-body-style': 0,
    // Allow a little more line length for edge cases and ignore comments
    'max-len': [2, 105, 2, {'ignoreUrls': true, 'ignoreComments': true}],
    // Allow param props to be set, useful for Array.reduce
    'no-param-reassign': [2, {'props': false}],
    // Allow shadowed variables, which makes writing redux connectors easier
    'no-shadow': 0,
    // No curly braces spacing
    'object-curly-spacing': [2, 'never'],
    // Allow regular string concatenation
    'prefer-template': 0,
    // Allow parseInt radix param to be omitted
    'radix': [2, 'as-needed']
  }
};
