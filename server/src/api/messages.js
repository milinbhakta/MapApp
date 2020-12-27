/* eslint-disable no-console */
/* eslint-disable object-curly-newline */
/* eslint-disable newline-per-chained-call */
/* eslint-disable quotes */
const express = require("express");
const Joi = require("joi");
const db = require("../db");

const messages = db.get("messages");

const router = express.Router();

const schema = Joi.object().keys({
  userName: Joi.string().alphanum().min(2).max(30).required(),
  Message: Joi.string().min(2).max(256).required(),
  latitude: Joi.number().min(-90).max(90),
  longitude: Joi.number().min(-180).max(180),
});

router.get("/", (req, res) => {
  messages.find().then((allMessages) => {
    res.json(allMessages);
  });
});

router.post("/", (req, res, next) => {
  const result = schema.validate(req.body);
  if (result.error === undefined) {
    const { userName, Message, latitude, longitude } = req.body;
    const userMessage = {
      userName,
      Message,
      latitude,
      longitude,
      date: new Date(),
    };
    messages.insert(userMessage).then((insertedMessage) => {
      res.json(insertedMessage);
    });
  } else {
    next(result.error);
  }
});

module.exports = router;
