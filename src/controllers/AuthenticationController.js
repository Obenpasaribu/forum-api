const {
  validatePostAuthenticationPayload,
  validatePutAuthenticationPayload,
  validateDeleteAuthenticationPayload,
} = require('../validators/authenticationValidator');

class AuthenticationController {
  constructor(authenticationService) {
    this._authenticationService = authenticationService;
    this.postAuthentication = this.postAuthentication.bind(this);
    this.putAuthentication = this.putAuthentication.bind(this);
    this.deleteAuthentication = this.deleteAuthentication.bind(this);
  }

  async postAuthentication(req, res, next) {
    try {
      validatePostAuthenticationPayload(req.body);
      const { accessToken, refreshToken } = await this._authenticationService.login(req.body);
      res.status(201).json({
        status: 'success',
        data: { accessToken, refreshToken },
      });
    } catch (error) {
      next(error);
    }
  }

  async putAuthentication(req, res, next) {
    try {
      validatePutAuthenticationPayload(req.body);
      const accessToken = await this._authenticationService.refreshAccessToken(req.body.refreshToken);
      res.status(200).json({
        status: 'success',
        data: { accessToken },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAuthentication(req, res, next) {
    try {
      validateDeleteAuthenticationPayload(req.body);
      await this._authenticationService.logout(req.body.refreshToken);
      res.status(200).json({ status: 'success' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthenticationController;
