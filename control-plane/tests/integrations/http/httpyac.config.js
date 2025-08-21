module.exports = {
  // options...
  log: {
    level: "warn",
    supportAnsiColors: true,
  },
  cookieJarEnabled: true,
  configureHooks: function (api) {

    // remove Authorization header hook
    api.hooks.responseLogging.addHook('removeSensitiveData', function (response) {
      if (response.request) {
        delete response.request.headers['authorization'];
      }
    });

  }
}
