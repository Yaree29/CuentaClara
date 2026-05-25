export const DEMO_CODE = '123456';

export const verifyMfaCode = async (code) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return code === DEMO_CODE;
};

export const resendMfaCode = async () => {
  await Promise.resolve();
};
