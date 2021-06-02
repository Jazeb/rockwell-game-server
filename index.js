const mongoose = require('mongoose');
const app = require('./app');
const PORT = process.env.PORT;

const URI = process.env.MONGO_URI;
const mondoconfig = { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }
mongoose.connect(URI, mondoconfig).then(_ => console.log('MongoDB connected'))

app.listen(PORT, _ => console.log(`server is running on port ${PORT}`));