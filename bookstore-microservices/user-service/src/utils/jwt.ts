import jwt from 'jsonwebtoken';
import { logger } from './logger';

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface RefreshTokenPayload {
  id: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    
    return jwt.sign(payload, secret, { expiresIn });
  } catch (error) {
    logger.error('Error generating access token:', error);
    throw new Error('Token generation failed');
  }
};

export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
  try {
    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET not configured');
    }

    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    
    return jwt.sign(payload, secret, { expiresIn });
  } catch (error) {
    logger.error('Error generating refresh token:', error);
    throw new Error('Refresh token generation failed');
  }
};

export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    return jwt.verify(token, secret) as TokenPayload;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    logger.error('Error verifying access token:', error);
    throw new Error('Token verification failed');
  }
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET not configured');
    }

    return jwt.verify(token, secret) as RefreshTokenPayload;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token expired');
    }
    logger.error('Error verifying refresh token:', error);
    throw new Error('Refresh token verification failed');
  }
};

export const generateTokenPair = (user: any): { accessToken: string; refreshToken: string } => {
  const accessToken = generateAccessToken({
    id: user._id,
    email: user.email,
    role: user.role,
    permissions: user.permissions || []
  });

  const refreshToken = generateRefreshToken({
    id: user._id
  });

  return { accessToken, refreshToken };
};
