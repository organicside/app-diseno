import { Task } from '../types';

export const INITIAL_TASKS: Task[] = [
  // 1. Backlog items (Por Clasificar / Backlog)
  {
    id: 'TSK-101',
    title: 'Diseño de Etiqueta Frontal para Nuevo Suero Facial 50ml',
    description: 'Se requiere actualización de troquel y aplicación de tintas directas Pantone para la nueva línea botánica. Incluir sellos ecológicos y código de barras GS1.',
    requesterName: 'Ana Morales',
    requesterDept: 'Desarrollo de Producto',
    taskType: 'Diseño General',
    assignee: 'Sin Asignar',
    generalStatus: 'Por Clasificar / Backlog',
    priority: 'Alta',
    complexity: 'M',
    createdAt: '2026-10-06T09:30:00Z',
    attachments: [
      { id: 'att-1', name: 'Troquel_Suero_50ml_v2.ai', size: '4.2 MB', type: 'application/illustrator' },
      { id: 'att-2', name: 'Brief_Textos_Legales.docx', size: '120 KB', type: 'application/docx' },
    ],
    history: [
      { id: 'h-1', timestamp: '2026-10-06T09:30:00Z', user: 'Ana Morales', action: 'Ingresó solicitud vía Intake Form' }
    ]
  },
  {
    id: 'TSK-102',
    title: 'Adelanto de Artes para Roll-ups de Expo Belleza 2026',
    description: '3 artes de 85x200cm con especificaciones de impresión en lona mate de alta resolución para el stand de ventas.',
    requesterName: 'Rodrigo Méndez',
    requesterDept: 'Ventas y Expansión',
    taskType: 'Diseño General',
    assignee: 'Sin Asignar',
    generalStatus: 'Por Clasificar / Backlog',
    priority: 'Media',
    complexity: 'S',
    createdAt: '2026-10-06T10:15:00Z',
    history: [
      { id: 'h-2', timestamp: '2026-10-06T10:15:00Z', user: 'Rodrigo Méndez', action: 'Solicitud creada en Intake' }
    ]
  },
  {
    id: 'TSK-103',
    title: 'Orden de Compra: Cajas Plegadizas Mascarilla de Arcilla',
    description: 'Tiraje de 20,000 piezas con acabado foil holográfico y barniz a registro. Requiere revisión previa de Print card con el proveedor.',
    requesterName: 'Patricia Guzmán',
    requesterDept: 'Operaciones & Compras',
    taskType: 'Orden de Compra',
    assignee: 'Sin Asignar',
    generalStatus: 'Por Clasificar / Backlog',
    priority: 'Alta',
    complexity: 'L',
    createdAt: '2026-10-05T16:00:00Z',
    poNumber: 'PO-9420',
    poProductDesc: 'Caja plegadiza cartulina sulfatada 16 pts con foil',
    poSupplier: 'Focomsa',
    poStatus: 'Pendiente de enviar archivo',
    poDeliveryCommitmentDate: '2026-10-22',
    history: [
      { id: 'h-3', timestamp: '2026-10-05T16:00:00Z', user: 'Patricia Guzmán', action: 'Generó requerimiento de PO' }
    ]
  },

  // 2. En Proceso (Benjy has 2, Hilda has 3 -> Hilda is at WIP limit!)
  {
    id: 'TSK-104',
    title: 'Diseño de Banners Promocionales para Web y Newsletter',
    description: 'Formatos para desktop (1920x600), mobile (1080x1350) y carrusel de Instagram para venta flash.',
    requesterName: 'Sofía Reyes',
    requesterDept: 'E-Commerce',
    taskType: 'Diseño General',
    assignee: 'Benjy',
    generalStatus: 'En Proceso',
    priority: 'Alta',
    complexity: 'M',
    createdAt: '2026-10-05T11:00:00Z',
    startedAt: '2026-10-05T14:30:00Z',
    attachments: [
      { id: 'att-3', name: 'Guia_Estilo_FlashSale.pdf', size: '1.8 MB', type: 'application/pdf' },
    ],
    history: [
      { id: 'h-4', timestamp: '2026-10-05T11:00:00Z', user: 'Sofía Reyes', action: 'Solicitud enviada' },
      { id: 'h-5', timestamp: '2026-10-05T14:30:00Z', user: 'Benjy', action: 'Tomó tarea del Backlog' }
    ]
  },
  {
    id: 'TSK-105',
    title: 'PO-8812: Etiquetas Bopp Metalizado Línea Shampoo Sólido',
    description: 'Supervisión de salida digital y aprobación de pruebas de color con Etimex. Alerta: fecha compromiso próxima.',
    requesterName: 'Patricia Guzmán',
    requesterDept: 'Operaciones & Compras',
    taskType: 'Orden de Compra',
    assignee: 'Benjy',
    generalStatus: 'En Proceso',
    priority: 'Alta',
    complexity: 'M',
    createdAt: '2026-10-02T10:00:00Z',
    startedAt: '2026-10-03T09:00:00Z',
    poNumber: 'PO-8812',
    poProductDesc: 'Etiquetas rollo Bopp metalizado 5x12cm con barniz UV',
    poSupplier: 'Etimex',
    poStatus: 'Pendiente firmar Print card',
    // Delivery within 36 hours from Oct 6 (e.g. Oct 7/8, triggers 48h alert!)
    poDeliveryCommitmentDate: '2026-10-07',
    history: [
      { id: 'h-6', timestamp: '2026-10-02T10:00:00Z', user: 'Patricia Guzmán', action: 'Registró PO' },
      { id: 'h-7', timestamp: '2026-10-04T12:00:00Z', user: 'Benjy', action: 'Recibió Print cards de Etimex' }
    ]
  },

  // Hilda's tasks (3 tasks = AT WIP LIMIT!)
  {
    id: 'TSK-106',
    title: 'Campaña: Lanzamiento Serum Hidratante Otoño 2026',
    description: 'Gestión creativa de pauta en Meta Ads y TikTok Ads. Segmentación AB y monitoreo de ROAS proyectado.',
    requesterName: 'Valeria Soto',
    requesterDept: 'Mercadotecnia',
    taskType: 'Campaña Publicitaria',
    assignee: 'Hilda',
    generalStatus: 'En Proceso',
    priority: 'Alta',
    complexity: 'L',
    createdAt: '2026-10-01T09:00:00Z',
    startedAt: '2026-10-02T10:00:00Z',
    campaignItem: 'Serum Hidratante Botánico 50ml con Ácido Hialurónico',
    campaignStartDate: '2026-10-05',
    campaignEndDate: '2026-10-25',
    campaignBudget: 45000,
    campaignStatus: 'Activa',
    history: [
      { id: 'h-8', timestamp: '2026-10-01T09:00:00Z', user: 'Valeria Soto', action: 'Campaña registrada' },
      { id: 'h-9', timestamp: '2026-10-05T09:00:00Z', user: 'Hilda', action: 'Pauta activada en plataformas' }
    ]
  },
  {
    id: 'TSK-107',
    title: 'PO-9104: Cajas Tubo para Velas Aromáticas',
    description: 'Validación de sustrato kraft y resistencia al transporte. Proveedor en producción.',
    requesterName: 'Patricia Guzmán',
    requesterDept: 'Operaciones & Compras',
    taskType: 'Orden de Compra',
    assignee: 'Hilda',
    generalStatus: 'En Proceso',
    priority: 'Media',
    complexity: 'M',
    createdAt: '2026-10-01T12:00:00Z',
    startedAt: '2026-10-02T15:00:00Z',
    poNumber: 'PO-9104',
    poProductDesc: 'Tubo cilíndrico rígido de cartón kraft con tapa metálica',
    poSupplier: 'Focomsa',
    poStatus: 'Producción en proceso',
    poDeliveryCommitmentDate: '2026-10-14',
    history: [
      { id: 'h-10', timestamp: '2026-10-03T11:00:00Z', user: 'Hilda', action: 'Aprobó Print Card firmada' }
    ]
  },
  {
    id: 'TSK-108',
    title: 'Rediseño de Ficha Técnica y Manual de Marca para Distribuidores',
    description: 'Documento PDF editable de 12 páginas con paleta de color, márgenes de seguridad y directrices para revendedores autorizados.',
    requesterName: 'Alberto Castro',
    requesterDept: 'Comercial',
    taskType: 'Diseño General',
    assignee: 'Hilda',
    generalStatus: 'En Proceso',
    priority: 'Media',
    complexity: 'L',
    createdAt: '2026-10-04T08:30:00Z',
    startedAt: '2026-10-04T11:00:00Z',
    history: [
      { id: 'h-11', timestamp: '2026-10-04T11:00:00Z', user: 'Hilda', action: 'Tomó tarea del Backlog' }
    ]
  },

  // 3. En Pausa
  {
    id: 'TSK-109',
    title: 'Campaña: Co-Branding con Influencers Lifestyle',
    description: 'Pausa en espera de validación de contrato por el área jurídica y recepción de los paquetes de muestra.',
    requesterName: 'Valeria Soto',
    requesterDept: 'Mercadotecnia',
    taskType: 'Campaña Publicitaria',
    assignee: 'Benjy',
    generalStatus: 'En Pausa',
    priority: 'Baja',
    complexity: 'M',
    createdAt: '2026-09-28T10:00:00Z',
    startedAt: '2026-09-29T11:00:00Z',
    campaignItem: 'Kit Rutina Glow - Campaña de Micro-influencers',
    campaignStartDate: '2026-10-15',
    campaignEndDate: '2026-10-31',
    campaignBudget: 28000,
    campaignStatus: 'En Pausa',
    history: [
      { id: 'h-12', timestamp: '2026-10-03T17:00:00Z', user: 'Benjy', action: 'Pausó tarea por espera de aprobación legal' }
    ]
  },
  {
    id: 'TSK-110',
    title: 'PO-8902: Botellas de Vidrio Ámbar con Serigrafía',
    description: 'En espera de resolución técnica por parte del proveedor sobre el horneado de tintas en envases curvos.',
    requesterName: 'Patricia Guzmán',
    requesterDept: 'Operaciones & Compras',
    taskType: 'Orden de Compra',
    assignee: 'Benjy',
    generalStatus: 'En Pausa',
    priority: 'Baja',
    complexity: 'S',
    createdAt: '2026-09-25T14:00:00Z',
    startedAt: '2026-09-26T10:00:00Z',
    poNumber: 'PO-8902',
    poProductDesc: 'Frasco ámbar 60ml con serigrafía en blanco hueso',
    poSupplier: 'Otro',
    poSupplierOther: 'Vidriería Monterrey',
    poStatus: 'A la espera de Print cards',
    poDeliveryCommitmentDate: '2026-10-18',
    history: [
      { id: 'h-13', timestamp: '2026-10-02T16:00:00Z', user: 'Benjy', action: 'Pausó orden en espera de muestra física' }
    ]
  },

  // 4. Completados en los últimos 7 días (para el reporte semanal)
  {
    id: 'TSK-111',
    title: 'Diseño de Empaque Secundario para Jabón Artesanal de Romero',
    description: 'Arte final con acabados en bajorrelieve y especificación de papel reciclado certificado FSC.',
    requesterName: 'Ana Morales',
    requesterDept: 'Desarrollo de Producto',
    taskType: 'Diseño General',
    assignee: 'Benjy',
    generalStatus: 'Completado',
    priority: 'Alta',
    complexity: 'L',
    createdAt: '2026-10-01T10:00:00Z',
    startedAt: '2026-10-01T14:00:00Z',
    completedAt: '2026-10-04T17:00:00Z',
    history: [
      { id: 'h-14', timestamp: '2026-10-04T17:00:00Z', user: 'Benjy', action: 'Finalizó tarea y archivó automáticamente' }
    ]
  },
  {
    id: 'TSK-112',
    title: 'PO-8730: Cintas Adhesivas con Branding Corporativo',
    description: 'Tiraje de 300 rollos de cinta canela 48mm impresa a dos tintas para almacén central.',
    requesterName: 'Patricia Guzmán',
    requesterDept: 'Operaciones & Compras',
    taskType: 'Orden de Compra',
    assignee: 'Hilda',
    generalStatus: 'Completado',
    priority: 'Media',
    complexity: 'S',
    createdAt: '2026-09-29T09:00:00Z',
    startedAt: '2026-09-29T10:00:00Z',
    completedAt: '2026-10-03T15:30:00Z',
    poNumber: 'PO-8730',
    poProductDesc: 'Cinta adhesiva acrílica 48mm x 150m con logotipo',
    poSupplier: 'Etimex',
    poStatus: 'Entregado',
    poDeliveryCommitmentDate: '2026-10-03',
    history: [
      { id: 'h-15', timestamp: '2026-10-03T15:30:00Z', user: 'Hilda', action: 'Proveedor confirmó entrega satisfactoria en almacén' }
    ]
  },
  {
    id: 'TSK-113',
    title: 'Campaña: Fin de Semana con Envío Gratis',
    description: 'Pauta relámpago con 12 creatividades dinámicas en Meta y Google Ads.',
    requesterName: 'Sofía Reyes',
    requesterDept: 'E-Commerce',
    taskType: 'Campaña Publicitaria',
    assignee: 'Hilda',
    generalStatus: 'Completado',
    priority: 'Alta',
    complexity: 'M',
    createdAt: '2026-09-30T11:00:00Z',
    startedAt: '2026-10-01T09:00:00Z',
    completedAt: '2026-10-05T18:00:00Z',
    campaignItem: 'Cupón FREESHIP Fin de Semana',
    campaignStartDate: '2026-10-02',
    campaignEndDate: '2026-10-05',
    campaignBudget: 15000,
    campaignStatus: 'Finalizada',
    history: [
      { id: 'h-16', timestamp: '2026-10-05T18:00:00Z', user: 'Hilda', action: 'Campaña concluida con 100% de presupuesto ejecutado' }
    ]
  },
  {
    id: 'TSK-114',
    title: 'Actualización de Gráficos para Catálogo Mayorista PDF',
    description: 'Reemplazo de 14 fotografías de producto y corrección de lista de precios de temporada.',
    requesterName: 'Alberto Castro',
    requesterDept: 'Comercial',
    taskType: 'Diseño General',
    assignee: 'Benjy',
    generalStatus: 'Completado',
    priority: 'Media',
    complexity: 'S',
    createdAt: '2026-10-02T13:00:00Z',
    startedAt: '2026-10-02T14:00:00Z',
    completedAt: '2026-10-03T12:00:00Z',
    history: [
      { id: 'h-17', timestamp: '2026-10-03T12:00:00Z', user: 'Benjy', action: 'Entregó PDF final a Ventas' }
    ]
  },
  {
    id: 'TSK-115',
    title: 'Diseño de Plantillas para Historias de Instagram',
    description: 'Set de 6 templates en Canva/Figma para publicaciones orgánicas del equipo de contenido.',
    requesterName: 'Valeria Soto',
    requesterDept: 'Mercadotecnia',
    taskType: 'Diseño General',
    assignee: 'Hilda',
    generalStatus: 'Completado',
    priority: 'Baja',
    complexity: 'M',
    createdAt: '2026-10-01T15:00:00Z',
    startedAt: '2026-10-02T09:00:00Z',
    completedAt: '2026-10-04T14:00:00Z',
    history: [
      { id: 'h-18', timestamp: '2026-10-04T14:00:00Z', user: 'Hilda', action: 'Entregó enlaces de Figma al equipo' }
    ]
  }
];
