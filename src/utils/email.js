import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends an email using the Resend API.
 *
 * @async
 * @function sendEmail
 * @param {Object} options - The email options.
 * @param {string|string[]} options.to - The recipient(s) of the email. Can be a single email address or an array of email addresses.
 * @param {string} options.subject - The subject of the email.
 * @returns {Promise<Object>} A promise that resolves to the response data from the Resend API.
 * @throws {Error} Throws an error if the email sending fails or if the Resend API returns an error.
 */
async function sendEmail(options) {
  try {
    const data = await resend.emails.send({
      from: `EduMove <info@feliexpress.com>`,
      // from: process.env.RESEND_NO_REPLY_EMIL,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.body,
    });

    if (data.error !== null) throw new Error(data.error.message);
    return data;
  } catch (error) {
    throw new Error(error);
  }
}

export default sendEmail;
