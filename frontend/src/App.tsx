import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Layout from "./components/common/Layout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import UserList from "./pages/users/UserList";
import UserForm from "./pages/users/UserForm";
import VisitorList from "./pages/visitors/VisitorList";
import VisitorForm from "./pages/visitors/VisitorForm";
import AuthorizationList from "./pages/authorizations/AuthorizationList";
import AuthorizationForm from "./pages/authorizations/AuthorizationForm";
import ResidentList from "./pages/census/ResidentList";
import ResidentForm from "./pages/census/ResidentForm";
import AssetList from "./pages/assets/AssetList";
import AssetForm from "./pages/assets/AssetForm";
import DocumentDashboard from "./pages/documents/DocumentDashboard";
import DocumentUpload from "./pages/documents/DocumentUpload";
import DocumentSearch from "./pages/documents/DocumentSearch";
import ShareLinkView from "./pages/documents/ShareLinkView";
import AuditLog from "./pages/audit/AuditLog";
import Settings from "./pages/settings/Settings";
import Profile from "./pages/users/Profile";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="loading">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/documents/share/:token" element={<ShareLinkView />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Layout>
                <UserList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/new"
          element={
            <ProtectedRoute>
              <Layout>
                <UserForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <UserForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/visitors"
          element={
            <ProtectedRoute>
              <Layout>
                <VisitorList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/visitors/new"
          element={
            <ProtectedRoute>
              <Layout>
                <VisitorForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/visitors/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <VisitorForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/authorizations"
          element={
            <ProtectedRoute>
              <Layout>
                <AuthorizationList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/authorizations/new"
          element={
            <ProtectedRoute>
              <Layout>
                <AuthorizationForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/census"
          element={
            <ProtectedRoute>
              <Layout>
                <ResidentList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/census/residents/new"
          element={
            <ProtectedRoute>
              <Layout>
                <ResidentForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/census/residents/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <ResidentForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/assets"
          element={
            <ProtectedRoute>
              <Layout>
                <AssetList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/assets/new"
          element={
            <ProtectedRoute>
              <Layout>
                <AssetForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/assets/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <AssetForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <Layout>
                <DocumentDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/upload"
          element={
            <ProtectedRoute>
              <Layout>
                <DocumentUpload />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/search"
          element={
            <ProtectedRoute>
              <Layout>
                <DocumentSearch />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/audit"
          element={
            <ProtectedRoute>
              <Layout>
                <AuditLog />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
