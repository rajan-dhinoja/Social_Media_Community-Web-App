import JWT from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader?.startsWith("Bearer")) {
    res.status(403).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Token format is Invalid...",
    });
  }

  try {
    // Verify token
    JWT.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Invalid token",
        });
      } else {
        req.body.user = {
          userId: decoded.userId,
        };
        next();
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Authentication failed, There is some Error...",
      error: error,
    });
  }
};

export default userAuth;
