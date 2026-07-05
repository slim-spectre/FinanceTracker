export const validateLogin = (login: string, loginErrorMsg : string): string => {
    if (!login || login.trim().length < 8){
        return loginErrorMsg;
    }
    return "";
}
export const validatePassword = (password: string,passwordErrorMsg: string): string => {
    if (!password || password.trim().length < 12){
        return passwordErrorMsg;
    }
    return "";
}