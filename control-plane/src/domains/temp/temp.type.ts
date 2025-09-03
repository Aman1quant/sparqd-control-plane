export interface TempLoginRequest {
  username: string;
  password: string;
}

export interface TempLoginResponse {
  id: number;
  username: string;
  name: string | null;
  role: string | null;
  lastLoginDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
