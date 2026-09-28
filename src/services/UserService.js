const password = require('../utils/password');

class UserService {
  constructor(userRepository) {
    this._userRepository = userRepository;
  }

  async addUser({ username, password: rawPassword, fullname }) {
    await this._userRepository.verifyUsernameAvailable(username);
    const hashedPassword = await password.hash(rawPassword);
    return this._userRepository.addUser({ username, password: hashedPassword, fullname });
  }
}

module.exports = UserService;
