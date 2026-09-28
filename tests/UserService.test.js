const UserService = require('../src/services/UserService');

describe('UserService', () => {
  it('hashes the password and delegates to the repository', async () => {
    const fakeUserRepository = {
      verifyUsernameAvailable: jest.fn().mockResolvedValue(),
      addUser: jest.fn().mockImplementation(({ username, password, fullname }) => Promise.resolve({
        id: 'user-123', username, fullname,
      })),
    };

    const userService = new UserService(fakeUserRepository);
    const result = await userService.addUser({
      username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia',
    });

    expect(fakeUserRepository.verifyUsernameAvailable).toHaveBeenCalledWith('dicoding');
    expect(fakeUserRepository.addUser).toHaveBeenCalled();
    const calledWith = fakeUserRepository.addUser.mock.calls[0][0];
    expect(calledWith.password).not.toEqual('secret'); // must be hashed
    expect(result).toEqual({ id: 'user-123', username: 'dicoding', fullname: 'Dicoding Indonesia' });
  });
});
