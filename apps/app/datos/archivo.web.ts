/** Descargar y abrir archivos en el navegador. En nativo hay otro camino. */

export function descargar(nombre: string, contenido: string, tipo = 'application/json'): void {
  const blob = new Blob([contenido], { type: `${tipo};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  // Sin esto el blob se queda en memoria hasta que se cierre la pestaña, y un
  // respaldo entero puede pesar bastante.
  URL.revokeObjectURL(url);
}

export function elegirArchivo(): Promise<string | null> {
  return new Promise((resolver) => {
    const entrada = document.createElement('input');
    entrada.type = 'file';
    entrada.accept = 'application/json,.json';
    entrada.onchange = async () => {
      const archivo = entrada.files?.[0];
      resolver(archivo ? await archivo.text() : null);
    };
    // Si el usuario cierra el diálogo sin elegir nada, `change` no se dispara
    // nunca y la promesa quedaría colgada para siempre.
    entrada.oncancel = () => resolver(null);
    entrada.click();
  });
}
