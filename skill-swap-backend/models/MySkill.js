const mongoose = require("mongoose");

const MySkillSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User ", required: true }, // Reference to the User model
  name: { type: String, required: true },
  level: { type: String, required: true },
  description: { type: String, required: true },
  taught: { type: Number, default: 0 }, // Number of times the skill has been taught
  rating: { type: Number, default: 0 }, // Average rating for the skill
  category: { type: String, required: true },
  sessions: { type: Number, default: 0 }, // Number of learning sessions for the skill
});

module.exports = mongoose.model("MySkill", MySkillSchema);
