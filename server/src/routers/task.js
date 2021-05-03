const express = require("express");
const Task = require("../models/task");
const auth = require("../middleware/auth");
const {
  queryHashtagsStats,
  queryImportanceStats,
  queryUrgencyStats,
  queryCreatedAtStats,
} = require("../queries/tasks-stats");

const router = new express.Router();

//Create a new task
router.post("/api/tasks", auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });

  try {
    await task.save();
    res.status(201).send(task);
  } catch (err) {
    res.status(400).send(err);
  }
});

//Read all tasks

//GET /tasks?completed=true
//GET /tasks/limit=10&skip=0
//GET /tasks?sortBy=createdAt:desc
router.get("/api/tasks", auth, async (req, res) => {
  //req.query are strings and must be converted
  const match = {};
  const sort = {};

  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }

  try {
    await req.user
      .populate({
        path: "tasks",
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort,
        },
      })
      .execPopulate();
    res.status(200).send(req.user.tasks);
  } catch (err) {
    res.status(500).send(err);
  }
});

//Read one task
router.get("/api/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;

  try {
    // const task = await Task.findById(_id);
    const task = await Task.findOne({ _id, owner: req.user._id });

    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (err) {
    res.status(500).send(err);
  }
});

//Update one task
router.patch("/api/tasks/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const validUpdates = ["description", "completed"];
  const isValidOperation = updates.every((update) =>
    validUpdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).send({ error: "Updates are not valid" });
  }

  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    console.log(task);

    if (!task) {
      return res.status(404).send();
    }

    updates.forEach((update) => (task[update] = req.body[update]));

    await task.save();
    res.send(task);
  } catch (err) {
    res.status(200).send(err);
  }
});

//Delete one task
router.delete("/api/tasks/:id", auth, async (req, res) => {
  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    owner: req.user._id,
  });

  try {
    if (!task) {
      return res.status(404).send();
    }
    res.status(200).send(task);
  } catch (err) {
    res.status(500).send(err);
  }
});

//Return stats about a user tasks
router.get("/api/stats/tasks", auth, async (req, res) => {
  try {
    console.log(req.user._id); //debug
    const userId = req.user._id;

    const hashtags = await queryHashtagsStats(userId);
    const importancy = await queryImportanceStats(userId);
    const urgency = await queryUrgencyStats(userId);
    const createdAt = await queryCreatedAtStats(userId);

    const stats = { hashtags, importancy, urgency, createdAt };

    res.status(200).send(stats);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
