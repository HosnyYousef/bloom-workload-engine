const User = require('../models/User');

describe('User model save middleware', () => {
  it('allows an existing user to save other fields without changing its password', async () => {
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'already-hashed-password',
    });
    user.$__reset();
    user.priorityPlans.typical = [];

    await expect(User.hashPasswordBeforeSave.call(user)).resolves.toBeUndefined();
    expect(user.password).toBe('already-hashed-password');
  });
});
