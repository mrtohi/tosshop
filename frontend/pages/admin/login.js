import { useState } from "react";
import { useRouter } from "next/router";
import { login, setToken } from "../../lib/adminApi";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token } = await login(email, password);
      setToken(token);
      router.push("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-surface">
      <form onSubmit={submit} className="bg-white rounded-2xl p-8 w-full max-w-sm border border-[#DDE3E0]">
        <h1 className="font-extrabold text-xl mb-6 text-center">ورود به پنل مدیریت</h1>

        {error && (
          <div className="text-sm rounded-lg p-3 mb-4 bg-[#FBE9E7] text-[#C1443C]">{error}</div>
        )}

        <div className="flex flex-col gap-3 mb-6">
          <input
            type="email"
            placeholder="ایمیل"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-[#DDE3E0] rounded-lg px-3 py-2.5 text-sm"
            required
          />
          <input
            type="password"
            placeholder="رمز عبور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-[#DDE3E0] rounded-lg px-3 py-2.5 text-sm"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg font-bold text-white bg-primary disabled:opacity-60"
        >
          {loading ? "در حال ورود..." : "ورود"}
        </button>
      </form>
    </div>
  );
}
