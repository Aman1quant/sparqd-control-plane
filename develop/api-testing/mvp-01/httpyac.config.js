module.exports = {
  // options...
  log: {
    level: "warn",
    supportAnsiColors: true,
  },
  cookieJarEnabled: true,
  configureHooks: function (api) {
    api.hooks.responseLogging.addHook('removeSensitiveData', function (response) {
      if (response.request) {
        delete response.request.headers['authorization'];
      }
    });
  }
}
