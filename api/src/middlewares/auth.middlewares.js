import jwt from "jsonwebtoken";
import ApiResponse from "../utilities/ApiResponse.js";
import ApiError from "../utilities/ApiError.js";

const Auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json(new ApiResponse(401, { message: "Unauthorized" }));
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res
          .status(403)
          .json(new ApiResponse(403, { message: "Forbidden" }));
      }
      req.userId = decoded.data;
      next();
    });
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiError(
          500,
          { message: "Internal Server Error" },
          error.message || error
        )
      );
  }
};

export default Auth;
