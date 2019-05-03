"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isStream = obj => obj && obj instanceof Object && obj.pipe instanceof Function;
exports.isReadable = obj => exports.isStream(obj) && obj._read instanceof Function && obj._readableState instanceof Object;
//# sourceMappingURL=helpers.js.map