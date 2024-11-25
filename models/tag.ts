import mongoose from "mongoose";
import { Tag } from "../modelsTypeScript";

const Schema = mongoose.Schema;

const tagSchema = new Schema<Tag>({ tag: { type: String, required: true } });

const Tag = mongoose.model("Tag", tagSchema);

export default Tag;
