import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center px-6">
          <p className="text-sm text-zinc-600">Loading…</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
