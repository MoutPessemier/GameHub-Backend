export const validatePhone = (phone: string): boolean => {
  const phoneRegEx = /^0{0,2}(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\d{7,14}$/;
  return phoneRegEx.test(phone);
};

export const validateEmail = (email: string): boolean => {
  const mailRegEx = /^([a-zA-Z]+[a-zA-Z0-9.\-_éèàùäëïöüâêîôû]*)@([a-z]+)[.]([a-z]+)([.][a-z]+)*$/g;
  return mailRegEx.test(email);
};
