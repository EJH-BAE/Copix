import { Navigate } from 'react-router-dom';
import { AuthPanel } from '../components/AuthPanel';
import { useAuth } from '../lib/auth';

export default function Signup() {
	const { user, loading } = useAuth();
	if (!loading && user) return <Navigate to="/account" replace />;
	return (
		<div className="auth-page">
			<AuthPanel mode="signup" />
		</div>
	);
}
