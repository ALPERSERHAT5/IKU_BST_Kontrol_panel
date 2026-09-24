import * as authService from '../services/auth.service.js';

export async function register(req, res, next) {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json({ user });
  } catch (e) { next(e); }
}

export async function login(req, res, next) {
  try {
    const result = await authService.loginUser(req.body);
    res.json(result);
  } catch (e) { next(e); }
}

export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshTokens(refreshToken);
    res.json(result);
  } catch (e) { next(e); }
}

export async function me(req, res) {
  res.json({ user: req.user });
}

export async function forgotPassword(req, res) {
  res.json({
    message: 'Şifre yenileme işlemi için BST/IT ekibinizle iletişime geçin.',
  });
}