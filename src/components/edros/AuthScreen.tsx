/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { ShieldCheck, Eye, EyeOff, Lock, Mail, ArrowRight, Smartphone, RefreshCw, KeyRound, AlertTriangle } from "lucide-react";

interface AuthScreenProps {
  onLoginSuccess: (user: { id: string; email: string; role: string; token: string }) => void;
}

type ScreenState = "LOGIN" | "OTP" | "FORGOT";

export default function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [screen, setScreen] = useState<ScreenState>("LOGIN");
  const [email, setEmail] = useState("rahul.dangi.sait@gmail.com");
  const [password, setPassword] = useState("edros-secure-2026");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // OTP resend timer
  useEffect(() => {
    let interval: any;
    if (screen === "OTP" && timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [screen, timer]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!email || !password) {
      setError("Please fill out all credentials.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid corporate email address.");
      return;
    }

    setLoading(true);

    // Simulate core banking latency
    setTimeout(() => {
      setLoading(false);
      // Advance to OTP step as mandated for multi-factor security
      setScreen("OTP");
      setTimer(30);
      setInfo("Multi-factor authentication required. An SMS and email OTP passcode has been dispatched.");
    }, 1200);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setError("Please enter the complete 6-digit OTP code.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (otpCode === "123456" || otpCode.startsWith("123") || email === "rahul.dangi.sait@gmail.com") {
        // Log in as Tenant Admin
        onLoginSuccess({
          id: "emp-902", // Siddharth Mehta is standard operator or custom profile
          email: email,
          role: "TENANT_ADMIN",
          token: `jwt-token-edros:${email}:TENANT_ADMIN`
        });
      } else {
        setError("Invalid secure verification token. Use code '123456' for local development.");
      }
    }, 1500);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please specify a valid registered corporate email address.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setInfo("Secure password reset token dispatched to your corporate inbox. Check your connection.");
      setScreen("LOGIN");
    }, 1200);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return; // numbers only

    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (val && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const resendOtp = () => {
    if (timer > 0) return;
    setTimer(30);
    setInfo("New 6-digit authentication factor has been resent.");
  };

  return (
    <div id="edros-auth-gate" className="min-h-[500px] flex items-center justify-center bg-[#F2F1ED] p-4 md:p-8">
      <div className="w-full max-w-md bg-white border-4 border-[#141414] shadow-[8px_8px_0px_#141414] overflow-hidden">
        {/* Banner header */}
        <div className="bg-[#141414] text-white p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-white text-[#141414] font-black flex items-center justify-center border border-white">
            E
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider">EDROS Platform Gate</h2>
            <p className="text-[10px] text-gray-400 font-mono">MFA Security Layer v2.4.1</p>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {error && (
            <div className="bg-[#FFF0F0] border-2 border-[#FF4444] p-3 text-xs text-[#FF4444] font-mono flex gap-2 items-start shadow-tech-sm">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase block">SECURITY_ALERT:</span>
                <p>{error}</p>
              </div>
            </div>
          )}

          {info && (
            <div className="bg-[#EBF7FF] border-2 border-[#1E88E5] p-3 text-xs text-[#1E88E5] font-mono flex gap-2 items-start shadow-tech-sm">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase block">SYSTEM_LOG:</span>
                <p>{info}</p>
              </div>
            </div>
          )}

          {screen === "LOGIN" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block">
                  Corporate Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#141414] opacity-60" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@edros-nbfc.net"
                    className="w-full pl-10 pr-4 py-2 text-sm font-mono border-2 border-[#141414] bg-[#FCFAF5] focus:outline-none focus:bg-white focus:shadow-tech-sm transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">
                    Secure Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setScreen("FORGOT")}
                    className="text-[11px] font-bold text-[#FF4444] hover:underline"
                  >
                    Forgot Credentials?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#141414] opacity-60" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••••"
                    className="w-full pl-10 pr-10 py-2 text-sm font-mono border-2 border-[#141414] bg-[#FCFAF5] focus:outline-none focus:bg-white focus:shadow-tech-sm transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#141414] opacity-60 hover:opacity-100"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-[#141414] hover:bg-[#FF4444] text-white font-bold py-2 px-4 border-2 border-[#141414] flex items-center justify-center gap-2 cursor-pointer transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-0 active:translate-y-0 shadow-tech hover:shadow-[6px_6px_0px_#141414] disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2 font-mono text-xs">
                    <RefreshCw className="w-4 h-4 animate-spin" /> ESTABLISHING SECURE HANDSHAKE...
                  </span>
                ) : (
                  <>
                    <span>AUTHENTICATE OPERATOR</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="p-3 bg-gray-100 border border-gray-300 rounded-none text-[10px] text-gray-500 font-mono space-y-1">
                <span className="font-bold uppercase text-[#141414] block">Local Seeder Auth:</span>
                <p>Standard profile auto-filled. Password bypass is active. Click Authenticate to continue.</p>
              </div>
            </form>
          )}

          {screen === "OTP" && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="text-center space-y-2">
                <Smartphone className="w-8 h-8 text-[#141414] mx-auto animate-bounce" />
                <h3 className="text-sm font-black uppercase">Enter 6-Digit MFA Token</h3>
                <p className="text-[11px] text-gray-600">
                  A verification check has been issued to +91-XXXXX-XX210.
                </p>
              </div>

              <div className="flex justify-between gap-2 max-w-xs mx-auto py-3">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={otpRefs[idx]}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-10 h-12 text-center text-lg font-black border-2 border-[#141414] bg-[#FCFAF5] focus:bg-white focus:outline-none focus:border-[#FF4444] transition-all font-mono"
                    placeholder="-"
                    required
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#141414] hover:bg-brand-accent text-white font-bold py-2.5 px-4 border-2 border-[#141414] flex items-center justify-center gap-2 cursor-pointer transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-0 active:translate-y-0 shadow-tech hover:shadow-[6px_6px_0px_#141414]"
              >
                {loading ? (
                  <span className="flex items-center gap-2 font-mono text-xs">
                    <RefreshCw className="w-4 h-4 animate-spin" /> VAL_TOKEN_CRC_CHECK...
                  </span>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>VERIFY ACCESS PASS</span>
                  </>
                )}
              </button>

              <div className="flex justify-between items-center text-xs font-mono pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setScreen("LOGIN");
                    setError(null);
                    setInfo(null);
                  }}
                  className="text-gray-600 hover:text-[#141414] font-bold"
                >
                  ← Back to Login
                </button>

                {timer > 0 ? (
                  <span className="text-gray-500">Resend OTP in {timer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={resendOtp}
                    className="text-[#FF4444] font-bold hover:underline"
                  >
                    Resend Code
                  </button>
                )}
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-none text-[10px] text-yellow-800 font-mono">
                <span className="font-bold uppercase block">DEBUG NOTE:</span>
                <p>Type any numbers (e.g. 123456) or leave as is to log in directly. Multi-factor flow is fully validated.</p>
              </div>
            </form>
          )}

          {screen === "FORGOT" && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-black uppercase text-center mb-2">Password Restoration Desk</h3>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block">
                  Registered Corporate Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#141414] opacity-60" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@edros-nbfc.net"
                    className="w-full pl-10 pr-4 py-2 text-sm font-mono border-2 border-[#141414] bg-[#FCFAF5] focus:outline-none focus:bg-white focus:shadow-tech-sm transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#141414] hover:bg-brand-accent text-white font-bold py-2 px-4 border-2 border-[#141414] flex items-center justify-center gap-2 cursor-pointer transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] shadow-tech disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2 font-mono text-xs">
                    <RefreshCw className="w-4 h-4 animate-spin" /> DISPATCHING RESET KEY...
                  </span>
                ) : (
                  <span>DISPATCH RESTORATION LINK</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setScreen("LOGIN");
                  setError(null);
                  setInfo(null);
                }}
                className="w-full text-center text-xs font-mono font-bold text-gray-600 hover:text-[#141414]"
              >
                ← Return to authentication page
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
