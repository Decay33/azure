function getClientPrincipal(req) {
  const header = req.headers["x-ms-client-principal"];
  if (!header) return null;
  try {
    const decoded = Buffer.from(header, "base64").toString("utf8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

module.exports = async function (context, req) {
  const cp = getClientPrincipal(req);
  context.res = {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: { user: cp }
  };
};
