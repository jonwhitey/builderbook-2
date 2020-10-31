const mongoose = require('mongoose');

const { Schema } = mongoose;

const workoutSchema = new Schema({
  uid: String,
  date: Date,
  completed: Boolean,
  exercises: [
    {
      exercise: String,
      numReps: Number,
      resistance: Number,
      exerciseIntensity: String,
      set: Number,
      sets: Number,
      exerciseCompleted: false,
    },
  ],
});

const mongoSchema = new Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
  },
  cycles: {
    type: Number,
    required: true,
    unique: false,
    default: 8,
  },
  currentCycle: {
    type: Number,
    required: true,
    unique: false,
    default: 8,
  },
  programName: {
    type: String,
    required: true,
    unique: false,
  },
  workouts: [workoutSchema],
  workoutsCompleted: Number,
});

class ProgramClass {
  static publicFields() {
    return ['id', 'displayName', 'email', 'isAdmin'];
  }

  static async createProgram(program) {
    try {
      console.log('hit build new program');
      console.log(program);
      console.log(program.workouts[0].exercises[1]);
      const newProgram = await this.create(program);
      console.log('created new program!!!');
      console.log(newProgram.workouts[0]);
      return newProgram;
    } catch (e) {
      console.log('failed to create new program');
      return e;
    }
  }

  static async getProgram(uid) {
    console.log('hit Program getProgram');
    console.log(uid);
    try {
      const program = await this.findOne({ uid });
      console.log(program);
      return program;
    } catch (e) {
      console.log('could not find new program');
      return e;
    }
  }
}

mongoSchema.loadClass(ProgramClass);

module.exports = mongoose.models.Program || mongoose.model('Program', mongoSchema);