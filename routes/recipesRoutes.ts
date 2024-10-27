import express from "express";
import catchAsync from "../utilities/catchAsync";
import multer from "multer";
import {
  getRecipes,
  createRecipe,
  getRecipe,
  updateRecipe,
  deleteRecipe,
} from "../controllers/recipes";
import { storage } from "../cloudinary";

const router = express.Router();
const upload = multer({ storage });

router
  .route("/")
  .get(catchAsync(getRecipes))
  .post(upload.array("addedPhotos", 5), catchAsync(createRecipe));

router
  .route("/:id")
  .get(catchAsync(getRecipe))
  .put(upload.array("addedPhotos", 5), catchAsync(updateRecipe))
  .delete(catchAsync(deleteRecipe));

export { router as recipesRoutes };
