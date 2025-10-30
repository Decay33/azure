const sgMail = require("@sendgrid/mail");
const { getPrincipal, extractUser } = require("../_shared/auth");
const { durableIdFromPrincipal, createDocumentId } = require("../_shared/id");

function parseBody(body) {
  if (body === undefined || body === null) {
    return {};
  }

  if (typeof body === "object") {
    return body;
  }

  try {
    return JSON.parse(body);
  } catch (_error) {
    return {};
  }
}

function isValidEmail(value) {
  if (!value) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

module.exports = async function (context, req) {
  const principal = getPrincipal(req);

  if (!principal) {
    context.res = {
      status: 401,
      body: { error: "Authentication required." }
    };
    return;
  }

  const body = parseBody(req.body);
  const name = (body.name || "").toString().trim();
  const email = (body.email || "").toString().trim();
  const subject = (body.subject || "").toString().trim();
  const message = (body.message || "").toString().trim();

  if (!name || !email || !subject || !message) {
    context.res = {
      status: 400,
      body: { error: "name, email, subject, and message are all required." }
    };
    return;
  }

  if (!isValidEmail(email)) {
    context.res = {
      status: 400,
      body: { error: "Provide a valid email address." }
    };
    return;
  }

  if (message.length > 4000) {
    context.res = {
      status: 400,
      body: { error: "Message is too long. Please keep it under 4000 characters." }
    };
    return;
  }

  const user = extractUser(principal);
  const contactId = createDocumentId(durableIdFromPrincipal(user));

  const payload = {
    id: contactId,
    fromName: name,
    fromEmail: email,
    subject,
    message,
    user
  };

  const apiKey = process.env.SENDGRID_API_KEY;
  const contactTo = process.env.CONTACT_TO;
  const contactFrom = process.env.CONTACT_FROM || contactTo;

  let delivered = false;

  if (apiKey && contactTo && contactFrom) {
    try {
      sgMail.setApiKey(apiKey);
      await sgMail.send({
        to: contactTo,
        from: contactFrom,
        replyTo: email,
        subject: `[The AI Democracy] ${subject}`,
        text: `${message}\n\n---\nFrom: ${name} <${email}>\nPrincipal: ${JSON.stringify(user)}`,
        html: `
          <p>${message.replace(/\n/g, "<br />")}</p>
          <hr />
          <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
          <p><strong>User Id:</strong> ${user?.id || "unknown"}</p>
          <p><strong>Provider:</strong> ${user?.provider || "unknown"}</p>
        `
      });
      delivered = true;
    } catch (error) {
      context.log.error("SendGrid delivery failed", error);
    }
  } else {
    context.log.warn("SendGrid not fully configured. Message captured only.", {
      hasApiKey: Boolean(apiKey),
      hasContactTo: Boolean(contactTo),
      hasContactFrom: Boolean(contactFrom)
    });
  }

  context.log.info("Contact submission", payload);

  context.res = {
    status: 200,
    body: { ok: true, delivered }
  };
};
