"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStatus = exports.UserType = void 0;
var UserType;
(function (UserType) {
    UserType["USER"] = "USER";
    UserType["ADMIN"] = "ADMIN";
    UserType["OWNER"] = "OWNER";
})(UserType || (exports.UserType = UserType = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "ACTIVE";
    UserStatus["BLOCK"] = "BLOCK";
    UserStatus["DELETE"] = "DELETE";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
