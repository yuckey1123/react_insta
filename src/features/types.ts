export interface File extends Blob {
    readonly lastModified: number;
    readonly name: string;
}

// authSlice.ts
export interface PROPS_AUTHEN {
    email: string;
    password: string;
}

export interface PROPS_PROFILE {
    id: number;
    nickName: string;
    img: File | null;   // null許容
}

export interface PROPS_NICKNAME {
    nickName: string;
}