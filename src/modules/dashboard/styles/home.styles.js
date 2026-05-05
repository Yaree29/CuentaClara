import { StyleSheet } from 'react-native';
import colors from "../../../theme/colors";

export default StyleSheet.create({
    center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    paddingTop: 25,
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.greeting,
    textAlign: 'center', 
  },
  date: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center', 
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    backgroundColor: colors.card,
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  cardTrend: {
    fontSize: 12,
    color: colors.trendCard,
    marginTop: 4,
  },
  chartPlaceholder: {
    marginTop: 20,
    height: 200,
    backgroundColor: colors.chartPhBackground,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: colors.chartPhBorder,
  },
  placeholderText: {
    color: colors.chartPhText,
    fontWeight: '500',
  },
});