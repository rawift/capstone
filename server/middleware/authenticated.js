

const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      console.log("Authenticated")
      return next();
    } else {
      console.log("Not Authenticated")
      res.status(401).json({ message: 'Not authenticated' });
    }
  };
  
module.exports = ensureAuthenticated;
  