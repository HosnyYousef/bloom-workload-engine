const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minLength: 6,
      select: false,
    },
    isDemo: {
      type: Boolean,
      default: false, // only the one demo account gets this set to true
    },
    // Goal statements the recommendation engine matches tasks against.
    // Weekly goals weigh more than monthly, monthly more than yearly.
    goals: {
      yearly: { type: [String], default: [] },
      monthly: { type: [String], default: [] },
      weekly: { type: [String], default: [] },
    },
    // Explicit daily plans override recommendation order for each energy mode.
    // Missing/completed task ids are repaired by the recommendation engine.
    priorityPlans: {
      early: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
      typical: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
      slow: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
    },
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
const hashPasswordBeforeSave = async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
};

userSchema.pre("save", hashPasswordBeforeSave);

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
User.hashPasswordBeforeSave = hashPasswordBeforeSave;

module.exports = User;
