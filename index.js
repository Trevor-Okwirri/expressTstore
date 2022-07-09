const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

mongoose.connect(
  'mongodb+srv://trevorokwirri:tresh@database1.zm15qv1.mongodb.net/?retryWrites=true&w=majority'
);

const app = express();
//installing our routes
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => res.send('Server listening on port 8000'));
app.use('/api', routes); //new
app.listen(8000, () => {
  console.log(`Server listening on port 8000`);
});
