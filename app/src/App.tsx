import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import Landing from './pages/Landing';

export default function App() {
	const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined;
	return (
		<BrowserRouter basename={basename}>
			<ErrorBoundary>
				<Routes>
					<Route path="/" element={<Landing />} />
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</ErrorBoundary>
		</BrowserRouter>
	);
}
