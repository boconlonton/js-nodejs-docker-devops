const protect = (req, res, next) => {
  const { user } = req.sessions;
  if (!user) {
    return res.status(401).json({
      status: "fail",
      message: "unauthorized",
    });
  }

  req.user = user;

  next();
};

module.exports = protect;
