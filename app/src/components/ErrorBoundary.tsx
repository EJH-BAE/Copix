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
				<div className="page" style={{ padding: 48, textAlign: 'center' }}>
					<img src={`${import.meta.env.BASE_URL}icon.png`} alt="" width={36} height={36} />
					<h1>Something went wrong</h1>
					<p className="hero-trust">{this.state.error.message}</p>
					<div className="hero-cta">
						<button
							type="button"
							className="btn primary"
							onClick={() => {
								this.setState({ error: null });
								window.location.reload();
							}}
						>
							Reload
						</button>
						<Link className="btn ghost" to="/">
							Back home
						</Link>
					</div>
				</div>
			);
		}
		return this.props.children;
	}
}
