const jwt = require('jsonwebtoken');
const { User } = require('../models');
const jwtConfig = require('../config/jwt');

const generateAccessToken = (id) => {
  return jwt.sign({ id }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, jwtConfig.refreshSecret, { expiresIn: jwtConfig.refreshExpiresIn });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { email, password, fullName, username } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      fullName,
      username
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Save refresh token in DB
    await user.update({ refreshToken });

    // Set cookies
    res.cookie('token', accessToken, jwtConfig.accessCookieOptions);
    res.cookie('refreshToken', refreshToken, jwtConfig.refreshCookieOptions);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toJSON(),
        token: accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || ! password) {
      return res. status(400).json({
        success: false,
        message:  'Please provide email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user. comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Save refresh token in DB
    await user.update({ refreshToken });

    // Set cookies
    res.cookie('token', accessToken, jwtConfig.accessCookieOptions);
    res.cookie('refreshToken', refreshToken, jwtConfig.refreshCookieOptions);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: user.toJSON(),
        token: accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req. user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    // Invalidate refresh token in DB so it can't be reused
    await User.update({ refreshToken: null }, { where: { id: req.user.id } });

    // Clear both cookies
    res.clearCookie('token');
    res.clearCookie('refreshToken');

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { fullName, username, currency, avatarUrl } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (fullName !== undefined) user.fullName = fullName;
    if (username !== undefined) user.username = username;
    if (currency !== undefined) user.currency = currency;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user. id);

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token using refresh token
// @route   POST /api/auth/refresh
// @access  Public (uses refresh token cookie)
const refreshAccessToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'No refresh token provided.' });
    }

    // Verify the refresh token signature
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret);
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
    }

    // Check the token exists in DB (not logged out)
    const user = await User.findOne({ where: { id: decoded.id, refreshToken } });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Refresh token has been revoked.' });
    }

    // Issue a new access token
    const newAccessToken = generateAccessToken(user.id);
    res.cookie('token', newAccessToken, jwtConfig.accessCookieOptions);

    res.status(200).json({
      success: true,
      data: { token: newAccessToken }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/auth/account
// @access  Private
const deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.destroy();

    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update notification preferences
// @route   PUT /api/auth/preferences
// @access  Private
const updatePreferences = async (req, res, next) => {
  try {
    const { emailNotifications, budgetAlerts, goalReminders } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updated = {
      emailNotifications: emailNotifications ?? user.preferences?.emailNotifications ?? true,
      budgetAlerts: budgetAlerts ?? user.preferences?.budgetAlerts ?? true,
      goalReminders: goalReminders ?? user.preferences?.goalReminders ?? true
    };

    await user.update({ preferences: updated });

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: { preferences: updated }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout,
  refreshAccessToken,
  updateProfile,
  changePassword,
  deleteAccount,
  updatePreferences
};