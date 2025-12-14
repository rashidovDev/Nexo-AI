import Errors, { HttpCode, Message } from "../libs/utils/Error";
import { TOKEN_TIME } from "../libs/utils/config"; // Example: 1h
import { User } from "../libs/types/user";
import jwt from "jsonwebtoken";

class AuthService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;

  constructor() {
    this.accessSecret = process.env.NEXT_PUBLIC_JWT_SECRET as string;
    this.refreshSecret = process.env.REFRESH_TOKEN_SECRET as string;
  }

  /**
   * Create Access Token
   */
  public async createAccessToken(payload : any): Promise<string> {
    return new Promise((resolve, reject) => {
      const duration =`${TOKEN_TIME}h`;
      jwt.sign(
        payload, 
        this.accessSecret,
        { expiresIn: duration },
        (err, token) => {
          if (err) {
            reject(
              new Errors(HttpCode.UNAUTHORIZED, Message.TOKEN_CREATION_FAILED)
            );
          } else { 
            resolve(token as string);
          }
        }
      );
    });
  }

  /**
   * Create Refresh Token
   */
  public async createRefreshToken(payload: User): Promise<string> {
    return new Promise((resolve, reject) => {
      const duration =`${TOKEN_TIME}d`;
      jwt.sign(
        payload,
        this.refreshSecret,
        { expiresIn: duration },
        (err, token) => {
          if (err) {
            reject(
              new Errors(HttpCode.UNAUTHORIZED, Message.TOKEN_CREATION_FAILED)
            );
          } else {
            resolve(token as string);
          }
        }
      );
    });
  }

  /**
   * Verify Access Token
   */
  public async verifyAccessToken(token: string): Promise<User> {
    try {
      const decoded = jwt.verify(token, this.accessSecret) as User;
      // console.log(`---[ACCESS] memberNick: ${decoded.username}---`);
      return decoded;
    } catch (err) {
      throw new Errors(HttpCode.UNAUTHORIZED, Message.INVALID_TOKEN);
    }
  }

  /**
   * Verify Refresh Token
   */
  public async verifyRefreshToken(token: string): Promise<User> {
    try {
      const decoded = jwt.verify(token, this.refreshSecret) as User;
      // console.log(`---[REFRESH] memberNick: ${decoded.userPhone}---`);
      return decoded;
    } catch (err) {
      throw new Errors(HttpCode.UNAUTHORIZED, Message.INVALID_REFRESH_TOKEN);
    }
  }

  /**
   * Rotate Tokens (Generate new Access using Refresh)
   */
  // public async rotateTokens(refreshToken: string): Promise<{
  //   accessToken: string;
  //   refreshToken: string;
  // }> {
  //   const decoded = await this.verifyRefreshToken(refreshToken);
  //   const newAccessToken = await this.createAccessToken(decoded);
  //   const newRefreshToken = await this.createRefreshToken(decoded);
  //   return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  // }
}

export default AuthService; 
