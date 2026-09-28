const { validateAddThreadPayload } = require('../validators/threadValidator');

class ThreadController {
  constructor(threadService, threadDetailService) {
    this._threadService = threadService;
    this._threadDetailService = threadDetailService;
    this.postThread = this.postThread.bind(this);
    this.getThread = this.getThread.bind(this);
  }

  async postThread(req, res, next) {
    try {
      validateAddThreadPayload(req.body);
      const owner = req.auth.credentials.id;
      const addedThread = await this._threadService.addThread({ ...req.body, owner });
      res.status(201).json({
        status: 'success',
        data: { addedThread },
      });
    } catch (error) {
      next(error);
    }
  }

  async getThread(req, res, next) {
    try {
      const { threadId } = req.params;
      const thread = await this._threadDetailService.getThreadDetail(threadId);
      res.status(200).json({
        status: 'success',
        data: { thread },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ThreadController;
