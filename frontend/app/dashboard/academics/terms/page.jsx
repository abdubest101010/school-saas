"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { authFetch } from "@/lib/api";

const TERM_TYPES = ["FIRST", "SECOND", "THIRD", "SUMMER"];

export default function TermsPage() {
  const { accessToken } = useAuth();
  const [years, setYears] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedYearId, setSelectedYearId] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ academicYearId: "", termType: "FIRST", name: "", startDate: "", endDate: "", isCurrent: false });
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (accessToken) {
      authFetch(accessToken, "/api/academic-years").then((d) => {
        setYears(d.academicYears);
        if (d.academicYears.length > 0) {
          const current = d.academicYears.find((y) => y.isCurrent) || d.academicYears[0];
          setSelectedYearId(current.id);
        }
      }).catch(() => {}).finally(() => setLoading(false));
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken && selectedYearId) {
      authFetch(accessToken, `/api/terms?academicYearId=${selectedYearId}`)
        .then((d) => setTerms(d.terms))
        .catch(() => {});
    } else {
      setTerms([]);
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
      await authFetch(accessToken, "/api/terms", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setStatus({ type: "success", message: "Term created." });
      setForm({ academicYearId: selectedYearId, termType: "FIRST", name: "", startDate: "", endDate: "", isCurrent: false });
      const data = await authFetch(accessToken, `/api/terms?academicYearId=${selectedYearId}`);
      setTerms(data.terms);
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSetCurrent(id) {
    try {
      await authFetch(accessToken, `/api/terms/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isCurrent: true }),
      });
      const data = await authFetch(accessToken, `/api/terms?academicYearId=${selectedYearId}`);
      setTerms(data.terms);
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this term?")) return;
    try {
      await authFetch(accessToken, `/api/terms/${id}`, { method: "DELETE" });
      const data = await authFetch(accessToken, `/api/terms?academicYearId=${selectedYearId}`);
      setTerms(data.terms);
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  }

  return (
    <main style={{ maxWidth: 640, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Terms</h1>

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
          placeholder="Term name (e.g. First Semester)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          style={{ padding: 8 }}
        />
        <select
          value={form.termType}
          onChange={(e) => setForm({ ...form, termType: e.target.value })}
          style={{ padding: 8 }}
        >
          {TERM_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
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
          Set as current term
        </label>
        <button type="submit" disabled={submitting} style={{ padding: 10 }}>
          {submitting ? "Creating..." : "Create Term"}
        </button>
      </form>

      {status && <p style={{ color: status.type === "error" ? "red" : "green" }}>{status.message}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : terms.length === 0 ? (
        <p>No terms for this academic year.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
              <th style={{ padding: 8 }}>Name</th>
              <th style={{ padding: 8 }}>Type</th>
              <th style={{ padding: 8 }}>Start</th>
              <th style={{ padding: 8 }}>End</th>
              <th style={{ padding: 8 }}>Current</th>
              <th style={{ padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {terms.map((t) => (
              <tr key={t.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 8 }}>{t.name}</td>
                <td style={{ padding: 8 }}>{t.termType}</td>
                <td style={{ padding: 8 }}>{new Date(t.startDate).toLocaleDateString()}</td>
                <td style={{ padding: 8 }}>{new Date(t.endDate).toLocaleDateString()}</td>
                <td style={{ padding: 8 }}>{t.isCurrent ? "Yes" : "No"}</td>
                <td style={{ padding: 8 }}>
                  {!t.isCurrent && (
                    <button onClick={() => handleSetCurrent(t.id)} style={{ marginRight: 8, padding: "4px 8px" }}>
                      Set Current
                    </button>
                  )}
                  <button onClick={() => handleDelete(t.id)} style={{ padding: "4px 8px", color: "red" }}>
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