export const getOperatorInfo = (number) => {
  const match = number.toString().match(/^(\d{2})/);
  if (!match) return null;

  const prefix = match[1];
  // Define the mapping
  // key = phone number prefix
  // value = operator id
  const operatorMap = {
    13: 1,
    17: 1,
    19: 2,
    14: 2,
    18: 3,
    15: 5,
    16: 6,
  };
  const operator = operatorMap[prefix];
  if (!operator) return null;

    // Dummy auth and secret keys (replace with your actual values)
  const credentialsMap= {
    1: { authKey: process.env.GP_AUTH_KEY, secretKey: process.env.GP_AUTH_SECRET },
    2: { authKey: process.env.BANGLALINK_AUTH_KEY, secretKey: process.env.BANGLALINK_AUTH_SECRET },
    3: { authKey: process.env.ROBI_AUTH_KEY, secretKey: process.env.ROBI_AUTH_SECRET },
    5: { authKey: process.env.TELETALK_AUTH_KEY, secretKey: process.env.TELETALK_AUTH_SECRET },
    6: { authKey: process.env.AIRTEL_AUTH_KEY, secretKey: process.env.AIRTEL_AUTH_SECRET },
  };
  const { authKey, secretKey } = credentialsMap[operator];
  return { operator, authKey, secretKey };
};

export const generateAlphanumericCode = (length = 12) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
