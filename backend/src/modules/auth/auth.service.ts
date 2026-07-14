import { AppError } from "../../common/errors/AppError";
import { comparePassword } from "../../common/utils/password";
import { generateToken } from "../../common/utils/cookie";
import { userRepository } from "../users/user.repository";
import { HTTP_STATUS } from "../../common/constants/httpStatus";
import { MESSAGES } from "../../common/constants/messages";

interface LoginDto {
  email: string;
  password: string;
}

class AuthService {
  async login(data: LoginDto) {
    const user = await userRepository.findByEmail(data.email);

    if (!user) {
      throw new AppError({
        statusCode: HTTP_STATUS.UNAUTHORIZED,
        message: MESSAGES.INVALID_CREDENTIALS,
      });
    }

    const isPasswordValid = await comparePassword(data.password, user.password);

    if (!isPasswordValid) {
      throw new AppError({
        statusCode: HTTP_STATUS.UNAUTHORIZED,
        message: MESSAGES.INVALID_CREDENTIALS,
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  async me(userId: string) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError({
        statusCode: HTTP_STATUS.NOT_FOUND,
        message: MESSAGES.USER_NOT_FOUND,
      });
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async logout(userId: string) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError({
        statusCode: HTTP_STATUS.NOT_FOUND,
        message: MESSAGES.USER_NOT_FOUND,
      });
    }

    return {
      message: "Logged out successfully",
    };
  }
}

export const authService = new AuthService();
