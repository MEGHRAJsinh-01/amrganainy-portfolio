const express = require("express");
const MySkill = require("../models/MySkill");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// ===============================
// @route   POST /api/skills
// @desc    Create a new skill
// ===============================
router.post("/skills", authMiddleware, async (req, res) => {
  const { name, level, description, category } = req.body;

  if (!name || !level || !description || !category) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newSkill = new MySkill({
      user: req.user.id,
      name,
      level,
      description,
      category,
    });

    const savedSkill = await newSkill.save();
    res.status(201).json(savedSkill);
  } catch (error) {
    console.error("Error creating skill:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ===============================
// @route   GET /api/skills
// @desc    Get all skills for logged-in user
// ===============================
router.get("/skills", authMiddleware, async (req, res) => {
  try {
    const skills = await MySkill.find({ user: req.user.id });
    res.json(skills);
  } catch (error) {
    console.error("Error fetching skills:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ===============================
// @route   PUT /api/skills/:id
// @desc    Update a skill
// ===============================
router.put("/skills/:id", authMiddleware, async (req, res) => {
  const { name, level, description, category } = req.body;

  try {
    const skill = await MySkill.findById(req.params.id);
    if (!skill) return res.status(404).json({ message: "Skill not found" });

    if (skill.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    skill.name = name;
    skill.level = level;
    skill.description = description;
    skill.category = category;

    const updatedSkill = await skill.save();
    res.json(updatedSkill);
  } catch (error) {
    console.error("Error updating skill:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ===============================
// @route   DELETE /api/skills/:id
// @desc    Delete a skill
// ===============================
router.delete("/skills/:id", authMiddleware, async (req, res) => {
  try {
    const skill = await MySkill.findById(req.params.id);
    if (!skill) return res.status(404).json({ message: "Skill not found" });

    if (skill.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    await MySkill.deleteOne({ _id: req.params.id });
    res.json({ message: "Skill deleted successfully" });
  } catch (error) {
    console.error("Error deleting skill:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
