// Generado por scripts/generar-catalogo.ts — no editar a mano.
// Se regenera con `npm run catalogo`. Los ids son UUID v5 derivados de la clave,
// así que el mismo ejercicio es la misma fila en todos los dispositivos.

import type { Equipamiento, Musculo } from './domain.ts';

export type EjercicioDelCatalogo = {
  /** Estable entre dispositivos. Derivado de la clave, nunca aleatorio. */
  id: string;
  /** Legible, para referirse a un ejercicio desde el código. No se persiste. */
  clave: string;
  nombre: string;
  musculoPrincipal: Musculo;
  musculosSecundarios: Musculo[];
  equipamiento: Equipamiento;
  unilateral: boolean;
};

export const CATALOGO_DE_EJERCICIOS: EjercicioDelCatalogo[] = [
  {
    "id": "9b5a629e-8fef-5cbe-84e7-10f249f08244",
    "clave": "press-banca-barra",
    "nombre": "Press de banca con barra",
    "musculoPrincipal": "pecho",
    "musculosSecundarios": [
      "triceps",
      "hombros"
    ],
    "equipamiento": "barra",
    "unilateral": false
  },
  {
    "id": "9670a526-337f-5e61-87e1-e299385a68cd",
    "clave": "press-inclinado-barra",
    "nombre": "Press inclinado con barra",
    "musculoPrincipal": "pecho",
    "musculosSecundarios": [
      "hombros",
      "triceps"
    ],
    "equipamiento": "barra",
    "unilateral": false
  },
  {
    "id": "f6c5bb74-b0b7-5343-9ec0-723c3add5fa3",
    "clave": "press-declinado-barra",
    "nombre": "Press declinado con barra",
    "musculoPrincipal": "pecho",
    "musculosSecundarios": [
      "triceps"
    ],
    "equipamiento": "barra",
    "unilateral": false
  },
  {
    "id": "10dfb5d6-7210-54f2-9599-b98ffdb313a0",
    "clave": "press-banca-mancuernas",
    "nombre": "Press de banca con mancuernas",
    "musculoPrincipal": "pecho",
    "musculosSecundarios": [
      "triceps",
      "hombros"
    ],
    "equipamiento": "mancuerna",
    "unilateral": false
  },
  {
    "id": "794c6b47-89f4-51a0-a106-6b0be3da7897",
    "clave": "press-inclinado-mancuernas",
    "nombre": "Press inclinado con mancuernas",
    "musculoPrincipal": "pecho",
    "musculosSecundarios": [
      "hombros",
      "triceps"
    ],
    "equipamiento": "mancuerna",
    "unilateral": false
  },
  {
    "id": "1a16d1eb-0c30-5930-b09f-fd562f0fb148",
    "clave": "press-declinado-mancuernas",
    "nombre": "Press declinado con mancuernas",
    "musculoPrincipal": "pecho",
    "musculosSecundarios": [
      "triceps"
    ],
    "equipamiento": "mancuerna",
    "unilateral": false
  },
  {
    "id": "e430ae23-6b88-5c23-bf4b-9bbe0b0f66d2",
    "clave": "press-pecho-maquina",
    "nombre": "Press de pecho en máquina",
    "musculoPrincipal": "pecho",
    "musculosSecundarios": [
      "triceps",
      "hombros"
    ],
    "equipamiento": "maquina",
    "unilateral": false
  },
  {
    "id": "84c44832-34a9-5a8f-9511-a5bf6a2a89cd",
    "clave": "press-pecho-polea-unilateral",
    "nombre": "Press de pecho unilateral en polea",
    "musculoPrincipal": "pecho",
    "musculosSecundarios": [
      "triceps",
      "hombros"
    ],
    "equipamiento": "polea",
    "unilateral": true
  },
  {
    "id": "ea178913-c680-548a-848c-e7bf6ae007ee",
    "clave": "aperturas-mancuernas",
    "nombre": "Aperturas con mancuernas",
    "musculoPrincipal": "pecho",
    "musculosSecundarios": [
      "hombros"
    ],
    "equipamiento": "mancuerna",
    "unilateral": false
  },
  {
    "id": "c4927c5c-cbce-5098-b12b-d4ec324da290",
    "clave": "aperturas-inclinadas-mancuernas",
    "nombre": "Aperturas inclinadas con mancuernas",
    "musculoPrincipal": "pecho",
    "musculosSecundarios": [
      "hombros"
    ],
    "equipamiento": "mancuerna",
    "unilateral": false
  },
  {
    "id": "265776fa-3535-594b-8b75-a9e966f8d46d",
    "clave": "contractor-pecho",
    "nombre": "Contractor de pecho",
    "musculoPrincipal": "pecho",
    "musculosSecundarios": [
      "hombros"
    ],
    "equipamiento": "maquina",
    "unilateral": false
  },
  {
    "id": "0834ee14-3d11-5f5d-aa25-de45328333f2",
    "clave": "cruce-poleas-alto",
    "nombre": "Cruce de poleas desde arriba",
    "musculoPrincipal": "pecho",
    "musculosSecundarios": [
      "hombros"
    ],
    "equipamiento": "polea",
    "unilateral": false
  },
  {
    "id": "f4646ee5-def5-5657-a72c-0e15df94877d",
    "clave": "cruce-poleas-bajo",
    "nombre": "Cruce de poleas desde abajo",
    "musculoPrincipal": "pecho",
    "musculosSecundarios": [
      "hombros"
    ],
    "equipamiento": "polea",
    "unilateral": false
  },
  {
    "id": "bd3a4e95-a7df-594e-90c0-668f316e9fee",
    "clave": "flexiones",
    "nombre": "Flexiones de pecho",
    "musculoPrincipal": "pecho",
    "musculosSecundarios": [
      "triceps",
      "hombros",
      "abdomen"
    ],
    "equipamiento": "peso_corporal",
    "unilateral": false
  },
  {
    "id": "0a8e491c-a87d-5bf4-a305-69de0540cf8b",
    "clave": "flexiones-inclinadas",
    "nombre": "Flexiones con los pies elevados",
    "musculoPrincipal": "pecho",
    "musculosSecundarios": [
      "hombros",
      "triceps"
    ],
    "equipamiento": "peso_corporal",
    "unilateral": false
  },
  {
    "id": "efe6465a-b42a-500a-a5d0-336bf0ae6d18",
    "clave": "fondos-pecho",
    "nombre": "Fondos en paralelas inclinado al pecho",
    "musculoPrincipal": "pecho",
    "musculosSecundarios": [
      "triceps",
      "hombros"
    ],
    "equipamiento": "peso_corporal",
    "unilateral": false
  },
  {
    "id": "c5989edd-b736-5016-b4c8-7477b595c288",
    "clave": "pullover-mancuerna",
    "nombre": "Pullover con mancuerna",
    "musculoPrincipal": "pecho",
    "musculosSecundarios": [
      "espalda",
      "triceps"
    ],
    "equipamiento": "mancuerna",
    "unilateral": false
  },
  {
    "id": "244078fc-13c7-5c50-8157-3d70b7de2b8f",
    "clave": "dominadas-pronas",
    "nombre": "Dominadas agarre prono",
    "musculoPrincipal": "espalda",
    "musculosSecundarios": [
      "biceps",
      "antebrazos"
    ],
    "equipamiento": "peso_corporal",
    "unilateral": false
  },
  {
    "id": "d02360b8-9c94-57f8-b536-8254295e2e71",
    "clave": "dominadas-supinas",
    "nombre": "Dominadas agarre supino",
    "musculoPrincipal": "espalda",
    "musculosSecundarios": [
      "biceps"
    ],
    "equipamiento": "peso_corporal",
    "unilateral": false
  },
  {
    "id": "a153e649-a5c5-5098-a7a9-32eba72f7dbd",
    "clave": "dominadas-neutras",
    "nombre": "Dominadas agarre neutro",
    "musculoPrincipal": "espalda",
    "musculosSecundarios": [
      "biceps",
      "antebrazos"
    ],
    "equipamiento": "peso_corporal",
    "unilateral": false
  },
  {
    "id": "386fa78f-dd0a-5a7d-b02c-26d2dd2636a0",
    "clave": "jalon-al-pecho",
    "nombre": "Jalón al pecho",
    "musculoPrincipal": "espalda",
    "musculosSecundarios": [
      "biceps"
    ],
    "equipamiento": "polea",
    "unilateral": false
  },
  {
    "id": "5e377ec5-f17a-590b-b596-3b90f396494f",
    "clave": "jalon-agarre-cerrado",
    "nombre": "Jalón con agarre cerrado",
    "musculoPrincipal": "espalda",
    "musculosSecundarios": [
      "biceps"
    ],
    "equipamiento": "polea",
    "unilateral": false
  },
  {
    "id": "cd495c20-b73b-5385-abb8-8efe6baa929b",
    "clave": "jalon-unilateral",
    "nombre": "Jalón unilateral en polea",
    "musculoPrincipal": "espalda",
    "musculosSecundarios": [
      "biceps"
    ],
    "equipamiento": "polea",
    "unilateral": true
  },
  {
    "id": "7d24c71f-c5f2-58f4-8525-e369f9a8a3e3",
    "clave": "remo-barra",
    "nombre": "Remo con barra",
    "musculoPrincipal": "espalda",
    "musculosSecundarios": [
      "biceps",
      "lumbares",
      "trapecio"
    ],
    "equipamiento": "barra",
    "unilateral": false
  },
  {
    "id": "fa374e04-7298-5d7e-96af-ad98481025e5",
    "clave": "remo-pendlay",
    "nombre": "Remo Pendlay",
    "musculoPrincipal": "espalda",
    "musculosSecundarios": [
      "biceps",
      "lumbares"
    ],
    "equipamiento": "barra",
    "unilateral": false
  },
  {
    "id": "29f738cc-6fca-5d9a-afdb-7910b92d0304",
    "clave": "remo-mancuerna-una-mano",
    "nombre": "Remo con mancuerna a una mano",
    "musculoPrincipal": "espalda",
    "musculosSecundarios": [
      "biceps",
      "trapecio"
    ],
    "equipamiento": "mancuerna",
    "unilateral": true
  },
  {
    "id": "0045dacc-0471-5e15-b6b7-5537415c280d",
    "clave": "remo-gorila",
    "nombre": "Remo gorila con mancuernas",
    "musculoPrincipal": "espalda",
    "musculosSecundarios": [
      "biceps",
      "trapecio"
    ],
    "equipamiento": "mancuerna",
    "unilateral": false
  },
  {
    "id": "6b95a834-2ceb-5ec6-bd9c-026008819857",
    "clave": "remo-sentado-polea",
    "nombre": "Remo sentado en polea",
    "musculoPrincipal": "espalda",
    "musculosSecundarios": [
      "biceps",
      "trapecio"
    ],
    "equipamiento": "polea",
    "unilateral": false
  },
  {
    "id": "4cc82d8f-98be-537e-9dbc-15a4d806328b",
    "clave": "remo-maquina",
    "nombre": "Remo en máquina",
    "musculoPrincipal": "espalda",
    "musculosSecundarios": [
      "biceps"
    ],
    "equipamiento": "maquina",
    "unilateral": false
  },
  {
    "id": "db8d1b9f-21f2-5b31-b2fe-b01237b15c3f",
    "clave": "remo-t",
    "nombre": "Remo en T",
    "musculoPrincipal": "espalda",
    "musculosSecundarios": [
      "biceps",
      "trapecio"
    ],
    "equipamiento": "barra",
    "unilateral": false
  },
  {
    "id": "05c0da09-bfe2-55f4-9a37-7ee416747d84",
    "clave": "remo-invertido",
    "nombre": "Remo invertido",
    "musculoPrincipal": "espalda",
    "musculosSecundarios": [
      "biceps",
      "abdomen"
    ],
    "equipamiento": "peso_corporal",
    "unilateral": false
  },
  {
    "id": "6040bbbe-e02e-5836-90b3-2b8af3e1d0d9",
    "clave": "pullover-polea",
    "nombre": "Pullover en polea",
    "musculoPrincipal": "espalda",
    "musculosSecundarios": [
      "triceps"
    ],
    "equipamiento": "polea",
    "unilateral": false
  },
  {
    "id": "e036bd5b-d33b-5d4b-b830-4ae6cb765a94",
    "clave": "peso-muerto",
    "nombre": "Peso muerto convencional",
    "musculoPrincipal": "espalda",
    "musculosSecundarios": [
      "gluteos",
      "isquiotibiales",
      "lumbares",
      "trapecio"
    ],
    "equipamiento": "barra",
    "unilateral": false
  },
  {
    "id": "e800fa3d-6266-5105-939c-3641c79bb7fd",
    "clave": "peso-muerto-sumo",
    "nombre": "Peso muerto sumo",
    "musculoPrincipal": "gluteos",
    "musculosSecundarios": [
      "cuadriceps",
      "espalda",
      "aductores",
      "lumbares"
    ],
    "equipamiento": "barra",
    "unilateral": false
  },
  {
    "id": "29f96a3b-f715-5c51-b9ef-971b6d7e392d",
    "clave": "rack-pull",
    "nombre": "Rack pull",
    "musculoPrincipal": "espalda",
    "musculosSecundarios": [
      "trapecio",
      "lumbares",
      "gluteos"
    ],
    "equipamiento": "barra",
    "unilateral": false
  },
  {
    "id": "e47b0b79-2b10-5241-b91b-b538ee0c63ba",
    "clave": "hiperextensiones",
    "nombre": "Hiperextensiones lumbares",
    "musculoPrincipal": "lumbares",
    "musculosSecundarios": [
      "gluteos",
      "isquiotibiales"
    ],
    "equipamiento": "peso_corporal",
    "unilateral": false
  },
  {
    "id": "3fa7df54-5367-59c7-9535-cd1fe93d1276",
    "clave": "buenos-dias",
    "nombre": "Buenos días",
    "musculoPrincipal": "isquiotibiales",
    "musculosSecundarios": [
      "lumbares",
      "gluteos"
    ],
    "equipamiento": "barra",
    "unilateral": false
  },
  {
    "id": "d7476707-b7dc-5ffb-975e-c78f0c319cdf",
    "clave": "press-militar-barra",
    "nombre": "Press militar con barra",
    "musculoPrincipal": "hombros",
    "musculosSecundarios": [
      "triceps",
      "trapecio"
    ],
    "equipamiento": "barra",
    "unilateral": false
  },
  {
    "id": "e372ef1d-c864-57d1-86e5-b77cb62e1770",
    "clave": "press-militar-mancuernas",
    "nombre": "Press militar con mancuernas",
    "musculoPrincipal": "hombros",
    "musculosSecundarios": [
      "triceps"
    ],
    "equipamiento": "mancuerna",
    "unilateral": false
  },
  {
    "id": "7a7c7e5f-4f5d-5224-ba86-9ccb2e8c6cc7",
    "clave": "press-arnold",
    "nombre": "Press Arnold",
    "musculoPrincipal": "hombros",
    "musculosSecundarios": [
      "triceps"
    ],
    "equipamiento": "mancuerna",
    "unilateral": false
  },
  {
    "id": "02bd0e79-bcd4-5dd0-aaf7-218fe6e9f6d1",
    "clave": "press-hombro-maquina",
    "nombre": "Press de hombro en máquina",
    "musculoPrincipal": "hombros",
    "musculosSecundarios": [
      "triceps"
    ],
    "equipamiento": "maquina",
    "unilateral": false
  },
  {
    "id": "cdd3a44f-0ffd-5663-8462-a6c1f20323c6",
    "clave": "press-tras-nuca",
    "nombre": "Press tras nuca",
    "musculoPrincipal": "hombros",
    "musculosSecundarios": [
      "triceps"
    ],
    "equipamiento": "barra",
    "unilateral": false
  },
  {
    "id": "cf23beec-7be1-5c06-ae05-fd9010435f6a",
    "clave": "elevaciones-laterales",
    "nombre": "Elevaciones laterales",
    "musculoPrincipal": "hombros",
    "musculosSecundarios": [
      "trapecio"
    ],
    "equipamiento": "mancuerna",
    "unilateral": false
  },
  {
    "id": "0c1b8e1f-f7c2-54c4-8ba3-851f90901612",
    "clave": "elevaciones-laterales-polea",
    "nombre": "Elevaciones laterales en polea",
    "musculoPrincipal": "hombros",
    "musculosSecundarios": [
      "trapecio"
    ],
    "equipamiento": "polea",
    "unilateral": true
  },
  {
    "id": "e7ac6493-d9a6-5106-a081-51e2b73897cf",
    "clave": "elevaciones-laterales-banda",
    "nombre": "Elevaciones laterales con banda",
    "musculoPrincipal": "hombros",
    "musculosSecundarios": [
      "trapecio"
    ],
    "equipamiento": "banda",
    "unilateral": false
  },
  {
    "id": "b1159e12-0d89-520a-8ad0-af3e6ac63cd5",
    "clave": "elevaciones-laterales-maquina",
    "nombre": "Elevaciones laterales en máquina",
    "musculoPrincipal": "hombros",
    "musculosSecundarios": [
      "trapecio"
    ],
    "equipamiento": "maquina",
    "unilateral": false
  },
  {
    "id": "96223eea-1a78-59b0-a88c-38cc9c8a01f3",
    "clave": "elevaciones-frontales",
    "nombre": "Elevaciones frontales",
    "musculoPrincipal": "hombros",
    "musculosSecundarios": [
      "pecho"
    ],
    "equipamiento": "mancuerna",
    "unilateral": false
  },
  {
    "id": "cc1227d2-de78-5f6b-962f-21b220338f73",
    "clave": "pajaros-mancuernas",
    "nombre": "Pájaros con mancuernas",
    "musculoPrincipal": "hombros",
    "musculosSecundarios": [
      "espalda",
      "trapecio"
    ],
    "equipamiento": "mancuerna",
    "unilateral": false
  },
  {
    "id": "4d1c3375-b919-5f57-87aa-46309f41e044",
    "clave": "pajaros-maquina",
    "nombre": "Pájaros en máquina",
    "musculoPrincipal": "hombros",
    "musculosSecundarios": [
      "espalda"
    ],
    "equipamiento": "maquina",
    "unilateral": false
  },
  {
    "id": "98affa66-b44b-5637-be80-7f0db21a81eb",
    "clave": "face-pull",
    "nombre": "Face pull",
    "musculoPrincipal": "hombros",
    "musculosSecundarios": [
      "trapecio",
      "espalda"
    ],
    "equipamiento": "polea",
    "unilateral": false
  },
  {
    "id": "d7def33a-86fa-5a11-a065-e31b701ff3c7",
    "clave": "remo-al-menton",
    "nombre": "Remo al mentón",
    "musculoPrincipal": "hombros",
    "musculosSecundarios": [
      "trapecio",
      "biceps"
    ],
    "equipamiento": "barra",
    "unilateral": false
  },
  {
    "id": "a8ee86ca-8b1f-53b2-bd37-eea8c30d1213",
    "clave": "encogimientos-barra",
    "nombre": "Encogimientos con barra",
    "musculoPrincipal": "trapecio",
    "musculosSecundarios": [
      "antebrazos"
    ],
    "equipamiento": "barra",
    "unilateral": false
  },
  {
    "id": "48737b9e-e72e-56ff-9a6e-62d03aea3539",
    "clave": "encogimientos-mancuernas",
    "nombre": "Encogimientos con mancuernas",
    "musculoPrincipal": "trapecio",
    "musculosSecundarios": [
      "antebrazos"
    ],
    "equipamiento": "mancuerna",
    "unilateral": false
  },
  {
    "id": "45e14282-8c7c-5aac-835b-7c2eab4069a1",
    "clave": "encogimientos-maquina",
    "nombre": "Encogimientos en máquina",
    "musculoPrincipal": "trapecio",
    "musculosSecundarios": [
      "antebrazos"
    ],
    "equipamiento": "maquina",
    "unilateral": false
  },
  {
    "id": "58f949a5-2987-5505-9af1-aff281b523ca",
    "clave": "curl-barra",
    "nombre": "Curl con barra",
    "musculoPrincipal": "biceps",
    "musculosSecundarios": [
      "antebrazos"
    ],
    "equipamiento": "barra",
    "unilateral": false
  },
  {
    "id": "53e11845-5adb-587c-ad2e-c9827aae17c5",
    "clave": "curl-barra-z",
    "nombre": "Curl con barra Z",
    "musculoPrincipal": "biceps",
    "musculosSecundarios": [
      "antebrazos"
    ],
    "equipamiento": "barra",
    "unilateral": false
  },
  {
    "id": "d35a133e-bd6a-50b1-9922-f9d840d8b0f4",
    "clave": "curl-mancuernas-alterno",
    "nombre": "Curl alterno con mancuernas",
    "musculoPrincipal": "biceps",
    "musculosSecundarios": [
      "antebrazos"
    ],
    "equipamiento": "mancuerna",
    "unilateral": true
  },
  {
    "id": "d25021d3-0e9a-57dc-ba42-ab928e8ba4b3",
    "clave": "curl-martillo",
    "nombre": "Curl martillo",
    "musculoPrincipal": "biceps",
    "musculosSecundarios": [
      "antebrazos"
    ],
    "equipamiento": "mancuerna",
    "unilateral": true
  },
  {
    "id": "3516a129-df61-5742-ae3e-0f024514b6a3",
    "clave": "curl-concentrado",
    "nombre": "Curl concentrado",
    "musculoPrincipal": "biceps",
    "musculosSecundarios": [
      "antebrazos"
    ],
    "equipamiento": "mancuerna",
    "unilateral": true
  },
  {
    "id": "199acbd1-b2c9-5cf1-9cf3-83327093cb53",
    "clave": "curl-predicador",
    "nombre": "Curl en banco predicador",
    "musculoPrincipal": "biceps",
    "musculosSecundarios": [
      "antebrazos"
    ],
    "equipamiento": "barra",
    "unilateral": false
  },
  {
    "id": "cf82b50f-83ad-5afd-b2df-c2634a15ac34",
    "clave": "curl-inclinado",
    "nombre": "Curl inclinado en banco",
    "musculoPrincipal": "biceps",
    "musculosSecundarios": [
      "antebrazos"
    ],
    "equipamiento": "mancuerna",
    "unilateral": false
  },
  {
    "id": "cf4124fa-990a-5652-b9bd-2e5d4dbb00b7",
    "clave": "curl-arana",
    "nombre": "Curl araña",
    "musculoPrincipal": "biceps",
    "musculosSecundarios": [
      "antebrazos"
    ],
    "equipamiento": "mancuerna",
    "unilateral": false
  },
  {
    "id": "9978ddde-7a0d-56d0-a790-054d8fe68777",
    "clave": "curl-polea-baja",
    "nombre": "Curl en polea baja",
    "musculoPrincipal": "biceps",
    "musculosSecundarios": [
      "antebrazos"
    ],
    "equipamiento": "polea",
    "unilateral": false
  },
  {
    "id": "62cae768-4824-5329-9f8a-9743a8587ff7",
    "clave": "curl-maquina",
    "nombre": "Curl en máquina",
    "musculoPrincipal": "biceps",
    "musculosSecundarios": [
      "antebrazos"
    ],
    "equipamiento": "maquina",
    "unilateral": false
  },
  {
    "id": "e22a1c26-8304-5cc4-840d-9dcf9616f758",
    "clave": "curl-banda",
    "nombre": "Curl con banda",
    "musculoPrincipal": "biceps",
    "musculosSecundarios": [
      "antebrazos"
    ],
    "equipamiento": "banda",
    "unilateral": false
  },
  {
    "id": "e1434bc1-5c86-5513-a768-f83965ab0019",
    "clave": "press-frances",
    "nombre": "Press francés",
    "musculoPrincipal": "triceps",
    "musculosSecundarios": [
      "hombros"
    ],
    "equipamiento": "barra",
    "unilateral": false
  },
  {
    "id": "7876cb12-2243-5868-aac3-7e3db5ab2f46",
    "clave": "press-cerrado",
    "nombre": "Press de banca agarre cerrado",
    "musculoPrincipal": "triceps",
    "musculosSecundarios": [
      "pecho",
      "hombros"
    ],
    "equipamiento": "barra",
    "unilateral": false
  },
  {
    "id": "bbabf174-70ca-5e64-bc90-11f4e14b53e5",
    "clave": "extension-triceps-polea",
    "nombre": "Extensión de tríceps en polea",
    "musculoPrincipal": "triceps",
    "musculosSecundarios": [],
    "equipamiento": "polea",
    "unilateral": false
  },
  {
    "id": "a4484297-2bcd-56eb-9bb1-1c8af94e5bcb",
    "clave": "extension-triceps-cuerda",
    "nombre": "Extensión de tríceps con cuerda",
    "musculoPrincipal": "triceps",
    "musculosSecundarios": [],
    "equipamiento": "polea",
    "unilateral": false
  },
  {
    "id": "100d9917-8077-5639-9765-7acb7c6b5658",
    "clave": "extension-triceps-sobre-cabeza",
    "nombre": "Extensión de tríceps sobre la cabeza",
    "musculoPrincipal": "triceps",
    "musculosSecundarios": [
      "hombros"
    ],
    "equipamiento": "mancuerna",
    "unilateral": false
  },
  {
    "id": "7bf6fdb6-2979-52aa-a63a-ea94208da687",
    "clave": "extension-triceps-maquina",
    "nombre": "Extensión de tríceps en máquina",
    "musculoPrincipal": "triceps",
    "musculosSecundarios": [],
    "equipamiento": "maquina",
    "unilateral": false
  },
  {
    "id": "003ec68d-06e0-5cf3-a0f2-d4b052fadb6b",
    "clave": "extension-triceps-banda",
    "nombre": "Extensión de tríceps con banda",
    "musculoPrincipal": "triceps",
    "musculosSecundarios": [],
    "equipamiento": "banda",
    "unilateral": false
  },
  {
    "id": "475e0010-05e0-5c55-9d28-73883da6f2a6",
    "clave": "patada-triceps",
    "nombre": "Patada de tríceps",
    "musculoPrincipal": "triceps",
    "musculosSecundarios": [
      "hombros"
    ],
    "equipamiento": "mancuerna",
    "unilateral": true
  },
  {
    "id": "23e3b900-0b31-5043-87e1-c7d82a853e62",
    "clave": "fondos-triceps",
    "nombre": "Fondos en paralelas vertical",
    "musculoPrincipal": "triceps",
    "musculosSecundarios": [
      "pecho",
      "hombros"
    ],
    "equipamiento": "peso_corporal",
    "unilateral": false
  },
  {
    "id": "663c2502-53cb-5090-9173-46a956400651",
    "clave": "fondos-banco",
    "nombre": "Fondos en banco",
    "musculoPrincipal": "triceps",
    "musculosSecundarios": [
      "pecho",
      "hombros"
    ],
    "equipamiento": "peso_corporal",
    "unilateral": false
  },
  {
    "id": "784b353b-db65-583e-ad61-51e066973c58",
    "clave": "flexiones-diamante",
    "nombre": "Flexiones diamante",
    "musculoPrincipal": "triceps",
    "musculosSecundarios": [
      "pecho",
      "hombros"
    ],
    "equipamiento": "peso_corporal",
    "unilateral": false
  },
  {
    "id": "723d24d2-e9cc-5044-a3c4-df963b66d894",
    "clave": "curl-muneca",
    "nombre": "Curl de muñeca",
    "musculoPrincipal": "antebrazos",
    "musculosSecundarios": [],
    "equipamiento": "barra",
    "unilateral": false
  },
  {
    "id": "69edd228-43fa-5f51-b5cf-720212b17cfc",
    "clave": "curl-muneca-inverso",
    "nombre": "Curl de muñeca inverso",
    "musculoPrincipal": "antebrazos",
    "musculosSecundarios": [],
    "equipamiento": "barra",
    "unilateral": false
  },
  {
    "id": "64f7bebf-b583-59ee-8a19-e2d486cc1498",
    "clave": "curl-inverso",
    "nombre": "Curl inverso",
    "musculoPrincipal": "antebrazos",
    "musculosSecundarios": [
      "biceps"
    ],
    "equipamiento": "barra",
    "unilateral": false
  },
  {
    "id": "0a95ee14-1c90-5752-a68d-98e26032828b",
    "clave": "paseo-granjero",
    "nombre": "Paseo del granjero",
    "musculoPrincipal": "antebrazos",
    "musculosSecundarios": [
      "trapecio",
      "abdomen"
    ],
    "equipamiento": "mancuerna",
    "unilateral": false
  },
  {
    "id": "1c7a0e43-68c6-5e84-b029-385f62b383a5",
    "clave": "sentadilla-trasera",
    "nombre": "Sentadilla trasera con barra",
    "musculoPrincipal": "cuadriceps",
    "musculosSecundarios": [
      "gluteos",
      "lumbares",
      "isquiotibiales"
    ],
    "equipamiento": "barra",
    "unilateral": false
  },
  {
    "id": "5e08a8c2-2f16-520d-a6b7-763fb1c17bcc",
    "clave": "sentadilla-frontal",
    "nombre": "Sentadilla frontal",
    "musculoPrincipal": "cuadriceps",
    "musculosSecundarios": [
      "gluteos",
      "abdomen"
    ],
    "equipamiento": "barra",
    "unilateral": false
  },
  {
    "id": "6c05ccd2-2b2f-5210-b937-fead9585af3f",
    "clave": "sentadilla-goblet",
    "nombre": "Sentadilla goblet",
    "musculoPrincipal": "cuadriceps",
    "musculosSecundarios": [
      "gluteos",
      "abdomen"
    ],
    "equipamiento": "mancuerna",
    "unilateral": false
  },
  {
    "id": "35abdb02-73ec-56ba-8c0e-4654331c8dc9",
    "clave": "sentadilla-goblet-kettlebell",
    "nombre": "Sentadilla goblet con kettlebell",
    "musculoPrincipal": "cuadriceps",
    "musculosSecundarios": [
      "gluteos",
      "abdomen"
    ],
    "equipamiento": "kettlebell",
    "unilateral": false
  },
  {
    "id": "0a805c9f-cb70-5520-8ecb-72277e954981",
    "clave": "sentadilla-multipower",
    "nombre": "Sentadilla en multipower",
    "musculoPrincipal": "cuadriceps",
    "musculosSecundarios": [
      "gluteos"
    ],
    "equipamiento": "maquina",
    "unilateral": false
  },
  {
    "id": "2e7181b5-89f8-5bfa-bc95-d86e504d13c0",
    "clave": "sentadilla-libre",
    "nombre": "Sentadilla sin peso",
    "musculoPrincipal": "cuadriceps",
    "musculosSecundarios": [
      "gluteos"
    ],
    "equipamiento": "peso_corporal",
    "unilateral": false
  },
  {
    "id": "53ae1d66-94c0-50db-af50-f317c9b81cef",
    "clave": "sentadilla-sissy",
    "nombre": "Sentadilla sissy",
    "musculoPrincipal": "cuadriceps",
    "musculosSecundarios": [],
    "equipamiento": "peso_corporal",
    "unilateral": false
  },
  {
    "id": "c8366c7b-5993-5ce3-8885-5a3e23264555",
    "clave": "sentadilla-pistol",
    "nombre": "Sentadilla a una pierna",
    "musculoPrincipal": "cuadriceps",
    "musculosSecundarios": [
      "gluteos",
      "abdomen"
    ],
    "equipamiento": "peso_corporal",
    "unilateral": true
  },
  {
    "id": "1d0d7739-4542-56c8-ac85-b0ee0feb2551",
    "clave": "prensa-piernas",
    "nombre": "Prensa de piernas",
    "musculoPrincipal": "cuadriceps",
    "musculosSecundarios": [
      "gluteos",
      "isquiotibiales"
    ],
    "equipamiento": "maquina",
    "unilateral": false
  },
  {
    "id": "c496a61a-b95e-5204-b27d-80d00097d76f",
    "clave": "hack-squat",
    "nombre": "Hack squat",
    "musculoPrincipal": "cuadriceps",
    "musculosSecundarios": [
      "gluteos"
    ],
    "equipamiento": "maquina",
    "unilateral": false
  },
  {
    "id": "7be994d5-abc0-5f33-a388-ea5d55de3a94",
    "clave": "extension-cuadriceps",
    "nombre": "Extensión de cuádriceps",
    "musculoPrincipal": "cuadriceps",
    "musculosSecundarios": [],
    "equipamiento": "maquina",
    "unilateral": false
  },
  {
    "id": "1a21c96b-1505-5624-bcea-1c5f6b9a0081",
    "clave": "zancadas-mancuernas",
    "nombre": "Zancadas con mancuernas",
    "musculoPrincipal": "cuadriceps",
    "musculosSecundarios": [
      "gluteos",
      "isquiotibiales"
    ],
    "equipamiento": "mancuerna",
    "unilateral": true
  },
  {
    "id": "dc96a28a-3683-5c4c-bda5-edf32bf1e5e4",
    "clave": "zancadas-caminando",
    "nombre": "Zancadas caminando",
    "musculoPrincipal": "cuadriceps",
    "musculosSecundarios": [
      "gluteos",
      "isquiotibiales"
    ],
    "equipamiento": "mancuerna",
    "unilateral": true
  },
  {
    "id": "5b1e4975-f5c3-535f-b1a4-8f17a95734d1",
    "clave": "sentadilla-bulgara",
    "nombre": "Sentadilla búlgara",
    "musculoPrincipal": "cuadriceps",
    "musculosSecundarios": [
      "gluteos",
      "isquiotibiales"
    ],
    "equipamiento": "mancuerna",
    "unilateral": true
  },
  {
    "id": "ae9c1127-e83f-5adf-a435-f642ee8204f5",
    "clave": "subida-al-cajon",
    "nombre": "Subida al cajón",
    "musculoPrincipal": "cuadriceps",
    "musculosSecundarios": [
      "gluteos"
    ],
    "equipamiento": "mancuerna",
    "unilateral": true
  },
  {
    "id": "f3a5665c-4ccd-5eb4-a48f-6f9c9ade67e9",
    "clave": "peso-muerto-rumano",
    "nombre": "Peso muerto rumano",
    "musculoPrincipal": "isquiotibiales",
    "musculosSecundarios": [
      "gluteos",
      "lumbares"
    ],
    "equipamiento": "barra",
    "unilateral": false
  },
  {
    "id": "0831a9f3-39fe-53bf-a406-1953ffd3a5f4",
    "clave": "peso-muerto-rumano-mancuernas",
    "nombre": "Peso muerto rumano con mancuernas",
    "musculoPrincipal": "isquiotibiales",
    "musculosSecundarios": [
      "gluteos",
      "lumbares"
    ],
    "equipamiento": "mancuerna",
    "unilateral": false
  },
  {
    "id": "542da06a-582a-58c2-abb7-27e870117f3e",
    "clave": "peso-muerto-piernas-rigidas",
    "nombre": "Peso muerto con piernas rígidas",
    "musculoPrincipal": "isquiotibiales",
    "musculosSecundarios": [
      "gluteos",
      "lumbares"
    ],
    "equipamiento": "barra",
    "unilateral": false
  },
  {
    "id": "ca1a5d36-9660-5b7c-9a85-9ae92054b291",
    "clave": "peso-muerto-una-pierna",
    "nombre": "Peso muerto a una pierna",
    "musculoPrincipal": "isquiotibiales",
    "musculosSecundarios": [
      "gluteos",
      "lumbares"
    ],
    "equipamiento": "mancuerna",
    "unilateral": true
  },
  {
    "id": "8bc2e382-8f9c-5a51-b15d-f1126ba8dba9",
    "clave": "curl-femoral-tumbado",
    "nombre": "Curl femoral tumbado",
    "musculoPrincipal": "isquiotibiales",
    "musculosSecundarios": [
      "gemelos"
    ],
    "equipamiento": "maquina",
    "unilateral": false
  },
  {
    "id": "f28ef3a4-0e1b-59cf-bbfc-5c41fb2c5ee4",
    "clave": "curl-femoral-sentado",
    "nombre": "Curl femoral sentado",
    "musculoPrincipal": "isquiotibiales",
    "musculosSecundarios": [
      "gemelos"
    ],
    "equipamiento": "maquina",
    "unilateral": false
  },
  {
    "id": "fa881037-0cda-58b0-a969-d073acd6eee2",
    "clave": "curl-femoral-de-pie",
    "nombre": "Curl femoral de pie",
    "musculoPrincipal": "isquiotibiales",
    "musculosSecundarios": [],
    "equipamiento": "maquina",
    "unilateral": true
  },
  {
    "id": "43c1e591-ac32-5737-adf0-6e44793fca02",
    "clave": "curl-nordico",
    "nombre": "Curl nórdico",
    "musculoPrincipal": "isquiotibiales",
    "musculosSecundarios": [
      "gemelos"
    ],
    "equipamiento": "peso_corporal",
    "unilateral": false
  },
  {
    "id": "407adcd9-f463-5c97-b8a3-48ce05a2caae",
    "clave": "hip-thrust",
    "nombre": "Hip thrust con barra",
    "musculoPrincipal": "gluteos",
    "musculosSecundarios": [
      "isquiotibiales",
      "cuadriceps"
    ],
    "equipamiento": "barra",
    "unilateral": false
  },
  {
    "id": "106cc236-eec6-5673-a051-3fb0da03c1e3",
    "clave": "puente-gluteo",
    "nombre": "Puente de glúteo",
    "musculoPrincipal": "gluteos",
    "musculosSecundarios": [
      "isquiotibiales"
    ],
    "equipamiento": "peso_corporal",
    "unilateral": false
  },
  {
    "id": "83da51ba-3774-5a69-a635-6b9e1ed13260",
    "clave": "patada-gluteo-polea",
    "nombre": "Patada de glúteo en polea",
    "musculoPrincipal": "gluteos",
    "musculosSecundarios": [
      "isquiotibiales"
    ],
    "equipamiento": "polea",
    "unilateral": true
  },
  {
    "id": "3ab90457-ae5b-51b4-b9c4-56fd50a62d60",
    "clave": "abduccion-cadera-maquina",
    "nombre": "Abducción de cadera en máquina",
    "musculoPrincipal": "gluteos",
    "musculosSecundarios": [],
    "equipamiento": "maquina",
    "unilateral": false
  },
  {
    "id": "9de1c034-3e1e-57e0-940e-6bcaccb7cf95",
    "clave": "abduccion-cadera-banda",
    "nombre": "Abducción de cadera con banda",
    "musculoPrincipal": "gluteos",
    "musculosSecundarios": [],
    "equipamiento": "banda",
    "unilateral": false
  },
  {
    "id": "f023346a-6b53-537f-85ed-884da49f23d3",
    "clave": "aduccion-cadera-maquina",
    "nombre": "Aducción de cadera en máquina",
    "musculoPrincipal": "aductores",
    "musculosSecundarios": [],
    "equipamiento": "maquina",
    "unilateral": false
  },
  {
    "id": "5fcddfb6-b35c-5287-82fd-abd268933b51",
    "clave": "aduccion-cadera-polea",
    "nombre": "Aducción de cadera en polea",
    "musculoPrincipal": "aductores",
    "musculosSecundarios": [
      "gluteos"
    ],
    "equipamiento": "polea",
    "unilateral": true
  },
  {
    "id": "4c24cdc8-81c2-5c25-992f-1acbe559bc40",
    "clave": "swing-kettlebell",
    "nombre": "Swing con kettlebell",
    "musculoPrincipal": "gluteos",
    "musculosSecundarios": [
      "isquiotibiales",
      "lumbares",
      "hombros"
    ],
    "equipamiento": "kettlebell",
    "unilateral": false
  },
  {
    "id": "e9d58d16-46a8-5609-bcb1-73e3862bc22c",
    "clave": "elevacion-talones-de-pie",
    "nombre": "Elevación de talones de pie",
    "musculoPrincipal": "gemelos",
    "musculosSecundarios": [],
    "equipamiento": "maquina",
    "unilateral": false
  },
  {
    "id": "7161e405-ee86-5967-a8ee-01501e95efed",
    "clave": "elevacion-talones-sentado",
    "nombre": "Elevación de talones sentado",
    "musculoPrincipal": "gemelos",
    "musculosSecundarios": [],
    "equipamiento": "maquina",
    "unilateral": false
  },
  {
    "id": "9fe369dd-5eb5-585b-af55-4b8f2789143f",
    "clave": "elevacion-talones-prensa",
    "nombre": "Elevación de talones en prensa",
    "musculoPrincipal": "gemelos",
    "musculosSecundarios": [],
    "equipamiento": "maquina",
    "unilateral": false
  },
  {
    "id": "a454fd13-90fb-5e84-a6b6-a19b09cc0999",
    "clave": "elevacion-talones-una-pierna",
    "nombre": "Elevación de talones a una pierna",
    "musculoPrincipal": "gemelos",
    "musculosSecundarios": [],
    "equipamiento": "peso_corporal",
    "unilateral": true
  },
  {
    "id": "d68b6bde-d198-5b0f-940c-d04bb181b366",
    "clave": "crunch",
    "nombre": "Crunch abdominal",
    "musculoPrincipal": "abdomen",
    "musculosSecundarios": [],
    "equipamiento": "peso_corporal",
    "unilateral": false
  },
  {
    "id": "582a1fc2-8f53-5991-b11f-c9d7be5dedc5",
    "clave": "crunch-polea",
    "nombre": "Crunch en polea",
    "musculoPrincipal": "abdomen",
    "musculosSecundarios": [],
    "equipamiento": "polea",
    "unilateral": false
  },
  {
    "id": "b4fa5439-918c-5f4c-a294-e5d10294a427",
    "clave": "crunch-maquina",
    "nombre": "Crunch en máquina",
    "musculoPrincipal": "abdomen",
    "musculosSecundarios": [],
    "equipamiento": "maquina",
    "unilateral": false
  },
  {
    "id": "3b961935-4814-5488-ae2d-c09eb407acab",
    "clave": "encogimiento-inverso",
    "nombre": "Encogimiento inverso",
    "musculoPrincipal": "abdomen",
    "musculosSecundarios": [],
    "equipamiento": "peso_corporal",
    "unilateral": false
  },
  {
    "id": "505fb6d7-9699-5710-9651-769124f79b23",
    "clave": "elevacion-piernas-colgado",
    "nombre": "Elevación de piernas colgado",
    "musculoPrincipal": "abdomen",
    "musculosSecundarios": [
      "antebrazos"
    ],
    "equipamiento": "peso_corporal",
    "unilateral": false
  },
  {
    "id": "a7878394-9d35-5e49-b2f7-d19d18ce1ab2",
    "clave": "elevacion-rodillas-colgado",
    "nombre": "Elevación de rodillas colgado",
    "musculoPrincipal": "abdomen",
    "musculosSecundarios": [
      "antebrazos"
    ],
    "equipamiento": "peso_corporal",
    "unilateral": false
  },
  {
    "id": "77e91f60-6514-57dc-b600-296e84226f85",
    "clave": "plancha",
    "nombre": "Plancha",
    "musculoPrincipal": "abdomen",
    "musculosSecundarios": [
      "hombros",
      "lumbares"
    ],
    "equipamiento": "peso_corporal",
    "unilateral": false
  },
  {
    "id": "ae784e51-fddc-570a-995b-a9b435f48568",
    "clave": "plancha-lateral",
    "nombre": "Plancha lateral",
    "musculoPrincipal": "oblicuos",
    "musculosSecundarios": [
      "abdomen",
      "hombros"
    ],
    "equipamiento": "peso_corporal",
    "unilateral": true
  },
  {
    "id": "fc7fe501-d570-58da-98a9-5d3ae67100fc",
    "clave": "rueda-abdominal",
    "nombre": "Rueda abdominal",
    "musculoPrincipal": "abdomen",
    "musculosSecundarios": [
      "hombros",
      "lumbares"
    ],
    "equipamiento": "otro",
    "unilateral": false
  },
  {
    "id": "82c65117-b76d-54f5-95b5-070dfe0a09a2",
    "clave": "hollow-hold",
    "nombre": "Hollow hold",
    "musculoPrincipal": "abdomen",
    "musculosSecundarios": [],
    "equipamiento": "peso_corporal",
    "unilateral": false
  },
  {
    "id": "1b4e1ad7-66f4-538d-8354-dd20bc64d79d",
    "clave": "dead-bug",
    "nombre": "Dead bug",
    "musculoPrincipal": "abdomen",
    "musculosSecundarios": [
      "lumbares"
    ],
    "equipamiento": "peso_corporal",
    "unilateral": false
  },
  {
    "id": "930947fd-dd74-5ce6-98ca-064fdcf5d238",
    "clave": "escaladores",
    "nombre": "Escaladores",
    "musculoPrincipal": "abdomen",
    "musculosSecundarios": [
      "hombros",
      "cuadriceps"
    ],
    "equipamiento": "peso_corporal",
    "unilateral": false
  },
  {
    "id": "6bdf22f4-5bc4-58e4-8fdb-f43971c58396",
    "clave": "giro-ruso",
    "nombre": "Giro ruso",
    "musculoPrincipal": "oblicuos",
    "musculosSecundarios": [
      "abdomen"
    ],
    "equipamiento": "mancuerna",
    "unilateral": false
  },
  {
    "id": "8e2965fb-a2dc-53a6-bd36-9fa11d033f44",
    "clave": "press-pallof",
    "nombre": "Press Pallof",
    "musculoPrincipal": "oblicuos",
    "musculosSecundarios": [
      "abdomen"
    ],
    "equipamiento": "polea",
    "unilateral": true
  },
  {
    "id": "d3d77e27-9e8f-5e58-aa71-e652f093cc11",
    "clave": "lenador-polea",
    "nombre": "Leñador en polea",
    "musculoPrincipal": "oblicuos",
    "musculosSecundarios": [
      "abdomen",
      "hombros"
    ],
    "equipamiento": "polea",
    "unilateral": true
  },
  {
    "id": "0b5e2223-916e-5b1c-a0d0-e87687272c0a",
    "clave": "flexion-cuello",
    "nombre": "Flexión de cuello",
    "musculoPrincipal": "cuello",
    "musculosSecundarios": [],
    "equipamiento": "otro",
    "unilateral": false
  },
  {
    "id": "bae1b4b9-d904-5991-a9e3-aa213e2d6e94",
    "clave": "extension-cuello",
    "nombre": "Extensión de cuello",
    "musculoPrincipal": "cuello",
    "musculosSecundarios": [],
    "equipamiento": "otro",
    "unilateral": false
  },
  {
    "id": "9e5f9459-bcf4-5ddf-bd4c-082fff353a48",
    "clave": "cargada-y-press",
    "nombre": "Cargada y press",
    "musculoPrincipal": "hombros",
    "musculosSecundarios": [
      "cuadriceps",
      "espalda",
      "triceps"
    ],
    "equipamiento": "barra",
    "unilateral": false
  },
  {
    "id": "41f2cebd-6553-50ca-9d9e-a07e3d4ba253",
    "clave": "thruster",
    "nombre": "Thruster",
    "musculoPrincipal": "hombros",
    "musculosSecundarios": [
      "cuadriceps",
      "gluteos",
      "triceps"
    ],
    "equipamiento": "barra",
    "unilateral": false
  },
  {
    "id": "cb944e09-af63-536c-8a61-6dcb672ef918",
    "clave": "turkish-get-up",
    "nombre": "Turkish get-up",
    "musculoPrincipal": "hombros",
    "musculosSecundarios": [
      "abdomen",
      "cuadriceps"
    ],
    "equipamiento": "kettlebell",
    "unilateral": true
  },
  {
    "id": "e51edad1-0091-5005-bfb0-8f03a7ba26f4",
    "clave": "burpee",
    "nombre": "Burpee",
    "musculoPrincipal": "cuadriceps",
    "musculosSecundarios": [
      "pecho",
      "hombros",
      "abdomen"
    ],
    "equipamiento": "peso_corporal",
    "unilateral": false
  }
];

/** Sube cuando cambia el catálogo, para que el sembrado sepa que hay que repasarlo. */
export const VERSION_DEL_CATALOGO = 136;
