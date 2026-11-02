import { model } from "mongoose";
import userSchema from "../user/user.schema"
import { IUser } from "../../utils/common/interfaces";
const User = model<IUser>("User",userSchema);
export default User;