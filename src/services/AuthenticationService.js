const password = require('../utils/password');
const token = require('../utils/token');

class AuthenticationService {
  constructor(userRepository, authenticationRepository) {
    this._userRepository = userRepository;
    this._authenticationRepository = authenticationRepository;
  }

  async login({ username, password: rawPassword }) {
    const { id, password: hashedPassword } = await this._userRepository.getPasswordByUsername(username);
    await password.compare(rawPassword, hashedPassword);

    const accessToken = token.generateAccessToken({ id });
    const refreshToken = token.generateRefreshToken({ id });

    await this._authenticationRepository.addToken(refreshToken);

    return { accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken) {
    await this._authenticationRepository.checkTokenAvailability(refreshToken);
    const { id } = token.verifyRefreshToken(refreshToken);
    return token.generateAccessToken({ id });
  }

  async logout(refreshToken) {
    await this._authenticationRepository.checkTokenAvailability(refreshToken);
    await this._authenticationRepository.deleteToken(refreshToken);
  }
}

module.exports = AuthenticationService;
