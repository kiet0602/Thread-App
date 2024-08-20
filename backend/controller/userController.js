import User from "../Model/userModel.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../untils/helpers/generateTokenAndSetCookie.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import Post from "../Model/postModel.js";

const getProfile = async (req, res) => {
  const { query } = req.params;
  try {
    let user;
    // query la userId
    if (mongoose.Types.ObjectId.isValid(query)) {
      user = await User.findOne({ _id: query })
        .select("-password")
        .select("-updateAt");
    } else {
      user = await User.findOne({ username: query })
        .select("-password")
        .select("-updateAt");
    }
    if (!user) return res.status(400).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in getProfile: " + error.message);
  }
};

const getSuggestUsers = async (req, res) => {
  try {
    // exclude the current user from suggested users array and exclude users that current user is already following
    const userId = req.user._id;

    const usersFollowedByYou = await User.findById(userId).select("following");

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      {
        $sample: { size: 10 },
      },
    ]);
    const filteredUsers = users.filter(
      (user) => !usersFollowedByYou.following.includes(user._id)
    );
    const suggestedUsers = filteredUsers.slice(0, 4);

    suggestedUsers.forEach((user) => (user.password = null));

    res.status(200).json(suggestedUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const signupUser = async (req, res) => {
  try {
    // Truyền dữ liệu các trường bên model
    const { name, username, email, password } = req.body;
    // tìm User chưa có đăng kí
    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }
    // Băm mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Tạo User mới, lưu dữ liệu theo các trường có trong User model
    const newUser = await User({
      name,
      email,
      username,
      password: hashedPassword,
    });
    await newUser.save();

    // Trả về User mới tạo
    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      res.status(201).json({
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        bio: newUser.bio,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in SignupUser: " + error.message);
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    // Kiểm tra username(có hay ko) và password(đúng hay ko)
    const user = await User.findOne({ username });
    // SO SÁNH: password: nhập và user.password: của db đã băm
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!user || !isPasswordCorrect) {
      return res.status(400).json({
        error: "Invalid user or password",
      });
    }
    if (user.isFrozen) {
      user.isFrozen = false;
      await user.save();
    }

    // Chú ý: user._id muốn đặt sao thì đặt
    generateTokenAndSetCookie(user._id, res);
    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      bio: user.bio,
      profilePic: user.profilePic,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in LoginUser: " + error.message);
  }
};

const logoutUser = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 1 });
    res.status(200).json({ message: "User Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in LogoutUser: " + error.message);
  }
};

const followUnFollowUser = async (req, res) => {
  try {
    const { id } = req.params; // Lấy id từ URL

    const userToModify = await User.findById(id); // Tìm người dùng (người khác)
    const currentUser = await User.findById(req.user._id); // Tìm người dùng hiện tại (bản thân)

    if (id.toString() === req.user._id.toString())
      return res
        .status(400)
        .json({ message: "You cannot follow/unfollow yourself" });
    if (!currentUser || !userToModify)
      return res.status(400).json({ error: "User not found" });

    // currentUser.following là một mảng chứa danh sách các ID của người dùng mà currentUser đang theo dõi.
    // includes(id) kiểm tra xem mảng following có chứa id của người đag following mình hay không.
    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // Trường hợp hủy theo dõi (unfollow):
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      // loại bỏ ID của người dùng mà họ đang theo dõi (id) khỏi mảng
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      // Trường hợp theo dõi (follow):
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } }); // thêm phần tử có giá trị id vào mảng
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      res.status(200).json({ message: "User followed successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in Follow/unFollow User: " + error.message);
  }
};

const updateUser = async (req, res) => {
  // lấy các trường trong User model
  const { name, email, username, password, bio } = req.body;
  let { profilePic } = req.body;
  // khi đã đăng nhập sẽ có user._id
  const userId = req.user._id;
  try {
    let user = await User.findById(userId);
    if (!user) return res.status(400).json({ message: "User not found" });

    if (req.params.id !== userId.toString())
      return res
        .status(400)
        .json({ message: "You cannot update other user is profile" });

    if (password) {
      // thư viện băm mật khẩu
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }

    if (profilePic) {
      if (user.profilePic) {
        await cloudinary.uploader.destroy(
          user.profilePic.split("/").pop().split(".")[0]
        );
      }
      const uploadedResponse = await cloudinary.uploader.upload(profilePic);
      profilePic = uploadedResponse.secure_url;
    }

    //user.name giá trị cũ
    //name là giá trị mới
    //toán tử || giá trị mới k nhập, sẽ lấy giá trị cũ, nên sẽ k có TH null, undefined
    user.name = name || user.name;
    user.email = email || user.email;
    user.username = username || user.username;
    user.profilePic = profilePic || user.profilePic;
    user.bio = bio || user.bio;

    user = await user.save();

    await Post.updateMany(
      { "replies.userId": userId },
      {
        $set: {
          "replies.$[reply].username": user.username,
          "replies.$[reply].userProfilePic": user.userProfilePic,
        },
      },
      {
        arrayFilters: [{ "reply.userId": userId }], // Sửa từ arrayFilter thành arrayFilters
      }
    );

    // password nên null
    user.password = null;

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log("Error in updateUser: " + error.message);
  }
};
const freezeAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.isFrozen = true;
    await user.save();
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  signupUser,
  loginUser,
  logoutUser,
  followUnFollowUser,
  updateUser,
  getProfile,
  getSuggestUsers,
  freezeAccount,
};
