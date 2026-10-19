import jwt from "jsonwebtoken";
import { HttpError } from "../lib/http.js";

const adminAuth = (req, res, next) => {
  const { token } = req.headers;

  if (!token) {
    return next(new HttpError(401, "Not authorized, Login Again"));
  }

  try {
    const decoded_token = jwt.verify(token, process.env.JWT_SECRET);
    if (
      decoded_token !==
      process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD
    ) {
      return next(new HttpError(401, "Not authorized, Login Again"));
    }

    next();
  } catch (error) {
    next(new HttpError(401, "Not authorized, token failed"));
  }
};

export default adminAuth;
