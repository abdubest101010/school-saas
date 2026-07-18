"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { authFetch } from "@/lib/api";

export default function AcademicYearsPage() {
  const { accessToken } = useAuth();
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", startDate: "", endDate: "", isCurrent: false });
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadYears() {
    try {
      const data = await authFetch(accessToken, "/api/academic-years");
      setYears(data.academicYears);
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (accessToken) loadYears();
  }, [accessToken]);

  async function handleCreate(e) {
    e.preventDefault();
    setStatus(null);
    setSubmitting(true);
    try {
      await authFetch(accessToken, "/api/academic-years", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setStatus({ type: "success", message: "Academic year created." });
      setForm({ name: "", startDate: "", endDate: "", isCurrent: false });
      await loadYears();
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSetCurrent(id) {
    try {
      await authFetch(accessToken, `/api/academic-years/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isCurrent: true }),
      });
      await loadYears();
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this academic year?")) return;
    try {
      await authFetch(accessToken, `/api/academic-years/${id}`, { method: "DELETE" });
      await loadYears();
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  }

  return (
    <main style={{ maxWidth: 640, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Academic Years</h1>

      <nav style={{ display: "flex", gap: 8, margin: "16px 0", padding: "8px 0", borderBottom: "1px solid #ddd" }}>
        <Link href="/dashboard/academics" style={{ padding: "6px 12px", background: "#eee", borderRadius: 4, textDecoration: "none", color: "inherit", fontWeight: "bold" }}>
          Years
        </Link>
        <Link href="/dashboard/academics/terms" style={{ padding: "6px 12px", background: "#eee", borderRadius: 4, textDecoration: "none", color: "inherit" }}>
          Terms
        </Link>
        <Link href="/dashboard/academics/classes" style={{ padding: "6px 12px", background: "#eee", borderRadius: 4, textDecoration: "none", color: "inherit" }}>
          Classes
        </Link>
        <Link href="/dashboard/academics/subjects" style={{ padding: "6px 12px", background: "#eee", borderRadius: 4, textDecoration: "none", color: "inherit" }}>
          Subjects
        </Link>
      </nav>

      <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 360, marginBottom: 32 }}>
        <input
          placeholder="Year name (e.g. 2025-2026)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          style={{ padding: 8 }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <label style={{ flex: 1 }}>
            Start date
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              required
              style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
            />
          </label>
          <label style={{ flex: 1 }}>
            End date
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              required
              style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
            />
          </label>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={form.isCurrent}
            onChange={(e) => setForm({ ...form, isCurrent: e.target.checked })}
          />
          Set as current year
        </label>
        <button type="submit" disabled={submitting} style={{ padding: 10 }}>
          {submitting ? "Creating..." : "Create Academic Year"}
        </button>
      </form>

      {status && <p style={{ color: status.type === "error" ? "red" : "green" }}>{status.message}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : years.length === 0 ? (
        <p>No academic years yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
              <th style={{ padding: 8 }}>Name</th>
              <th style={{ padding: 8 }}>Start</th>
              <th style={{ padding: 8 }}>End</th>
              <th style={{ padding: 8 }}>Current</th>
              <th style={{ padding: 8 }}>Terms</th>
              <th style={{ padding: 8 }}>Classes</th>
              <th style={{ padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {years.map((y) => (
              <tr key={y.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 8 }}>{y.name}</td>
                <td style={{ padding: 8 }}>{new Date(y.startDate).toLocaleDateString()}</td>
                <td style={{ padding: 8 }}>{new Date(y.endDate).toLocaleDateString()}</td>
                <td style={{ padding: 8 }}>{y.isCurrent ? "Yes" : "No"}</td>
                <td style={{ padding: 8 }}>{y._count.terms}</td>
                <td style={{ padding: 8 }}>{y._count.classSections}</td>
                <td style={{ padding: 8 }}>
                  {!y.isCurrent && (
                    <button onClick={() => handleSetCurrent(y.id)} style={{ marginRight: 8, padding: "4px 8px" }}>
                      Set Current
                    </button>
                  )}
                  <button onClick={() => handleDelete(y.id)} style={{ padding: "4px 8px", color: "red" }}>
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