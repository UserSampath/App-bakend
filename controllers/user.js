const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
var nodemailer = require("nodemailer");



const keySecret = process.env.SECRET;
const createToken = (_id) => {
  return jwt.sign({ _id }, keySecret, { expiresIn: "3d" });
};

const otpGenerator = (otpLength) => {
  let otp = ""
  for (let i = 0; i < otpLength; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return (Number(otp));
}


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "lenzzhasthiyit@gmail.com",
    pass: "mfmpeqgzbjbxkcja",
  },
});
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);

    // create a token
    const token = createToken(user._id);

    res.status(200).json({ email, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// signup a user
const signup = async (req, res) => {
  const { firstname, lastname, email, password, selectedJob } = req.body;

  try {
    const user = await User.signup(
      firstname,
      lastname,
      email,
      password,
      selectedJob
    );

    // create a token
    const token = createToken(user._id);

    res.status(200).json({ email, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const generateOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.forget(email);
    const otp = otpGenerator(6);

    // console.log(otp)
    const expirationTime = new Date(Date.now() + 5 * 60 * 1000);
    const a = await User.updateOne({ email }, { $set: { otp, otpExpiration: expirationTime } });
    const userFind = await User.findOne({ email: email });

    res.status(200).json({ userFind });
    if (a.modifiedCount) {
      const mailOptions = {
        from: "lenzzhasthiyit@gmail.com",
        to: email,
        subject: "sending Email for password Reset",
        text: `your OTP is ${otp} , the OTP will expire within 5 minutes`,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("error", error);
          res.status(201).json({ status: 201, message: "email not send" });
        } else {
          console.log("Email sent", info.response);
          res
            .status(201)
            .json({ status: 201, message: "email sent successful" });
        }
      });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    console.log("gdf")

    const user = await User.findOne({ email });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    if (user && user.otp === otp && user.otpExpiration > new Date()) {
      user.password = hash;
      await user.save();
      await User.updateOne({ email }, { $unset: { otp: '', otpExpiration: '' } });

      res.status(200).json({ message: 'Password reset successfully' });
    } else {
      res.status(400).json({ message: 'Invalid OTP or OTP expired' });
    }
  } catch (error) {
    next(error);
  }
};


module.exports = {
  generateOTP,
  signup,
  login,
  resetPassword,
  
};
