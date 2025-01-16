'use server'

import { signIn } from "next-auth/react";

export async function loginWithGithub() {
  await signIn("github", { callbackUrl: "/dashboard" });
}

export async function loginWithAccessToken(accessToken: string) {
  await signIn("credentials", { accessToken, callbackUrl: "/dashboard" });
}

