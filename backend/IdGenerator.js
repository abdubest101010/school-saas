/**
 * Generates a unique student code in the format: YYYYMMDD-XXXX
 * Example: 20260713-4821
 *
 * The date prefix means codes are naturally sortable and instantly
 * tell you which day a student was registered. The random suffix
 * avoids collisions if multiple students register the same day.
 */
function generateStudentId() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    const datePart = `${y}${m}${d}`;
  
    // 4-digit random suffix (1000–9999)
    const randomPart = Math.floor(1000 + Math.random() * 9000);
  
    return `${datePart}-${randomPart}`;
  }
  
  /**
   * Wraps generation with a uniqueness check against the database.
   * Pass in your Prisma client instance.
   *
   * Usage:
   *   const studentCode = await generateUniqueStudentId(prisma);
   */
  async function generateUniqueStudentId(prisma) {
    let code;
    let exists = true;
  
    while (exists) {
      code = generateStudentId();
      const existing = await prisma.student.findUnique({
        where: { studentCode: code },
      });
      exists = Boolean(existing);
    }
  
    return code;
  }
  
  module.exports = { generateStudentId, generateUniqueStudentId };
  