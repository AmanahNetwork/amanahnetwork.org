import { Navigate } from 'react-router-dom';

export const GovernanceGuard = ({ children }) => {
    const hasGovAuth = sessionStorage.getItem('transferGovAuth') === 'true' || sessionStorage.getItem('govAuth') === 'true';

    if (!hasGovAuth) return <Navigate to="/" replace />;
    return children;
};