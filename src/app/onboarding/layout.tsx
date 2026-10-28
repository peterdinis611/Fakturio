import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function Guard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = await auth();
  if (!isAuthenticated) redirect("/sign-in");
  return children;
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <Guard>{children}</Guard>
    </Suspense>
  );
}
