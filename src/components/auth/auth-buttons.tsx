"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import React from "react";
import { Button } from "../ui/button";

export const SignInButton = () => {
  const { signIn } = useAuthActions();
  return (
    <Button
      className="bg-gray-900 text-md text-white font-semibold py-2 px-6 rounded-full transition-transform transform hover:scale-105"
      onClick={() => signIn("google")}
    >
      Sign in Google
    </Button>
  );
};

export const SignOutButton = () => {
  const { signOut } = useAuthActions();
  return <Button onClick={() => signOut()}>Log out</Button>;
};
