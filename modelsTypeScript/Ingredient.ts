import { Unit } from "./UnitEnum";

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
}
