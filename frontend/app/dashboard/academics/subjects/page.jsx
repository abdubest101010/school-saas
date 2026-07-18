"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { authFetch } from "@/lib/api";

export default function SubjectsPage() {
  const { accessToken } = useAuth();
  const [sections, setSections] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", code: "", classSectionId: "", teacherId: "" });
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (accessToken) {
      Promise.all([
        authFetch(accessToken, "/api/class-sections"),
        authFetch(accessToken, "/api/teachers")
      ]).then(([sectionsData, teachersData]) => {
        setSections(sectionsData.classSections);
        setTeachers(teachersData.teachers);
        if (sectionsData.classSections.length > 0) {
          setSelectedSectionId(sectionsData.classSections[0].id);
        }
      }).catch(() => {}).finally(() => setLoading(false));
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken && selectedSectionId) {
      authFetch(accessToken, `/api/subjects?classSectionId=${selectedSectionId}`)
        .then((d) => setSubjects(d.subjects))
        .catch(() => {});
    } else {
      setSubjects([]);
    }
  }, [accessToken, selectedSectionId]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, classSectionId: selectedSectionId }));
  }, [selectedSectionId]);

  async function handleCreate(e) {
    e.preventDefault();
    setStatus(null);
    setSubmitting(true);
    try {
      await authFetch(accessToken, "/api/subjects", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setStatus({ type: "success", message: "Subject created." });
      setForm({ name: "", code: "", classSectionId: selectedSectionId, teacherId: "" });
      const data = await authFetch(accessToken, `/api/subjects?classSectionId=${selectedSectionId}`);
      setSubjects(data.subjects);
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateTeacher(id, teacherId) {
    try {
      await authFetch(accessToken, `/api/subjects/${id}`, {
        method: "PUT",
        body: JSON.stringify({ teacherId }),
      });
      const data = await authFetch(accessToken, `/api/subjects?classSectionId=${selectedSectionId}`);
      setSubjects(data.subjects);
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this subject?")) return;
    try {
      await authFetch(accessToken, `/api/subjects/${id}`, { method: "DELETE" });
      const data = await authFetch(accessToken, `/api/subjects?classSectionId=${selectedSectionId}`);
      setSubjects(data.subjects);
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  }

  return (
    <main style={{ maxWidth: 640, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Subjects</h1>

      <div style={{ marginBottom: 16 }}>
        <label>
          Class Section
          <select
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          >
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>
      </div>

      <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 360, marginBottom: 32 }}>
        <input
          placeholder="Subject Name (e.g. Mathematics)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          style={{ padding: 8 }}
        />
        <input
          placeholder="Subject Code (optional)"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          style={{ padding: 8 }}
        />
        <select
          value={form.teacherId}
          onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
          style={{ padding: 8 }}
        >
          <option value="">No Teacher Assigned</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <button type="submit" disabled={submitting} style={{ padding: 10 }}>
          {submitting ? "Creating..." : "Create Subject"}
        </button>
      </form>

      {status && <p style={{ color: status.type === "error" ? "red" : "green" }}>{status.message}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : subjects.length === 0 ? (
        <p>No subjects for this class section.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
              <th style={{ padding: 8 }}>Name</th>
              <th style={{ padding: 8 }}>Code</th>
              <th style={{ padding: 8 }}>Teacher</th>
              <th style={{ padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s) => (
              <tr key={s.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 8 }}>{s.name}</td>
                <td style={{ padding: 8 }}>{s.code || "-"}</td>
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