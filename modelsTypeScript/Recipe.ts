import { Difficulty } from "./DifficultyEnum";
import { RecipeIngredient } from "./RecipeIngredient";
import { MealCategory } from "./MealCategoryEnum";

export interface Recipe {
  id?: string;
  userId: string;
  creationDate: string;
  title: string;
  category: MealCategory;
  groups: string[];
  time: number;
  portions: number;
  difficulty: Difficulty;
  tags?: string[];
  ingredients: RecipeIngredient[];
  description: string;
  steps: string[];
  photos: {
    filename: string;
    url: string;
    state: string;
  }[];
  favourite: boolean;
}
