import { Archivo_700Bold } from '@expo-google-fonts/archivo/700Bold';
import { Archivo_900Black } from '@expo-google-fonts/archivo/900Black';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono/500Medium';
import { JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono/700Bold';

/**
 * Las siete variantes que usa la interfaz, y solo esas.
 *
 * Cada una es un archivo que el navegador descarga en el primer arranque de la
 * PWA, así que la lista no crece sin motivo: añadir un peso es añadir peso.
 */
export const fuentesDeLaApp = {
  Archivo_700Bold,
  Archivo_900Black,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  JetBrainsMono_500Medium,
  JetBrainsMono_700Bold,
};
