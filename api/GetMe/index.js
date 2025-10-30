const { getUser } = require("../_shared/auth");

module.exports = async function (context, req) {
  const user = getUser(req);

  if (!user) {
    context.res = {
      status: 401,
      body: { error: "Authentication required." }
    };
    return;
  }

  context.res = {
    status: 200,
    body: user
  };
};
