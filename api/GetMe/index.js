function getClientPrincipal(req) {
  const header = req.headers["x-ms-client-principal"];
  if (!header) return null;
  const decoded = Buffer.from(header, "base64").toString("utf8");
  try { return JSON.parse(decoded); } catch { return null; }
}
module.exports = async function (context, req) {
  const cp = getClientPrincipal(req);
  return {
    status: 200,
    headers: { "content-type": "application/json" },
    body: { user: cp }
  };
};
