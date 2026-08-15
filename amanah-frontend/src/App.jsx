import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import { GovernanceGuard } from './components/GovernanceGaurd';
import AdminGuard from './components/AdminGuard';
// Features
import Register from './features/public/Register';
import Donate from './features/public/Donate';
import RequestAid from './features/public/RequestAid';
import Timeline from './features/public/Timeline';
import Home from './features/public/Home';
import Council from './features/public/Council';
import Associates from './features/public/Associates';
import Terms from './features/public/Terms';
import Contact from './features/public/Contact';
import Vision from './features/public/Vision';
import EnrollAgent from './features/admin/EnrollAgent';
import TransferAid from '../src/components/TransferAid';
import AccessPortal from './features/public/AccessPortal';
import AdminEntryPortal from './features/admin/AdminEntryPortal';

const Dashboard = lazy(() => import('./features/admin/Dashboard'));

// Helper to enforce security session reset on explicit Home page navigation
function SecurityManager() {
  const location = useLocation();

  useEffect(() => {
    // Clear secret session state whenever user explicitly navigates to Home page
    if (location.pathname === '/') {
      sessionStorage.removeItem('transferGovAuth');
      sessionStorage.removeItem('govAuth');
      sessionStorage.removeItem('agentUserAuth');
      sessionStorage.removeItem('userAuth');
      sessionStorage.removeItem('dashboardAuth');
      localStorage.removeItem('governanceKey');
    }
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <Router>
      <SecurityManager />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Secret Gate Route for Aid Transfer & Agent Flow */}
        <Route path={import.meta.env.VITE_SECRET_TRANSFER_PATH} element={<AccessPortal />} />

        {/* Protected Agent Routes (Require prior entry of VITE_SECRET_TRANSFER_PATH and Key) */}
        <Route path="/admin-login" element={
          <GovernanceGuard>
            <AdminEntryPortal />
          </GovernanceGuard>
        } />

        <Route path="/enrollment" element={
          <GovernanceGuard>
            <EnrollAgent />
          </GovernanceGuard>
        } />

        <Route path="/transferaid" element={
          <AdminGuard>
            <TransferAid />
          </AdminGuard>
        } />

        {/* Public Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/request-aid" element={<RequestAid />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/council" element={<Council />} />
        <Route path="/associates" element={<Associates />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/vision" element={<Vision />} />

        {/* Secret Gate Route for Governance Dashboard */}
        <Route path={import.meta.env.VITE_VISION_PATH} element={
          <Suspense fallback={<div>Loading...</div>}>
            <Dashboard />
          </Suspense>
        } />
        <Route path={import.meta.env.VITE_VISION_PATH} element={
          <Suspense fallback={<div>Loading...</div>}>
            <Dashboard />
          </Suspense>
        } />
        <Route path="/dashboard" element={
          <Suspense fallback={<div>Loading...</div>}>
            <Dashboard />
          </Suspense>
        } />

        {/* Fallback to Home */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;