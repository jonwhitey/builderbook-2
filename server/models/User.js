const mongoose = require('mongoose');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const generateSlug = require('../utils/slugify');
const sendEmail = require('../aws');
const { getEmailTemplate } = require('./EmailTemplate');

const logger = require('../logs');

const { Schema } = mongoose;

// define user Schema
const mongoSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: false,
    unique: false,
  },
  firstName: {
    type: String,
    required: false,
    unique: false,
  },
  lastName: {
    type: String,
    required: false,
    unique: false,
  },
  googleId: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
  },
  googleToken: {
    access_token: String,
    refresh_token: String,
    token_type: String,
    expiry_date: Number,
  },

  slug: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  displayName: String,
  avatarUrl: String,
  github: {
    isGithubConnected: {
      type: Boolean,
      default: false,
    },
    githubAccessToken: {
      type: String,
    },
  },
  purchasedBookIds: [String],
});

class UserClass {
  static publicFields() {
    return [
      'id',
      'firstName',
      'lastName',
      'displayName',
      'email',
      'avatarUrl',
      'slug',
      'isAdmin',
      'isGithubConnected',
      'purchasedBookIds',
    ];
  }

  static async findEmail({ uid }) {
    try {
      const email = await this.findOne({ _id: uid }).select('email');
      return email;
    } catch (e) {
      console.log(`User.js findEmail error -  ${e}`);
      return e;
    }
  }

  static async signInOrSignUp({
    email,
    password,
    firstName,
    lastName,
    googleId,
    googleToken,
    displayName,
    avatarUrl,
  }) {
    const saltRounds = 10;
    const passwordHash = bcrypt.hashSync(password, saltRounds);

    // check if user exists with email
    let user = await this.findOne({ email });
    if (user) {
      const match = await bcrypt.compare(password, user.passwordHash);
      if (user && password && match) {
        console.log('found user and password match');
        user = _.pick(user, UserClass.publicFields());

        console.log(`User.js returns ${user}`);
        return user;
      }
      if (user && password && !match) {
        console.log(`correct email but wrong password`);
        return false;
      }
    }

    if (user) {
      if (user.googleId) {
        const modifier = {};
        // check if google provided new tokens
        if (googleToken.accessToken) {
          modifier.access_token = googleToken.accessToken;
        }

        if (googleToken.refreshToken) {
          modifier.refresh_token = googleToken.refreshToken;
        }
        // if google did not provide tokens; leave it the same
        if (_.isEmpty(modifier)) {
          return user;
        }
        // if google did provide the tokens, update the User document
        await this.updateOne({ googleId }, { $set: modifier });

        return user;
      }
    }
    if (user) {
      console.log('USER EXISTS');
      return user;
    }
    // if user does not exist, generate a slug and add the new user

    if (!displayName) {
      // eslint-disable-next-line no-param-reassign
      displayName = firstName + lastName;
    }

    const slug = await generateSlug(this, displayName);

    // set default avatarUrl
    if (avatarUrl === undefined) {
      // eslint-disable-next-line no-param-reassign
      avatarUrl = 'https://storage.googleapis.com/builderbook/logo.svg';
    }

    let newUser = await this.create({
      createdAt: new Date(),
      email,
      passwordHash,
      firstName,
      lastName,
      googleId,
      googleToken,
      displayName,
      avatarUrl,
      slug,
    });

    newUser = _.pick(newUser, UserClass.publicFields());

    const template = await getEmailTemplate('welcome', {
      userName: displayName,
    });
    if (email === 'jonathan.e.white@colorado.edu') {
      return newUser;
    }
    try {
      await sendEmail({
        from: `Jon at basics.fitness <${process.env.EMAIL_SUPPORT_FROM_ADDRESS}>`,
        to: [email],
        subject: template.subject,
        body: template.message,
      });
    } catch (err) {
      logger.error('Email sending error:', err);
    }

    return newUser;
  }
}

mongoSchema.loadClass(UserClass);

const User = mongoose.model('User', mongoSchema);

module.exports = User;
