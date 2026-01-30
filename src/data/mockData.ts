// Datos hipotéticos para visualizar la plataforma

export interface Transaction {
  id: string;
  type: "ingreso" | "gasto";
  description: string;
  amount: number;
  category: string;
  subcategory?: string;
  account: string;
  creditCard?: string;
  responsible: string;
  dueDate: Date;
  paymentDate?: Date;
  competenceDate: Date;
  status: "pagado" | "pendiente" | "cobrado" | "por_cobrar";
  isFixed: boolean;
  color: string;
}

export interface Category {
  id: string;
  name: string;
  type: "ingreso" | "gasto";
  color: string;
  icon: string;
  subcategories: string[];
  totalAmount: number;
}

export interface BankAccount {
  id: string;
  name: string;
  bank: string;
  type: "corriente" | "ahorro";
  balance: number;
  color: string;
}

export interface CreditCard {
  id: string;
  name: string;
  bank: string;
  brand: string;
  limit: number;
  used: number;
  closingDay: number;
  dueDay: number;
  color: string;
  account?: string;
  holder?: string;
}

// Categorías de gastos e ingresos
export const categories: Category[] = [
  { id: "1", name: "Salario", type: "ingreso", color: "hsl(142, 76%, 36%)", icon: "Briefcase", subcategories: ["Nómina", "Bonificaciones", "Horas extra"], totalAmount: 3200 },
  { id: "2", name: "Freelance", type: "ingreso", color: "hsl(200, 98%, 39%)", icon: "Laptop", subcategories: ["Diseño", "Desarrollo", "Consultoría"], totalAmount: 850 },
  { id: "3", name: "Inversiones", type: "ingreso", color: "hsl(262, 83%, 58%)", icon: "TrendingUp", subcategories: ["Dividendos", "Intereses", "Plusvalías"], totalAmount: 180 },
  { id: "4", name: "Vivienda", type: "gasto", color: "hsl(340, 82%, 52%)", icon: "Home", subcategories: ["Alquiler", "Hipoteca", "Comunidad", "Seguro hogar"], totalAmount: 950 },
  { id: "5", name: "Alimentación", type: "gasto", color: "hsl(25, 95%, 53%)", icon: "ShoppingCart", subcategories: ["Supermercado", "Restaurantes", "Delivery"], totalAmount: 485 },
  { id: "6", name: "Transporte", type: "gasto", color: "hsl(45, 93%, 47%)", icon: "Car", subcategories: ["Gasolina", "Transporte público", "Taxi/VTC", "Mantenimiento"], totalAmount: 210 },
  { id: "7", name: "Suministros", type: "gasto", color: "hsl(190, 95%, 39%)", icon: "Zap", subcategories: ["Electricidad", "Gas", "Agua", "Internet", "Móvil"], totalAmount: 175 },
  { id: "8", name: "Ocio", type: "gasto", color: "hsl(280, 87%, 54%)", icon: "Gamepad", subcategories: ["Streaming", "Cine", "Eventos", "Hobbies"], totalAmount: 120 },
  { id: "9", name: "Salud", type: "gasto", color: "hsl(0, 84%, 60%)", icon: "Heart", subcategories: ["Farmacia", "Médico", "Seguro médico", "Gimnasio"], totalAmount: 95 },
  { id: "10", name: "Educación", type: "gasto", color: "hsl(220, 90%, 56%)", icon: "GraduationCap", subcategories: ["Cursos", "Libros", "Material"], totalAmount: 75 },
  { id: "11", name: "Ropa", type: "gasto", color: "hsl(320, 70%, 50%)", icon: "Shirt", subcategories: ["Ropa", "Calzado", "Accesorios"], totalAmount: 65 },
  { id: "12", name: "Mascotas", type: "gasto", color: "hsl(30, 80%, 55%)", icon: "Cat", subcategories: ["Comida", "Veterinario", "Accesorios"], totalAmount: 55 },
];

// Cuentas bancarias
export const bankAccounts: BankAccount[] = [
  { id: "1", name: "Cuenta Principal", bank: "Santander", type: "corriente", balance: 4250.80, color: "hsl(0, 100%, 40%)" },
  { id: "2", name: "Cuenta Ahorro", bank: "BBVA", type: "ahorro", balance: 8500.00, color: "hsl(210, 100%, 40%)" },
  { id: "3", name: "Cuenta Nómina", bank: "CaixaBank", type: "corriente", balance: 1820.45, color: "hsl(200, 80%, 45%)" },
];

// Tarjetas de crédito
export const creditCards: CreditCard[] = [
  { id: "1", name: "Visa Gold", bank: "Santander", brand: "Visa", limit: 3000, used: 845.30, closingDay: 25, dueDay: 5, color: "hsl(45, 100%, 50%)", account: "Santander", holder: "Juan" },
  { id: "2", name: "Mastercard", bank: "BBVA", brand: "Mastercard", limit: 2000, used: 320.50, closingDay: 15, dueDay: 1, color: "hsl(15, 100%, 50%)", account: "BBVA", holder: "María" },
];

// Generar transacciones para el mes actual
const currentDate = new Date();
const currentMonth = currentDate.getMonth();
const currentYear = currentDate.getFullYear();

export const transactions: Transaction[] = [
  // Ingresos
  {
    id: "t1",
    type: "ingreso",
    description: "Nómina Enero",
    amount: 2800,
    category: "Salario",
    subcategory: "Nómina",
    account: "Cuenta Nómina",
    responsible: "Juan García",
    dueDate: new Date(currentYear, currentMonth, 28),
    paymentDate: new Date(currentYear, currentMonth, 28),
    competenceDate: new Date(currentYear, currentMonth, 1),
    status: "cobrado",
    isFixed: true,
    color: "hsl(142, 76%, 36%)",
  },
  {
    id: "t2",
    type: "ingreso",
    description: "Proyecto web freelance",
    amount: 650,
    category: "Freelance",
    subcategory: "Desarrollo",
    account: "Cuenta Principal",
    responsible: "Juan García",
    dueDate: new Date(currentYear, currentMonth, 15),
    paymentDate: new Date(currentYear, currentMonth, 16),
    competenceDate: new Date(currentYear, currentMonth, 15),
    status: "cobrado",
    isFixed: false,
    color: "hsl(200, 98%, 39%)",
  },
  {
    id: "t3",
    type: "ingreso",
    description: "Diseño logo empresa",
    amount: 200,
    category: "Freelance",
    subcategory: "Diseño",
    account: "Cuenta Principal",
    responsible: "Juan García",
    dueDate: new Date(currentYear, currentMonth, 20),
    competenceDate: new Date(currentYear, currentMonth, 18),
    status: "por_cobrar",
    isFixed: false,
    color: "hsl(200, 98%, 39%)",
  },
  {
    id: "t4",
    type: "ingreso",
    description: "Paga extra",
    amount: 400,
    category: "Salario",
    subcategory: "Bonificaciones",
    account: "Cuenta Nómina",
    responsible: "Juan García",
    dueDate: new Date(currentYear, currentMonth, 28),
    paymentDate: new Date(currentYear, currentMonth, 28),
    competenceDate: new Date(currentYear, currentMonth, 28),
    status: "cobrado",
    isFixed: false,
    color: "hsl(142, 76%, 36%)",
  },
  {
    id: "t5",
    type: "ingreso",
    description: "Dividendos acciones",
    amount: 180,
    category: "Inversiones",
    subcategory: "Dividendos",
    account: "Cuenta Ahorro",
    responsible: "Juan García",
    dueDate: new Date(currentYear, currentMonth, 10),
    paymentDate: new Date(currentYear, currentMonth, 10),
    competenceDate: new Date(currentYear, currentMonth, 10),
    status: "cobrado",
    isFixed: false,
    color: "hsl(262, 83%, 58%)",
  },
  // Gastos
  {
    id: "t6",
    type: "gasto",
    description: "Alquiler piso",
    amount: 850,
    category: "Vivienda",
    subcategory: "Alquiler",
    account: "Cuenta Principal",
    responsible: "Juan García",
    dueDate: new Date(currentYear, currentMonth, 1),
    paymentDate: new Date(currentYear, currentMonth, 1),
    competenceDate: new Date(currentYear, currentMonth, 1),
    status: "pagado",
    isFixed: true,
    color: "hsl(340, 82%, 52%)",
  },
  {
    id: "t7",
    type: "gasto",
    description: "Comunidad de vecinos",
    amount: 65,
    category: "Vivienda",
    subcategory: "Comunidad",
    account: "Cuenta Principal",
    responsible: "Juan García",
    dueDate: new Date(currentYear, currentMonth, 5),
    paymentDate: new Date(currentYear, currentMonth, 5),
    competenceDate: new Date(currentYear, currentMonth, 5),
    status: "pagado",
    isFixed: true,
    color: "hsl(340, 82%, 52%)",
  },
  {
    id: "t8",
    type: "gasto",
    description: "Seguro del hogar",
    amount: 35,
    category: "Vivienda",
    subcategory: "Seguro hogar",
    account: "Cuenta Principal",
    responsible: "Juan García",
    dueDate: new Date(currentYear, currentMonth, 15),
    paymentDate: new Date(currentYear, currentMonth, 15),
    competenceDate: new Date(currentYear, currentMonth, 15),
    status: "pagado",
    isFixed: true,
    color: "hsl(340, 82%, 52%)",
  },
  {
    id: "t9",
    type: "gasto",
    description: "Compra supermercado Mercadona",
    amount: 125,
    category: "Alimentación",
    subcategory: "Supermercado",
    account: "Cuenta Principal",
    responsible: "María López",
    dueDate: new Date(currentYear, currentMonth, 3),
    paymentDate: new Date(currentYear, currentMonth, 3),
    competenceDate: new Date(currentYear, currentMonth, 3),
    status: "pagado",
    isFixed: false,
    color: "hsl(25, 95%, 53%)",
  },
  {
    id: "t10",
    type: "gasto",
    description: "Supermercado Carrefour",
    amount: 98,
    category: "Alimentación",
    subcategory: "Supermercado",
    account: "Cuenta Principal",
    responsible: "María López",
    dueDate: new Date(currentYear, currentMonth, 10),
    paymentDate: new Date(currentYear, currentMonth, 10),
    competenceDate: new Date(currentYear, currentMonth, 10),
    status: "pagado",
    isFixed: false,
    color: "hsl(25, 95%, 53%)",
  },
  {
    id: "t11",
    type: "gasto",
    description: "Cena restaurante japonés",
    amount: 78,
    category: "Alimentación",
    subcategory: "Restaurantes",
    account: "Cuenta Principal",
    creditCard: "Visa Gold",
    responsible: "Juan García",
    dueDate: new Date(currentYear, currentMonth, 8),
    paymentDate: new Date(currentYear, currentMonth, 8),
    competenceDate: new Date(currentYear, currentMonth, 8),
    status: "pagado",
    isFixed: false,
    color: "hsl(25, 95%, 53%)",
  },
  {
    id: "t12",
    type: "gasto",
    description: "Delivery Just Eat",
    amount: 32,
    category: "Alimentación",
    subcategory: "Delivery",
    account: "Cuenta Principal",
    creditCard: "Visa Gold",
    responsible: "Juan García",
    dueDate: new Date(currentYear, currentMonth, 14),
    paymentDate: new Date(currentYear, currentMonth, 14),
    competenceDate: new Date(currentYear, currentMonth, 14),
    status: "pagado",
    isFixed: false,
    color: "hsl(25, 95%, 53%)",
  },
  {
    id: "t13",
    type: "gasto",
    description: "Compra supermercado",
    amount: 87,
    category: "Alimentación",
    subcategory: "Supermercado",
    account: "Cuenta Principal",
    responsible: "María López",
    dueDate: new Date(currentYear, currentMonth, 22),
    competenceDate: new Date(currentYear, currentMonth, 22),
    status: "pendiente",
    isFixed: false,
    color: "hsl(25, 95%, 53%)",
  },
  {
    id: "t14",
    type: "gasto",
    description: "Gasolina Repsol",
    amount: 65,
    category: "Transporte",
    subcategory: "Gasolina",
    account: "Cuenta Principal",
    creditCard: "Visa Gold",
    responsible: "Juan García",
    dueDate: new Date(currentYear, currentMonth, 5),
    paymentDate: new Date(currentYear, currentMonth, 5),
    competenceDate: new Date(currentYear, currentMonth, 5),
    status: "pagado",
    isFixed: false,
    color: "hsl(45, 93%, 47%)",
  },
  {
    id: "t15",
    type: "gasto",
    description: "Abono transporte mensual",
    amount: 70,
    category: "Transporte",
    subcategory: "Transporte público",
    account: "Cuenta Principal",
    responsible: "María López",
    dueDate: new Date(currentYear, currentMonth, 1),
    paymentDate: new Date(currentYear, currentMonth, 1),
    competenceDate: new Date(currentYear, currentMonth, 1),
    status: "pagado",
    isFixed: true,
    color: "hsl(45, 93%, 47%)",
  },
  {
    id: "t16",
    type: "gasto",
    description: "Uber viaje aeropuerto",
    amount: 45,
    category: "Transporte",
    subcategory: "Taxi/VTC",
    account: "Cuenta Principal",
    creditCard: "Mastercard",
    responsible: "Juan García",
    dueDate: new Date(currentYear, currentMonth, 12),
    paymentDate: new Date(currentYear, currentMonth, 12),
    competenceDate: new Date(currentYear, currentMonth, 12),
    status: "pagado",
    isFixed: false,
    color: "hsl(45, 93%, 47%)",
  },
  {
    id: "t17",
    type: "gasto",
    description: "Gasolina segunda quincena",
    amount: 55,
    category: "Transporte",
    subcategory: "Gasolina",
    account: "Cuenta Principal",
    responsible: "Juan García",
    dueDate: new Date(currentYear, currentMonth, 25),
    competenceDate: new Date(currentYear, currentMonth, 25),
    status: "pendiente",
    isFixed: false,
    color: "hsl(45, 93%, 47%)",
  },
  {
    id: "t18",
    type: "gasto",
    description: "Factura electricidad Iberdrola",
    amount: 75,
    category: "Suministros",
    subcategory: "Electricidad",
    account: "Cuenta Principal",
    responsible: "Juan García",
    dueDate: new Date(currentYear, currentMonth, 10),
    paymentDate: new Date(currentYear, currentMonth, 10),
    competenceDate: new Date(currentYear, currentMonth, 10),
    status: "pagado",
    isFixed: true,
    color: "hsl(190, 95%, 39%)",
  },
  {
    id: "t19",
    type: "gasto",
    description: "Factura gas Naturgy",
    amount: 42,
    category: "Suministros",
    subcategory: "Gas",
    account: "Cuenta Principal",
    responsible: "Juan García",
    dueDate: new Date(currentYear, currentMonth, 12),
    paymentDate: new Date(currentYear, currentMonth, 12),
    competenceDate: new Date(currentYear, currentMonth, 12),
    status: "pagado",
    isFixed: true,
    color: "hsl(190, 95%, 39%)",
  },
  {
    id: "t20",
    type: "gasto",
    description: "Internet Movistar",
    amount: 45,
    category: "Suministros",
    subcategory: "Internet",
    account: "Cuenta Principal",
    responsible: "Juan García",
    dueDate: new Date(currentYear, currentMonth, 5),
    paymentDate: new Date(currentYear, currentMonth, 5),
    competenceDate: new Date(currentYear, currentMonth, 5),
    status: "pagado",
    isFixed: true,
    color: "hsl(190, 95%, 39%)",
  },
  {
    id: "t21",
    type: "gasto",
    description: "Móvil línea principal",
    amount: 25,
    category: "Suministros",
    subcategory: "Móvil",
    account: "Cuenta Principal",
    responsible: "Juan García",
    dueDate: new Date(currentYear, currentMonth, 15),
    paymentDate: new Date(currentYear, currentMonth, 15),
    competenceDate: new Date(currentYear, currentMonth, 15),
    status: "pagado",
    isFixed: true,
    color: "hsl(190, 95%, 39%)",
  },
  {
    id: "t22",
    type: "gasto",
    description: "Netflix suscripción",
    amount: 17.99,
    category: "Ocio",
    subcategory: "Streaming",
    account: "Cuenta Principal",
    creditCard: "Visa Gold",
    responsible: "Juan García",
    dueDate: new Date(currentYear, currentMonth, 8),
    paymentDate: new Date(currentYear, currentMonth, 8),
    competenceDate: new Date(currentYear, currentMonth, 8),
    status: "pagado",
    isFixed: true,
    color: "hsl(280, 87%, 54%)",
  },
  {
    id: "t23",
    type: "gasto",
    description: "Spotify Premium",
    amount: 12.99,
    category: "Ocio",
    subcategory: "Streaming",
    account: "Cuenta Principal",
    creditCard: "Visa Gold",
    responsible: "Juan García",
    dueDate: new Date(currentYear, currentMonth, 12),
    paymentDate: new Date(currentYear, currentMonth, 12),
    competenceDate: new Date(currentYear, currentMonth, 12),
    status: "pagado",
    isFixed: true,
    color: "hsl(280, 87%, 54%)",
  },
  {
    id: "t24",
    type: "gasto",
    description: "Cine entradas x2",
    amount: 18,
    category: "Ocio",
    subcategory: "Cine",
    account: "Cuenta Principal",
    responsible: "María López",
    dueDate: new Date(currentYear, currentMonth, 18),
    paymentDate: new Date(currentYear, currentMonth, 18),
    competenceDate: new Date(currentYear, currentMonth, 18),
    status: "pagado",
    isFixed: false,
    color: "hsl(280, 87%, 54%)",
  },
  {
    id: "t25",
    type: "gasto",
    description: "Concierto Teatro Real",
    amount: 85,
    category: "Ocio",
    subcategory: "Eventos",
    account: "Cuenta Principal",
    creditCard: "Mastercard",
    responsible: "Juan García",
    dueDate: new Date(currentYear, currentMonth, 28),
    competenceDate: new Date(currentYear, currentMonth, 28),
    status: "pendiente",
    isFixed: false,
    color: "hsl(280, 87%, 54%)",
  },
  {
    id: "t26",
    type: "gasto",
    description: "Farmacia medicamentos",
    amount: 28,
    category: "Salud",
    subcategory: "Farmacia",
    account: "Cuenta Principal",
    responsible: "María López",
    dueDate: new Date(currentYear, currentMonth, 7),
    paymentDate: new Date(currentYear, currentMonth, 7),
    competenceDate: new Date(currentYear, currentMonth, 7),
    status: "pagado",
    isFixed: false,
    color: "hsl(0, 84%, 60%)",
  },
  {
    id: "t27",
    type: "gasto",
    description: "Gimnasio mensualidad",
    amount: 45,
    category: "Salud",
    subcategory: "Gimnasio",
    account: "Cuenta Principal",
    responsible: "Juan García",
    dueDate: new Date(currentYear, currentMonth, 1),
    paymentDate: new Date(currentYear, currentMonth, 1),
    competenceDate: new Date(currentYear, currentMonth, 1),
    status: "pagado",
    isFixed: true,
    color: "hsl(0, 84%, 60%)",
  },
  {
    id: "t28",
    type: "gasto",
    description: "Dentista revisión",
    amount: 60,
    category: "Salud",
    subcategory: "Médico",
    account: "Cuenta Principal",
    responsible: "María López",
    dueDate: new Date(currentYear, currentMonth, 20),
    competenceDate: new Date(currentYear, currentMonth, 20),
    status: "pendiente",
    isFixed: false,
    color: "hsl(0, 84%, 60%)",
  },
  {
    id: "t29",
    type: "gasto",
    description: "Curso Udemy desarrollo",
    amount: 14.99,
    category: "Educación",
    subcategory: "Cursos",
    account: "Cuenta Principal",
    creditCard: "Visa Gold",
    responsible: "Juan García",
    dueDate: new Date(currentYear, currentMonth, 9),
    paymentDate: new Date(currentYear, currentMonth, 9),
    competenceDate: new Date(currentYear, currentMonth, 9),
    status: "pagado",
    isFixed: false,
    color: "hsl(220, 90%, 56%)",
  },
  {
    id: "t30",
    type: "gasto",
    description: "Libro programación",
    amount: 35,
    category: "Educación",
    subcategory: "Libros",
    account: "Cuenta Principal",
    creditCard: "Mastercard",
    responsible: "Juan García",
    dueDate: new Date(currentYear, currentMonth, 15),
    paymentDate: new Date(currentYear, currentMonth, 15),
    competenceDate: new Date(currentYear, currentMonth, 15),
    status: "pagado",
    isFixed: false,
    color: "hsl(220, 90%, 56%)",
  },
  {
    id: "t31",
    type: "gasto",
    description: "Zara ropa invierno",
    amount: 89,
    category: "Ropa",
    subcategory: "Ropa",
    account: "Cuenta Principal",
    creditCard: "Visa Gold",
    responsible: "María López",
    dueDate: new Date(currentYear, currentMonth, 11),
    paymentDate: new Date(currentYear, currentMonth, 11),
    competenceDate: new Date(currentYear, currentMonth, 11),
    status: "pagado",
    isFixed: false,
    color: "hsl(320, 70%, 50%)",
  },
  {
    id: "t32",
    type: "gasto",
    description: "Comida gato Royal Canin",
    amount: 42,
    category: "Mascotas",
    subcategory: "Comida",
    account: "Cuenta Principal",
    responsible: "María López",
    dueDate: new Date(currentYear, currentMonth, 6),
    paymentDate: new Date(currentYear, currentMonth, 6),
    competenceDate: new Date(currentYear, currentMonth, 6),
    status: "pagado",
    isFixed: false,
    color: "hsl(30, 80%, 55%)",
  },
  {
    id: "t33",
    type: "gasto",
    description: "Veterinario vacunas",
    amount: 75,
    category: "Mascotas",
    subcategory: "Veterinario",
    account: "Cuenta Principal",
    responsible: "María López",
    dueDate: new Date(currentYear, currentMonth, 24),
    competenceDate: new Date(currentYear, currentMonth, 24),
    status: "pendiente",
    isFixed: false,
    color: "hsl(30, 80%, 55%)",
  },
];

// Funciones helper para calcular totales
export function calculateTotals(transactionList: Transaction[]) {
  const ingresos = transactionList.filter(t => t.type === "ingreso");
  const gastos = transactionList.filter(t => t.type === "gasto");

  const totalIngresos = ingresos.reduce((sum, t) => sum + t.amount, 0);
  const ingresosCobrados = ingresos.filter(t => t.status === "cobrado").reduce((sum, t) => sum + t.amount, 0);
  const ingresosPorCobrar = ingresos.filter(t => t.status === "por_cobrar").reduce((sum, t) => sum + t.amount, 0);

  const totalGastos = gastos.reduce((sum, t) => sum + t.amount, 0);
  const gastosPagados = gastos.filter(t => t.status === "pagado").reduce((sum, t) => sum + t.amount, 0);
  const gastosPendientes = gastos.filter(t => t.status === "pendiente").reduce((sum, t) => sum + t.amount, 0);

  return {
    totalIngresos,
    ingresosCobrados,
    ingresosPorCobrar,
    totalGastos,
    gastosPagados,
    gastosPendientes,
    saldoPrevisto: totalIngresos - totalGastos,
    saldoDisponible: ingresosCobrados - gastosPagados,
  };
}

export function getExpensesByCategory(transactionList: Transaction[]) {
  const gastos = transactionList.filter(t => t.type === "gasto");
  const categoryMap = new Map<string, { name: string; value: number; color: string }>();

  gastos.forEach(t => {
    const existing = categoryMap.get(t.category);
    if (existing) {
      existing.value += t.amount;
    } else {
      categoryMap.set(t.category, { name: t.category, value: t.amount, color: t.color });
    }
  });

  return Array.from(categoryMap.values()).sort((a, b) => b.value - a.value);
}

export function getIncomeByCategory(transactionList: Transaction[]) {
  const ingresos = transactionList.filter(t => t.type === "ingreso");
  const categoryMap = new Map<string, { name: string; value: number; color: string }>();

  ingresos.forEach(t => {
    const existing = categoryMap.get(t.category);
    if (existing) {
      existing.value += t.amount;
    } else {
      categoryMap.set(t.category, { name: t.category, value: t.amount, color: t.color });
    }
  });

  return Array.from(categoryMap.values()).sort((a, b) => b.value - a.value);
}

// Datos del saldo del período anterior (simulado)
export const previousPeriodBalance = {
  available: 3850.00,
  pending: 250.00,
  total: 4100.00,
};
