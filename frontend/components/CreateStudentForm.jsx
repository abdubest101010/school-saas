"use client";

import { useState } from "react";
import { authFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function CreateStudentForm() {
  const { accessToken } = useAuth();
  const [includeParent, setIncludeParent] = useState(true);
  const [form, setForm] = useState({
    email: "",
    name: "",
    password: "",
    parentEmail: "",
    parentName: "",
    parentPassword: "",
  });
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);
    setSubmitting(true);
    try {
      const payload = {
        email: form.email,
        name: form.name,
        password: form.password,
        ...(includeParent && {
          newParent: {
            email: form.parentEmail,
            name: form.parentName,
            password: form.parentPassword,
          },
        }),
      };
      await authFetch(accessToken, "/api/students", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setStatus({ type: "success", message: `Student ${form.email} registered.` });
      setForm({ email: "", name: "", password: "", parentEmail: "", parentName: "", parentPassword: "" });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section style={{ marginTop: 32, borderTop: "1px solid #ddd", paddingTop: 16 }}>
      <h2>Register Student</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 320 }}>
        <input
          placeholder="Student name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          style={{ padding: 8 }}
        />
        <input
          type="email"
          placeholder="Student email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          style={{ padding: 8 }}
        />
        <input
          type="password"
          placeholder="Student password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          style={{ padding: 8 }}
        />

        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={includeParent}
            onChange={(e) => setIncludeParent(e.target.checked)}
          />
          Also create a new Parent account
        </label>

        {includeParent && (
          <>
            <input
              placeholder="Parent name"
              value={form.parentName}
              onChange={(e) => setForm({ ...form, parentName: e.target.value })}
              required={includeParent}
              style={{ padding: 8 }}
            />
            <input
              type="email"
              placeholder="Parent email"
              value={form.parentEmail}
              onChange={(e) => setForm({ ...form, parentEmail: e.target.value })}
              required={includeParent}
              style={{ padding: 8 }}
            />
            <input
              type="password"
              placeholder="Parent password"
              value={form.parentPassword}
              onChange={(e) => setForm({ ...form, parentPassword: e.target.value })}
              required={includeParent}
              style={{ padding: 8 }}
            />
          </>
        )}

        <button type="submit" disabled={submitting} style={{ padding: 10 }}>
          {submitting ? "Registering..." : "Register Student"}
        </button>
      </form>
      {status && (
        <p style={{ color: status.type === "error" ? "red" : "green" }}>{status.message}</p>
      )}
    </section>
  );
}
