import jwt from "jsonwebtoken";
import { HttpError } from "../lib/http.js";

export const userAuth = (req, res, next) => {
  const { token } = req.headers;

  if (!token) {
    return next(new HttpError(401, "Not authorized, Login again"));
  }

  try {
    const token_decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = token_decoded.userId;
    next();
  } catch (error) {
    next(new HttpError(401, "Not authorized, token failed"));
  }
};
