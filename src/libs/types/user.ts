import { UserType, UserStatus } from '../enums/user.enum';
import { ObjectId } from "mongoose";
import { Request } from "express";

export interface User {
         _id: ObjectId;
        userType: UserType; // Optional
        userStatus: UserStatus; // Optional
        userEmail: string; // Required
        username : string; // Required
        userPassword: string; // Required
        userImage?: {
            url : string,
            public_id : string
        }; // Optional
        lastSeen?: Date; // Optional
        createdAt: Date; // Optional
        updatedAt: Date; // Optional (corrected from 'updete')
    }
export interface UserInput {
    userType?: UserType; // Optional
    userStatus?: UserStatus; // Optional
    userEmail : string // Required
    username: string; // Required
    userPassword: string; // Required
    userImage?: string; // Optional
}

export interface LoginInput {
    username:string;
    userPassword:string;
}
export interface UserUpdateInput {
        _id: ObjectId;
        userStatus?: UserStatus; // Optional
        userEmail?: string; // Required
        username?: string; // Required
        userPassword?: string; // Required
        userDesc?: string; // Optional
        userAddress?: string; // Optional
        userImage?: string; // Optional
        
}
export interface ExtendedRequest extends Request {
    user: User;
    // file: Express.Multer.File;
    // files:Express.Multer.File[];
 }

// export interface AdminRequest extends Request {
//     user: User;
//     session: Session & { user: User} ;
//     file: Express.Multer.File;
//     files:Express.Multer.File[];
//  }