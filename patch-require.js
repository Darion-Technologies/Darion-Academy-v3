const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function(id) {
  if (typeof id !== 'string') {
    console.error("UNDEFINED REQUIRE CALLED FROM:", new Error().stack);
  }
  return originalRequire.apply(this, arguments);
};
