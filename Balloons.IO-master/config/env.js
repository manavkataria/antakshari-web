/**
 * Module dependencies.
 */

var env = process.env;

/**
 * Expose environment configuration
 */

module.exports = {
  redisURL: env.REDIS_URL || env.REDISTOGO_URL || "",
  auth: {
    facebook: {
      clientid: env.FB_CLIENT_ID,
      clientsecret: env.FB_CLIENT_SECRET,
      callback: env.FB_CALLBACK
    },
    google: {
      consumerkey: env.GL_CONSUMER_KEY,
      consumersecret: env.GL_CONSUMER_SECRET,
      callback: env.GL_CALLBACK
    }
  },
  session: {
    secret: env.SESSION_SECRET || "b.io:secret"
  },
  app: {
    port: env.PORT || 6789
  },
  theme: {
    name: env.THEME_NAME || "default"
  }
};
