const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  let token = req.headers.authorization;

  if (token && token.startsWith("Bearer")) {
    try {
      token = token.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.adminId = decoded.id;
      next();
    } catch (error) {
      return res
        .status(401)
        .json({ success: false, message: "Token tidak valid" });
    }
  } else {
    return res
      .status(401)
      .json({ success: false, message: "Akses ditolak, token tidak ada" });
  }
};

module.exports = { protect };
