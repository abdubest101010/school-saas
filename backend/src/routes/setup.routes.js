const express = require("express");
const { createInitialOwner, getSetupStatus } = require("../controllers/setup.controller");

const router = express.Router();

// Intentionally NOT behind `authenticate` — nobody has an account yet
// the first time this runs. Safety comes from createInitialOwner checking
// for an existing Owner, not from a login wall.
router.post("/owner", createInitialOwner);
router.get("/status", getSetupStatus);

module.exports = router;
