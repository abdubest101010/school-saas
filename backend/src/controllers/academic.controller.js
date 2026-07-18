const prisma = require("../lib/prisma");

// ==================== ACADEMIC YEARS ====================

async function getAcademicYears(req, res) {
  const years = await prisma.academicYear.findMany({
    orderBy: { startDate: "desc" },
    include: { _count: { select: { terms: true, classSections: true } } },
  });
  res.json({ academicYears: years });
}

async function createAcademicYear(req, res) {
  const { name, startDate, endDate, isCurrent } = req.body;

  if (!name || !startDate || !endDate) {
    return res.status(400).json({ error: "name, startDate, and endDate are required" });
  }

  if (isCurrent) {
    await prisma.academicYear.updateMany({ data: { isCurrent: false } });
  }

  const year = await prisma.academicYear.create({
    data: { name, startDate: new Date(startDate), endDate: new Date(endDate), isCurrent: isCurrent || false },
  });

  res.status(201).json({ academicYear: year });
}

async function updateAcademicYear(req, res) {
  const { id } = req.params;
  const { name, startDate, endDate, isCurrent } = req.body;

  if (isCurrent) {
    await prisma.academicYear.updateMany({ data: { isCurrent: false } });
  }

  const year = await prisma.academicYear.update({
    where: { id },
    data: { ...(name && { name }), ...(startDate && { startDate: new Date(startDate) }), ...(endDate && { endDate: new Date(endDate) }), isCurrent },
  });

  res.json({ academicYear: year });
}

async function deleteAcademicYear(req, res) {
  const { id } = req.params;
  await prisma.academicYear.delete({ where: { id } });
  res.json({ success: true });
}

// ==================== TERMS ====================

async function getTerms(req, res) {
  const { academicYearId } = req.query;
  const where = academicYearId ? { academicYearId } : {};
  const terms = await prisma.term.findMany({
    where,
    orderBy: { startDate: "asc" },
    include: { academicYear: { select: { name: true } }, _count: { select: { exams: true, feeInvoices: true } } },
  });
  res.json({ terms });
}

async function createTerm(req, res) {
  const { academicYearId, termType, name, startDate, endDate, isCurrent } = req.body;

  if (!academicYearId || !termType || !name || !startDate || !endDate) {
    return res.status(400).json({ error: "academicYearId, termType, name, startDate, and endDate are required" });
  }

  if (isCurrent) {
    await prisma.term.updateMany({ data: { isCurrent: false } });
  }

  const term = await prisma.term.create({
    data: { academicYearId, termType, name, startDate: new Date(startDate), endDate: new Date(endDate), isCurrent: isCurrent || false },
  });

  res.status(201).json({ term });
}

async function updateTerm(req, res) {
  const { id } = req.params;
  const { termType, name, startDate, endDate, isCurrent } = req.body;

  if (isCurrent) {
    await prisma.term.updateMany({ data: { isCurrent: false } });
  }

  const term = await prisma.term.update({
    where: { id },
    data: { ...(termType && { termType }), ...(name && { name }), ...(startDate && { startDate: new Date(startDate) }), ...(endDate && { endDate: new Date(endDate) }), isCurrent },
  });

  res.json({ term });
}

async function deleteTerm(req, res) {
  const { id } = req.params;
  await prisma.term.delete({ where: { id } });
  res.json({ success: true });
}

// ==================== CLASS SECTIONS ====================

async function getClassSections(req, res) {
  const { academicYearId } = req.query;
  const where = academicYearId ? { academicYearId } : {};
  const sections = await prisma.classSection.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      academicYear: { select: { name: true } },
      teacher: { select: { id: true, name: true } },
      _count: { select: { students: true, subjects: true } },
    },
  });
  res.json({ classSections: sections });
}

async function createClassSection(req, res) {
  const { name, academicYearId, teacherId } = req.body;

  if (!name || !academicYearId) {
    return res.status(400).json({ error: "name and academicYearId are required" });
  }

  const section = await prisma.classSection.create({
    data: { name, academicYearId, teacherId: teacherId || null },
    include: { academicYear: { select: { name: true } }, teacher: { select: { id: true, name: true } } },
  });

  res.status(201).json({ classSection: section });
}

async function updateClassSection(req, res) {
  const { id } = req.params;
  const { name, teacherId } = req.body;

  const section = await prisma.classSection.update({
    where: { id },
    data: { ...(name && { name }), teacherId },
    include: { academicYear: { select: { name: true } }, teacher: { select: { id: true, name: true } } },
  });

  res.json({ classSection: section });
}

async function deleteClassSection(req, res) {
  const { id } = req.params;
  await prisma.classSection.delete({ where: { id } });
  res.json({ success: true });
}

// ==================== SUBJECTS ====================

async function getSubjects(req, res) {
  const { classSectionId } = req.query;
  const where = classSectionId ? { classSectionId } : {};
  const subjects = await prisma.subject.findMany({
    where,
    orderBy: { name: "asc" },
    include: { classSection: { select: { id: true, name: true } }, teacher: { select: { id: true, name: true } } },
  });
  res.json({ subjects });
}

async function createSubject(req, res) {
  const { name, code, classSectionId, teacherId } = req.body;

  if (!name || !classSectionId) {
    return res.status(400).json({ error: "name and classSectionId are required" });
  }

  const subject = await prisma.subject.create({
    data: { name, code: code || null, classSectionId, teacherId: teacherId || null },
    include: { classSection: { select: { id: true, name: true } }, teacher: { select: { id: true, name: true } } },
  });

  res.status(201).json({ subject });
}

async function updateSubject(req, res) {
  const { id } = req.params;
  const { name, code, teacherId } = req.body;

  const subject = await prisma.subject.update({
    where: { id },
    data: { ...(name && { name }), ...(code !== undefined && { code }), teacherId },
    include: { classSection: { select: { id: true, name: true } }, teacher: { select: { id: true, name: true } } },
  });

  res.json({ subject });
}

async function deleteSubject(req, res) {
  const { id } = req.params;
  await prisma.subject.delete({ where: { id } });
  res.json({ success: true });
}

// ==================== TEACHER LIST (for dropdowns) ====================

async function getTeachersList(req, res) {
  const teachers = await prisma.teacher.findMany({
    select: { id: true, name: true, subject: true },
    orderBy: { name: "asc" },
  });
  res.json({ teachers });
}

module.exports = {
  getAcademicYears, createAcademicYear, updateAcademicYear, deleteAcademicYear,
  getTerms, createTerm, updateTerm, deleteTerm,
  getClassSections, createClassSection, updateClassSection, deleteClassSection,
  getSubjects, createSubject, updateSubject, deleteSubject,
  getTeachersList,
};