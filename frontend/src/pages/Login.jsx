import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/client.js";

export default function Login() {
  const { user, login, register, demoLogin, applyToken } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Handle Google OAuth redirect (?token=...) and errors.
  useEffect(() => {
    const token = params.get("token");
    const err = params.get("error");
    if (err) setError("Google sign-in was cancelled or failed.");
    if (token) {
      applyToken(token).then(() => navigate("/")).catch(() => setError("Login failed."));
    }
  }, [params]);

  useEffect(() => {
    if (user) navigate("/");
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError("");
    try {
      const res = await api.get("/auth/google/login");
      window.location.href = res.data.url;
    } catch (err) {
      setError(err.response?.data?.detail || "Google OAuth is not configured.");
    }
  };

  const demo = async () => {
    setBusy(true);
    try {
      await demoLogin();
      navigate("/");
    } catch {
      setError("Could not start demo session.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-600 to-indigo-800 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-800">
        <div className="mb-6 text-center">
          <div className="text-4xl">🤖</div>
          <h1 className="mt-2 text-2xl font-bold">AI Meeting Assistant</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Your personal meeting &amp; calendar hub
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          {mode === "register" && (
            <div>
              <label className="label">Name</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
          )}
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button className="btn-primary w-full" disabled={busy}>
            {mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          OR
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        </div>

        <button className="btn-ghost w-full" onClick={google}>
          <span className="font-bold text-brand-600">G</span> Continue with Google
        </button>
        <button className="btn-ghost mt-2 w-full" onClick={demo} disabled={busy}>
          🚀 Try demo account
        </button>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          {mode === "login" ? "No account?" : "Already have an account?"}{" "}
          <button
            className="font-medium text-brand-600 hover:underline"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Register" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
