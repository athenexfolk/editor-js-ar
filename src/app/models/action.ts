export type Action<T> = (data: T) => void;

export type Function<T,U> = (arg:U) => T;