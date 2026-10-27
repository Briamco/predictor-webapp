# Predictor de Consumo Eléctrico del Hogar

Aplicación web para analizar 12 meses consecutivos de consumo eléctrico y
estimar el comportamiento del siguiente periodo. Está construida con Node.js,
Express 5 y Handlebars.

## Requisitos

- Node.js
- pnpm

## Instalación y ejecución

```sh
pnpm install
pnpm run css
pnpm start
```

La aplicación queda disponible en `http://localhost:3000`. Para desarrollo con
recarga automática, ejecuta `pnpm dev`.

## Uso

Ingresa exactamente 12 meses consecutivos, ordenados desde el más antiguo hasta
el más reciente, y el consumo de cada mes en kWh. El formulario solicita meses
con formato `AAAA-MM`; el servidor también acepta fechas `AAAA-MM-DD` si se envía
la solicitud directamente. Los consumos deben ser números mayores o iguales a
cero. El formulario se abre en una ventana modal y los resultados aparecen en
la página principal.

El selector permite elegir uno de estos métodos:

- **Promedio Móvil Simple (SMA):** promedia los tres consumos más recientes,
  proyecta el mes 13 y compara el promedio con el último consumo.
- **Regresión Lineal:** ajusta el consumo contra los números de mes y devuelve
  la proyección del mes 13, la pendiente, el intercepto y la tendencia.
- **Variación Porcentual:** presenta el cambio de cada mes respecto al anterior,
  el promedio de las variaciones calculables y la tendencia general. La primera
  variación y las que tienen consumo anterior igual a cero aparecen como `n/a`.
- **Detección de Tendencia:** cuenta los aumentos, disminuciones y periodos
  estables entre meses consecutivos.

La validación y todos los cálculos se ejecutan en el servidor. El navegador solo
recopila los valores y presenta la respuesta.

## Estructura

- `src/routes/`: rutas HTTP.
- `src/controllers/`: validación de solicitudes y preparación de resultados.
- `src/services/`: funciones de cálculo de cada método.
- `src/utils/`: validación de las 12 fechas y consumos, filas de formulario y preparación de resultados para la vista.
- `views/`: página principal y formulario Handlebars.
- `public/css/`: hoja de estilos servida por Express.
