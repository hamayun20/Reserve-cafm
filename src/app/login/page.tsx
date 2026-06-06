"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";

export default function LoginPage() {
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (response.ok) {
      window.location.href = "/";
    } else {
      setMessage(result.message ?? "Login failed");
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-ink">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg border border-white bg-white p-6 shadow-lift">
        <div className="grid gap-4">
          <div className="grid h-24 place-items-center overflow-hidden rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <Image src="/cafm-pro.png" alt="CAFM PRO logo" width={1100} height={380} className="h-full w-full object-contain" priority />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">Enterprise facility command</p>
            <p className="mt-1 text-xs font-bold text-slate-400">Sign in to continue</p>
          </div>
        </div>
        <div className="mt-6 grid gap-3">
          <input name="email" type="email" defaultValue="admin@cafm.local" className="h-11 rounded-lg border border-slate-200 px-3 outline-none focus:border-lagoon" />
          <input name="password" type="password" defaultValue="Admin@12345" className="h-11 rounded-lg border border-slate-200 px-3 outline-none focus:border-lagoon" />
          <button className="h-11 rounded-lg bg-ink font-black text-white">Login</button>
          {message && <p className="text-sm font-bold text-coral">{message}</p>}
        </div>
      </form>
    </main>
  );
}
