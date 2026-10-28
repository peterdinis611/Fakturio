import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/spinner";

export const metadata = { title: "Registrácia" };

export default function SignUpPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-ground px-4 py-12">
      <Suspense fallback={<PageLoader label="Načítavam registráciu…" />}>
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/dashboard"
        />
      </Suspense>
    </div>
  );
}
