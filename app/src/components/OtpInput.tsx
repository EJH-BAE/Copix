import { useEffect, useRef } from 'react';

type Props = {
	value: string;
	onChange: (v: string) => void;
	disabled?: boolean;
};

export function OtpInput({ value, onChange, disabled }: Props) {
	const refs = useRef<Array<HTMLInputElement | null>>([]);
	const digits = Array.from({ length: 6 }, (_, i) => value[i] || '');

	useEffect(() => {
		refs.current[0]?.focus();
	}, []);

	function commit(nextDigits: string[]) {
		const joined = nextDigits.join('').replace(/\D/g, '').slice(0, 6);
		onChange(joined);
		return joined;
	}

	function setAt(index: number, char: string) {
		const next = digits.slice();
		next[index] = char;
		const joined = commit(next);
		if (char && index < 5) refs.current[index + 1]?.focus();
		else if (joined.length === 6) refs.current[5]?.blur();
	}

	return (
		<div className="otp" role="group" aria-label="6-digit code">
			{digits.map((d, i) => (
				<input
					key={i}
					ref={(el) => {
						refs.current[i] = el;
					}}
					className="otp-cell"
					type="text"
					inputMode="numeric"
					pattern="[0-9]*"
					autoComplete={i === 0 ? 'one-time-code' : 'off'}
					maxLength={1}
					size={1}
					disabled={disabled}
					value={d}
					aria-label={`Digit ${i + 1}`}
					onChange={(e) => {
						const v = e.target.value.replace(/\D/g, '').slice(-1);
						setAt(i, v);
					}}
					onKeyDown={(e) => {
						if (e.key === 'Backspace') {
							e.preventDefault();
							if (digits[i]) {
								setAt(i, '');
							} else if (i > 0) {
								refs.current[i - 1]?.focus();
								const next = digits.slice();
								next[i - 1] = '';
								commit(next);
							}
						} else if (e.key === 'ArrowLeft' && i > 0) {
							refs.current[i - 1]?.focus();
						} else if (e.key === 'ArrowRight' && i < 5) {
							refs.current[i + 1]?.focus();
						}
					}}
					onPaste={(e) => {
						const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
						if (paste) {
							e.preventDefault();
							onChange(paste);
							refs.current[Math.min(5, Math.max(0, paste.length - 1))]?.focus();
						}
					}}
				/>
			))}
		</div>
	);
}
