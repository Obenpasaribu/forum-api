const { validateAddUserPayload } = require('../validators/userValidator');

class UserController {
  constructor(userService) {
    this._userService = userService;
    this.postUser = this.postUser.bind(this);
  }

  async postUser(req, res, next) {
    try {
      validateAddUserPayload(req.body);
      const addedUser = await this._userService.addUser(req.body);
      res.status(201).json({
        status: 'success',
        data: { addedUser },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
