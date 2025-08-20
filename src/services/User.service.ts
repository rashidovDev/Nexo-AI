import bcrypt from "bcryptjs";
import UserModel from "../models/User.model";
import Errors, { HttpCode, Message } from "../libs/utils/Error";
import { LoginInput, User, UserInput } from "../libs/types/user";
import { UserStatus } from "../libs/enums/user.enum";
import { shapeIntoMongooseObjectId } from "../libs/utils/config";

class UserService {
  private readonly userModel;
   constructor() {
    this.userModel = UserModel;
  }
  /**
   * Sign up new member
   */
  /** SPA Signup */
   public async signup(input: UserInput): Promise<User> {
    const salt = await bcrypt.genSalt(); 
    input.userPassword = await bcrypt.hash(input.userPassword, salt);
    try {
      const result = await this.userModel.create(input);
      result.userPassword = ""; // Hide password before returning
      return result.toJSON() as unknown as User;
    } catch (err) {
      console.log("Error , model:signup", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATION_FAILED);
    }
  }

  /**
   * Login existing member
   */
   /** SPA Login */
   public async login(input: LoginInput): Promise<{
    user: User;
  }> {
    // 1️⃣ Find user by nickname (and not deleted)
    const user = await this.userModel
      .findOne(
        {
          username: input.username,
          memberStatus: { $ne: UserStatus.DELETE },
        },
        { username: 1, userPassword: 1, userStatus: 1 }
      )
      .exec();

    if (!user) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);
    } else if (user.userStatus === UserStatus.BLOCK) {
      throw new Errors(HttpCode.FORBIDDEN, Message.BLOCKED_USER);
    }

    // 2️⃣ Check password
    const isMatch = await bcrypt.compare(input.userPassword, user.userPassword);
    if (!isMatch) {
      throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
    }

    // 3️⃣ Fetch complete user data without password
    const foundMember = await this.userModel
      .findById(user._id)
      .select("username userType userStatus createdAt updatedAt")
      .exec();

    if (!foundMember) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);
    }
    console.log(foundMember)

    const safeUser = foundMember.toJSON() as unknown as User

    // 5️⃣ Return user & tokens
    return {
      user: safeUser,
    };
  }

  /**
   * Find member by ID
   */

  public async getUserDetails(user:User): Promise <User> {
    const userId = shapeIntoMongooseObjectId(user._id);
    const result = await this.userModel.findOne({
      _id: userId,
      userStatus: UserStatus.ACTIVE
   })
   .exec();
   if(!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
   return result.toJSON() as unknown as User;
  }

  public async searchUserByUsername(payload : string) {
  const result = await this.userModel.findOne({
  username: { $regex: new RegExp(`^${payload}$`, "i") }, // case-insensitive match
  userStatus: UserStatus.ACTIVE
  })
  .exec()
  if(!result)  if(!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
  return result.toJSON() as unknown as User
  }

  public async getUserById(userId: string): Promise<User> {
    const result = await this.userModel.findById(userId)
      .select("username userImage userEmail userPhone")
      .exec();
    if (!result) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }
    return result.toJSON() as unknown as User;  
}

  public async getAllUsers(): Promise<User[]> {
    const users = await this.userModel.find({ userStatus: UserStatus.ACTIVE })
      .select("username userImage userEmail")
      .exec();
    return users.map(user => user.toJSON() as unknown as User);
  }

}

export default UserService;