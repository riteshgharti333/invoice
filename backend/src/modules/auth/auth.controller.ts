import type { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { apiResponse } from "../../common/utils/apiResponse";
import { authService } from "./auth.service";
import { setTokenCookie, clearTokenCookie } from "../../common/utils/cookie";

class AuthController {
  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);

    //  Set token in cookie 
    setTokenCookie(res, result.token);

    return apiResponse({
      res,
      message: "Login successful",
      data: {
        user: result.user,
      },
    });
  });

  me = asyncHandler(async (req, res) => {
    const profile = await authService.me(req.user!.userId);

    return apiResponse({
      res,
      message: "Profile fetched successfully",
      data: profile,
    });
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.logout(req.user!.userId);

    //  Clear cookie
    clearTokenCookie(res);

    return apiResponse({
      res,
      message: result.message,
    });
  });
}

export const authController = new AuthController();
