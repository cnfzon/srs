// src/app/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Authentication page: Login & Register with Firebase Auth & Firestore
// ─────────────────────────────────────────────────────────────────────────────
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  type AuthError,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";

type AuthMode = "login" | "register";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!identifier || !password) {
      setError("請填寫電子郵件與密碼");
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, identifier, password);
      router.push("/dashboard/inventory");
    } catch (err: unknown) {
      const errorCode = (err as any)?.code || "unknown";
      const msg = mapFirebaseError(errorCode);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email || !password || !confirmPassword) {
      setError("請填寫所有欄位");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("密碼與確認密碼不符");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("密碼長度至少 6 個字元");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        role: "user",
        createdAt: serverTimestamp(),
        displayName: email.split("@")[0],
      });

      router.push("/dashboard/inventory");
    } catch (err: unknown) {
      const errorCode = (err as any)?.code || "unknown";
      const msg = mapFirebaseError(errorCode);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    setError("");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user document exists, if not create it
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || email.split("@")[0],
          photoURL: user.photoURL || null,
          role: "user",
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      router.push("/dashboard/inventory");
    } catch (err: unknown) {
      const errorCode = (err as any)?.code || "unknown";
      if (errorCode === "auth/popup-closed-by-user") {
        setError("已取消登入");
      } else {
        const msg = mapFirebaseError(errorCode);
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  function mapFirebaseError(code: string): string {
    const errorMap: Record<string, string> = {
      "auth/invalid-email": "電子郵件格式不正確",
      "auth/user-disabled": "此帳號已被停用",
      "auth/user-not-found": "帳號不存在",
      "auth/wrong-password": "密碼錯誤",
      "auth/email-already-in-use": "此電子郵件已被註冊",
      "auth/weak-password": "密碼強度不足（至少 6 個字元）",
      "auth/operation-not-allowed": "此操作不被允許",
      "auth/too-many-requests": "嘗試次數過多，請稍後再試",
      "auth/popup-closed-by-user": "已取消登入",
      "auth/network-request-failed": "網路連線失敗",
    };
    return errorMap[code] || "驗證失敗，請重試";
  }

  return (
    <div className="min-h-screen bg-brand-dark text-slate-50 overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-[#0b1220] via-[#0f172a] to-[#020617]" />

      {/* Glassmorphism overlay */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(59,130,246,0.14) 0%, rgba(15,23,42,0.92) 55%, rgba(2,6,23,0.96) 100%)",
          backdropFilter: "blur(8px)",
        }}
      />

      {/* Debug node overlay */}
      <div className="fixed top-12 left-12 z-20 pointer-events-none opacity-20 hidden lg:block">
        <div className="text-primary font-mono text-xs space-y-1">
          <div>SYS_LOAD: OPTIMAL</div>
          <div>NET_SYNC: 0.04ms</div>
          <div>LOC_NODE: TPE_NORTH_01</div>
        </div>
      </div>

      {/* Card */}
      <main className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 rounded-2xl shadow-glow overflow-hidden border border-outline-variant bg-[#0b1220]/40 backdrop-blur">

          {/* Left: Brand panel */}
          <div className="hidden md:flex flex-col justify-between p-12 bg-[#0b1220]/60 text-slate-50 relative overflow-hidden border-r border-outline-variant">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-primary/15 border border-outline-variant rounded-lg flex items-center justify-center">
                  <span
                    className="material-symbols-outlined text-primary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    SRS
                  </span>
                </div>
                <span className="text-headline-md font-headline-md">
                  
                </span>
              </div>
              <h1 className="text-display-lg font-black mb-6 leading-tight">
                智慧災難物資管理系統
              </h1>
              <p className="text-slate-200/90 max-w-sm">
                建立強韌的災害應變網絡，透過即時物資調度與自動化的高效庫存管理，守護每一份重建的希望。
              </p>
            </div>

            {/* Security badge */}
            <div className="relative z-10">
              <div className="flex items-center gap-4 bg-white/5 border border-outline-variant p-4 rounded-lg backdrop-blur-sm">
                <span className="material-symbols-outlined text-primary">
                  verified_user
                </span>
                <div>
                  <div className="text-label-caps font-label-caps uppercase opacity-70">
                    Security Protocol
                  </div>
                  <div className="text-data-tabular font-data-tabular">
                    256-bit AES Encryption Active
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative blobs */}
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          </div>

          {/* Right: Auth form */}
          <div className="p-8 md:p-16 flex flex-col justify-center bg-[#0f172a]/60 text-slate-50">
            {/* Mobile logo */}
            <div className="md:hidden flex items-center gap-2 mb-12">
              <span className="material-symbols-outlined text-primary text-3xl">
                shield_with_heart
              </span>
              <span className="text-headline-md font-headline-md text-slate-50">
                ResilienceOps
              </span>
            </div>

            {/* Mode tabs */}
            <div className="mb-8 flex gap-2 border-b border-outline-variant">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                className={`pb-3 px-4 font-semibold transition-colors ${
                  mode === "login"
                    ? "text-primary border-b-2 border-primary"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                登入
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
                className={`pb-3 px-4 font-semibold transition-colors ${
                  mode === "register"
                    ? "text-primary border-b-2 border-primary"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                註冊
              </button>
            </div>

            <div className="mb-8">
              <h2 className="text-headline-md font-headline-md text-slate-50 mb-2">
                {mode === "login" ? "歡迎回來" : "加入我們"}
              </h2>
              <p className="text-slate-300 text-body-sm">
                {mode === "login"
                  ? "請輸入您的憑證以進入指揮中心"
                  : "建立帳號開始管理物資"}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-error/10 text-error border border-error/40 rounded-lg text-sm">
                {error}
              </div>
            )}

            {mode === "login" ? (
              // Login form
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="identifier"
                    className="text-label-caps font-label-caps text-slate-300 block"
                  >
                    電子郵件
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-slate-400 text-xl"> </span>
                    </div>
                    <input
                      id="identifier"
                      type="email"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="你的電子郵件"
                      className="block w-full pl-10 pr-3 py-3 rounded-lg bg-surface-container-low border border-outline-variant text-slate-50 placeholder:text-slate-500 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor="password"
                      className="text-label-caps font-label-caps text-slate-300"
                    >
                      密碼
                    </label>
                    <a href="#" className="text-primary text-xs font-semibold hover:underline">
                      忘記密碼？
                    </a>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-slate-400 text-xl"> </span>
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-10 pr-3 py-3 rounded-lg bg-surface-container-low border border-outline-variant text-slate-50 placeholder:text-slate-500 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 text-primary border-outline-variant rounded focus:ring-primary/50 bg-surface-container-low"
                  />
                  <label htmlFor="remember" className="text-body-sm text-slate-300">
                    保持登入狀態
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-4 px-4 rounded-lg font-semibold text-white bg-primary hover:brightness-110 focus:ring-2 focus:ring-primary/60 transition-all active:scale-[0.98] disabled:opacity-60"
                >
                  {loading ? "登入中..." : "登入"}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-outline-variant"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[#0f172a]/60 text-slate-400">或</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg font-semibold border border-outline-variant text-slate-50 hover:bg-white/5 transition-all active:scale-[0.98] disabled:opacity-60"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  使用 Google 登入
                </button>
              </form>
            ) : (
              // Register form
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-label-caps font-label-caps text-slate-300 block"
                  >
                    電子郵件
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-slate-400 text-xl"> </span>
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="你的電子郵件"
                      className="block w-full pl-10 pr-3 py-3 rounded-lg bg-surface-container-low border border-outline-variant text-slate-50 placeholder:text-slate-500 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="reg-password"
                    className="text-label-caps font-label-caps text-slate-300"
                  >
                    密碼（至少 6 個字元）
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-slate-400 text-xl"> </span>
                    </div>
                    <input
                      id="reg-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-10 pr-3 py-3 rounded-lg bg-surface-container-low border border-outline-variant text-slate-50 placeholder:text-slate-500 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="confirm-password"
                    className="text-label-caps font-label-caps text-slate-300"
                  >
                    確認密碼
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-slate-400 text-xl"> </span>
                    </div>
                    <input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-10 pr-3 py-3 rounded-lg bg-surface-container-low border border-outline-variant text-slate-50 placeholder:text-slate-500 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-4 px-4 rounded-lg font-semibold text-white bg-primary hover:brightness-110 focus:ring-2 focus:ring-primary/60 transition-all active:scale-[0.98] disabled:opacity-60"
                >
                  {loading ? "註冊中..." : "建立帳號"}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-outline-variant"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[#0f172a]/60 text-slate-400">或</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg font-semibold border border-outline-variant text-slate-50 hover:bg-white/5 transition-all active:scale-[0.98] disabled:opacity-60"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  使用 Google 註冊
                </button>
              </form>
            )}

            <div className="mt-10 pt-8 border-t border-outline-variant">
              <p className="text-[10px] text-center text-slate-500 uppercase tracking-widest font-label-caps">
                System Version 2.4.0-Stable | Sector-7 Authorized Access Only
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
