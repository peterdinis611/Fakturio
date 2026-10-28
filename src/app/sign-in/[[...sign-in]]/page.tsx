import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/spinner";

export const metadata = { title: "Prihlásenie" };

export default function SignInPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-ground px-4 py-12">
      <Suspense fallback={<PageLoader label="Načítavam prihlásenie…" />}>
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/dashboard"
        />
      </Suspense>
    </div>
  );
}
