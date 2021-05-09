const pkg = require("../package.json");

module.exports = {
  applicationName: pkg.name,
  mysql: {
    options: {
      host: "localhost",
      database: "sys",
      user: "root",
      password: "mypassword",
      port: 3407,
    },
    client: null,
  },
};
