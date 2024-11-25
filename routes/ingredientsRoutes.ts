import express from "express";
import catchAsync from "../utilities/catchAsync";
import verifyToken from "../utilities/verifyToken";
import { getIngredients } from "../controllers/ingredients";

const router = express.Router();

router.route("/").get(verifyToken, catchAsync(getIngredients));

export { router as ingredientsRoutes };
