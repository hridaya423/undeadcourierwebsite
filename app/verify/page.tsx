/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function VerifyPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      router.push(`/profile`);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-md mx-auto bg-gray-900 p-8 rounded-lg">
        <h1 className="text-2xl font-bold text-toxic-green mb-6">
          Verify Your Player Account
        </h1>

        <div className="mb-8">
          <p className="text-gray-400 mb-4">
            To verify your player account and set a username, please enter the
            verification code from the game:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Open the game on your device</li>
            <li>Go to Settings or Profile section</li>
            <li>Click on &quot;Get Verification Code&quot;</li>
            <li>Enter the 6-digit code below</li>
          </ol>
        </div>

        <form onSubmit={handleVerify}>
          <div className="mb-6">
            <label
              htmlFor="code"
              className="block text-gray-400 mb-2 font-medium"
            >
              Verification Code
            </label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter 6-digit code"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-toxic-green"
              maxLength={6}
              pattern="[0-9]{6}"
              required
            />
          </div>

          {error && (
            <div className="mb-6 p-3 bg-blood-red/20 border border-blood-red rounded-lg text-blood-red">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-toxic-green text-black font-bold py-3 px-4 rounded-lg hover:bg-toxic-green/80 transition disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-toxic-green hover:underline">
            ← Back to Main
          </Link>
        </div>
      </div>
    </div>
  );
}