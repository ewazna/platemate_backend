import Recipe from "../models/recipe";
import Tag from "../models/tag";
import Ingredient from "../models/Ingredient";
import Group from "../models/group";
import ExpressError from "../utilities/ExpressError";
import { NextFunction, Request, Response } from "express";
import { cloudinary } from "../cloudinary";
import { RequestWithUser } from "../modelsTypeScript";

const getRecipes = async (req: RequestWithUser, res: Response) => {
  const { filterConfig, sortConfig, searchConfig, selectedGroup } = req.query;
  const userId = req.user!.uid;

  let sortOption: any = { creationDate: -1 };
  let findOptions: any = {
    $and: [
      {
        userId: { $eq: userId },
      },
    ],
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

  const recipes = await Recipe.find(findOptions).sort(sortOption);

  res.send(recipes);
};

const createRecipe = async (req: RequestWithUser, res: Response) => {
  const body = req.body;
  const userId = req.user!.uid;

  body.ingredients = parseIngredients(body.ingredients);

  const recipe = new Recipe({ userId: userId, ...body });

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
  await markGroupsAsUsed(body.groups, userId);

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
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const userId = req.user!.uid;

  const recipe = await Recipe.findById(id);
  if (!recipe) {
    return next(new ExpressError(404, "Resource not found"));
  }
  if (recipe?.userId !== userId) {
    return next(
      new ExpressError(403, "Access to the requested resource is forbidden")
    );
  }

  const body = req.body;

  body.ingredients = parseIngredients(body.ingredients);

  const updatedRecipe = await Recipe.findByIdAndUpdate(id, {
    ...body,
  });
  if (!updatedRecipe) {
    return next(new ExpressError(404, "Resource not found"));
  }

  if (body.deletedPhotos) {
    updatedRecipe.photos = [
      ...updatedRecipe.photos.filter(
        (photo) => !body.deletedPhotos.includes(photo.filename)
      ),
    ];
    for (const filename of body.deletedPhotos) {
      await cloudinary.uploader.destroy(filename);
    }
  }
  if (req.files && Array.isArray(req.files)) {
    updatedRecipe.photos = [
      ...updatedRecipe.photos,
      ...req.files.map((photo) => {
        return {
          filename: photo.filename,
          url: photo.path,
          state: "existing",
        };
      }),
    ];
  }

  await updatedRecipe.save();

  await handleNewTags(body.tags);
  await handleNewIngredients(body.ingredients);
  await markGroupsAsUsed(body.groups, userId);

  res.send(updatedRecipe);
};

const deleteRecipe = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const userId = req.user!.uid;

  const recipe = await Recipe.findById(id);
  if (!recipe) {
    return next(new ExpressError(404, "Resource not found"));
  }
  if (recipe?.userId !== userId) {
    return next(
      new ExpressError(403, "Access to the requested resource is forbidden")
    );
  }

  const deletedRecipe = await Recipe.findByIdAndDelete(id);
  if (!deletedRecipe) {
    return next(new ExpressError(404, "Resource not found"));
  }
  res.send(deletedRecipe.id);
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

async function markGroupsAsUsed(
  groups: string | string[],
  userId: string
): Promise<void> {
  const userGroupIds = (await Group.find({ userId: { $eq: userId } })).map(
    (group) => group.id
  );
  const groupIds = Array.isArray(groups) ? groups : [groups];

  await Promise.all(
    groupIds
      .filter((id: string) => userGroupIds.includes(id))
      .map((id: string) => Group.findByIdAndUpdate(id, { state: "used" }))
  );
}

export { getRecipes, createRecipe, getRecipe, updateRecipe, deleteRecipe };
