import { UserType, UserStatus } from '../enums/user.enum';
import { ObjectId } from "mongoose";
import { Request } from "express";

export interface User {
         _id: ObjectId;
        userType: UserType; // Optional
        userStatus: UserStatus; // Optional
        firstName: string; // Optional       
        lastName: string; // Optional
        email: string; // Required
        username : string; // Required
        userImage?: {
            url : string,
            public_id : string
        }; // Optional
        muted: boolean;
        lastSeen?: Date; // Optional
        createdAt: Date; // Optional
        updatedAt: Date; // Optional (corrected from 'updete')
    }
export interface UserInput {
    userType?: UserType; // Optional
    userStatus?: UserStatus; // Optional
    email : string // Required
    lastname : string; // Optional
    firstname : string; // Optional
    username: string; // Required
    userImage?: string; // Optional
}

export interface LoginInput {
    email : string;
}

export interface UserUpdateInput {
    username: string; // Required   
    firstName: string; // Optional
    lastName: string; // Optional
    bio: string; // Optional
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