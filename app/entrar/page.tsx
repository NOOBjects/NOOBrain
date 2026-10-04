import type { Metadata } from "next";
import { LoginDone } from "@/components/LoginDone";

export const metadata: Metadata = { title: "A entrar · NOOBrain", robots: { index: false } };

export default function Page() {
  return <LoginDone />;
}
