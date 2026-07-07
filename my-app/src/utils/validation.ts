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
export const validateFullName = (fullName: string,fullNameErrorMsg : string) : string => {
  if (!fullName || fullName.trim().length < 2){
    return fullNameErrorMsg;
  }
  return "";
}
export const validateAssetId = (assetId : number,assetIdErrorMsg : string) : string => {
  if(!assetId || assetId <= 0){
    return assetIdErrorMsg
  }
  return "";
}
export const validateQuantity = (quantity : number,quantityErrorMsg : string) : string => {
  if(!quantity || quantity <= 0){
    return quantityErrorMsg
  }
  return "";
}
export const validateSellQuantity = (quantity : number,maxQuantity : number,quantityErrorMsg : string) : string => {
  if(!quantity || quantity <= 0 || quantity > maxQuantity){
    return quantityErrorMsg
  }
  return "";
}
export const validatePrice = (price : number,priceErrorMsg : string) : string => {
  if(!price || price <= 0){
    return priceErrorMsg
  }
  return "";
}