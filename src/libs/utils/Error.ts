export enum HttpCode {
    OK = 200,
    CREATED = 201,
    NOT_MODIFIED = 304,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
}

export enum Message {
    ALREADY_REGISTERED = "User with this email already exists",
    NO_USER_FOUND = "No user found with that email.",
    CANT_CR_SELF = "You can not add yourself as a contact",
    CANNOT_DM_SELF = "You cannot send a direct message to yourself.",
    DELETE_SUCCESS = "Succesfully deleted",
    NOT_UPLOADED = "No file uploaded",
    REGISTRATION_FAILED = 'Registration failed',
    INVALID_TOKEN = "Invalid token",
    INVALID_CREDENTIALS = "Invalid credentials",
    INVALID_REFRESH_TOKEN = "Invalid refresh token",
    SOMETHING_WENT_WRONG = "Something went wrong!",
    NO_DATA_FOUND = "No data found!",
    UPDATE_FAILED = "Update failed!",
    ALREADY_EXIST = "This contact already exist",
    NO_MEMBER_NICK = "No member found with that nickname.",
    BLOCKED_USER ="You have been blocked ,contact the restaurant",
    WRONG_PASSWORD = "Wrong password!",
    NOT_AUTHENTICATED = "You are not authenticated!,Please login first ",
    CREATION_FAILED = "CREATION_FAILED",
    TOKEN_CREATION_FAILED ="Token creation errors!",
    NOT_FOUND = "NOT_FOUND",
    INVALID_POINT = "INVALID_POINT",
}

class Errors extends Error {
    public code: HttpCode;
    public message: Message;

    static standard ={
      code: HttpCode.INTERNAL_SERVER_ERROR,
      message: Message.SOMETHING_WENT_WRONG,
    }

    constructor(statusCode: HttpCode, statusMessage: Message) {
        super();
        this.code = statusCode;
        this.message = statusMessage;
    }
}

export default Errors;