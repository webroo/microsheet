// This acts as an entry point to the tests when they're bundled using webpack
// We search for files ending in .spec.js inside the src folder and automatically require() them all
// The src folder is resolved relative to the location of this file
require('../src/common.spec.js');
var context = require.context('../src/', true, /.+\.spec\.js?$/);
context.keys().forEach(context);
