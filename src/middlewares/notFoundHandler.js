const notFoundHandler = (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: 'resource yang Anda minta tidak ditemukan',
  });
};

module.exports = notFoundHandler;
