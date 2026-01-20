import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const handler = async (event) => {
  try {
    const { email } = JSON.parse(event.body);

    await resend.emails.send({
      from: 'notifications@transplantmedicationnavigator.com',
      to: email,
      subject: 'Welcome!',
      html: '<p>Thanks for signing up for alerts.</p>'
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
