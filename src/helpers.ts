export function isStream(obj: any): boolean {
    return obj && obj instanceof Object && obj.pipe instanceof Function;
}

export function isReadable(obj: any): boolean {
    return isStream(obj) && obj._read instanceof Function && obj._readableState instanceof Object;
}
