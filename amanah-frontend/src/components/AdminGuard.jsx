import { Navigate } from 'react-router-dom';

export const AdminGuard = ({ children }) => {
    const hasGovAuth = sessionStorage.getItem('transferGovAuth') === 'true' || sessionStorage.getItem('govAuth') === 'true';
    const hasUserAuth = sessionStorage.getItem('userAuth') === 'true' || sessionStorage.getItem('agentUserAuth') === 'true';

    if (!hasGovAuth) return <Navigate to="/" replace />;
    if (!hasUserAuth) return <Navigate to="/admin-login" replace />;
    
    return children;
};
export default AdminGuard;