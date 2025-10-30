"use client";

import React, { useState } from "react";
import Link from "next/link";

type FormState = {
  username: string;
  email: string;
  mobile: string;
};

export default function DeleteAccountPage() {
  const [form, setForm] = useState<FormState>({
    username: "",
    email: "",
    mobile: "",
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = (data: FormState) => {
    const e: Partial<FormState> = {};
    if (!data.username.trim()) e.username = "Username is required.";
    if (!data.email.trim()) {
      e.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      e.email = "Enter a valid email.";
    }
    if (!data.mobile.trim()) {
      e.mobile = "Mobile number is required.";
    } else if (!/^\d{10}$/.test(data.mobile.trim())) {
      e.mobile = "Enter a 10-digit mobile number.";
    }
    return e;
  };

  const onChange =
    (field: keyof FormState) => (ev: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [field]: ev.target.value }));
      // live-validate the changed field
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    setSubmitting(true);
    try {
      // If you have an API endpoint, call it here:
      // await fetch("/api/account/delete-request", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(form),
      // });
      // For now, just simulate success:
      await new Promise((r) => setTimeout(r, 600));
      setSubmitted(true);
    } catch (err) {
      // You can surface an error toast or inline error here
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-xl mx-auto px-4 py-12">
          <div className="rounded-2xl border border-gray-200 shadow-sm p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Delete Account Request Received
            </h1>
            <p className="mt-3 text-gray-900">
              Thanks, <span className="font-medium">{form.username}</span>.
              We’ve recorded your request to delete your account associated with{" "}
              <span className="font-medium">{form.email}</span> /{" "}
              <span className="font-medium">{form.mobile}</span>.
            </p>
            <p className="mt-2 text-gray-900">
              Your data will be permanently deleted in{" "}
              <span className="font-semibold">2–3 business days</span>. If you
              didn’t make this request, please contact support immediately.
            </p>
            <Link
              href="/"
              className="inline-flex mt-6 px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-100 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-xl mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          Delete My Account
        </h1>
        <p className="mt-2 text-gray-900">
          Enter your details to request deletion of your account and associated
          data.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-900"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={form.username}
              onChange={onChange("username")}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your_username"
              autoComplete="username"
              required
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-900"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={onChange("email")}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Mobile */}
          <div>
            <label
              htmlFor="mobile"
              className="block text-sm font-medium text-gray-900"
            >
              Mobile Number
            </label>
            <input
              id="mobile"
              type="tel"
              inputMode="numeric"
              pattern="\d{10}"
              value={form.mobile}
              onChange={onChange("mobile")}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="10-digit number"
              autoComplete="tel"
              required
            />
            {errors.mobile && (
              <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center rounded-lg bg-red-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-red-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Submitting..." : "Request Account Deletion"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-xs text-gray-700">
          By submitting, you confirm that you want your account and data to be
          permanently deleted. This action cannot be undone.
        </div>
      </div>
    </div>
  );
}
