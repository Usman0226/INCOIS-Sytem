const User = require("../models/User");
const Scientist = require("../models/Scientist");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const register = async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ message: "Name and phone are required" });
    }

    let user = await User.findOne({ phone });

    if (user) {
      const otp = generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();

      return res.status(200).json({
        message: "OTP sent to existing user",
        phone: user.phone,
        otp: otp,
      });
    }

    // Create new user
    const otp = generateOTP();
    user = await User.create({
      name,
      phone,
    });

    res.status(201).json({
      message: "User created & OTP sent",
      phone: user.phone,
      otp: otp,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res
      .status(500)
      .json({ message: "At the auth controller Internal server error" });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone and OTP are required" });
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    if (user.otpExpires < new Date()) {
      return res.status(401).json({ message: "OTP has expired" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookies("token", token);

    res.status(200).json({
      message: "OTP verified successfully",
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        isVerified: user.isVerified,
      },
      token,
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    res.status(200).json({
      message: "OTP resent successfully",
      phone: user.phone,
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { phone } = req.body;
    let phoneExist = await User.findOne({ phone });

    if (!phoneExist) {
      return res.status(401).json({ message: "User doesn't exist !" });
    }

    return res.status(200).json({ message: "User logged in successfully" });
  } catch (err) {
    res.status(500).json({ message: "Login Error , try again or signup !" });
  }
};

const registerScientist = async (req, res) => {
  try {
    const { name, email, password, organization } = req.body;

    if (!name || !email || !password || !organization) {
      return res.status(400).json({ message: "Provide all details !" });
    }

    const hashedPass = await bcrypt.hash(password, 10);

    const scientist = await Scientist.create({
      name,
      email,
      password: hashedPass,
      organization,
    });

    const token = jwt.sign(
      {id : scientist.id},
      process.env.JWT_SECRET,
      {expiresIn : process.env.JWT_EXPIRES_IN}
    )

    res.cookie('token',token,{
      httpOnly : true,
      secure : true,
      maxAge : 15 * 24 * 3600 * 1000 
    })
    
    res.status(200).json({message : "Scientist registration completed ! "})


  } catch (error) {
    console.log("at registering the scientist " ,error)
  }
};

const loginAuthority = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const scientist = await Scientist.findOne({ email });
    if (!scientist) {
      return res.status(400).json({ message: "Email not found ! " });
    }

    const passcheck = await bcrypt.compare(password, scientist.password);
    if (!passcheck) {
      return res.status(401).json({ message: "password didn't match !" });
    }

    const token = jwt.sign(
      { scientistId: scientist._id, email: scientist.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res
      .status(200)
      .json({ 
        message: "Email found, login successfull !",
        token: token,
        scientist: {
          id: scientist._id,
          name: scientist.name,
          email: scientist.email,
          organization: scientist.organization
        }
      });
  } catch (err) {
    console.log(`In login auth : ${err}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  register,
  verifyOTP,
  resendOTP,
  loginUser,
  loginAuthority,
  registerScientist,
};
