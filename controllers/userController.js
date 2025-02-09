import { User } from "../models/userModel.js";
import Validator from "validatorjs";
import bcrypt from "bcryptjs";
import Status from "../Trait/Status.js";
import dotenv from "dotenv";
import JWT from "jsonwebtoken";
import { Token } from "../models/Token.js";
import { CounterID } from "../models/CounterID.js";

dotenv.config();

function firstError(validation) {
  let first_key = Object.keys(validation.errors.errors)[0];
  return validation.errors.first(first_key);
}

export default {
  //create new user..
  async create(req, res) {
    var request = req.body;
    const user = {
      username: request.username,
      email: request.email,
      password: request.password,
    };

    let validation = new Validator(request, {
      username: "required",
      email: "required|email|max:30",
      password:
        "required|min:8|max:18|regex:/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/|same:confirm_password",
    });

    if (validation.fails()) {
      return res.json(Status.failed(firstError(validation)));
    }
    const salt = bcrypt.genSaltSync(10);
    const hashedpassword = await bcrypt.hash(user.password, salt);
    user.password = hashedpassword;

    let existance = await User.find({ email: user.email });

    if (existance.length != 0) {
      return res.json(Status.failed("Email is already exist"));
    }
    CounterID.findOneAndUpdate(
      {
        id: "autoval"
      },
      { "$inc": { "seq": 1 } },
      {
        new: true
      },
      (err, cd) => {
        let seqID = 0;
        if (cd == null) {
          const newVal = new CounterID({ id: "autoval", seq: 1 });
          newVal.save();
          seqID = 1
        }
        else {
          seqID = cd.seq;
          user.id = seqID;
          User.create(user)
            .then((data) => {
              let finalData = {
                user: data
              }
              return res.json(Status.success("User registered Successfully", finalData));
            })
            .catch((err) => {
              res.Status(500).send({
                message: "Error occurred while creating the User.",
              });
            });
        }
      }
    )

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
        "id"
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
    }
    catch (err) {
      return res.send(Status.failed(err))
    }


  },
};
