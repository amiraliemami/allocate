"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [hovering, setHovering] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (hovering && inputRef.current) {
      inputRef.current.focus();
    }
  }, [hovering]);

  const tryLogin = async (value: string) => {
    setError(false);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: value }),
    });
    if (res.ok) {
      router.push("/");
    } else {
      setError(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setError(false);
    if (value.length > 0) {
      tryLogin(value);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div
        className="relative animate-spin [animation-duration:5s] "
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => {
          if (!password) setHovering(false);
        }}
      >
        {/* Title — visible when not hovering */}
        <h1
          className={`text-2xl font-bold tracking-widest text-zinc-900 transition-all duration-300 cursor-default select-none ${
            hovering ? "opacity-0 scale-90" : "opacity-100 scale-100"
          }`}
        >
          A L L O C A T E
        </h1>

        {/* Password input — appears on hover */}
        <input
          ref={inputRef}
          type="password"
          value={password}
          onChange={handleChange}
          autoComplete="off"
          data-1p-ignore
          data-lpignore="true"
          className={`absolute inset-0 w-full text-center text-2xl font-bold tracking-widest bg-transparent outline-none transition-all duration-300 ${
            hovering ? "opacity-100 scale-100" : "opacity-0 scale-110 pointer-events-none"
          }`}
          placeholder=""
        />
      </div>
    </div>
  );
}
