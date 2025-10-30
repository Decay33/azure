const { getPrincipal } = require("../_shared/auth");

module.exports = async function (context, req) {
  const principal = getPrincipal(req);

  if (!principal) {
    context.res = {
      status: 401,
      body: { error: "Authentication required." }
    };
    return;
  }

  const { userId, userDetails, identityProvider, userRoles } = principal;

  context.res = {
    status: 200,
    body: {
      userId,
      userDetails,
      identityProvider,
      userRoles
    }
  };
};
