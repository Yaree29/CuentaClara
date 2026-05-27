import { useEffect, useRef, useState } from 'react';
import { DEMO_CODE, resendMfaCode, verifyMfaCode } from '../services/mfaService';

const CODE_LENGTH = 6;

const createEmptyDigits = () => Array(CODE_LENGTH).fill('');

const useMfaVerification = (navigation, options = {}) => {
  const [digits, setDigits] = useState(createEmptyDigits());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;

    const timer = setTimeout(() => setResendCooldown((current) => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const resetDigits = () => {
    setDigits(createEmptyDigits());
    inputRefs.current[0]?.focus();
  };

  const handleDigitChange = (text, index) => {
    const clean = text.replace(/[^0-9]/g, '');

    if (clean.length === CODE_LENGTH) {
      setDigits(clean.split(''));
      inputRefs.current[CODE_LENGTH - 1]?.focus();
      setError('');
      return;
    }

    const char = clean.slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = char;
    setDigits(nextDigits);
    setError('');

    if (char && index < CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyPress = (event, index) => {
    if (event.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const fullCode = digits.join('');
  const isComplete = fullCode.length === CODE_LENGTH;

  const handleVerify = async () => {
    if (!isComplete) {
      setError('Ingresa los 6 dígitos del código.');
      return;
    }

    setLoading(true);
    setError('');

    const isValid = await verifyMfaCode(fullCode);

    if (!isValid) {
      resetDigits();
      setError(`Código incorrecto. Intenta de nuevo. (Demo: usa ${DEMO_CODE})`);
      setLoading(false);
      return;
    }

    setLoading(false);
    if (options.returnToProfile) {
      navigation?.navigate('MainTabs', { screen: 'Profile' });
      return;
    }

    navigation?.goBack();
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    await resendMfaCode();
    setResendCooldown(60);
    resetDigits();
    setError('');
  };

  return {
    codeLength: CODE_LENGTH,
    digits,
    loading,
    error,
    resendCooldown,
    inputRefs,
    fullCode,
    isComplete,
    handleDigitChange,
    handleKeyPress,
    handleVerify,
    handleResend,
  };
};

export default useMfaVerification;
