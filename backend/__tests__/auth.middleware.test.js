// Mock heavy dependencies BEFORE requiring the module under test.
// This prevents mongoose from making a DB connection when the User model loads.
jest.mock('jsonwebtoken');
jest.mock('../models/User', () => ({ findById: jest.fn() }));

const jwt  = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// ── Test helpers ──────────────────────────────────────────────────────────────
const makeReq = (token = null) => ({
  headers: token ? { authorization: `Bearer ${token}` } : {},
});

const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('protect middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Silence the console.error that auth.js intentionally emits on invalid tokens
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it('returns 401 with a descriptive message when no Authorization header is present', async () => {
    const req  = makeReq(null);
    const res  = makeRes();
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, no token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when the JWT token is invalid or expired', async () => {
    jwt.verify.mockImplementation(() => { throw new Error('jwt malformed'); });

    const req  = makeReq('bad.token.here');
    const res  = makeRes();
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, token failed' });
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next() and attaches the user to req when a valid token is provided', async () => {
    const mockUser = { _id: 'user123', name: 'Yousef', email: 'y@test.com' };
    jwt.verify.mockReturnValue({ id: 'user123' });
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    const req  = makeReq('valid.jwt.token');
    const res  = makeRes();
    const next = jest.fn();

    await protect(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toEqual(mockUser);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('looks up the user by the id encoded in the token', async () => {
    const mockUser = { _id: 'xyz789', name: 'Test' };
    jwt.verify.mockReturnValue({ id: 'xyz789' });
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    const req  = makeReq('token');
    const res  = makeRes();
    const next = jest.fn();

    await protect(req, res, next);

    expect(User.findById).toHaveBeenCalledWith('xyz789');
  });

  it('excludes the password field when fetching the user', async () => {
    const mockUser = { _id: 'u1', name: 'Alice' };
    jwt.verify.mockReturnValue({ id: 'u1' });
    const selectMock = jest.fn().mockResolvedValue(mockUser);
    User.findById.mockReturnValue({ select: selectMock });

    const req  = makeReq('token');
    const res  = makeRes();
    await protect(req, res, jest.fn());

    expect(selectMock).toHaveBeenCalledWith('-password');
  });
});
