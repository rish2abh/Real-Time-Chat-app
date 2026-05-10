import { useState } from "react";
import { request } from "../api/client";

const AuthPage = ({ onLogin, statusText, setStatusText }) => {
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setStatusText("");

    try {
      const payload = authMode === "register"
        ? authForm
        : { email: authForm.email, password: authForm.password };

      const data = await request(`/api/auth/${authMode}`, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      if (authMode === "register") {
        setAuthForm({ name: "", email: "", password: "" });
        setShowPassword(false);
        setAuthMode("login");
        setStatusText("Account created. Log in to continue.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin(data.token, data.user);
    } catch (error) {
      setStatusText(error.message);
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-panel" onSubmit={handleAuthSubmit}>
        <div>
          <p className="eyebrow">Chat App</p>
          <h1>{authMode === "login" ? "Login" : "Register"}</h1>
        </div>

        <div className="mode-switch">
          <button
            type="button"
            className={authMode === "login" ? "active" : ""}
            onClick={() => setAuthMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={authMode === "register" ? "active" : ""}
            onClick={() => setAuthMode("register")}
          >
            Register
          </button>
        </div>

        {authMode === "register" && (
          <label>
            Name
            <input
              value={authForm.name}
              onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })}
              required
            />
          </label>
        )}

        <label>
          Email
          <input
            type="email"
            value={authForm.email}
            onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
            required
          />
        </label>

        <label>
          Password
          <span className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              value={authForm.password}
              onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
              required
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((current) => !current)}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
                {!showPassword && <path d="m4 4 16 16" />}
              </svg>
            </button>
          </span>
        </label>

        {statusText && <p className="status-line">{statusText}</p>}

        <button className="primary-button" type="submit">
          {authMode === "login" ? "Login" : "Create Account"}
        </button>
      </form>
    </main>
  );
};

export default AuthPage;
