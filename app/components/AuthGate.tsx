"use client";

import React from "react";

const AUTH_KEY = "lamapaola-auth";
const USERNAME = "admin";
const PASSWORD = "lamapaola123";

export default function AuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = React.useState(false);
  const [authenticated, setAuthenticated] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const auth = localStorage.getItem(AUTH_KEY);
    if (auth === "true") {
      setAuthenticated(true);
    }
    setReady(true);
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (username === USERNAME && password === PASSWORD) {
      localStorage.setItem(AUTH_KEY, "true");
      setAuthenticated(true);
      setError("");
      return;
    }

    setError("Credenziali non corrette");
  }

  function logout() {
    localStorage.removeItem(AUTH_KEY);
    setAuthenticated(false);
    setUsername("");
    setPassword("");
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-700">
        Caricamento...
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/login-ortofrutta.jpg')",
          }}
        />

        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(6,78,59,0.88)_0%,rgba(21,128,61,0.78)_38%,rgba(15,23,42,0.70)_100%)]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(254,240,138,0.10),transparent_22%)]" />

        <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
          <div className="w-full max-w-md rounded-[34px] border border-white/25 bg-white/92 p-8 shadow-[0_30px_90px_rgba(15,23,42,0.30)] backdrop-blur-md">
            <div className="mb-6 flex justify-center">
              <div className="rounded-[24px] border border-slate-100 bg-white px-4 py-3 shadow-[0_14px_30px_rgba(15,23,42,0.10)]">
                <img
                  src="/logo-lamapaola.jpg"
                  alt="Lamapaola"
                  className="h-20 w-auto object-contain sm:h-24"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            </div>

            <div className="mb-6 text-center">
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-700">
                Ortofrutta fresca
              </div>
              <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900">
                Sistema Pricing Lamapaola
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Accesso riservato all’area quotazioni, anagrafiche e listini clienti.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Inserisci username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-black placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Inserisci password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-black placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                className="w-full rounded-2xl bg-[linear-gradient(135deg,_#15803d_0%,_#16a34a_55%,_#22c55e_100%)] px-5 py-3 font-semibold text-white shadow-[0_14px_30px_rgba(22,163,74,0.28)] transition hover:scale-[1.01]"
              >
                Accedi
              </button>
            </form>

            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-xs text-amber-800">
              Credenziali iniziali: <strong>admin</strong> / <strong>lamapaola123</strong>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="sticky top-0 z-50 border-b border-sky-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          <div className="text-sm font-semibold text-slate-700">
            Accesso attivo · area riservata Lamapaola
          </div>
          <button
            onClick={logout}
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
          >
            Logout
          </button>
        </div>
      </div>

      {children}
    </div>
  );
}