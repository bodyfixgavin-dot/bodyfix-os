import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>BodyFix OS MVP</h1>
      <p>系統建置中。</p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/dashboard">前往 Dashboard</Link>
        <Link href="/booking">前往 Booking</Link>
        <Link href="/admin">前往 Booking Admin</Link>
        <Link href="/sadm">前往 SADM 關係決策整理</Link>
      </div>
    </main>
  );
}
