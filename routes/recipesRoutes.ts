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
import verifyToken from "../utilities/verifyToken";

const router = express.Router();
const upload = multer({ storage });

router
  .route("/")
  .get(verifyToken, catchAsync(getRecipes))
  .post(verifyToken, upload.array("addedPhotos", 5), catchAsync(createRecipe));

router
  .route("/:id")
  .get(verifyToken, catchAsync(getRecipe))
  .put(verifyToken, upload.array("addedPhotos", 5), catchAsync(updateRecipe))
  .delete(verifyToken, catchAsync(deleteRecipe));

export { router as recipesRoutes };
