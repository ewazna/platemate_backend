import { Unit } from "./UnitEnum";

export interface RecipeIngredient {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
}
