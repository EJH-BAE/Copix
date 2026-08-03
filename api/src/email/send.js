import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import nodemailer from 'nodemailer';
import { env } from '../lib/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const emailsDir = path.resolve(__dirname, '../../emails');

function render(template, vars) {
	let out = template;
	for (const [k, v] of Object.entries(vars)) {
		out = out.replaceAll(`{{${k}}}`, String(v));
	}
	return out;
}

function loadTemplate(name) {
	return fs.readFileSync(path.join(emailsDir, name), 'utf8');
}

let transporter;

function getTransporter() {
	if (transporter) return transporter;
	if (!env.smtp.host || !env.smtp.pass) return null;
	transporter = nodemailer.createTransport({
		host: env.smtp.host,
		port: env.smtp.port,
		secure: env.smtp.secure,
		auth: {
			user: env.smtp.user,
			pass: env.smtp.pass,
		},
	});
	return transporter;
}

/**
 * Send the Copix 6-digit sign-in email (custom template — not Supabase defaults).
 * When SMTP is not configured, returns { demo: true, code } so local/dev still works.
 */
export async function sendOtpEmail(email, code) {
	const vars = {
		CODE: code,
		EXPIRES_MINUTES: '10',
		YEAR: String(new Date().getFullYear()),
	};
	const html = render(loadTemplate('otp.html'), vars);
	const text = render(loadTemplate('otp.txt'), vars);
	const subject = `${code} is your Copix sign-in code`;

	const tx = getTransporter();
	if (!tx) {
		console.log(`[copix-email:demo] To: ${email}  Code: ${code}`);
		return { ok: true, demo: true, code, message: 'SMTP not configured — code returned for development' };
	}

	await tx.sendMail({
		from: env.smtp.from,
		to: email,
		subject,
		html,
		text,
	});
	return { ok: true, demo: false };
}
