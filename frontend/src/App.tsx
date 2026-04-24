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
import InvoiceDashboard from "./pages/finance/InvoiceDashboard";
import PaymentHistory from "./pages/finance/PaymentHistory";
import BalanceView from "./pages/finance/BalanceView";
import PazYSalvo from "./pages/finance/PazYSalvo";
import ImportData from "./pages/finance/ImportData";
import FAQView from "./pages/communication/FAQView";
import FAQAdmin from "./pages/communication/FAQAdmin";
import PQRSList from "./pages/communication/PQRSList";
import PQRSForm from "./pages/communication/PQRSForm";
import CircularDashboard from "./pages/communication/CircularDashboard";
import CommunicationHistory from "./pages/communication/CommunicationHistory";
import ReservationList from "./pages/reservations/ReservationList";
import ReservationForm from "./pages/reservations/ReservationForm";
import CalendarView from "./pages/reservations/CalendarView";
import InfractionList from "./pages/convivencia/InfractionList";
import InfractionForm from "./pages/convivencia/InfractionForm";
import RegulationView from "./pages/convivencia/RegulationView";
import AssemblyList from "./pages/assemblies/AssemblyList";
import AssemblyDetail from "./pages/assemblies/AssemblyDetail";
import AgendaBuilder from "./pages/assemblies/AgendaBuilder";
import AttendanceTracker from "./pages/assemblies/AttendanceTracker";
import VoteForm from "./pages/assemblies/VoteForm";
import MinutesView from "./pages/assemblies/MinutesView";
import TaskList from "./pages/assemblies/TaskList";
import TaskDetail from "./pages/assemblies/TaskDetail";
import ProviderList from "./pages/providers/ProviderList";
import ProviderForm from "./pages/providers/ProviderForm";
import ContractView from "./pages/providers/ContractView";
import AlertDashboard from "./pages/maintenance/AlertDashboard";
import AlertForm from "./pages/maintenance/AlertForm";
import MaintenanceCalendar from "./pages/maintenance/MaintenanceCalendar";

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

        {/* Finance */}
        <Route path="/finance" element={<ProtectedRoute><Layout><InvoiceDashboard /></Layout></ProtectedRoute>} />
        <Route path="/finance/payments" element={<ProtectedRoute><Layout><PaymentHistory /></Layout></ProtectedRoute>} />
        <Route path="/finance/balance" element={<ProtectedRoute><Layout><BalanceView /></Layout></ProtectedRoute>} />
        <Route path="/finance/pazysalvo" element={<ProtectedRoute><Layout><PazYSalvo /></Layout></ProtectedRoute>} />
        <Route path="/finance/import" element={<ProtectedRoute><Layout><ImportData /></Layout></ProtectedRoute>} />

        {/* Communication */}
        <Route path="/communication" element={<ProtectedRoute><Layout><PQRSList /></Layout></ProtectedRoute>} />
        <Route path="/communication/new" element={<ProtectedRoute><Layout><PQRSForm /></Layout></ProtectedRoute>} />
        <Route path="/communication/faq" element={<ProtectedRoute><Layout><FAQView /></Layout></ProtectedRoute>} />
        <Route path="/communication/faq/admin" element={<ProtectedRoute><Layout><FAQAdmin /></Layout></ProtectedRoute>} />
        <Route path="/communication/circulars" element={<ProtectedRoute><Layout><CircularDashboard /></Layout></ProtectedRoute>} />
        <Route path="/communication/history" element={<ProtectedRoute><Layout><CommunicationHistory /></Layout></ProtectedRoute>} />

        {/* Reservations */}
        <Route path="/reservations" element={<ProtectedRoute><Layout><ReservationList /></Layout></ProtectedRoute>} />
        <Route path="/reservations/new" element={<ProtectedRoute><Layout><ReservationForm /></Layout></ProtectedRoute>} />
        <Route path="/reservations/calendar" element={<ProtectedRoute><Layout><CalendarView /></Layout></ProtectedRoute>} />

        {/* Convivencia */}
        <Route path="/convivencia" element={<ProtectedRoute><Layout><InfractionList /></Layout></ProtectedRoute>} />
        <Route path="/convivencia/new" element={<ProtectedRoute><Layout><InfractionForm /></Layout></ProtectedRoute>} />
        <Route path="/convivencia/regulations" element={<ProtectedRoute><Layout><RegulationView /></Layout></ProtectedRoute>} />

        {/* Assemblies */}
        <Route path="/assemblies" element={<ProtectedRoute><Layout><AssemblyList /></Layout></ProtectedRoute>} />
        <Route path="/assemblies/:id" element={<ProtectedRoute><Layout><AssemblyDetail /></Layout></ProtectedRoute>} />
        <Route path="/assemblies/:id/agenda" element={<ProtectedRoute><Layout><AgendaBuilder /></Layout></ProtectedRoute>} />
        <Route path="/assemblies/:id/attendance" element={<ProtectedRoute><Layout><AttendanceTracker /></Layout></ProtectedRoute>} />
        <Route path="/assemblies/:id/vote/:agendaId" element={<ProtectedRoute><Layout><VoteForm /></Layout></ProtectedRoute>} />
        <Route path="/assemblies/:id/minutes" element={<ProtectedRoute><Layout><MinutesView /></Layout></ProtectedRoute>} />
        <Route path="/assemblies/:id/tasks" element={<ProtectedRoute><Layout><TaskList /></Layout></ProtectedRoute>} />
        <Route path="/assemblies/:id/tasks/:taskId" element={<ProtectedRoute><Layout><TaskDetail /></Layout></ProtectedRoute>} />

        {/* Providers */}
        <Route path="/directories" element={<ProtectedRoute><Layout><ProviderList /></Layout></ProtectedRoute>} />
        <Route path="/directories/new" element={<ProtectedRoute><Layout><ProviderForm /></Layout></ProtectedRoute>} />
        <Route path="/directories/:id" element={<ProtectedRoute><Layout><ContractView /></Layout></ProtectedRoute>} />

        {/* Maintenance */}
        <Route path="/maintenance" element={<ProtectedRoute><Layout><AlertDashboard /></Layout></ProtectedRoute>} />
        <Route path="/maintenance/new" element={<ProtectedRoute><Layout><AlertForm /></Layout></ProtectedRoute>} />
        <Route path="/maintenance/calendar" element={<ProtectedRoute><Layout><MaintenanceCalendar /></Layout></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
