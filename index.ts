import { config } from "dotenv";
config();

import express, { Request, Response, Application, NextFunction } from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";

import { recipesRoutes } from "./routes/recipesRoutes";
import { groupsRoutes } from "./routes/groupsRoutes";
import { tagsRoutes } from "./routes/tagsRoutes";
import { ingredientsRoutes } from "./routes/ingredientsRoutes";
import ExpressError from "./utilities/ExpressError";

mongoose
  .connect(process.env.MONGO_DB_URI as string)
  .then(() => {
    console.log("Connection Open");
  })
  .catch((err) => {
    console.log(err);
  });

const app: Application = express();

app.use(cors({ credentials: true, origin: "http://localhost:5173" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/recipes", recipesRoutes);
app.use("/groups", groupsRoutes);
app.use("/tags", tagsRoutes);
app.use("/ingredients", ingredientsRoutes);

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new ExpressError(404, "Resource not found"));
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const { status = 500 } = err;
  if (!err.message) {
    err.message = "Something went wrong";
  }
  res.status(status);
  res.send(err.message);
});

app.listen(3000, () => {
  console.log("Listen on port 3000");
});
