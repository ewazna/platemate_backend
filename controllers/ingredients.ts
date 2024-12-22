import Ingredient from "../models/ingredient";
import { Request, Response } from "express";

const getIngredients = async (req: Request, res: Response) => {
  const { searchConfig } = req.query;
  let searchOption = {};
  if (searchConfig) {
    const searchTerm = (searchConfig as string).trim();
    searchOption = { name: { $regex: searchTerm, $options: "i" } };
  }
  const ingredients = await Ingredient.find(searchOption).sort({ name: 1 });
  res.send(ingredients);
};

export { getIngredients };
