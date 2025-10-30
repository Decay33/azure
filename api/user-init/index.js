const { getUser } = require("../_shared/auth");
const { getContainer } = require("../_shared/cosmos");

module.exports = async function (context, req) {
  try {
    const user = getUser(req);

    if (!user) {
      context.res = {
        status: 401,
        body: { error: "Authentication required." }
      };
      return;
    }

    const container = getContainer();
    const now = new Date().toISOString();

    let existingProfile = null;
    try {
      const response = await container.item(user.userId, user.playerId).read();
      existingProfile = response.resource || null;
    } catch (error) {
      if (error.code !== 404) {
        throw error;
      }
    }

    const profile = {
      id: user.userId,
      playerId: user.playerId,
      type: "user",
      displayName: user.displayName,
      email: user.email,
      provider: user.provider,
      createdAt: existingProfile?.createdAt || now,
      lastSeenAt: now
    };

    await container.items.upsert(profile);

    context.res = {
      status: existingProfile ? 200 : 201,
      body: { ok: true, profile }
    };
  } catch (error) {
    context.log.error("user-init failure", error);
    context.res = {
      status: 500,
      body: { error: "Failed to initialize user profile." }
    };
  }
};
