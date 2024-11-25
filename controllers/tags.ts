import Tag from "../models/tag";
import { Request, Response } from "express";

const getTags = async (req: Request, res: Response) => {
  const { searchConfig } = req.query;
  let searchOption = {};
  if (searchConfig) {
    const searchTerm = (searchConfig as string).trim();
    searchOption = { tag: { $regex: searchTerm, $options: "i" } };
  }
  const tags = await Tag.find(searchOption).sort({ tag: 1 });
  res.send(tags);
};

export { getTags };
