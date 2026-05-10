const Joi = require("joi");

const objectId = Joi.string().hex().length(24);

const createChatSchema = Joi.object({
  participantId: objectId.optional(),
  userId: objectId.optional()
}).or("participantId", "userId");

const createGroupChatSchema = Joi.object({
  groupName: Joi.string().trim().min(2).max(80).required(),
  users: Joi.array().items(objectId.required()).min(1).unique().required()
});

const sendMessageSchema = Joi.object({
  text: Joi.string().trim().min(1).max(5000).required()
});

const getMessagesSchema = Joi.object({
  chatId: objectId.required()
});

module.exports = {
  createChatSchema,
  createGroupChatSchema,
  sendMessageSchema,
  getMessagesSchema
};
