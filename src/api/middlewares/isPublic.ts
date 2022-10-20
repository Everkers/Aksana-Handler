const IsPublic = async (req, res, next) => {
  try {
    req.isPublic = true;
    return next();
  } catch (e) {
    return next(e);
  }
};
export default IsPublic;
