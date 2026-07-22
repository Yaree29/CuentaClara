import { StyleSheet } from 'react-native';
import colors from '../../../theme/colors';

export default StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingVertical: 32,
  },
  centerBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 88,
    height: 88,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  brand: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textWhite,
    letterSpacing: 1,
    marginBottom: 40,
  },
  welcomeTextWrap: {
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.textWhite,
    marginBottom: 14,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: colors.secondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  actions: {
    width: '100%',
  },
  primaryButton: {
    backgroundColor: colors.textWhite,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 18,
  },
  primaryButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryLink: {
    alignItems: 'center',
  },
  secondaryLinkText: {
    color: colors.secondary,
    fontSize: 14,
  },
  secondaryLinkTextBold: {
    color: colors.textWhite,
    fontWeight: '700',
  },
});
