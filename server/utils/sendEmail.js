import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ to, subject, html }) => {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || 'CollabFlow <onboarding@resend.dev>',
    to,
    subject,
    html,
  });

  if (error) {
    console.error('Resend email error:', error);
    throw new Error(error.message || 'Failed to send email');
  }

  return data;
};