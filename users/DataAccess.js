import User from './schema.js'


class UsersDataAccess {
  async userCheck(login, password) {
    const user = await User.findOne({ name: login, password: password })
    if (!user) {
      throw new Error('User not found')
    }
    return user
  }

}

export default UsersDataAccess
