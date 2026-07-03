import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RequireStaff({ children }) {
  const { staff, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-light dark:bg-base-dark text-ink-light dark:text-ink-dark">
        <p className="text-sm text-muted-light dark:text-muted-dark">Loading...</p>
      </div>
    );
  }

  if (!staff) {
    return <Navigate to="/staff/login" replace />;
  }

  return children;
}
