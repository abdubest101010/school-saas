"use client";

import { useState } from "react";
import { authFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function CreateTeacherForm() {
  const { accessToken } = useAuth();
  const [form, setForm] = useState({ email: "", name: "", subject: "", password: "" });
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);
    setSubmitting(true);
    try {
      await authFetch(accessToken, "/api/teachers", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setStatus({ type: "success", message: `Teacher ${form.email} hired.` });
      setForm({ email: "", name: "", subject: "", password: "" });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section style={{ marginTop: 32, borderTop: "1px solid #ddd", paddingTop: 16 }}>
      <h2>Hire Teacher</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 320 }}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          style={{ padding: 8 }}
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          style={{ padding: 8 }}
        />
        <input
          placeholder="Subject (optional)"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          style={{ padding: 8 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          style={{ padding: 8 }}
        />
        <button type="submit" disabled={submitting} style={{ padding: 10 }}>
          {submitting ? "Hiring..." : "Hire Teacher"}
        </button>
      </form>
      {status && (
        <p style={{ color: status.type === "error" ? "red" : "green" }}>{status.message}</p>
      )}
    </section>
  );
}
