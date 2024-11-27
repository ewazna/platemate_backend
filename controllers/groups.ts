import { Response } from "express";

import { RequestWithUser } from "../modelsTypeScript";
import Group from "../models/group";
import Recipe from "../models/recipe";

const getGroups = async (req: RequestWithUser, res: Response) => {
  const userId = req.user!.uid;
  const groups = await Group.find({ userId: { $eq: userId } });
  res.send(groups);
};

const updateGroups = async (req: RequestWithUser, res: Response) => {
  const userId = req.user!.uid;
  const requestGroups = [...req.body.groups];
  const deleteRecipes = req.body.deleteRecipes;

  const existingGroups = await Group.find({ userId: { $eq: userId } });
  const existingGroupIds = existingGroups.map((group) => group.id);
  const requestGroupIds = requestGroups.map((group) => group._id);
  const groupsToRemove = existingGroupIds.filter((id) => {
    return !requestGroupIds.includes(id);
  });

  await Promise.all([
    ...requestGroups.map((group, i) => {
      if (existingGroupIds.includes(group._id)) {
        return Group.findOneAndUpdate({ _id: group._id }, { name: group.name });
      } else {
        return Group.insertMany({
          userId: userId,
          name: group.name,
          state: "empty",
        });
      }
    }),
    ...groupsToRemove.map((id) => {
      return Group.findOneAndDelete({ _id: id });
    }),
  ]);

  const recipesWithRemovedGroup = await Recipe.find({
    $and: [{ userId: { $eq: userId } }, { groups: { $in: groupsToRemove } }],
  });
  const recipesWithRemovedGroupIds = recipesWithRemovedGroup.map(
    (recipe) => recipe.id
  );

  await Recipe.updateMany(
    {
      $and: [{ userId: { $eq: userId } }, { groups: { $in: groupsToRemove } }],
    },
    { $pull: { groups: { $in: groupsToRemove } } }
  );

  if (deleteRecipes) {
    await Recipe.deleteMany({
      $and: [
        { _id: { $in: recipesWithRemovedGroupIds } },
        { groups: { $eq: [] } },
      ],
    });
  }

  const finalGroups = await Group.find({ user: { $eq: userId } });

  res.status(200);
  res.send(finalGroups);
};

export { getGroups, updateGroups };
