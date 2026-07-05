export const validateEmail = (email: string, emailErrorMsg : string): string => {
    if (!email || email.trim().length < 15 || !email.includes("@gmail.com")){
        return emailErrorMsg;
    }
    return "";
}
export const validatePassword = (password: string,passwordErrorMsg: string): string => {
    if (!password || password.trim().length < 12){
        return passwordErrorMsg;
    }
    return "";
}