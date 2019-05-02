const isStream = obj => obj && obj instanceof Object && obj.pipe instanceof Function;

const isReadable = obj => isStream(obj) && obj._read instanceof Function && obj._readableState instanceof Object;

module.exports = {
    isStream,
    isReadable,
}