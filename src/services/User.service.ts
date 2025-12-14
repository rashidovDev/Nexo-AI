import bcrypt from "bcryptjs";
import UserModel from "../models/User.model";
import Errors, { HttpCode, Message } from "../libs/utils/Error";
import {  User,  UserUpdateInput } from "../libs/types/user";
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
  //  public async signup(input: UserInput): Promise<User> {
  //   const salt = await bcrypt.genSalt(); 
  //   input.userPassword = await bcrypt.hash(input.userPassword, salt);
  //   try {
  //     const result = await this.userModel.create(input);
  //     result.userPassword = ""; // Hide password before returning
  //     return result.toJSON() as unknown as User;
  //   } catch (err) {
  //     console.log("Error , model:signup", err);
  //     throw new Errors(HttpCode.BAD_REQUEST, Message.CREATION_FAILED);
  //   }
  // }
// EDIT USER PROFILE
  public async editUserDetails(user : User, input : UserUpdateInput): Promise <User> {
    const userId = shapeIntoMongooseObjectId(user._id);
    const result = await this.userModel.findOneAndUpdate({
      _id: userId,
      userStatus: UserStatus.ACTIVE
   },
   {
    $set: {
       ...input
    }
    },
    { new: true } // return the updated document
    )  
    .exec();
    if(!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result.toJSON() as unknown as User;
  }


   public async checkUsername(username : string): Promise <boolean> {

    const result = await this.userModel.findOne({
      username,
      userStatus: UserStatus.ACTIVE}
    )  
    .exec();
    const available = !result;
    
    return available as unknown as boolean;
  }


  /**
   * Find member by ID
   */
public async createContact(user: User, email: string): Promise<User> {
  const userId = shapeIntoMongooseObjectId(user._id);

  // 1️⃣ Find the contact user by email
  const contact = await this.userModel
    .findOne({ email, userStatus: UserStatus.ACTIVE })
    .select('_id email userStatus bio userImage firstName lastName') // ✅ only return these fields
    .exec();

  if (!contact) throw new Errors(HttpCode.NOT_FOUND, Message.NO_USER_FOUND);

  // 2️⃣ Prevent adding yourself
  if (contact._id.equals(userId)) {
    throw new Errors(HttpCode.BAD_REQUEST, Message.CANT_CR_SELF);
  }

  // 3️⃣ Check if contact already exists
  const isAlreadyContact = await this.userModel.exists({
    _id: userId,
    contacts: contact._id,
  });

  if (isAlreadyContact) {
    throw new Errors(HttpCode.BAD_REQUEST, Message.ALREADY_EXIST);
  }

  // 4️⃣ Push new contact ID into user's contacts
  await this.userModel.findByIdAndUpdate(
    userId,
    { $push: { contacts: contact._id } },
    { new: true }
  );

  // ✅ 5️⃣ Return only the created contact
  return contact.toJSON() as unknown as User;
}




public async getMyContacts(user : User): Promise<User[]> {
  const userId = shapeIntoMongooseObjectId(user);

  const result = await this.userModel.findOne({
    _id: userId,
    userStatus: UserStatus.ACTIVE,
  })
  .populate({
    path: "contacts",
    select: "_id email userStatus bio userImage firstName lastName", // only needed fields
  })
  .select("contacts")
  .exec();

  if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

  // At runtime, result.contacts is populated as User[]
  // But TypeScript still thinks it's ObjectId[]
  // So we cast it explicitly
  return result.contacts as unknown as User[];
}



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


  public async searchUserByUsername(payload: string) {
    const query = payload.trim();
    if (!query) return [];

    const regex = new RegExp(query, "i");
    const result = await this.userModel
      .find({
        $or: [
          { username: { $regex: regex } },
          { firstName: { $regex: regex } },
          { lastName: { $regex: regex } },
          { email: { $regex: regex } },
        ],
        userStatus: UserStatus.ACTIVE,
      })
      .select("userImage email bio firstName lastName username")
      .limit(25)
      .exec();

    return result.map(user => user.toJSON() as unknown as User);
  }


  public async getUserById(userId: string): Promise<User> {
    const result = await this.userModel.findById(userId)
      .select("username userImage email userPhone")
      .exec();
    if (!result) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }
    return result.toJSON() as unknown as User;  
}

  public async getAllUsers(): Promise<User[]> {
    const users = await this.userModel.find({ userStatus: UserStatus.ACTIVE })
      .select("username userImage email")
      .exec();
    return users.map(user => user.toJSON() as unknown as User);
  }

  public async deleteContact(user : User, contactId : string ): Promise <User> {
    const userId = shapeIntoMongooseObjectId(user._id);
    const existingContact = await this.userModel.findOne({ _id : userId})
    if(!existingContact) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }
    existingContact.contacts = existingContact.contacts.filter(
      (contact) => contact.toString() !== contactId
    );
    await existingContact.save();
    const result = await this.userModel.findOne({
      _id: userId,    
      userStatus: UserStatus.ACTIVE
   })
   .exec();
    
    if(!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result.toJSON() as unknown as User;; 
    }
}



export default UserService;
