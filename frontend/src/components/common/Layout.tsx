import { useAuthStore } from "../../store/authStore";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { sidebarCollapsed } = useAuthStore();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar collapsed={sidebarCollapsed} />
      <div style={{ flex: 1, marginLeft: sidebarCollapsed ? 64 : 240 }}>
        <Header />
        <main style={{ padding: 24 }}>{children}</main>
      </div>
    </div>
  );
}
