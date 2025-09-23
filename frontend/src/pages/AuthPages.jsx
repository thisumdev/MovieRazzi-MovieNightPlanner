import React, { useState } from "react";
import { AuthForm } from "../components/AuthForm";

export function AuthPages() {
  const [mode, setMode] = useState("login");
  return (
    <AuthForm
      mode={mode}
      onToggleMode={() => setMode(mode === "login" ? "signup" : "login")}
    />
  );
}
