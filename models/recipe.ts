import mongoose from "mongoose";
import { Recipe, Difficulty, Unit, MealCategory } from "../modelsTypeScript";

const Schema = mongoose.Schema;

const recipeSchema = new Schema<Recipe>({
  userId: { type: String, required: true },
  creationDate: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, enum: Object.values(MealCategory) },
  groups: [String],
  time: {
    type: Number,
    required: true,
    min: [0, "Time of preperation must be greater than 0."],
  },
  portions: {
    type: Number,
    required: true,
    min: [0, "Number of portions must be greater than 0."],
  },
  difficulty: {
    type: String,
    enum: Object.values(Difficulty),
    required: true,
  },
  tags: [String],
  ingredients: {
    type: [
      {
        id: String,
        name: String,
        quantity: Number,
        unit: { type: String, enum: Object.values(Unit) },
      },
    ],
    required: true,
  },
  description: { type: String, required: false },
  steps: { type: [String], required: true },
  photos: {
    type: [{ filename: String, url: String, state: String }],
    required: true,
  },
  favourite: { type: Boolean },
});

const Recipe = mongoose.model("Recipe", recipeSchema);

export default Recipe;
export { recipeSchema };
