import Post from "../Model/postModel.js";
import User from "../Model/userModel.js";
import { v2 as cloudinary } from "cloudinary";

const createPost = async (req, res) => {
  try {
    const { postedBy, text } = req.body;
    let { img } = req.body;

    if (!postedBy || !text)
      return res
        .status(400)
        .json({ message: "Postedby and text field are required" });

    const user = await User.findById(postedBy);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Unauthorized to create post" });
    }
    const maxLength = 500;
    if (text.length > maxLength) {
      return res
        .status(403)
        .json({ message: `Text must less than ${maxLength} characters` });
    }
    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }
    const newPost = new Post({ postedBy, text, img });
    await newPost.save();
    // res.status(200).json({ message: "Successfully created post", newPost }); // trả về => xem ảnh (2element.PNG) => res.data.newPost(FE)
    res.status(200).json(newPost); // trả về Object => res.data(FE)
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in createPost: " + error.message);
  }
};

const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "No post found" });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in getPost: " + error.message);
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "No post found" });
    }
    // post.postedBy : Đây là thuộc tính của đối tượng post, chứa ID của người dùng đã đăng bài viết.
    // req.user._id : Đây là ID của người dùng hiện tại đã đăng nhập
    // => Người đăng, mới có quyền xóa
    if (post.postedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Unauthorized to delete post " });
    }
    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }

    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "delete post successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in deletePost: " + error.message);
  }
};

const likeUnlikePost = async (req, res) => {
  try {
    const { id: postId } = req.params; // Lấy ID của bài đăng từ tham số URL và đặt vào biến postId
    const userId = req.user._id; // Lấy ID của người dùng từ thông tin xác thực (middleware)

    const post = await Post.findById(postId); // Tìm bài đăng theo ID

    if (!post) {
      return res.status(404).json({ error: "Not Found Post" }); // Nếu không tìm thấy bài đăng, trả về mã lỗi 404
    }

    const userLikePost = post.likes.includes(userId); // Kiểm tra xem người dùng đã thích bài đăng này chưa
    if (userLikePost) {
      // Nếu người dùng đã thích bài đăng
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } }); // Bỏ thích bằng cách xóa ID của người dùng khỏi mảng likes
      res.status(200).json({ message: "unLike successfully" }); // Trả về thông báo bỏ thích thành công
    } else {
      // Nếu người dùng chưa thích bài đăng
      post.likes.push(userId); // Thêm ID của người dùng vào mảng likes
      await post.save(); // Lưu bài đăng
      res.status(200).json({ message: "Like successfully" }); // Trả về thông báo thích thành công
    }
  } catch (error) {
    res.status(500).json({ error: error.message }); // Nếu có lỗi, trả về mã lỗi 500 và thông báo lỗi
    console.log("Error in likeUnlikePost: " + error.message); // Ghi log lỗi vào console
  }
};

const replytoPost = async (req, res) => {
  try {
    const postId = req.params.id;

    const { text } = req.body;

    const userId = req.user._id;
    const userProfilePic = req.user.profilePic;
    const username = req.user.username;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not Found" });
    }
    const reply = { userId, text, userProfilePic, username };
    post.replies.push(reply);
    await post.save();
    res.status(200).json(reply);
  } catch (error) {
    res.status(500).json({ error: error.message }); // Nếu có lỗi, trả về mã lỗi 500 và thông báo lỗi
    console.log("Error in replyPost: " + error.message); // Ghi log lỗi vào console
  }
};

const getFeedPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const following = user.following; //  mảng chứa người dùng đang theo dõi
    // tìm tất cả các bài viết có trường postedBy (người đăng bài) nằm trong danh sách following.
    const feedPosts = await Post.find({ postedBy: { $in: following } }).sort({
      createdAt: -1,
    });
    res.status(200).json(feedPosts);
  } catch (error) {
    res.status(500).json({ error: error.message }); // Nếu có lỗi, trả về mã lỗi 500 và thông báo lỗi
    console.log("Error in getFeedPosts: " + error.message); // Ghi log lỗi vào console
  }
};

const getUserPosts = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });
    const posts = await Post.find({ postedBy: user._id }).sort({
      createdAt: -1,
    });
    return res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  createPost,
  getPost,
  deletePost,
  likeUnlikePost,
  replytoPost,
  getFeedPosts,
  getUserPosts,
};
