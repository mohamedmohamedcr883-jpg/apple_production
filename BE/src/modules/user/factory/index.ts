import { RegisterDTO } from "../../user/user.dto";
import { hashing } from "../../../utils/hashing";
import { User } from "../entity";

export class AuthFactoryService {
    async register(registerDTO: RegisterDTO) {
        const user = new User();
        user.name = registerDTO.name;
        user.email = registerDTO.email;
        user.phone = registerDTO.phone;
        user.password = await hashing(registerDTO.password);
        return user;
    }
}