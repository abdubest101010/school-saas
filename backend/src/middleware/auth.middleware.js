const { verifyAccessToken } = require("../utils/token");

// Protects a route: requires a valid access token in the Authorization header.
// Frontend sends it as: Authorization: Bearer <accessToken>
function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing access token" });
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = verifyAccessToken(token);
    req.user = payload; // { sub: userId, role }
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired access token" });
  }
}

// Restricts a route to specific roles. Use after `authenticate`.
// Example: router.post("/admins", authenticate, authorize("OWNER"), createAdmin)
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Not allowed to perform this action" });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
