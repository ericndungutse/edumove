import sendEmail from './email.js';

function generateEmailTemplate(status, { guardian, student, travelDetails, travelNumber }) {
  const arrivalTime = new Date(travelDetails.expectedArrivalTime).toLocaleString();
  const transporter = travelDetails.transporter;

  const templates = {
    Boarded: {
      subject: `🚌 ${student.name} has boarded the bus`,
      body: `
        <p>Hello <strong>${guardian.name}</strong>,</p>
        <p>We wanted to let you know that <strong>${student.name}</strong> has <span style="color: #0ea5e9; font-weight: bold;">boarded the bus</span>.</p>
        <p><strong>Departure:</strong> ${travelDetails.departure}<br/>
           <strong>Destination:</strong> ${travelDetails.destination}<br/>
           <strong>Departure Time:</strong> ${travelDetails.departureTime}<br/>
           <strong>Expected Arrival:</strong> ${arrivalTime}</p>
        <p><strong>Transporter:</strong> ${transporter.name}</p>
        <p style="font-size: 14px;">Trip ID: <strong>${travelNumber}</strong></p>
      `,
    },
    'Arrived At Destination': {
      subject: `✅ ${student.name} has arrived at the destination`,
      body: `
        <p>Hello <strong>${guardian.name}</strong>,</p>
        <p><strong>${student.name}</strong> has <span style="color: green; font-weight: bold;">safely arrived at the destination</span>.</p>
        <p><strong>Destination:</strong> ${travelDetails.destination}<br/>
           <strong>Transporter:</strong> ${transporter.name}</p>
        <p style="font-size: 14px;">Trip ID: <strong>${travelNumber}</strong></p>
      `,
    },
    'Arrived At School': {
      subject: `🏫 ${student.name} has arrived at school`,
      body: `
        <p>Hello <strong>${guardian.name}</strong>,</p>
        <p><strong>${student.name}</strong> has <span style="color: green; font-weight: bold;">safely arrived at school</span>.</p>
        <p><strong>From:</strong> ${travelDetails.departure}<br/>
           <strong>Transporter:</strong> ${transporter.name}</p>
        <p style="font-size: 14px;">Trip ID: <strong>${travelNumber}</strong></p>
      `,
    },
    Cancelled: {
      subject: `⚠️ Travel Cancelled for ${student.name}`,
      body: `
        <p>Hello <strong>${guardian.name}</strong>,</p>
        <p>We regret to inform you that <strong>${student.name}</strong>’s trip has been <span style="color: red; font-weight: bold;">cancelled</span>.</p>
        <p>If you have questions, please contact your assigned transporter <strong>${transporter.name}</strong>.</p>
        <p style="font-size: 14px;">Trip ID: <strong>${travelNumber}</strong></p>
      `,
    },
  };

  const template = templates[status];
  if (!template) return null;

  return `
    <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 0;
            background: #f4f6f8;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #374151;
          }
          .email-container {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
          }
          .header {
            text-align: center;
            color: #0ea5e9;
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 20px;
          }
          .footer {
            margin-top: 30px;
            font-size: 13px;
            color: #9ca3af;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">EduMove Travel Update</div>
          ${template.body}
          <div class="footer">
            <p>Powered by EduMove</p>
            <p>&copy; ${new Date().getFullYear()} EduMove. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateSchoolEmailTemplate(status, { student, travelDetails, travelNumber }) {
  const arrivalTime = new Date(travelDetails.expectedArrivalTime).toLocaleString();
  const transporter = travelDetails.transporter;

  const templates = {
    Boarded: {
      subject: `🚌 ${student.name} has boarded the bus`,
      body: `
        <p>Dear School Administrator,</p>
        <p>This is to inform you that <strong>${student.name}</strong> has <span style="color: #0ea5e9; font-weight: bold;">boarded the school bus</span>.</p>
        <p><strong>From:</strong> ${travelDetails.departure}<br/>
           <strong>To:</strong> ${travelDetails.destination}<br/>
           <strong>Departure Time:</strong> ${travelDetails.departureTime}<br/>
           <strong>Expected Arrival:</strong> ${arrivalTime}</p>
        <p><strong>Transporter:</strong> ${transporter.name}</p>
        <p style="font-size: 14px;">Trip ID: <strong>${travelNumber}</strong></p>
      `,
    },
    'Arrived At School': {
      subject: `🏫 ${student.name} has arrived at school`,
      body: `
        <p>Dear School Administrator,</p>
        <p><strong>${student.name}</strong> has <span style="color: green; font-weight: bold;">safely arrived at the school</span>.</p>
        <p><strong>Origin:</strong> ${travelDetails.departure}<br/>
           <strong>Transporter:</strong> ${transporter.name}</p>
        <p style="font-size: 14px;">Trip ID: <strong>${travelNumber}</strong></p>
      `,
    },
    'Arrived At Destination': {
      subject: `✅ ${student.name} has arrived at the destination`,
      body: `
        <p>Dear School Administrator,</p>
        <p><strong>${student.name}</strong> has <span style="color: green; font-weight: bold;">arrived at the destination</span> as planned.</p>
        <p><strong>Destination:</strong> ${travelDetails.destination}<br/>
           <strong>Transporter:</strong> ${transporter.name}</p>
        <p style="font-size: 14px;">Trip ID: <strong>${travelNumber}</strong></p>
      `,
    },
    Cancelled: {
      subject: `⚠️ Trip Cancelled for ${student.name}`,
      body: `
        <p>Dear School Administrator,</p>
        <p>The planned trip for <strong>${student.name}</strong> has been <span style="color: red; font-weight: bold;">cancelled</span>.</p>
        <p>Please take the necessary actions if needed. For inquiries, contact the transporter: <strong>${transporter.name}</strong>.</p>
        <p style="font-size: 14px;">Trip ID: <strong>${travelNumber}</strong></p>
      `,
    },
  };

  const template = templates[status];
  if (!template) return null;

  return `
    <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 0;
            background: #f4f6f8;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #374151;
          }
          .email-container {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
          }
          .header {
            text-align: center;
            color: #0ea5e9;
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 20px;
          }
          .footer {
            margin-top: 30px;
            font-size: 13px;
            color: #9ca3af;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">Student Travel Notification</div>
          ${template.body}
          <div class="footer">
            <p>Powered by EduMove</p>
            <p>&copy; ${new Date().getFullYear()} EduMove. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateTravelCreationConfirmationEmail({ guardian, student, travelDetails, travelNumber, transporter }) {
  const arrivalTime = new Date(travelDetails.expectedArrivalTime).toLocaleString();
  const departureTime = new Date(travelDetails.departureTime).toLocaleString();
  const price = travelDetails.price;
  const paymentRef = travelDetails.paymentDetails?.data?.ref;

  return `
    <html><body style="font-family: Arial; padding: 20px; background-color: #f9f9f9;">
      <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #007BFF;">🎟️ Travel Confirmation for ${student.name}</h2>
        <p>Dear <strong>${guardian.name}</strong>,</p>
        <p>Your travel for <strong>${student.name}</strong> has been successfully created and confirmed.</p>

        <table style="width: 100%; margin-top: 20px;">
          <tr><td><strong>Travel Number:</strong></td><td>${travelNumber}</td></tr>
          <tr><td><strong>Departure:</strong></td><td>${travelDetails.departure}</td></tr>
          <tr><td><strong>Destination:</strong></td><td>${travelDetails.destination}</td></tr>
          <tr><td><strong>Departure Time:</strong></td><td>${departureTime}</td></tr>
          <tr><td><strong>Expected Arrival:</strong></td><td>${arrivalTime}</td></tr>
          <tr><td><strong>Transporter:</strong></td><td>${transporter.name}</td></tr>
          <tr><td><strong>Price:</strong></td><td>RWF ${price}</td></tr>
          <tr><td><strong>Payment Ref:</strong></td><td>${paymentRef}</td></tr>
        </table>

        <p style="margin-top: 30px;">Thank you for using <strong>EduMove</strong>.</p>
        <p>Regards,<br/><strong>EduMove Transport Team</strong></p>
      </div>
    </body></html>
  `;
}

export async function notifyGuardianOfTravelStatusChange(travel) {
  const { status, guardian, student, travelDetails, travelNumber } = travel;

  const emailHtml = generateEmailTemplate(status, { guardian, student, travelDetails, travelNumber });
  if (!emailHtml) return;

  try {
    await sendEmail({
      to: guardian.email,
      subject: `EduMove Update: ${student.name}'s Status - ${status}`,
      body: emailHtml,
    });
  } catch (error) {
    console.error(`Error sending email for status "${status}":`, error.message);
  }
}

export async function notifySchoolOfTravelStatusChange(travel) {
  const { status, school, student, travelDetails, travelNumber } = travel;

  const emailHtml = generateSchoolEmailTemplate(status, {
    student,
    travelDetails,
    travelNumber,
  });

  if (!emailHtml) return;

  try {
    await sendEmail({
      to: school.email,
      subject: `EduMove Notification: ${student.name}'s Status - ${status}`,
      body: emailHtml,
    });
  } catch (error) {
    console.error(`Error sending school email for status "${status}":`, error.message);
  }
}

export async function notifyGuardianOfTravelCreation(travel) {
  const { guardian, student, travelDetails, travelNumber } = travel;

  const emailHtml = generateTravelCreationConfirmationEmail({
    guardian,
    student,
    travelDetails,
    travelNumber,
    transporter: travelDetails.transporter,
  });

  try {
    await sendEmail({
      to: guardian.email,
      subject: `🎟️ ${student.name}'s Travel Confirmed - Ticket #${travelNumber}`,
      body: emailHtml,
    });
  } catch (error) {
    console.error('Failed to send confirmation email to guardian:', error.message);
  }
}
