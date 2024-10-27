import { Difficulty } from "./DifficultyEnum";
import { Ingredient } from "./Ingredient";
import { MealCategory } from "./MealCategoryEnum";

export interface Recipe {
  id?: string;
  creationDate: string;
  title: string;
  category: MealCategory;
  groups: string[];
  time: number;
  portions: number;
  difficulty: Difficulty;
  tags?: string[];
  ingredients: Ingredient[];
  description: string;
  steps: string[];
  photos: {
    filename: string;
    url: string;
    state: string;
  }[];
  favourite: boolean;
}
