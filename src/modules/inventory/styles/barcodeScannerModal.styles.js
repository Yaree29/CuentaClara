import { StyleSheet } from 'react-native';
import colors from '../../../theme/colors';

export default StyleSheet.create({
  overlay: {
    flex: 1,
    // Sin negro sólido detrás del modal: transparente, se ve el fondo real
    // de la pantalla debajo en vez de un velo oscuro de pantalla completa.
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    // El visor de cámara nativo (CameraView) puede ignorar el clip del
    // overflow:hidden/borderRadius de su contenedor directo en Android (es
    // una superficie de hardware aparte, no una View normal) — se repite
    // overflow:'hidden' aquí, en el contenedor padre, como red de seguridad
    // para que nunca se salga de las esquinas redondeadas del bottom-sheet.
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  stateBox: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardSecondary,
    borderRadius: 18,
    padding: 24,
  },
  permCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  permTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  permText: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  permButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 14,
  },
  permButtonText: {
    color: colors.textWhite,
    fontSize: 14,
    fontWeight: '800',
  },
  cameraFrame: {
    width: '100%',
    height: 260,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.cardSecondary,
    borderWidth: 1,
    borderColor: colors.borderLight,
    // position:'relative' explícito: cameraView se ancla con absoluteFill a
    // ESTE contenedor (con medidas fijas en px, no porcentuales) en vez de
    // depender de que el layout resuelva un 100%/100% a tiempo — evita el
    // parpadeo/desborde de un frame del visor durante el primer render.
    position: 'relative',
  },
  cameraView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  torchButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 48,
    height: 48,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: colors.primary,
    borderTopLeftRadius: 10,
  },
  cornerBottomRight: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    width: 48,
    height: 48,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: colors.primary,
    borderBottomRightRadius: 10,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 18,
  },
});
