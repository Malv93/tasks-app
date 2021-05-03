const mongoose = require("mongoose");
const Task = require("../models/task");

//Query that match all user's tasks
const findUserTasks = (userId) => ({
  $match: { owner: mongoose.Types.ObjectId(userId) },
});

const queryHashtagsStats = async (userId) => {
  try {
    //query that count docs grouped by hashtag
    const groupHashtags = {
      $group: {
        _id: "$hashtag",
        count: { $sum: 1 },
      },
    };
    const sortByHashtag = {
      $sort: { hashtag: 1 },
    };

    //return hashtags groups
    return await Task.aggregate([
      findUserTasks(userId),
      groupHashtags,
      sortByHashtag,
    ]);
  } catch (err) {
    console.log(err); //debug
    return { err };
  }
};

const queryImportanceStats = async (userId) => {
  try {
    //query that count docs grouped by importance
    const groupImportance = {
      $group: {
        _id: "$important",
        count: { $sum: 1 },
      },
    };
    //return importance groups
    return await Task.aggregate([findUserTasks(userId), groupImportance]);
  } catch (err) {
    console.log(err); //debug
    return { err };
  }
};

const queryUrgencyStats = async (userId) => {
  try {
    //query that count docs grouped by urgency
    const groupUrgency = {
      $group: {
        _id: "$urgent",
        count: { $sum: 1 },
      },
    };
    //return urgency groups
    return await Task.aggregate([findUserTasks(userId), groupUrgency]);
  } catch (err) {
    console.log(err); //debug
    return { err };
  }
};

const queryCreatedAtStats = async (userId) => {
  try {
    //query that counts tasks grouped by day of creation
    const groupCreatedAt = {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    };
    const sortByDate = {
      $sort: { _id: -1 },
    };
    //return createdAt groups
    return await Task.aggregate([
      findUserTasks(userId),
      groupCreatedAt,
      sortByDate,
    ]);
  } catch (err) {
    console.log(err); //debug
    return { err };
  }
};

module.exports = {
  queryHashtagsStats,
  queryImportanceStats,
  queryUrgencyStats,
  queryCreatedAtStats,
};
