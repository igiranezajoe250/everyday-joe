import type { NextAuthOptions } from "next-auth";
import Apple from "next-auth/providers/apple";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

type ProviderKey = "google" | "apple" | "github";

function hasEnv(...keys: string[]) {
  return keys.every((key) => Boolean(process.env[key]));
}

const providerAvailability: Record<ProviderKey, boolean> = {
  google: hasEnv("AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET"),
  apple: hasEnv("AUTH_APPLE_ID", "AUTH_APPLE_SECRET"),
  github: hasEnv("AUTH_GITHUB_ID", "AUTH_GITHUB_SECRET"),
};

const providers = [
  ...(providerAvailability.google
    ? [
        Google({
          clientId: process.env.AUTH_GOOGLE_ID!,
          clientSecret: process.env.AUTH_GOOGLE_SECRET!,
        }),
      ]
    : []),
  ...(providerAvailability.apple
    ? [
        Apple({
          clientId: process.env.AUTH_APPLE_ID!,
          clientSecret: process.env.AUTH_APPLE_SECRET!,
        }),
      ]
    : []),
  ...(providerAvailability.github
    ? [
        GitHub({
          clientId: process.env.AUTH_GITHUB_ID!,
          clientSecret: process.env.AUTH_GITHUB_SECRET!,
        }),
      ]
    : []),
];

export const authProviders = [
  {
    id: "google" as const,
    name: "Google",
    enabled: providerAvailability.google,
    blurb: "Sign in with your Google account.",
  },
  {
    id: "apple" as const,
    name: "Apple",
    enabled: providerAvailability.apple,
    blurb: "Sign in with your Apple account.",
  },
  {
    id: "github" as const,
    name: "GitHub",
    enabled: providerAvailability.github,
    blurb: "Sign in with your GitHub account.",
  },
];

export { providerAvailability };

export const authOptions: NextAuthOptions = {
  secret:
    process.env.AUTH_SECRET ??
    (process.env.NODE_ENV === "production"
      ? undefined
      : "mutara-capital-local-dev-secret"),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers,
};
