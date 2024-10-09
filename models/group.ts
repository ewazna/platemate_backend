import mongoose from "mongoose";
import { Group } from "../modelsTypeScript";

const Schema = mongoose.Schema;

const groupSchema = new Schema<Group>({
  name: { type: String, required: true },
});

const Group = mongoose.model("Group", groupSchema);
export default Group;
