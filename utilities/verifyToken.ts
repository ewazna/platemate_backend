import { Request, Response, NextFunction } from "express";
import { admin } from "../config/firebase";
import { RequestWithUser } from "../modelsTypeScript";
import ExpressError from "./ExpressError";

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const idToken = req.cookies.access_token;
  if (!idToken) {
    return next(new ExpressError(401, "No token provided"));
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    (req as RequestWithUser).user = decodedToken;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return next(new ExpressError(401, "Unauthorized"));
  }
};

export default verifyToken;
