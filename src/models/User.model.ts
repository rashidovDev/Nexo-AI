import mongoose, {Schema} from "mongoose";
import { UserStatus, UserType } from "../libs/enums/user.enum";
// Schema first and Code first

const userSchema = new Schema({
    userType: {
        type: String,
        enum: UserType,
        default:UserType.USER
    },
    userStatus: {
        type: String,
        enum: UserStatus,
        default: UserStatus.ACTIVE
    },
    userEmail: {
        type: String,
        index: { unique: true, sparse: true},
        required: true,
    },
    username: {
        type: String,
        index: { unique: true, sparse: true},
        required: true,
    },
    userPassword:{
        type:String, 
        select: false, 
        required: true,
    },
   userImage: {
    url: String,
    public_id: String
  },
    lastSeen: { type: Date },
},
   { timestamps:true}  // updateAt createAt
);


export default mongoose.model("User", userSchema);




