import mongoose, {Schema} from "mongoose";
import { UserStatus, UserType } from "../libs/enums/user.enum";
// Schema first and Code first

const userSchema = new Schema({
    userType: {
        type: String,
        enum: UserType,
        default:UserType.USER
    },
    isVerified: { type: Boolean, default: false },
    userStatus: {
        type: String,
        enum: UserStatus,
        default: UserStatus.ACTIVE
    },
    firstName: { type: String },
    lastName: { type: String },
    muted: { type: Boolean, default: false },
    email: {
        type: String,
        index: { unique: true, sparse: true},
        required: true,
    },
    username: {
        type: String,
        index: { unique: true, sparse: true},
    },
    userPassword:{
        type:String, 
        select: false, 
    },
   userImage: {
    url: String,
    public_id: String
  },
    bio: { type: String, default: "" },
    notificationSound : {type : String, default: 'notification.mp3'},
    sendingSound : {type : String, default: 'sending.mp3'},
    lastSeen: { type: Date },
    contacts: [{ type: Schema.Types.ObjectId, ref: 'User' }],
},
   { timestamps:true}  // updateAt createAt
);


export default mongoose.model("User", userSchema);




