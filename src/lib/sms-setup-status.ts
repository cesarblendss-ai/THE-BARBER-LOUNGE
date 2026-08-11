export type SmsSetupStatus = {
  accountSid: boolean;
  phoneNumber: boolean;
  authToken: boolean;
};

function isConfigured(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

export function getSmsSetupStatus(): SmsSetupStatus {
  return {
    accountSid: isConfigured(process.env.TWILIO_ACCOUNT_SID),
    phoneNumber: isConfigured(process.env.TWILIO_PHONE_NUMBER),
    authToken: isConfigured(process.env.TWILIO_AUTH_TOKEN),
  };
}
