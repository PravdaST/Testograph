// Force all /admin routes to use dynamic rendering in Next.js 16
// This prevents server-side pre-rendering which can't access session cookies
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
