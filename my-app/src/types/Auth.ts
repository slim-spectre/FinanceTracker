export interface LoginCredentials {
  login : string,
  password : string,
}

export interface RegisterCredentials {
  login : string,
  password : string,
  fullName : string,
}


export interface AuthResponse {
  token : string
}