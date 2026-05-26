import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>BodyFix OS MVP</h1>
      <p>系統建置中。</p>
      <Link href="/dashboard">前往 Dashboard</Link>
    </main>
  );
}
