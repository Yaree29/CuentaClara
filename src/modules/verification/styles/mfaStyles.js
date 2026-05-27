import { StyleSheet } from 'react-native';
import colors from '../../../theme/colors';

const mfaStyles = StyleSheet.create({
  container: { flexGrow: 1, paddingTop: 48, paddingBottom: 40, alignItems: 'center' },
  iconWrapper: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  iconEmoji: { fontSize: 36 },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.textPrimary, textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 8, paddingHorizontal: 8 },
  demoHint: { fontSize: 12, color: '#7c3aed', textAlign: 'center', backgroundColor: '#f5f3ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginBottom: 24, overflow: 'hidden' },
  codeRow: { flexDirection: 'row', gap: 6, marginBottom: 20, justifyContent: 'center', alignSelf: 'stretch' },
  digitBox: { flex: 1, maxWidth: 42, minWidth: 0, height: 56, paddingHorizontal: 0, paddingVertical: 0, borderRadius: 10, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.card, textAlign: 'center', fontSize: 22, fontWeight: 'bold', color: colors.textPrimary },
  digitBoxFilled: { borderColor: colors.primary, backgroundColor: '#eff6ff' },
  digitBoxError: { borderColor: colors.textError, backgroundColor: '#fff1f2' },
  errorBanner: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fef2f2', borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#fecaca', width: '100%' },
  errorIcon: { fontSize: 14, marginRight: 8, marginTop: 1 },
  errorText: { flex: 1, fontSize: 13, color: colors.textError, lineHeight: 18 },
  verifyButton: { width: '100%', backgroundColor: colors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 16 },
  verifyButtonDisabled: { backgroundColor: colors.disabledButton },
  verifyButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  resendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  resendLabel: { fontSize: 14, color: colors.textSecondary },
  resendLink: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  resendLinkDisabled: { color: colors.disabledButton },
  backRow: { paddingVertical: 8 },
  backText: { fontSize: 14, color: colors.textSecondary, fontWeight: '500' },
});

export default mfaStyles;
