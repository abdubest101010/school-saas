"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import CreateAdminForm from "@/components/CreateAdminForm";
import CreateTeacherForm from "@/components/CreateTeacherForm";
import CreateStudentForm from "@/components/CreateStudentForm";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading) return <p style={{ fontFamily: "sans-serif", margin: 40 }}>Loading...</p>;
  if (!user) return null;

  return (
    <main style={{ maxWidth: 560, margin: "40px auto", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Welcome, {user.email}</h1>
        <button onClick={logout} style={{ padding: 10 }}>
          Log out
        </button>
      </div>
      <p>
        Role: <strong>{user.role}</strong>
      </p>

      <nav style={{ display: "flex", gap: 12, margin: "24px 0", padding: "12px 0", borderTop: "1px solid #ddd", borderBottom: "1px solid #ddd" }}>
        <Link href="/dashboard/academics" style={{ padding: "8px 16px", background: "#eee", borderRadius: 4, textDecoration: "none", color: "inherit" }}>
          Academic Years
        </Link>
      </nav>

      {user.role === "OWNER" && <CreateAdminForm />}
      {user.role === "ADMIN" && (
        <>
          <CreateTeacherForm />
          <CreateStudentForm />
        </>
      )}
    </main>
  );
}
