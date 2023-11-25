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


export interface SignInCredentials {    
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

 export interface Product {
    userId: string;   
    title: string;
    description: string;
    bulletPoints?: string[];
    mrp: number;
    salePrice: number;
    category: string;
    quantity: number;
    thumbnail?: {url: string; id: string};
    images?: {url: string; id: string}[];

 }

 export interface NewProductInfo {
    userId: string;   
    title: string;
    description: string;
    bulletPoints: string[];
    mrp: number;
    salePrice: number;
    category: string;
    quantity: number;
    thumbnail?: File;
    images: File[]
 }
