"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
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
