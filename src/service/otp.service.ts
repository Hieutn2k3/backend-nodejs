import crypto from 'crypto';

const OTPService = {
  generateOTP: () => {
    const randomBytes = crypto.randomBytes(4);
    const randomNumber = randomBytes.readUInt32BE(0);

    const otp = 10000000 + (randomNumber % 90000000);

    return otp.toString();
  },
};
export default OTPService;
