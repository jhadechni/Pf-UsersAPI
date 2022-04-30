const userRoutes = require('./userRoutes')

const routes = (app) => {
    app.use("/users", userRoutes)
};

module.exports = routes