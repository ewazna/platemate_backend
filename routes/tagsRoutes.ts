import express from "express";
import catchAsync from "../utilities/catchAsync";
import { getTags } from "../controllers/tags";
import verifyToken from "../utilities/verifyToken";

const router = express.Router();

router.route("/").get(verifyToken, catchAsync(getTags));

export { router as tagsRoutes };
