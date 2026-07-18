"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { authFetch } from "@/lib/api";

export default function ClassSectionsPage() {
  const { accessToken } = useAuth();
  const [years, setYears] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedYearId, setSelectedYearId] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", academicYearId: "", teacherId: "" });
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (accessToken) {
      Promise.all([
        authFetch(accessToken, "/api/academic-years"),
        authFetch(accessToken, "/api/teachers")
      ]).then(([yearsData, teachersData]) => {
        setYears(yearsData.academicYears);
        setTeachers(teachersData.teachers);
        if (yearsData.academicYears.length > 0) {
          const current = yearsData.academicYears.find((y) => y.isCurrent) || yearsData.academicYears[0];
          setSelectedYearId(current.id);
        }
      }).catch(() => {}).finally(() => setLoading(false));
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken && selectedYearId) {
      authFetch(accessToken, `/api/class-sections?academicYearId=${selectedYearId}`)
        .then((d) => setSections(d.classSections))
        .catch(() => {});
    } else {
      setSections([]);
    }
  }, [accessToken, selectedYearId]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, academicYearId: selectedYearId }));
  }, [selectedYearId]);

  async function handleCreate(e) {
    e.preventDefault();
    setStatus(null);
    setSubmitting(true);
    try {
      await authFetch(accessToken, "/api/class-sections", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setStatus({ type: "success", message: "Class section created." });
      setForm({ name: "", academicYearId: selectedYearId, teacherId: "" });
      const data = await authFetch(accessToken, `/api/class-sections?academicYearId=${selectedYearId}`);
      setSections(data.classSections);
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateTeacher(id, teacherId) {
    try {
      await authFetch(accessToken, `/api/class-sections/${id}`, {
        method: "PUT",
        body: JSON.stringify({ teacherId }),
      });
      const data = await authFetch(accessToken, `/api/class-sections?academicYearId=${selectedYearId}`);
      setSections(data.classSections);
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this class section?")) return;
    try {
      await authFetch(accessToken, `/api/class-sections/${id}`, { method: "DELETE" });
      const data = await authFetch(accessToken, `/api/class-sections?academicYearId=${selectedYearId}`);
      setSections(data.classSections);
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  }

  return (
    <main style={{ maxWidth: 640, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Class Sections</h1>

      <div style={{ marginBottom: 16 }}>
        <label>
          Academic Year
          <select
            value={selectedYearId}
            onChange={(e) => setSelectedYearId(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          >
            {years.map((y) => (
              <option key={y.id} value={y.id}>{y.name}{y.isCurrent ? " (Current)" : ""}</option>
            ))}
          </select>
        </label>
      </div>

      <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 360, marginBottom: 32 }}>
        <input
          placeholder="Class Name (e.g. Grade 10-A)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          style={{ padding: 8 }}
        />
        <select
          value={form.teacherId}
          onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
          style={{ padding: 8 }}
        >
          <option value="">No Teacher Assigned</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>{t.name} ({t.subject || "General"})</option>
          ))}
        </select>
        <button type="submit" disabled={submitting} style={{ padding: 10 }}>
          {submitting ? "Creating..." : "Create Class Section"}
        </button>
      </form>

      {status && <p style={{ color: status.type === "error" ? "red" : "green" }}>{status.message}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : sections.length === 0 ? (
        <p>No class sections for this academic year.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
              <th style={{ padding: 8 }}>Name</th>
              <th style={{ padding: 8 }}>Teacher</th>
              <th style={{ padding: 8 }}>Students</th>
              <th style={{ padding: 8 }}>Subjects</th>
              <th style={{ padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((s) => (
              <tr key={s.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 8 }}>{s.name}</td>
                <td style={{ padding: 8 }}>
                  <select 
                    value={s.teacher?.id || ""} 
                    onChange={(e) => handleUpdateTeacher(s.id, e.target.value)}
                    style={{ padding: 4 }}
                  >
                    <option value="">No Teacher</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: 8 }}>{s._count.students}</td>
                <td style={{ padding: 8 }}>{s._count.subjects}</td>
                <td style={{ padding: 8 }}>
                  <button onClick={() => handleDelete(s.id)} style={{ padding: "4px 8px", color: "red" }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}