const express = require("express");
const { createAdmin, hireTeacher } = require("../controllers/admin.controller");
const { registerStudent } = require("../controllers/student.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/admins", authenticate, authorize("OWNER"), createAdmin);
router.post("/teachers", authenticate, authorize("ADMIN"), hireTeacher);
router.post("/students", authenticate, authorize("ADMIN"), registerStudent);

module.exports = router;
