import express, { Request, Response, Application, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import { config } from "dotenv";
if (process.env.NODE_ENV !== "production") {
  config();
}

import { recipesRoutes } from "./routes/recipesRoutes";
import { groupsRoutes } from "./routes/groupsRoutes";
import ExpressError from "./utilities/ExpressError";

mongoose
  .connect("mongodb://127.0.0.1:27017/platemate")
  .then(() => {
    console.log("Connection Open");
  })
  .catch((err) => {
    console.log(err);
  });

const app: Application = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/recipes", recipesRoutes);
app.use("/groups", groupsRoutes);

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new ExpressError(404, "Resource not found"));
});

app.use((err: any, req: Request, res: Response) => {
  const { status = 500 } = err;
  if (!err.message) {
    err.message = "Something went wrong";
  }
  res.status(status);
  res.send(err);
});

app.listen(3000, () => {
  console.log("Listen on port 3000");
});
