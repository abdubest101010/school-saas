const express = require("express");
const {
  getAcademicYears, createAcademicYear, updateAcademicYear, deleteAcademicYear,
  getTerms, createTerm, updateTerm, deleteTerm,
  getClassSections, createClassSection, updateClassSection, deleteClassSection,
  getSubjects, createSubject, updateSubject, deleteSubject,
  getTeachersList,
} = require("../controllers/academic.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

// Teachers list (for dropdowns in forms)
router.get("/teachers", authenticate, getTeachersList);

// Academic Years
router.get("/academic-years", authenticate, getAcademicYears);
router.post("/academic-years", authenticate, authorize("OWNER", "ADMIN"), createAcademicYear);
router.put("/academic-years/:id", authenticate, authorize("OWNER", "ADMIN"), updateAcademicYear);
router.delete("/academic-years/:id", authenticate, authorize("OWNER", "ADMIN"), deleteAcademicYear);

// Terms
router.get("/terms", authenticate, getTerms);
router.post("/terms", authenticate, authorize("OWNER", "ADMIN"), createTerm);
router.put("/terms/:id", authenticate, authorize("OWNER", "ADMIN"), updateTerm);
router.delete("/terms/:id", authenticate, authorize("OWNER", "ADMIN"), deleteTerm);

// Class Sections
router.get("/class-sections", authenticate, getClassSections);
router.post("/class-sections", authenticate, authorize("OWNER", "ADMIN"), createClassSection);
router.put("/class-sections/:id", authenticate, authorize("OWNER", "ADMIN"), updateClassSection);
router.delete("/class-sections/:id", authenticate, authorize("OWNER", "ADMIN"), deleteClassSection);

// Subjects
router.get("/subjects", authenticate, getSubjects);
router.post("/subjects", authenticate, authorize("OWNER", "ADMIN"), createSubject);
router.put("/subjects/:id", authenticate, authorize("OWNER", "ADMIN"), updateSubject);
router.delete("/subjects/:id", authenticate, authorize("OWNER", "ADMIN"), deleteSubject);

module.exports = router;