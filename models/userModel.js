const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const { Jobs } = require("../utils/Constants");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    selectedJob: {
        type: String,
        enum: [
            Jobs.SystemAdmin,
            Jobs.Projectmanager,
            Jobs.Developer,
            Jobs.TeamLead,
        ],
    },
    otp: {
        type: String
    },
    otpExpiration: {
        type:Date
    }
});

// static signup method
userSchema.statics.signup = async function (
    firstname,
    lastname,
    email,
    password,
    selectedJob
) {

    // validation
    if (!email || !password || !firstname || !lastname || !selectedJob) {
        throw Error("All fields must be filled");
    }
    if (!validator.isEmail(email)) {
        throw Error("Email not valid")

    }
    if (!validator.isStrongPassword(password)) {
        throw Error("Password not strong enough");
    }

    const exists = await this.findOne({ email });

    if (exists) {
        throw Error("Email already in use");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await this.create({
        email,
        password: hash,
        firstname,
        lastname,
        selectedJob,
    });

    return user;
};


userSchema.statics.login = async function (email, password) {
    if (!email || !password) {
        throw Error("All fields must be filled");
    } else if (!password) {
        throw Error(" Password must be filled");
    } else if (!email) {
        throw Error("Email must be filled");
    }
    const user = await this.findOne({ email });
    if (!user) {
        throw Error("Incorrect email");
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        throw Error("Incorrect password");
    }

    return user;
};

userSchema.statics.forget = async function (email) {
    if (!email) {
        throw Error("Email must be filled");
    }

    if (!validator.isEmail(email)) {
        throw Error("Email not valid");
    }
    const user = await this.findOne({ email });
    if (!user) {
        throw Error("Incorrect email");
    }
    return user;
};

module.exports = mongoose.model("User", userSchema);
