import express from "express";
import catchAsync from "../utilities/catchAsync";
import { getGroups, updateGroups } from "../controllers/groups";
import verifyToken from "../utilities/verifyToken";

const router = express.Router();

router
  .route("/")
  .get(verifyToken, catchAsync(getGroups))
  .put(verifyToken, catchAsync(updateGroups));

export { router as groupsRoutes };
