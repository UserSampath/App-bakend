require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");

const userRoutes = require("./routes/user");



app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
mongoose.set("strictQuery", true);


app.use(express.urlencoded({ extended: false }));

// express app
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        // listen for requests
        app.listen(process.env.PORT, () => {
            console.log("connected to db & listening on port", process.env.PORT);
        });
    })
    .catch((error) => {
        console.log(error);
    });



app.use("/api/user", userRoutes);