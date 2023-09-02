import PostModel from "../models/Post.js";

export const getPosts = async (req, res) => {
  const category = req.params.category;
  try {
    let posts;

    if (category === "popular") {
      posts = await PostModel.find()
        .populate("user")
        .sort({ viewsCount: -1 })
        .exec();
    } else if (category === "news") {
      posts = await PostModel.find()
        .populate("user")
        .sort({ createdAt: -1 })
        .exec();
    } else {
      return res.status(400).json({ error: "Invalid category" });
    }

    res.status(200).json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getLastTags = async (req, res) => {
  try {
    const posts = await PostModel.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .exec();

    const tags = posts.map((post) => post.tags).flat();

    const uniqTags = [...new Set(tags)].slice(0, 5);

    res.json(uniqTags);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Не удалось получить статьи.",
    });
  }
};

export const getTag = async (req, res) => {
  try {
    const tag = req.params.tag;

    const posts = await PostModel.find({ tags: tag }).populate("user");

    res.status(200).json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Не удалось получить статью по тэгу.",
    });
  }
};

export const getLastComments = async (req, res) => {
  try {
    const comments = await PostModel.aggregate([
      { $unwind: "$comments" },
      { $sort: { "comments.date": -1 } },
      { $limit: 5 },
      {
        $project: {
          user: "$comments.user",
          text: "$comments.text",
          date: "$comments.date",
        },
      },
    ]);

    res.json(comments);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось получить комментарии.",
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;

    const updatedPost = await PostModel.findOneAndUpdate(
      {
        _id: postId,
      },
      {
        $inc: { viewsCount: 1 },
      },
      {
        new: true,
      }
    ).populate("user");

    if (!updatedPost) {
      return res.status(404).json({
        message: "Статья не найдена",
      });
    }

    res.json(updatedPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Не удалось получить статью",
    });
  }
};

export const remove = async (req, res) => {
  try {
    const postId = req.params.id;

    const deletedPost = await PostModel.findOneAndDelete({
      _id: postId,
    }).exec();

    if (!deletedPost) {
      return res.status(404).json({
        message: "Статья не найдена.",
      });
    }

    res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Не удалось удалить статью.",
    });
  }
};

export const create = async (req, res) => {
  try {
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      tags: req.body.tags.split(", "),
      user: req.userId,
    });

    const post = await doc.save();

    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось создать статью.",
    });
  }
};

export const update = async (req, res) => {
  try {
    const postId = req.params.id;

    await PostModel.updateOne(
      {
        _id: postId,
      },
      {
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        tags: req.body.tags.split(", "),
        user: req.userId,
      }
    );

    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось обновить статью.",
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const commentDate = req.params.date;
    const result = await PostModel.findOneAndUpdate(
      { "comments.date": commentDate },
      {
        $pull: { comments: { date: commentDate } },
        $inc: { viewsCount: -1 },
      },
      { new: true }
    );

    if (result) {
      res.status(204).send();
    } else {
      console.log(`Комментарий с датой '${commentDate}' не найден.`);
      res.status(404).json({
        message: "Комментарий не найден.",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Не удалось удалить комментарий.",
    });
  }
};

export const addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const newComment = req.body.comment;

    await PostModel.updateOne(
      {
        _id: postId,
      },
      {
        $push: { comments: newComment },
        $inc: { viewsCount: -1 },
      }
    );

    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось добавить комментарий.",
    });
  }
};

export const likeClick = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.body.userId;

    const updatedPost = await PostModel.updateOne(
      {
        _id: postId,
      },
      {
        $inc: { "likes.count": 1 },
        $addToSet: { "likes.users": userId },
      },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({
        message: "Пост не найден",
      });
    }

    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось поставить лайк.",
    });
  }
};
