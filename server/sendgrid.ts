import sgMail from '@sendgrid/mail';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=sendgrid',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key || !connectionSettings.settings.from_email)) {
    throw new Error('SendGrid not connected');
  }
  return {apiKey: connectionSettings.settings.api_key, email: connectionSettings.settings.from_email};
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getUncachableSendGridClient() {
  const {apiKey, email} = await getCredentials();
  sgMail.setApiKey(apiKey);
  return {
    client: sgMail,
    fromEmail: email
  };
}

export async function sendFeedbackEmail(feedback: { name: string; email: string; message: string }) {
  try {
    const { client, fromEmail } = await getUncachableSendGridClient();
    
    const msg = {
      to: 'xiangliatai@gmail.com',
      from: fromEmail,
      subject: `[Tencent Financial App] New Feedback from ${feedback.name || 'Anonymous'}`,
      text: `
New feedback received:

From: ${feedback.name || 'Anonymous'}
Email: ${feedback.email || 'Not provided'}

Message:
${feedback.message}

---
Sent from Tencent Financial Intelligence App
      `.trim(),
      html: `
<h2>New Feedback Received</h2>
<p><strong>From:</strong> ${feedback.name || 'Anonymous'}</p>
<p><strong>Email:</strong> ${feedback.email || 'Not provided'}</p>
<hr>
<h3>Message:</h3>
<p>${feedback.message.replace(/\n/g, '<br>')}</p>
<hr>
<p><em>Sent from Tencent Financial Intelligence App</em></p>
      `.trim(),
    };

    await client.send(msg);
    console.log('Feedback email sent successfully');
    return true;
  } catch (error) {
    console.error('Failed to send feedback email:', error);
    return false;
  }
}
