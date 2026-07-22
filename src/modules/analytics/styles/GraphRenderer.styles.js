import { StyleSheet, Dimensions } from 'react-native';
import colors from '../../../theme/colors';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  container:{
    width:'100%',
    marginTop:12,
    marginBottom:20,
  },

  verticalList:{
    gap:16,
    paddingHorizontal:16,
  },

  carousel:{
    paddingHorizontal:16,
    paddingRight:32,
  },

  graphCard:{
    width:'100%',
    borderRadius:16,
    padding:16,
    backgroundColor:colors.card,
    borderWidth:1,
    borderColor:colors.border,
    shadowColor:colors.shadowCard,
    shadowOffset:{
      width:0,
      height:2,
    },
    shadowOpacity:0.05,
    shadowRadius:4,
    elevation:2,
  },

  carouselCard:{
    width:width * 0.88,
    marginRight:16,
  },

  graphTitle:{
    fontSize:17,
    fontWeight:'700',
    color:colors.textPrimary,
    marginBottom:6,
  },

  graphDescription:{
    fontSize:13,
    lineHeight:18,
    color:colors.textSecondary,
    marginBottom:16,
  },

  chartWrapper:{
    width:'100%',
    alignItems:'center',
    justifyContent:'center',
    overflow:'hidden',
  },

  fallbackContainer:{
    height:200,
    justifyContent:'center',
    alignItems:'center',
  },

  fallbackText:{
    color:colors.chartPhText,
    fontSize:14,
  },

  pagination:{
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    marginTop:14,
  },

  paginationDot:{
    width:8,
    height:8,
    borderRadius:4,
    marginHorizontal:4,
    backgroundColor:colors.border,
  },

  activeDot:{
    width:24,
    borderRadius:4,
    backgroundColor:colors.primary,
  },
});