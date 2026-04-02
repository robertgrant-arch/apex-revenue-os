import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      {/*
        The sidebar is fixed. We give the main content area a left margin
        that matches the sidebar width (14rem = 224px when expanded).
        On mobile we go full-width and add a top bar instead.
      */}
      <main className="ml-0 md:ml-56 transition-all duration-300 min-h-screen">
        {children}
      </main>
    </div>
  );
}
