const express = require('express');
const cors = require('cors');
const router = require('./routes/routesConfig');
const app = express();
const morgan = require('morgan');

//settings
app.set('port', process.env.PORT || 4000);

//middlewares
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(morgan('tiny'))

//routes
router(app);

module.exports = app;