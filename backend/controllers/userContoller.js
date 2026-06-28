import User from "../models/usermodel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


const JWT_SECRET = process.env.JWT_SECRET || "YOUR_JWT_secret_here";
const TOKEN_EXPIRES = "24h";

const createToken = (userId) =>
  jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });
//Register function
export async function registerUser(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ sucess: false, message: "All Fields are required" });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ sucess: false, message: "invalid email" });
  }
  if (password.length < 8) {
    return res.status(400).json({
      sucess: false,
      message: "Password must be of atleast 8 charactors",
    });
  }
  try {
    if (await User.findOne({ email })) {
      return res
        .status(409)
        .json({ sucess: false, message: "user already exists" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({name, email, password:hashed});
    const token = createToken(user._id);

    res.status(201).json({
      sucess: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ sucess: false, message: "servererror" });
  }
}

//LOGIN FUNCTION
export async function loginUser(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ sucess: false, message: "Email and password required" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ sucess: false, message: "Invalid Credentails" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res
        .status(401)
        .json({ sucess: false, message: "Invalid Credentials" });
    }
    const token = createToken(user._id);
    res.json({
      sucess: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ sucess: false, message: "servererror" });
  }
}

//GET CURRENT USER
export async function getCurrentUser(req, res) {
  try {
    const user = await User.findById(req.user.id).select("name email");
    if (!user) {
      return res.status(400).json({ sucess: false, message: "User not found" });
      res.json({
  success: true,
  user,
});

    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ sucess: false, message: "servererror" });
  }
}

//UPDATE USER PROFILE

export async function updateProfile(req, res) {
  const { name, email } = req.body;
  if (!name || !email || !validator.isEmail(email)) {
    return res
      .status(400)
      .json({ sucess: false, message: "Valid name and email required" });
  }
  try {
    const exists = await User.findOne({ email, _id: { $ne: req.user.id } });
    if (exists) {
      return res.status(409).json({
        sucess: false,
        message: "Email already in use by another user",
      });
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true, runValidators: true, select: "name email" },
    );
    res.json({ sucess: true, user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ sucess: false, message: "servererror" });
  }
}


//CHANGE PASSWORD FUNCTION 
export async function updatePassword(req,res){
    const {currentPassword, newPassword}=req.body;

    if(!currentPassword || !newPassword || newPassword.length<8){
        return res.status(400).json({sucess:false, message:"Password invalid or too short"});
    }
    try{
        const user = await User.findById(req.user.id).select("password");
        if(!user){
            return res.status(404).json({sucess:false, message:"User not found"});
        }
        const match = await bcrypt.compare(currentPassword, user.password);
        if(!match){
            return res.status(401).json({sucess:false, message:"current password is incorrect"});
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.json({sucess:true, message:"Password Changed"});
    } 
      catch (err) {
    console.log(err);
    res.status(500).json({ sucess: false, message: "servererror" });
  }
  console.log("LOGIN SECRET:", JWT_SECRET);
}