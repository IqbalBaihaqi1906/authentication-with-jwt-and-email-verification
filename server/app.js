// defining stuff
const express = require('express')
const app = express()
require('dotenv/config')
const PORT = process.env.PORT
const errorHandler = require('./middlewares/errorHandler')
const mongoose = require('mongoose')
const cors = require('cors')
const route = require('./routes/index')

// middlewares
app.use(express.urlencoded({extended : true}))
app.use(express.json())
app.use(cors())

app.use(route)

// db connection
mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  let db = mongoose.connection;
  db.on("error", console.error.bind(console, "Database Connection Error!"));
  db.once("open", () => {
    console.log("Database Connected!");
  });

app.use(errorHandler)

app.listen(PORT,() => console.log(`Server running at port ${PORT}`))