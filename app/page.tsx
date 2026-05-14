"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, User } from "lucide-react";

export default function Login() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [email, setEmail] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (res?.error === "No user found") {
      toast.error("No account found with this username");
    } else if (res?.error === "Invalid password") {
      toast.error("Incorrect password");
    } else if (res?.error === "ROLE_MISMATCH") {
      toast.error("Access denied for this role");
    } else if (res?.ok) {
      toast.success("Login successful");
      router.push("/dashboard");
    } else {
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6 py-12 overflow-hidden">

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-3xl bg-white shadow-2xl p-10 space-y-6"
        >
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-gray-800">
              Welcome Back
            </h2>
            <p className="text-sm text-gray-500">
              Login to continue
            </p>
          </div>

          {/* Username */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Enter username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-11 rounded-xl"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-11 rounded-xl"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <Button
            className="w-full h-11 text-base font-semibold rounded-xl bg-orange-600 hover:bg-orange-700"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </Button>

          <p className="text-xs text-center text-gray-500">
            © {new Date().getFullYear()} Finance Management System
          </p>
        </form>
    </div>
  );
}
