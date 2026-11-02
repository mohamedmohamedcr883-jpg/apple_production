export interface RegisterDTO {
    name: string;
    phone: string;
    password: string;
    email: string;
}

export interface LoginDTO {
    email: string;
    password: string;
}
export interface SendOtpDTO {
    email: string;
}