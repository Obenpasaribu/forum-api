const { validateAddUserPayload } = require('../src/validators/userValidator');
const InvariantError = require('../src/commons/exceptions/InvariantError');

describe('validateAddUserPayload', () => {
  it('throws InvariantError when required property is missing', () => {
    expect(() => validateAddUserPayload({ username: 'dicoding' })).toThrow(InvariantError);
  });

  it('throws InvariantError when data type is wrong', () => {
    expect(() => validateAddUserPayload({
      username: 123, password: 'secret', fullname: 'Dicoding Indonesia',
    })).toThrow(InvariantError);
  });

  it('throws InvariantError when username exceeds 50 characters', () => {
    expect(() => validateAddUserPayload({
      username: 'a'.repeat(51), password: 'secret', fullname: 'Dicoding Indonesia',
    })).toThrow('karakter username melebihi batas limit');
  });

  it('throws InvariantError when username contains forbidden characters', () => {
    expect(() => validateAddUserPayload({
      username: 'dico ding', password: 'secret', fullname: 'Dicoding Indonesia',
    })).toThrow('username mengandung karakter terlarang');
  });

  it('does not throw for a valid payload', () => {
    expect(() => validateAddUserPayload({
      username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia',
    })).not.toThrow();
  });
});
