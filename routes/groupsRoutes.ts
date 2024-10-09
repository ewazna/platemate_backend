import express from "express";
import catchAsync from "../utilities/catchAsync";
import {
  getGroups,
  getGroup,
  updateGroups,
  updateGroup,
} from "../controllers/groups";

const router = express.Router();

router.route("/").get(catchAsync(getGroups)).put(catchAsync(updateGroups));

router.route("/:id").get(catchAsync(getGroup)).put(catchAsync(updateGroup));

export { router as groupsRoutes };
