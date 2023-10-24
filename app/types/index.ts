export interface MenuItems {
    href: string;
    icon: React.JSX.Element;
    label: string;
};

export interface NewUserRequest {
    name: string;
    email: string;
    password: string;
}

export interface EmailVerifyRequest {
    token: string;
    userId: string;
}

export interface ForgetPasswordRequest {   
    email: string;   
}

export interface UpdatePasswordRequest {
    password: string;
    token: string;
    userId: string;
}

export interface SessionUserProfile {
        id: string,
        name: string,
        email: string,
        role: "USER" | "ADMIN"
        emailVerified: boolean
 }
