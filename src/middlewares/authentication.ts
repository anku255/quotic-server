import jwt from 'jsonwebtoken';
import User from '../models/user.model'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const authentication = async (req, _, next): Promise<any> => {
  try {
    const { headers: { authorization } } = req
    if (!authorization) {
      return next()
    }

    const accessToken = authorization.split(' ')[1]

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET)
    if (!decoded) {
      return next()
    }


    const user = await User.findById(decoded.userId)

    if (!user) {
      return next()
    }

    Object.assign(req, {
      user,
      accessToken
    })

    return next()
  } catch (error) {
    return next()
  }
}

export default authentication;