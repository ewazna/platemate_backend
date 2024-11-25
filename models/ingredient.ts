import mongoose from "mongoose";
import { Ingredient } from "../modelsTypeScript";

const Schema = mongoose.Schema;

const ingredientSchema = new Schema<Ingredient>({
  name: { type: String, required: true },
});

const Ingredient = mongoose.model("Ingredient", ingredientSchema);

export default Ingredient;
