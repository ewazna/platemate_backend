import Recipe from "../models/recipe";
import Tag from "../models/tag";
import Ingredient from "../models/Ingredient";
import Group from "../models/group";
import ExpressError from "../utilities/ExpressError";
import { NextFunction, Request, Response } from "express";
import { cloudinary } from "../cloudinary";

const getRecipes = async (req: Request, res: Response) => {
  const { filterConfig, sortConfig, searchConfig, selectedGroup } = req.query;

  let sortOption: any = { creationDate: -1 };
  let findOptions: any = {
    $and: [],
  };

  if (sortConfig) {
    if (sortConfig === "AZ") {
      sortOption = { title: 1 };
    }
    if (sortConfig === "ZA") {
      sortOption = { title: -1 };
    }
    if (sortConfig === "Latest") {
      sortOption = { creationDate: -1 };
    }
  }

  if (filterConfig) {
    const { diets, categories, tags, difficulty, time, ingredients } =
      JSON.parse(filterConfig as string);
    if (diets && diets.length > 0) {
      findOptions.$and.push({
        tags: { $in: diets },
      });
    }
    if (tags && tags.length > 0) {
      findOptions.$and.push({
        tags: { $in: tags },
      });
    }
    if (categories && categories.length > 0) {
      findOptions.$and.push({
        categories: { $in: categories },
      });
    }
    if (difficulty && difficulty.length > 0) {
      findOptions.$and.push({
        difficulty: { $in: difficulty },
      });
    }
    if (ingredients && ingredients.length > 0) {
      findOptions.$and.push({
        ingredients: { $in: ingredients },
      });
    }
    if (time) {
      findOptions.$and.push({
        time: { $lte: time },
      });
    }
  }

  if (
    selectedGroup &&
    selectedGroup !== "All" &&
    selectedGroup !== "Favourite"
  ) {
    findOptions.$and.push({ groups: { $eq: selectedGroup } });
  }
  if (selectedGroup && selectedGroup === "Favourite") {
    findOptions.$and.push({ favourite: true });
  }

  if (searchConfig) {
    const searchTerm = (searchConfig as string).trim();
    findOptions.$and.push({ title: { $regex: searchTerm, $options: "i" } });
  }

  const recipes = await Recipe.find(
    findOptions.$and.length > 0 ? findOptions : {}
  ).sort(sortOption);

  res.send(recipes);
};

const createRecipe = async (req: Request, res: Response) => {
  const body = req.body;

  body.ingredients = parseIngredients(body.ingredients);

  const recipe = new Recipe(body);

  if (req.files && Array.isArray(req.files)) {
    recipe.photos = req.files.map((photo) => {
      return { filename: photo.filename, url: photo.path, state: "existing" };
    });
  } else {
    recipe.photos = [];
  }

  recipe.creationDate = new Date().toISOString();

  await recipe.save();

  await handleNewTags(body.tags);
  await handleNewIngredients(body.ingredients);
  await markGroupsAsUsed(body.groups);

  res.status(201);
  res.send(recipe);
};

const getRecipe = async (req: Request, res: Response, next: NextFunction) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) {
    return next(new ExpressError(404, "Resource not found"));
  }
  res.send(recipe);
};

const updateRecipe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const body = req.body;

  body.ingredients = parseIngredients(body.ingredients);

  const recipe = await Recipe.findByIdAndUpdate(id, {
    ...body,
  });
  if (!recipe) {
    return next(new ExpressError(404, "Resource not found"));
  }

  if (body.deletedPhotos) {
    recipe.photos = [
      ...recipe.photos.filter(
        (photo) => !body.deletedPhotos.includes(photo.filename)
      ),
    ];
    for (const filename of body.deletedPhotos) {
      await cloudinary.uploader.destroy(filename);
    }
  }
  if (req.files && Array.isArray(req.files)) {
    recipe.photos = [
      ...recipe.photos,
      ...req.files.map((photo) => {
        return { filename: photo.filename, url: photo.path, state: "existing" };
      }),
    ];
  }

  await recipe.save();

  await handleNewTags(body.tags);
  await handleNewIngredients(body.ingredients);
  await markGroupsAsUsed(body.groups);

  res.send(recipe);
};

const deleteRecipe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const recipe = await Recipe.findByIdAndDelete(id);
  if (!recipe) {
    return next(new ExpressError(404, "Resource not found"));
  }
  res.send(recipe._id);
};

function parseIngredients(ingredients: string | string[]): Ingredient[] {
  if (Array.isArray(ingredients)) {
    return ingredients.map(
      (ingredient: string) => JSON.parse(ingredient) as Ingredient
    );
  } else {
    return [JSON.parse(ingredients)] as Ingredient[];
  }
}

async function handleNewTags(newTags: string[]): Promise<void> {
  const tags = (await Tag.find()).map((tag) => tag.tag.toString());

  if (newTags && Array.isArray(newTags)) {
    await Promise.all(
      newTags
        .filter((tag) => !tags.includes(tag))
        .map((tag) => Tag.insertMany({ tag: tag }))
    );
  } else if (newTags && !tags.includes(newTags)) {
    await Tag.insertMany({ tag: newTags });
  }
}

async function handleNewIngredients(
  newIngredients: Ingredient[]
): Promise<void> {
  const ingredientNames = (await Ingredient.find()).map((ingredient) =>
    ingredient.name.toString()
  );

  const newIngredientNames = newIngredients.map(
    (ingredient: { name: string }) => ingredient.name
  );

  await Promise.all(
    newIngredientNames
      .filter((ingr) => !ingredientNames.includes(ingr))
      .map((ingr) => Ingredient.insertMany({ name: ingr }))
  );
}

async function markGroupsAsUsed(groups: string | string[]): Promise<void> {
  if (groups && Array.isArray(groups)) {
    await Promise.all(
      groups.map((id: string) => {
        return Group.findByIdAndUpdate(id, { state: "used" });
      })
    );
  } else {
    await Group.findByIdAndUpdate(groups, { state: "used" });
  }
}

export { getRecipes, createRecipe, getRecipe, updateRecipe, deleteRecipe };
