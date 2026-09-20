import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { fuentesDeLaApp } from '../theme/fuentes.ts';
import { colores } from '../theme/tokens.ts';

export default function DisposicionRaiz() {
  const [fuentesListas, errorDeFuentes] = useFonts(fuentesDeLaApp);

  // Si una fuente no carga, la app sigue: React Native cae a la del sistema y
  // la pantalla se ve fea pero funciona. Quedarse en negro porque no bajó una
  // tipografía sería peor, sobre todo en el gimnasio y con mala señal.
  const listo = fuentesListas || errorDeFuentes !== null;

  if (!listo) {
    return <View style={{ flex: 1, backgroundColor: colores.oscuro }} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colores.oscuro },
        }}
      />
    </SafeAreaProvider>
  );
}
