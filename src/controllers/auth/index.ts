import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../models/user.model';
import { UserInterface } from '../../@types/index'

export const me = {
  name: 'me',
  type: 'User!',
  resolve: ({ context: { user } }): UserInterface => user
}

export const signUp = {
  name: 'signUp',
  type: 'AccessToken!',
  args: {
    fullName: 'String!',
    email: 'String!',
    password: 'String!'
  },
  resolve: async ({ args: { fullName, email, password } }): Promise<{ accessToken: string }> => {
    try {
      let user = await User.findOne({ email })
      if (user) {
        return Promise.reject(new Error('Email has already been taken.'))
      }

      const hash = bcrypt.hashSync(password, 10);

      user = await new User({
        fullName,
        email,
        password: hash,
      }).save()

      const accessToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
      )



      return { accessToken }
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

export const signIn = {
  name: 'signIn',
  type: 'AccessToken!',
  args: {
    email: 'String!',
    password: 'String!'
  },
  resolve: async ({ args: { email, password } }): Promise<{ accessToken: string }> => {
    try {
      const user = await User.findOne({ email })
      if (!user) {
        return Promise.reject(new Error('User not found.'))
      }

      const isValidPassword = await user.schema.methods.comparePassword(password)
      if (!isValidPassword) {
        return Promise.reject(new Error('Password is incorrect.'))
      }

      const accessToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
      )

      return { accessToken }
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

