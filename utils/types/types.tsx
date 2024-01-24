export type TModify<TOriginal, TModification> = Omit<TOriginal, keyof TModification> & TModification;

/**
 * Acts like Partial, but requires all properties to be explicity set to undefined if missing.
 */
export type TPartialExhaustive<T> = {[Key in keyof T]: T[Key] | undefined};
