import { Subject } from "rxjs";
import { Action } from "./action";

export enum IOType {
  INPUT = 'input',
  OUTPUT = 'output',
}

export interface IO {
  type: IOType;
  data: string;
}

export type IOCallback = Action<Subject<IO>>;
