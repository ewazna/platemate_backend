import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

import Group from "../models/group";
import Recipe from "../models/recipe";
import ExpressError from "../utilities/ExpressError";

const getGroups = async (req: Request, res: Response) => {
  const groups = await Group.find();
  res.send(groups);
};

const getGroup = async (req: Request, res: Response, next: NextFunction) => {
  const group = await Group.findById(req.params.id);
  if (!group) {
    return next(new ExpressError(404, "Resource not found"));
  }
  res.send(group);
};

const updateGroup = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const group = await Group.findByIdAndUpdate(id, {
    ...req.body.group,
  });
  if (!group) {
    return next(new ExpressError(404, "Resource not found"));
  }
  await group.save();
  res.send(group);
};

const updateGroups = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const idArray = (await Group.find()).map((group) => group._id.toString());
  const groups = [...req.body.groups];
  const groupsIdArray = groups.map((group) => group._id);
  const groupsToRemove = idArray.filter((id) => {
    return !groupsIdArray.includes(id);
  });

  await Promise.all(
    groups.map((group, i) => {
      if (idArray.includes(group._id)) {
        return Group.findOneAndUpdate({ _id: group._id }, { name: group.name });
      } else {
        return Group.insertMany({ name: group.name });
      }
    })
  );

  await Promise.all(
    groupsToRemove.map((id) => {
      return Group.findOneAndDelete({ _id: new mongoose.Types.ObjectId(id) });
    })
  );
  await Promise.all(
    groupsToRemove.map((id) => {
      Recipe.findOneAndUpdate(
        { groups: { $elemMatch: { $eq: id } } },
        { $pull: { groups: { $eq: id } } }
      );
    })
  );
  const uploadedGroups = await Group.find();

  res.status(200);
  res.send(uploadedGroups);
};

export { getGroups, getGroup, updateGroup, updateGroups };
