import { StyleSheet } from 'react-native';
import  colors  from '../../../theme/colors';

export default StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
  },
  inputError: {
    borderColor: colors.textError,
    borderWidth: 2,
  },
  errorMessage: {
    color: colors.textError,
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  strongPassword: {
    color: '#10b981',
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.addBackground,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: colors.textButton,
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: colors.textLink,
    fontSize: 14,
  },
  dropdown: {
  height: 50,
  borderColor: '#ccc',
  borderWidth: 1,
  borderRadius: 10,
  paddingHorizontal: 12,
  backgroundColor: '#fff',
  marginBottom: 20,
},

placeholderStyle: {
  fontSize: 16,
  color: '#999',
},

selectedTextStyle: {
  fontSize: 16,
  color: '#000',
},

headerContainer: {
  alignItems: 'center',
  marginBottom: 30,
  marginTop: 10,
},

logo: {
  width: 90,
  height: 90,
  marginBottom: 10,
},

appName: {
  fontSize: 26,
  fontWeight: '700',
  color: colors.primary,
},

mainSubtitle: {
  fontSize: 16,
  color: colors.textSecondary,
  marginTop: 8,
  textAlign: 'center',
  marginBottom: 20,
},

cardsContainer: {
  gap: 20,
},

profileCard: {
  backgroundColor: '#F5F8F5',
  borderRadius: 20,
  padding: 24,
  borderWidth: 1,
  borderColor: '#DCE3DC',
},

iconBox: {
  width: 70,
  height: 70,
  borderRadius: 16,
  backgroundColor: '#fff',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 20,
},

icon: {
  fontSize: 50,
},

cardTitle: {
  fontSize: 24,
  fontWeight: '700',
  color: colors.primary,
  marginBottom: 14,
},

cardDescription: {
  fontSize: 16,
  color: colors.textSecondary,
  lineHeight: 24,
  marginBottom: 24,
},

});