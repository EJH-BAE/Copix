import { Navigate } from 'react-router-dom';
import { AuthPanel } from '../components/AuthPanel';
import { useAuth } from '../lib/auth';

export default function Login() {
	const { user, loading } = useAuth();
	if (!loading && user) return <Navigate to="/account" replace />;
	return (
		<div className="auth-page">
			<AuthPanel mode="signin" />
		</div>
	);
}
