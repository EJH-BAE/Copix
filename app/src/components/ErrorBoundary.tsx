import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
	state: State = { error: null };

	static getDerivedStateFromError(error: Error): State {
		return { error };
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		console.error('UI crash', error, info.componentStack);
	}

	render() {
		if (this.state.error) {
			return (
				<div className="auth-page">
					<div className="auth-card">
						<p className="auth-brand">
							<img src={`${import.meta.env.BASE_URL}icon.png`} alt="" width={36} height={36} />
							<span>Copix</span>
						</p>
						<h1>Something went wrong</h1>
						<p className="auth-sub">The page hit an unexpected error. You can reload or go home.</p>
						<p className="auth-error">{this.state.error.message}</p>
						<div className="auth-actions">
							<button
								type="button"
								className="auth-btn auth-btn-primary"
								onClick={() => {
									this.setState({ error: null });
									window.location.reload();
								}}
							>
								Reload
							</button>
							<Link className="auth-btn auth-btn-ghost" to="/">
								Back home
							</Link>
						</div>
					</div>
				</div>
			);
		}
		return this.props.children;
	}
}
