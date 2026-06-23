import type { Metadata } from "next";
import InternalAccessClient from "./InternalAccessClient";

export const metadata: Metadata = {
  title: "Restricted Interface",
  robots: {
    index: false,
    follow: false,
  },
};

export default function InternalAccessPage() {
  return <InternalAccessClient />;
}
