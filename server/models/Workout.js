const mongoose = require('mongoose');
const User = require('./LocalUser');

const { Schema } = mongoose;

// define user Schema
const mongoSchema = new Schema({
  uid: {
    type: String,
    required: true,
    unique: false,
  },
  date: {
    type: Date,
    required: true,
    unique: false,
    default: Date.now,
  },
  name: {
    type: String,
    required: true,
    unique: false,
  },

  training: [
    {
      name: String,
      exercises: [
        {
          eid: String,
          name: String,
          // options come from the exercise
          options: [
            {
              progression: String,
            },
          ],
          sets: [
            {
              numReps: Number,
              units: String,
              resistance: Number,
            }, 
          ],
          equipment: String,
          workTime: Number,
          restTime: Number,
          complete: Boolean,
        },
      ],
    },
  ],
});

class WorkoutClass {
  static publicFields() {
    return [];
  }

  static async findEmail({ uid }) {
    try {
      console.log('find email');
      console.log(uid);
      const email = await User.findOne({ _id: uid }).select('email');
      return email;
    } catch (e) {
      console.log(`Workout.js findEmail error -  ${e}`);
      return false;
    }
  }

  static async getNextWorkout({ uid }) {
    console.log('models/workout get next workout called');
    console.log(uid);
    try {
      const nextWorkout = await this.findOne({ uid });
      return nextWorkout;
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  static async deleteWorkout(_id) {
    let response = 'error';
    try {
      await this.deleteOne({ _id });
      response = 'deleted workout';
      return response;
    } catch (e) {
      return e;
    }
  }

  static async saveWorkout(workout) {
    console.log('Workout.saveWorkout');
    console.log(workout.uid);
    const { uid } = workout;
    console.log({ uid });
    try {
      console.log('attempt to save workout');
      const email = await this.findEmail({ uid });
      if (email) {
        console.log('valid uid');
        console.log(email);
      } else {
        return email;
      }
      const newWorkout = await this.create(workout);
      console.log('new workout =');
      console.log(newWorkout);
      return newWorkout;
    } catch (e) {
      console.log(e);
      return e;
    }
  }
  /*
  static async submitWorkout() {
    return true;
  }

  static async prevWorkouts(_id, uid, length) {
    return true;
  }

  static async prevExercises(workout, uid, length) {
    return true;
  }
  */
}

mongoSchema.loadClass(WorkoutClass);

module.exports = mongoose.models.Workout || mongoose.model('Workout', mongoSchema);
