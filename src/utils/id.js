const { nanoid } = require('nanoid');

const generateId = (prefix) => `${prefix}-${nanoid(21)}`;

module.exports = { generateId };
