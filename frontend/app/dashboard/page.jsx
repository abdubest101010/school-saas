"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
<<<<<<< HEAD
import Link from "next/link";
=======
>>>>>>> 156a74a8cd2bda92a8ea182fc56001b1b2dd221c
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
<<<<<<< HEAD
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

=======
  if (!user) return null; // redirecting

  return (
    <main style={{ maxWidth: 480, margin: "80px auto", fontFamily: "sans-serif" }}>
      <h1>Welcome, {user.email}</h1>
      <p>
        Role: <strong>{user.role}</strong>
      </p>
      <button onClick={logout} style={{ padding: 10 }}>
        Log out
      </button>

      {/* Each form only calls the backend route that role is actually
          authorized for — the backend still enforces this independently,
          this is just about showing people the actions they can take. */}
>>>>>>> 156a74a8cd2bda92a8ea182fc56001b1b2dd221c
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
