import { ProjectionType, QueryOptions } from "mongoose";
import { AbstractRepository } from "../../DB/abstract.repository";
import { IUser } from "../../utils/common/interfaces";
import User from "../user/user.model";

export class UserRepository extends AbstractRepository<IUser>{
    constructor(){
        super(User)
    }
    async getAllUsers(filter:Partial<IUser>,projection:ProjectionType<IUser>,options:QueryOptions<IUser>){
       return await User.find(filter,projection,options);
    }
} 