const userRoutes = require('./userRoutes')
const defaultRoutes = require('./defaultRoutes')
const certificateRoutes = require('./certificateRoutes')

const routes = (app) => {
    app.use('/', defaultRoutes)
    app.use('/users', userRoutes)
    app.use('/certificate', certificateRoutes)
};

module.exports = routes