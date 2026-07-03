import { Service, TeamMember, BlogPost } from '../types';

export const SERVICES: Service[] = [
  {
    id: 'commercial-corporate-law',
    title: {
      en: 'Commercial & Corporate Law',
      tr: 'Şirketler ve Ticaret Hukuku',
      ar: 'القانون التجاري وقانون الشركات',
      es: 'Derecho Comercial y Corporativo',
      zh: '商业与公司法'
    },
    description: {
      en: 'Company formations, mergers and acquisitions, commercial contracts and dispute resolution.',
      tr: 'Yerli ve yabancı sermayeli şirket kuruluşu, şube/irtibat bürosu süreçleri ve kurumsal hukuki danışmanlık.',
      ar: 'تأسيس الشركات وعمليات الدمج والاستحواذ والعقود التجارية وتسوية المنازعات.',
      es: 'Constitución de empresas, fusiones y adquisiciones, contratos comerciales y resolución de disputas.',
      zh: '公司设立、并购、商业合同和争议解决。'
    },
    bullets: {
      en: [
        'Company Formations & Incorporation',
        'Mergers & Acquisitions (M&A)',
        'Commercial Contract Management',
        'Corporate Compliance & Governance'
      ],
      tr: [
        'Şirket Kuruluş İşlemleri',
        'Birleşme ve Devralmalar (M&A)',
        'Ticari Sözleşme Yönetimi',
        'Kurumsal Yönetim ve Uyum'
      ]
    },
    icon: 'Briefcase'
  },
  {
    id: 'citizenship-immigration-law',
    title: {
      en: 'Citizenship & Immigration Law',
      tr: 'Vatandaşlık ve Yabancılar Hukuku',
      ar: 'قانون الجنسية والهجرة',
      es: 'Derecho de Ciudadanía e Inmigración',
      zh: '公民与移民法'
    },
    description: {
      en: 'Citizenship applications, residence and work permits, foreigners law and deportation proceedings.',
      tr: 'Gayrimenkul alımı yoluyla vatandaşlık, oturum izinleri ve idari süreçlerin takibi.',
      ar: 'طلبات الجنسية وتصاريح الإقامة والعمل وقانون الأجانب وإجراءات الترحيل.',
      es: 'Solicitudes de ciudadanía, permisos de residencia y trabajo, ley de extranjería y procedimientos de deportación.',
      zh: '公民身份申请、居留和工作许可、外国人法和遣返程序。'
    },
    bullets: {
      en: [
        'Citizenship by Investment',
        'Residence & Work Permits',
        'Deportation Defense Procedures',
        'Foreigners Rights Representation'
      ],
      tr: [
        'Yatırım Yoluyla Vatandaşlık',
        'Oturum ve Çalışma İzinleri',
        'Deport ve Sınır Dışı İşlemleri',
        'Yabancı Hakları Temsili'
      ]
    },
    icon: 'Globe'
  },
  {
    id: 'real-estate-property-law',
    title: {
      en: 'Real Estate & Property Law',
      tr: 'Gayrimenkul ve Taşınmaz Hukuku',
      ar: 'قانون العقارات والملكية',
      es: 'Derecho Inmobiliario y de Propiedad',
      zh: '房地产法'
    },
    description: {
      en: 'Lease law, urban transformation, title deed transactions and condominium disputes.',
      tr: 'Gayrimenkul alım-satım süreçlerinin hukuki denetimi (Due Diligence), tapu işlemleri ve taşınmaz kaynaklı uyuşmazlıklar.',
      ar: 'قانون الإيجار، والتحول الحضري، ومعاملات سندات الملكية، ونزاعات الوحدات السكنية.',
      es: 'Ley de arrendamiento, transformación urbana, transacciones de títulos de propiedad y disputas de condominios.',
      zh: '租赁法、城市转型、契约交易和公寓争议。'
    },
    bullets: {
      en: [
        'Real Estate Due Diligence',
        'Title Deed & Land Registry Transactions',
        'Condominium & Lease Disputes',
        'Urban Transformation Projects'
      ],
      tr: [
        'Gayrimenkul Hukuki Denetimi',
        'Tapu ve Sicil İşlemleri',
        'Kat Mülkiyeti ve Kira Uyuşmazlıkları',
        'Kentsel Dönüşüm Projeleri'
      ]
    },
    icon: 'Home'
  },
  {
    id: 'global-mobility-visa',
    title: {
      en: 'Global Mobility & Visa Services',
      tr: 'Uluslararası Oturum ve Vize İşlemleri',
      ar: 'خدمat التنقل العالمي والتأشيرات',
      es: 'Servicios de Movilidad Global y Visas',
      zh: '全球流动与签证服务'
    },
    description: {
      en: 'Legal support for residency opportunities in the UK, Portugal, Spain, and the USA.',
      tr: 'Yurt dışı oturum programları, vize başvuru dosyalarının hazırlanması ve reddedilen başvurulara hukuki itirazlar.',
      ar: 'الدعم القانوني لفرص الإقامة في المملكة المتحدة والبرتغال وإسبانيا والولايات المتحدة الأمريكية.',
      es: 'Apoyo legal para oportunidades de residencia en el Reino Unido, Portugal, España y los Estados Unidos.',
      zh: '为英国、葡萄牙、西班牙和美国的居留机会提供法律支持。'
    },
    bullets: {
      en: [
        'UK Global Talent & Startup Visas',
        'Golden Visa (Portugal, Spain, Greece)',
        'USA E2 Investor Visa Processing',
        'Visa Denial Appeal Representation'
      ],
      tr: [
        'UK Yetenek ve Girişimci Vizeleri',
        'Golden Visa Programları',
        'ABD E2 Yatırımcı Vizesi',
        'Vize Reddi İtiraz Süreçleri'
      ]
    },
    icon: 'Navigation'
  },
  {
    id: 'inheritance-private-client',
    title: {
      en: 'Inheritance & Private Client Services',
      tr: 'Miras Hukuku ve Gurbetçi Hakları',
      ar: 'الميراث وخدمات العملاء الخاصين',
      es: 'Sucesiones y Servicios para Clientes Privados',
      zh: '继承与私人客户服务'
    },
    description: {
      en: 'Succession planning, inheritance disputes (İzale-i Şuyu), and legal representation for Turkish citizens abroad.',
      tr: 'Emeklilik, askerlik, Mavi Kart, nüfus işlemleri ve Türkiye’deki hakların vekaleten takibi.',
      ar: 'تخطيط الخلافة ومنازعات الميراث والتمثيل القانوني للمواطنين الأتراك في الخارج.',
      es: 'Planificación de sucesiones, disputas de herencia y representación legal para ciudadanos turcos en el extranjero.',
      zh: '继任规划、继承纠纷以及土耳其公民在国外的法律代表。'
    },
    bullets: {
      en: [
        'Succession & Estate Planning',
        'Inheritance Dispute Representation',
        'Blue Card & Military Exemption',
        'Overseas Citizen Pension Rights'
      ],
      tr: [
        'Miras ve Veraset Planlaması',
        'İzale-i Şuyu Davaları',
        'Mavi Kart ve Askerlik İşlemleri',
        'Yurt Dışı Emeklilik Hakları'
      ]
    },
    icon: 'Scale'
  },
  {
    id: 'family-matrimonial-law',
    title: {
      en: 'Family & Matrimonial Law',
      tr: 'Aile Hukuku (Tanıma ve Tenfiz)',
      ar: 'قانون الأسرة والزواج',
      es: 'Derecho de Familia y Matrimonial',
      zh: '家庭与婚姻法'
    },
    description: {
      en: 'Divorce, custody, and recognition and enforcement of foreign court decrees (Tanıma-Tenfiz).',
      tr: 'Yurt dışı boşanma kararlarının Türk nüfus kayıtlarına işlenmesi ve hukuki geçerlilik süreçleri.',
      ar: 'الطلاق والحضانة والاعتراف بالأحكام القضائية الأجنبية وتنفيذها.',
      es: 'Divorcio, custodia y reconocimiento y ejecución de sentencias judiciales extranjeras.',
      zh: '离婚、监护以及外国法院判决的承认与执行。'
    },
    bullets: {
      en: [
        'Recognition of Foreign Divorce Decrees',
        'Enforcement of Custody & Alimony',
        'International Matrimonial Disputes',
        'Civil Status Record Governance'
      ],
      tr: [
        'Yurt Dışı Boşanma Tanıma İşlemleri',
        'Nafaka ve Velayet Tenfizi',
        'Uluslararası Aile İhtilafları',
        'Nüfus Kayıt Güncelleme'
      ]
    },
    icon: 'Heart'
  },
  {
    id: 'data-protection-law',
    title: {
      en: 'Data Protection Law (KVKK)',
      tr: 'Kişisel Verilerin Korunması Hukuku',
      ar: 'قانون حماية البيانات',
      es: 'Ley de Protección de Datos',
      zh: '数据保护法'
    },
    description: {
      en: 'KVKK compliance processes for local and foreign companies, privacy notices, data breach notifications and Board applications.',
      tr: 'Veri envanteri hazırlığı ve sınır ötesi veri aktarımı yönetimi.',
      ar: 'عمليات الامتثال لـ KVKK للشركات المحلية والأجنبية، وإشعارات الخصوصية، وإخطارات خرق البيانات وطلبات المجلس.',
      es: 'Procesos de cumplimiento de KVKK para empresas locales y extranjeras, avisos de privacidad, notificaciones de violación de datos ve solicitudes de la Junta.',
      zh: '本地和外国公司的 KVKK 合规流程、隐私声明、数据泄露通知和委员会申请。'
    },
    bullets: {
      en: [
        'KVKK Compliance Audits',
        'Data Inventory Preparation',
        'Cross-Border Data Transfer Agreements',
        'Privacy Notice (Aydınlatma Metni) Drafting'
      ],
      tr: [
        'KVKK Uyum Denetimleri',
        'Veri Envanteri Hazırlığı',
        'Sınır Ötesi Veri Aktarımı Sözleşmeleri',
        'Aydınlatma Metni Yazımı'
      ]
    },
    icon: 'ShieldCheck'
  },
  {
    id: 'human-rights-administrative',
    title: {
      en: 'Human Rights & Administrative Law',
      tr: 'İnsan Hakları ve İdare Hukuku',
      ar: 'حقوق الإنسان والقانون الإداري',
      es: 'Derechos Humanos y Derecho Administrativo',
      zh: '人权与行政法'
    },
    description: {
      en: 'Constitutional Court and ECtHR individual applications, annulment actions, and protection of fundamental rights.',
      tr: 'AİHM başvuruları ve idari makamların kararlarına karşı iptal ve tam yargı davaları.',
      ar: 'الطلبات الفردية للمحكمة الدستورية والمحكمة الأوروبية لحقوق الإنسان، وإجراءات الإلغاء، وحماية الحقوق الأساسية.',
      es: 'Solicitudes individuales ante el Tribunal Constitucional y el TEDH, acciones de nulidad y protección de derechos fundamentales.',
      zh: '宪法法院和欧洲人权法院的个人申请、无效诉讼以及基本权利的保护。'
    },
    bullets: {
      en: [
        'ECtHR Individual Applications',
        'Constitutional Court Procedures',
        'Administrative Decision Annulments',
        'Human Rights Violation Representation'
      ],
      tr: [
        'AİHM Bireysel Başvuruları',
        'Anayasa Mahkemesi Süreçleri',
        'İdari İşlem İptal Davaları',
        'Hak İhlali Temsili'
      ]
    },
    icon: 'Gavel'
  },
  {
    id: 'labor-employment-law',
    title: {
      en: 'Labor & Employment Law',
      tr: 'İş ve Sosyal Güvenlik Hukuku',
      ar: 'قانون العمل والتوظيف',
      es: 'Derecho Laboral y de Empleo',
      zh: '劳动与就业法'
    },
    description: {
      en: 'Employer-employee relations, employment contracts, collective labor law and labor disputes.',
      tr: 'İşçi-işveren uyuşmazlıklarının çözümü, sözleşme yönetimi ve iş hukuku kaynaklı davaların takibi.',
      ar: 'علاقات العمل والعمال، وعقود العمل، وقانون العمل الجماعي، ونزاعات العمل.',
      es: 'Relaciones empleador-empleado, contratos de trabajo, derecho laboral colectivo y disputas laborales.',
      zh: '劳资关系、劳工合同、集体劳动法和劳动争议。'
    },
    bullets: {
      en: [
        'Employment Contract Drafting',
        'Labor Dispute Resolution',
        'Collective Labor Law Consultancy',
        'Social Security (SGK) Representation'
      ],
      tr: [
        'İş Sözleşmesi Hazırlama',
        'İşçi-İşveren Uyuşmazlıkları',
        'Toplu İş Hukuku Danışmanlığı',
        'Sosyal Güvenlik Hukuku Temsili'
      ]
    },
    icon: 'Users'
  }
];

export const TEAM: TeamMember[] = [
  {
    id: '1',
    name: 'Fetanet Darıoğlu',
    role: {
      en: 'Founder & Principal Lawyer',
      tr: 'Kurucu ve Baş Avukat',
      ar: 'المؤسس والمحامي الرئيسي',
      es: 'Fundadora y Abogada Principal',
      zh: '创始人兼首席律师'
    },
    image: 'https://res.cloudinary.com/dlrsifk2y/image/upload/f_auto,q_auto/fetanet_y230cj',
    email: 'fetanet@resenlegal.com',
    bio: {
      en: 'Fetanet Darıoğlu is an experienced attorney specializing in international mobility, citizenship by investment, and corporate law. With over a decade of practice, she has successfully guided numerous multinational corporations and private clients through complex legal landscapes in Turkey and abroad.',
      tr: 'Fetanet Darıoğlu, uluslararası hareketlilik, yatırım yoluyla vatandaşlık ve şirketler hukuku alanlarında uzmanlaşmış deneyimli bir avukattır. On yılı aşkın mesleki tecrübesiyle, çok sayıda çok uluslu şirkete ve özel müvekkile Türkiye ve yurt dışındaki karmaşık hukuki süreçlerde başarıyla rehberlik etmiştir.'
    }
  },
  {
    id: '2',
    name: 'Yunus Emre Çakmak',
    role: {
      en: 'Senior Lawyer',
      tr: 'Kıdemli Avukat',
      ar: 'محامي أول',
      es: 'Abogado Senior',
      zh: '高级律师'
    },
    image: 'https://res.cloudinary.com/dlrsifk2y/image/upload/v1778682460/yunus_emre_ojdutf.png',
    email: 'yunusemre@resenlegal.com',
    bio: {
      en: 'Yunus Emre Çakmak focuses on commercial litigation and real estate law. He provides strategic counsel on property acquisitions and high-stakes commercial disputes, ensuring robust legal protection for corporate interests.',
      tr: 'Yunus Emre Çakmak, ticari dava takibi ve gayrimenkul hukuku üzerine yoğunlaşmaktadır. Gayrimenkul edinimleri ve yüksek riskli ticari uyuşmazlıklarda stratejik danışmanlık sağlayarak kurumsal çıkarlar için güçlü bir hukuki koruma temin etmektedir.'
    }
  },
  {
    id: '3',
    name: 'Kerim Said Akyüz',
    role: {
      en: 'Senior Lawyer',
      tr: 'Kıdemli Avukat',
      ar: 'محامي أول',
      es: 'Abogado Senior',
      zh: '高级律师'
    },
    image: 'https://res.cloudinary.com/dlrsifk2y/image/upload/v1778682477/kerim_said_pehs5e.png',
    email: 'kerimsaid@resenlegal.com',
    bio: {
      en: 'Kerim Said Akyüz specializes in labor law and administrative proceedings. He represents clients in complex employment disputes and provides comprehensive compliance advice for human resources management.',
      tr: 'Kerim Said Akyüz, iş hukuku ve idari süreçler konusunda uzmanlaşmıştır. Karmaşık iş uyuşmazlıklarında müvekkilleri temsil etmekte ve insan kaynakları yönetimi için kapsamlı uyum danışmanlığı sunmaktadır.'
    }
  },
  {
    id: '4',
    name: 'Emre Aydoğan',
    role: {
      en: 'Business Adviser',
      tr: 'İş Danışmanı',
      ar: 'مستشار أعمال',
      es: 'Asesor de Negocios',
      zh: '业务顾问'
    },
    image: 'https://res.cloudinary.com/dlrsifk2y/image/upload/v1778683723/emre_fqo4uy.jpg',
    email: 'emre@resenlegal.com',
    bio: {
      en: 'Emre Aydoğan provides strategic business consulting for international ventures entering the Turkish market. His expertise lies in market analysis, regulatory compliance, and cross-border business development.',
      tr: 'Emre Aydoğan, Türkiye pazarına giren uluslararası girişimler için stratejik iş danışmanlığı sağlamaktadır. Uzmanlık alanı pazar analizi, mevzuata uyum ve sınır ötesi iş geliştirme konularını kapsamaktadır.'
    }
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: {
      en: 'Navigating EU Immigration Post-Brexit',
      tr: 'Brexit Sonrası AB Göçmenliğinde Yol Almak',
      ar: 'التنقل في الهجرة إلى الاتحاد الأوروبي بعد خروج بريطانيا',
      es: 'Navegando la inmigración en la UE después del Brexit',
      zh: '脱欧后的欧盟移民导航'
    },
    excerpt: {
      en: 'A comprehensive guide to new residency requirements and mobility rights.',
      tr: 'Yeni ikamet gereksinimleri ve hareketlilik hakları için kapsamlı bir rehber.',
      ar: 'دليل شامل لمتطلبات الإقامة الجديدة وحقوق التنقل.',
      es: 'Una guía completa sobre los nuevos requisitos de residencia y derechos de movilidad.',
      zh: '关于新居留要求和流动权利的全面指南。'
    },
    content: { en: 'Full content here...' },
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=800&auto=format&fit=crop',
    date: '2024-05-10',
    category: 'Immigration'
  },
  {
    id: '2',
    title: {
      en: 'Corporate Governance in the Digital Age',
      tr: 'Dijital Çağda Kurumsal Yönetişim',
      ar: 'حورمة الشركات في العصر الرقمي',
      es: 'Gobierno Corporativo en la Era Digital',
      zh: '数字时代的企业治理'
    },
    excerpt: {
      en: 'Understanding the impact of AI and data privacy on board decisions.',
      tr: 'Yapay zeka ve veri gizliliğinin yönetim kurulu kararları üzerindeki etkisini anlamak.',
      ar: 'فهم تأثير الذكاء الاصطناعي وخصوصية البيانات على قرارات مجلس الإدارة.',
      es: 'Entender el impacto de la IA y la privacidad de datos en las decisiones de la junta.',
      zh: '了解人工智能和数据隐私对董事会决策的影响。'
    },
    content: { en: 'Full content here...' },
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop',
    date: '2024-05-12',
    category: 'Private International Law'
  }
];
