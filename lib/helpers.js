"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isStream(obj) {
    return obj && obj instanceof Object && obj.pipe instanceof Function;
}
exports.isStream = isStream;
function isReadable(obj) {
    return isStream(obj) && obj._read instanceof Function && obj._readableState instanceof Object;
}
exports.isReadable = isReadable;
//# sourceMappingURL=helpers.js.map