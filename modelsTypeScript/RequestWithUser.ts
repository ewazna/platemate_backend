import { DecodedIdToken } from "firebase-admin/auth";
import { Request } from "express";

export interface RequestWithUser extends Request {
  user?: DecodedIdToken;
}
