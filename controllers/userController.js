import { User } from "../models/userModel.js";
import Validator from "validatorjs";
import bcrypt from "bcryptjs";
import Status from "../traits/status.js";
import dotenv from "dotenv";
import JWT from "jsonwebtoken";
import { Token } from "../models/token.js";
import { CounterID } from "../models/counterID.js";

dotenv.config();

function firstError(validation) {
  let first_key = Object.keys(validation.errors.errors)[0];
  return validation.errors.first(first_key);
}

export default {
  //create new user..
  async create(req, res) {
    try {
      const { username, email, password, confirm_password } = req.body;

      // Validation
      const validation = new Validator(
        { username, email, password, confirm_password },
        {
          username: "required",
          email: "required|email|max:30",
          password:
            "required|min:8|max:18|regex:/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/|same:confirm_password",
        }
      );

      if (validation.fails()) {
        return res.json(Status.failed(firstError(validation)));
      }

      // Check for existing email and username simultaneously
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        const field = existingUser.email === email ? "Email" : "Username";
        return res.json(Status.failed(`${field} already exists`));
      }

      // Generate hashed password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Get next sequence ID using await instead of callback
      const counter = await CounterID.findOneAndUpdate(
        { id: "autoval" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      // Create new user
      const newUser = await User.create({
        id: counter.seq,
        username,
        email,
        password: hashedPassword,
      });

      return res.json(
        Status.success("User registered Successfully", { user: newUser })
      );
    } catch (error) {
      console.error("User creation error:", error);
      return res
        .status(500)
        .json(Status.failed("Error occurred while creating the User"));
    }
  },

  //login user...
  async login(req, res) {
    try {
      var request = req.body;
      var username = request.username;

      var password = request.password;

      let validation = new Validator(request, {
        username: "required",
        password: "required",
      });
      if (validation.fails()) {
        return res.json(Status.failed(firstError(validation)));
      }

      const user = await User.findOne({ username: username });
      if (!user) {
        return res.json(Status.failed("User not found!!"));
      }
      const pass_wrd = await bcrypt.compare(password, user.password);

      if (user && pass_wrd) {
        const token = JWT.sign(
          { user_id: user.id, username },
          process.env.JWT_KEY,
          {
            expiresIn: "24h",
          }
        );

        var userdata = {
          user: user,
          token: token,
        };

        await Token.create({ user_id: user.id, token: token })
          .then((data) => {
            return res.json(
              Status.success("User login Successfully", userdata)
            );
          })
          .catch((err) => {
            res.status(500).send({
              message:
                err.message || "Error occurred while creating the token.",
            });
          });
      } else {
        return res.json(Status.failed("Invalid login credentials"));
      }
    } catch (err) {
      console.error(`Error in logging  user: ${err}`);
      return res.sendStatus(403);
    }
  },

  async getAllUsers(req, res) {
    try {
      const users = await User.find({ _id: { $ne: req.params.id } }).select([
        "email",
        "username",
        "avatarImage",
        "_id",
        "id",
      ]);
      return res.json(users);
    } catch (err) {
      return res.send(err);
    }
  },

  async setAvatar(req, res) {
    try {
      const userId = req.params.id;
      const avatarImage = req.body.image;
      const userData = await User.findByIdAndUpdate(
        userId,
        {
          isAvatarImageSet: true,
          avatarImage,
        },
        { new: true }
      );
      return res.json({
        isSet: userData.isAvatarImageSet,
        image: userData.avatarImage,
      });
    } catch (err) {
      return res.send(err);
    }
  },

  async logOut(req, res) {
    try {
      if (!req.params.id) return res.json({ msg: "User id is required " });
      let logout = await Token.remove({ user_id: req.params.id });

      if (logout) {
        return res.send(Status.success("User logout successfully"));
      }
    } catch (err) {
      return res.send(Status.failed(err));
    }
  },
};
