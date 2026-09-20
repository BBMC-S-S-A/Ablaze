import { Stack } from 'expo-router';

import { colores } from '../../theme/tokens.ts';

export default function DisposicionDelOnboarding() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colores.oscuro },
        // Sin animación entre pasos: son dieciséis pantallas seguidas y una
        // transición por cada una acaba sintiéndose lenta, no cuidada.
        animation: 'none',
      }}
    />
  );
}
