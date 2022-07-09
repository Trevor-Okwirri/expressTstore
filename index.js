const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

mongoose.connect(process.env.MONGODB_CONNECTION + '/t-store').then(() => {
  const app = express();
  //installing our routes
  app.use(cors());
  app.use(express.json());
  app.use('/api', routes); //new
  app.listen(process.env.PORT, () => {
    console.log(`Sever listening on port ${process.env.PORT}`);
  });
});
