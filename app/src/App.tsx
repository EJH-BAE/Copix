import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AuthCallback from './pages/AuthCallback';
import Account from './pages/Account';

export default function App() {
	const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined;
	return (
		<AuthProvider>
			<BrowserRouter basename={basename}>
				<Routes>
					<Route path="/" element={<Landing />} />
					<Route path="/login" element={<Login />} />
					<Route path="/signup" element={<Signup />} />
					<Route path="/auth/callback" element={<AuthCallback />} />
					<Route path="/account" element={<Account />} />
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	);
}
