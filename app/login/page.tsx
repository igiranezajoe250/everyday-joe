import LoginPageClient from "./LoginPageClient";
import { authProviders } from "@/auth";

export const metadata = {
  title: "Log In | Syncabi",
};

function sanitizeNext(value: string | string[] | undefined) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

function getContextCopy(context: string | string[] | undefined) {
  if (context === "syncabi") {
    return {
      eyebrow: "Syncabi",
      title: "Sign in",
      body:
        "Use your account to open Syncabi.",
      asideTitle: "Inside Syncabi",
      asideItems: [
        "Inventory, point of sale, invoicing, and reporting.",
        "One place for day-to-day operations.",
        "A quiet, direct sign-in flow.",
      ],
    };
  }

  return {
  eyebrow: "Syncabi",
    title: "Sign in",
    body:
      "Use your account to continue.",
    asideTitle: "Your account",
    asideItems: [
      "Portfolio, wallet, and transfers.",
      "Syncabi for business operations.",
      "One sign-in across the platform.",
    ],
  };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{
    next?: string | string[];
    context?: string | string[];
  }>;
}) {
  const params = (await searchParams) ?? {};
  const redirectTo = sanitizeNext(params.next);
  const contextCopy = getContextCopy(params.context);

  return (
    <LoginPageClient
      redirectTo={redirectTo}
      providers={authProviders}
      eyebrow={contextCopy.eyebrow}
      title={contextCopy.title}
      body={contextCopy.body}
      asideTitle={contextCopy.asideTitle}
      asideItems={contextCopy.asideItems}
    />
  );
}
