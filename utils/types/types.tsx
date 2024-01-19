export type TModify<TOriginal, TModification> = Omit<TOriginal, keyof TModification> & TModification;
