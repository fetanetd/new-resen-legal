export interface ServiceSection {
  title: string;
  subtitle?: string;
  paragraphs: string[];
  bulletPoints?: {
    title: string;
    description: string;
    statuteRef?: string;
  }[];
  calloutBox?: {
    type: 'advisory' | 'warning' | 'strategy';
    title: string;
    content: string;
  };
  tableData?: {
    headers: string[];
    rows: string[][];
  };
}

export interface ServiceRelatedArticleRef {
  slug: string;
  title: string;
  badge: string;
  description: string;
}

export interface DetailedServiceContent {
  id: string;
  wordCountTarget: string;
  metaKeywords: string[];
  leadSummary: {
    tr: string;
    en: string;
  };
  sections: {
    tr: ServiceSection[];
    en: ServiceSection[];
  };
  relatedArticles: {
    tr: ServiceRelatedArticleRef[];
    en: ServiceRelatedArticleRef[];
  };
  faqList: {
    tr: { question: string; answer: string }[];
    en: { question: string; answer: string }[];
  };
}

export const PRIORITY_SERVICE_IDS = [
  'citizenship-immigration-law',
  'global-mobility-visa',
  'real-estate-property-law',
  'commercial-corporate-law'
] as const;

export const PRIORITY_SERVICES_DETAILED_CONTENT: Record<string, DetailedServiceContent> = {
  'citizenship-immigration-law': {
    id: 'citizenship-immigration-law',
    wordCountTarget: '1,200 - 1,450 words',
    metaKeywords: [
      'Türk vatandaşlığı başvurusu',
      'yatırım yoluyla vatandaşlık',
      '5901 sayılı kanun',
      '6458 sayılı YUKK',
      'oturum izni uzatma',
      'sınır dışı kararı iptal davası',
      'deport kaldırma',
      'uygunluk belgesi gayrimenkul',
      'Danıştay vatandaşlık iptali kararları',
      'insani ikamet izni',
      'aile ikamet izni',
      '18 yaşından sonra soybağı vatandaşlık'
    ],
    leadSummary: {
      tr: 'Resen Hukuk & Danışmanlık olarak; 5901 sayılı Türk Vatandaşlığı Kanunu ve 6458 sayılı Yabancılar ve Uluslararası Koruma Kanunu (YUKK) çerçevesinde, Türkiye’de yabancı ülke vatandaşlarının haklarını, yatırıma dayalı vatandaşlık süreçlerini, ikamet ve çalışma izinlerini ile idari tahdit kodlarına karşı yargı yollarını uçtan uca temsil ediyoruz. Dosyalarımız; idari yargı içtihatları, Danıştay kararları ve güncel göç regülasyonları ışığında çok katmanlı risk analizi yapılarak yönetilir.',
      en: 'Resen Legal provides premier legal representation under the Turkish Citizenship Law No. 5901 and the Law on Foreigners and International Protection No. 6458 (LFIP). We steer citizenship by investment acquisitions, residency and work permits, deportation defense, and administrative court litigation against entry bans. Every client matter is structured through rigorous regulatory compliance, Danıştay appellate jurisprudence, and proactive risk insulation.'
    },
    sections: {
      tr: [
        {
          title: '1. Yatırım Yoluyla Türk Vatandaşlığı ve Hukuki Denetim Mimarisi',
          subtitle: 'Mevzuat: 5901 Sayılı Türk Vatandaşlığı Kanunu m.12 ve Uygulama Yönetmeliği m.20',
          paragraphs: [
            'Türkiye’de yatırım yoluyla istisnai vatandaşlık kazanımı; en az 400.000 Amerikan Doları veya karşılığı döviz tutarındaki taşınmazın tapu siciline 3 yıl satılmama şerhi konularak iktisap edilmesi, en az 500.000 Amerikan Doları tutarında mevduatın Türk bankalarında 3 yıl tutulması veya eşdeğer fon araçlarının satın alınması esasına dayanır. İlk kritik hukuki eşik, ilgili bakanlıktan "Uygunluk Belgesi" (Certificate of Conformity) temin edilmesidir.',
            'Yatırım bedelinin transferinde Döviz Alım Belgesi (DAB) tanzimi, değerleme raporlarının SPK lisanslı uzmanlarca mevzuata tam uyumlu hazırlanması ve banka blokaj metinleri büromuzca bizzat yürütülür. Gayrimenkulün geçmişindeki haciz, ipotek, hisse uyuşmazlıkları ve imar kısıtlamaları taranarak yatırımcının sermayesi teminat altına alınır.',
            'Büromuzun "Yatırım Yoluyla Türk Vatandaşlığı Hukuki Rehberi" çalışmasında da vurguladığımız üzere; SPK değerleme tutarı, DAB döviz kaydı ve tapudaki resmi satış bedeli birbirini kuruşu kuruşuna teyit etmelidir. Usuli hatalar başvurunun reddine ve sürecin kilitlenmesine yol açabilir.'
          ],
          calloutBox: {
            type: 'advisory',
            title: 'Kritik İnceleme Noktası: Değerleme ve Ödeme Zinciri',
            content: 'Banka dekontlarındaki açıklamalar, DAB belgesi döviz kayıtları ve tapu resmi senedindeki beyanlar birebir örtüşmelidir. Yapılacak en küçük usuli hata Uygunluk Belgesi talebinin reddedilmesine neden olabilir.'
          }
        },
        {
          title: '2. Vatandaşlığın İptali ve Geri Alınması Uyuşmazlıkları (Danıştay İçtihatları)',
          subtitle: '5901 Sayılı Kanun m.31 (İptal) ile m.40 (Geri Alma) Arasındaki Hayati Ayrım',
          paragraphs: [
            'Geçmişe dönük güvenlik ve değerleme teftişleri sonucunda tesis edilen vatandaşlık iptalleri ciddi hukuki ihtilaflara yol açmaktadır. 5901 sayılı Kanun m.31, vatandaşlığın yalan beyan veya önemli hususları gizlemek suretiyle kazanılması halinde "iptal" edileceğini düzenlerken; m.40, idarenin kendi açık hatası sebebiyle kararı geri almasını düzenler.',
            'Danıştay’ın yerleşik içtihatlarına göre, vatandaşlığın iptali için somut, yeterli ve hukuken denetlenebilir deliller zorunludur. Soyut güvenlik değerlendirmeleri veya değerleme raporundaki kur farkları iptal sebebi yapılamaz. Ayrıca, yatırımcı hakkındaki bir işlem dürüst niyetli eş ve çocuklara sirayet ettirilemez; her fert bağımsız değerlendirilir.',
            'Nüfus ve Vatandaşlık İşleri Genel Müdürlüğü ile İçişleri Bakanlığı iptal işlemlerine karşı yetkili Ankara İdare Mahkemelerinde yürütmenin durdurulması istemli iptal davaları açıyoruz. Detaylı analiz için "Kazanılan Türk Vatandaşlığının İptali ve Geri Alınması Davaları" incelememize başvurabilirsiniz.'
          ],
          bulletPoints: [
            {
              title: 'İdare Mahkemesinde 60 Günlük Dava Süresi',
              description: 'İptal veya geri alma kararlarına karşı, tebliğden itibaren 60 gün içinde yürütmeyi durdurma talepli iptal davası açılmalıdır.',
              statuteRef: '2577 sayılı İYUK m.7 ve m.27'
            },
            {
              title: 'Kazanılmış Hakların ve Masumiyetin Korunması',
              description: 'İdarenin tek taraflı tasarruflarına karşı Danıştay ve AYM kararları emsal gösterilerek mülkiyet ve vatandaşlık bağı savunulur.'
            }
          ]
        },
        {
          title: '3. İkamet İzinleri Mimarisi, Uzatma Süreçleri ve Ret Kararlarına Karşı Yargı Yolu',
          subtitle: '6458 Sayılı Kanun m.31-33 Kısa Dönem, Taşınmaz, Turizm ve Uzatma Mimarisi',
          paragraphs: [
            'Türkiye’de ikamet izinleri; taşınmaz iktisabı, turistik amaç, ticari bağlantı, aile birleşimi, öğrenim ve insani gerekçelerle sınıflandırılmıştır. Göç İdaresi Başkanlığı tarafından uygulanan 200.000 USD değerleme eşiği ve kapalı mahalle kotaları, dosya sunulmadan önce titiz strateji gerektirir.',
            'İkamet izinlerinin uzatılmasında, mevcut iznin bitişine 60 gün kalmasından itibaren uzatma başvurusu yapılmalıdır. Yabancının UETS elektronik tebligat adresi alması ve Nüfus Müdürlüğü Mekansal Adres Kayıt Sistemi’ne (MAKS) tescilli konutta fiilen ikamet ettiğini kanıtlaması zorunludur.',
            'Ret tebliğ edildiğinde yabancıya 10 gün içinde Türkiye’yi terk etmesi ihtar edilir. Bu tebligata karşı 60 gün içinde İdare Mahkemesinde Yürütmenin Durdurulması talepli iptal davası açılarak yasal kalış korunur. Rehberlerimiz: "Türkiye’de İkamet İzni Türleri" ve "Türkiye’de İkamet İzni Uzatma Başvurusu".'
          ]
        },
        {
          title: '4. Sınır Dışı (Deport), İdari Gözetim ve Tahdit Kodlarının Kaldırılması',
          subtitle: 'G-87, Ç-114, Ç-141 Kodları ve Geri Gönderme Merkezleri (GGM) Süreçleri',
          paragraphs: [
            'Kamu düzeni veya güvenliği gerekçeleriyle verilen sınır dışı etme kararları (YUKK m.54) ve idari gözetim kararları (YUKK m.57), kişi hürriyetini doğrudan kısıtlayan en ağır idari işlemlerdir. Resen Hukuk ekibi, Çatalca, Tuzla ve Türkiye genelindeki GGM merkezlerinde tutulan yabancılar için ivedi hukuki müdahale sağlar.',
            'Sınır dışı etme kararına karşı tebliğden itibaren **7 gün** içinde İdare Mahkemesinde dava açılması, sınır dışı işlemini mahkeme karar verene kadar kanunen kendiliğinden durdurur. İdari gözetim kararlarına karşı ise Sulh Ceza Hakimliğine itiraz edilerek yabancının derhal tahliyesi sağlanır.',
            'İstihbari gerekçelerle konulan tahdit kodlarının (terör şüphesi G-87, kamu düzeni Ç-114, adli işlem Ç-141, sahte belge Ç-113 vb.) kaldırılması için Ankara İdare Mahkemelerinde iptal davaları açılır. Detaylar: "Sınır Dışı (Deport) Kararı ve İdari Gözetim Süreci".'
          ],
          calloutBox: {
            type: 'warning',
            title: '7 Günlük Hak Düşürücü Süreye Dikkat Ediniz',
            content: 'Sınır dışı (deport) kararlarında dava açma süresi genel 60 gün DEĞİL, yalnızca 7 gündür. Bu süre kaçırılırsa yabancının cebren menşe ülkeye gönderilme riski doğar.'
          }
        },
        {
          title: '5. Aile Birleşimi ve İnsani İkamet İzni (YUKK m.34 & m.46)',
          subtitle: 'Olağanüstü Koşullarda Koruma ve Aile Bütünlüğünün Hukuki Güvencesi',
          paragraphs: [
            'Türk vatandaşlarının veya ikamet izni sahiplerinin yabancı eş ve reşit olmayan çocukları için düzenlenen Aile İkamet İzni (YUKK m.34), aile birliğinin anayasal güvencesidir. Destekleyicinin asgari ücreti aşan geliri, sağlık sigortası ve adli sicil kaydı titizlikle dosyalanır.',
            'Öte yandan; menşe ülkesinde işkence riski bulunan, seyahat etmesi tıbben hayati tehlike yaratan ya da sınır dışı kararı alınmış olsa dahi çıkışı imkansız olan yabancılar için YUKK m.46 kapsamında İnsani İkamet İzni devreye girer. Valilik teklifi ve Genel Müdürlük onayıyla verilen bu izin yabancıya yasal statü kazandırır.',
            'Aile birleşimi ve insani ikamet konularını "Türkiye’de Aile Birleşimi İkamet İzni" ve "Türkiye’de İnsani İkamet İzni Nasıl Alınır" makalelerimizden inceleyebilirsiniz.'
          ]
        },
        {
          title: '6. Soybağı ile Türk Vatandaşlığının Tescili ve Çalışma İzinleri',
          subtitle: '5901 Sayılı Kanun m.7 Doğumla Kazanılan Vatandaşlığın 18 Yaşından Sonra Tespiti',
          paragraphs: [
            'Türk vatandaşı anne veya babadan doğan kişilerin vatandaşlığı doğum anından itibaren tescil edilebilir. 18 yaşından sonra yapılan başvurularda DNA testi, arşiv araştırmaları ve tanık beyanları gibi delillerin doğru sunulması gereklidir. Detaylı rehberimiz: "18 Yaşından Sonra Soybağı ile Türk Vatandaşlığı Tescili".',
            'Yabancı personeller ve şirket ortakları için 6735 sayılı Kanun kapsamında Çalışma Bakanlığı’ndan çalışma izni alınması süreçlerinde ise 5 Türk istihdamı kriteri ve sermaye şartları analiz edilerek kurumsal başvurular yönetilir. Çalışma izni onaylanan yabancı, ikamet izni alma zorunluluğundan muaftır.'
          ]
        }
      ],
      en: [
        {
          title: '1. Turkish Citizenship by Investment & Legal Due Diligence',
          subtitle: 'Governed by Law No. 5901 Article 12 and Enforcement Regulation Article 20',
          paragraphs: [
            'Acquiring Turkish citizenship through exceptional investment requires acquiring real estate valued at no less than USD 400,000 (with a mandatory 3-year non-sale registry annotation), depositing USD 500,000 in Turkish banks for 3 years, or subscribing to sovereign debt instruments. The initial cornerstone is obtaining a formal Certificate of Conformity from the Ministry of Environment, Urbanization and Climate Change.',
            'Our legal counsel oversees every nuance: Foreign Exchange Purchase Certificate (DAB) issuance, SPK-licensed certified property valuations, clear-title verifications, and escrow transfers. Prior to acquisition, we inspect encumbrances, judicial liens, zoning limits, and condominium records to secure both capital and naturalization validity.',
            'As highlighted in our "Turkish Citizenship by Investment Legal Guide", the certified appraisal value, DAB records, and declared title deed price must demonstrate exact alignment. Technical deficiencies trigger immediate ministerial rejections.'
          ],
          calloutBox: {
            type: 'advisory',
            title: 'Audit Warning: Valuation & Payment Alignment',
            content: 'Bank receipts, DAB records, and title deed declarations must exhibit exact transaction harmony. Discrepancies between valuation figures and wire transcripts are the leading cause of Conformity Certificate rejections.'
          }
        },
        {
          title: '2. Citizenship Revocation & Annulment Defense (Council of State Jurisprudence)',
          subtitle: 'The Strategic Divide between Law No. 5901 Article 31 and Article 40',
          paragraphs: [
            'Recent administrative audits targeting retroactive citizenship grants have led to widespread revocation proceedings. Law No. 5901 Article 31 governs the annulment of citizenship acquired through fraudulent disclosures. Article 40 of Law No. 5901 concerns the withdrawal of citizenship acquisition or loss decisions where it is later understood that the legal conditions were not fulfilled or that the decision was issued repeatedly. Each case requires a separate assessment of the original legal basis, administrative file, and the reason relied upon by the authority.',
            'According to settled Council of State (Danıştay) precedents, revocation mandates concrete, verifiable, and legally substantiated findings. Vague intelligence notations or minor valuation currency variances do not constitute legitimate grounds for revocation. The effect of a citizenship cancellation or annulment decision on spouses and children depends on whether their citizenship was acquired independently or derivatively through the principal applicant. The legal position of each family member must therefore be assessed separately under Law No. 5901, including Article 32.',
            'Resen Legal formulates tailored legal strategies and initiates urgent annulment actions and stay of execution requests against cancellation decrees. Actions are filed before the competent administrative court, often Ankara depending on the issuing authority and the administrative act in question, subject to current legislation and administrative practice. Read our authoritative brief: "Annulment & Revocation of Granted Turkish Citizenship: Court Precedents".'
          ],
          bulletPoints: [
            {
              title: 'Strict 60-Day Litigation Window',
              description: 'Lawsuits demanding stay of execution against citizenship revocation orders must be lodged within 60 days of official notification.',
              statuteRef: 'Law on Administrative Procedure No. 2577 Arts. 7 & 27'
            },
            {
              title: 'Preservation of Acquired Rights',
              description: 'We argue constitutional protections, property guarantees, and fundamental citizenship security under ECHR jurisprudence.'
            }
          ]
        },
        {
          title: '3. Residence Permit Architecture, Extension Protocols & Injunctions',
          subtitle: 'Law No. 6458 (LFIP) Short-Term, Real Estate, Tourism, and Extension Compliance',
          paragraphs: [
            'Residence permits are categorized into real estate ownership, tourism, business connectivity, family reunification, higher education, and humanitarian relief. With recent regulatory hurdles, including the USD 200,000 real estate valuation floor and closed neighborhood quotas, applications require proactive dossier design before filing with the Migration Directorate (PMM).',
            'For residence permit extensions, applications must be submitted within 60 days prior to permit expiration. Applicants must also secure a registered National Electronic Notification System (UETS) address and establish verifiable residency within the Civil Registry’s Spatial Address Registration System (MAKS).',
            'Upon rejection, foreigners receive a notice compelling departure within 10 days. Lodging an annulment lawsuit in the Administrative Court with a Stay of Execution request within 60 days legally protects residents from deportation. Consult our guides: "Turkish Residence Permits: Strategic Overview" and "How to Renew a Turkish Residence Permit".'
          ]
        },
        {
          title: '4. Deportation Defense, Administrative Detention & Removal of Entry Bans',
          subtitle: 'Managing G-87, Ç-114, Ç-141 Restriction Codes and Removal Centers (GGM)',
          paragraphs: [
            'Deportation orders (LFIP Art. 54) and administrative detention decisions (LFIP Art. 57) severely curtail physical freedom. Resen Legal delivers immediate emergency interventions across Removal Centers (Geri Gönderme Merkezleri - GGM) including Çatalca, Tuzla, and facilities nationwide.',
            'Filing an annulment lawsuit before the competent administrative court within **7 calendar days** of deportation notification generally suspends removal proceedings by operation of law pending judicial resolution, subject to statutory criteria under LFIP Art. 53. For detention, we petition the competent Peace Criminal Judicature for release on supervisory reporting measures based on case-specific evaluation.',
            'Restriction codes (such as terror suspicion G-87, public order Ç-114, judicial inquiry Ç-141, and document irregularities Ç-113) are challenged through specialized annulment lawsuits before the competent administrative court, frequently Ankara depending on the issuing authority and administrative record. Review our publication: "Deportation Decisions & Administrative Detention in Turkey".'
          ],
          calloutBox: {
            type: 'warning',
            title: 'Critical 7-Day Deadline',
            content: 'Deportation appeals must be filed within 7 days, unlike the standard 60-day window. Missing this timeframe renders deportation enforceable immediately.'
          }
        },
        {
          title: '5. Family Reunification & Humanitarian Residence Permits (LFIP Arts. 34 & 46)',
          subtitle: 'Preserving Core Family Integrity & Exceptional Protective Relief',
          paragraphs: [
            'Family Residence Permits granted to foreign spouses and minor children of Turkish nationals or valid permit holders safeguard family integrity under constitutional and European conventions. Filings require substantiating comprehensive healthcare insurance and sufficient income surpassing statutory benchmarks.',
            'Concurrently, foreigners who cannot be repatriated due to extraordinary armed conflicts, medical emergencies, or well-founded risks of inhuman treatment may be granted a Humanitarian Residence Permit under Article 46 of Law No. 6458 upon ministerial approval, providing full legal residency.',
            'Explore our focused publications: "Family Reunification Residence Permits in Turkey" and "How to Obtain a Humanitarian Residence Permit in Turkey".'
          ]
        },
        {
          title: '6. Lineage-Based Citizenship & Ministry of Labor Work Permits',
          subtitle: 'Naturalization via Paternity/Maternity Registration under Law No. 5901 Art. 7',
          paragraphs: [
            'Individuals born to a Turkish mother or father retain the statutory right to establish citizenship retroactively from birth, including determinations finalized past 18 years of age. Filings require forensic DNA documentation, sworn archival records, and civil registry rectification lawsuits. Read our guide: "Registration of Turkish Citizenship by Paternity After Age 18".',
            'For corporate personnel and shareholders, we coordinate Ministry of Labor and Social Security work permits under Law No. 6735, evaluating statutory capitalization thresholds, employee evaluation criteria, and applicable exemption grounds based on case-specific assessment. A valid work permit legally supersedes the necessity of a separate residence permit.'
          ]
        }
      ]
    },
    relatedArticles: {
      tr: [
        {
          slug: 'yatirim-yoluyla-kazanilan-turk-vatandasliginin-iptali-ve-geri-alinmasi',
          title: 'Kazanılan Türk Vatandaşlığının İptali ve Geri Alınması Davaları',
          badge: 'Danıştay İçtihatları',
          description: '5901 sayılı Kanun m.31 ve m.40 kapsamında idari iptallere karşı yürütmeyi durdurma ve dava stratejisi.'
        },
        {
          slug: 'turkish-citizenship-by-investment-legal-guide',
          title: 'Yatırım Yoluyla Türk Vatandaşlığı Hukuki Rehberi',
          badge: 'Yatırım & Vatandaşlık',
          description: 'Gayrimenkul alımı, $400.000 barajı, Uygunluk Belgesi ve tapu süreçlerinin adım adım analizi.'
        },
        {
          slug: 'turkiyede-sinir-disi-karari-ve-idari-gozetim-sureci',
          title: 'Sınır Dışı (Deport) Kararı ve İdari Gözetim Süreci',
          badge: 'Deport Savunması',
          description: '7 günlük dava açma süresi, GGM tahliye başvuruları ve tahdit kodlarının kaldırılması.'
        },
        {
          slug: 'turkiyede-ikamet-izni-turleri-kritik-farklar-ve-basvuru-rehberi',
          title: 'Türkiye’de İkamet İzni Türleri ve Ret Kararlarına Karşı Yargı Yolu',
          badge: 'Oturum İzinleri',
          description: 'Taşınmaz, turistik ve insani ikamet izinlerinde güncel kriterler ve mahkeme süreçleri.'
        },
        {
          slug: 'turkiyede-ikamet-izni-uzatma-basvurusu-nasil-yapilir',
          title: 'Türkiye’de İkamet İzni Uzatma Başvurusu Nasıl Yapılır?',
          badge: 'Oturum Uzatma',
          description: '60 günlük başvuru süresi, UETS elektronik tebligat ve adres tescil zorunlulukları.'
        },
        {
          slug: 'turkey-family-reunification-residence-permit-spouse-child',
          title: 'Türkiye’de Aile Birleşimi İkamet İzni Rehberi',
          badge: 'Aile İkameti',
          description: 'Destekleyici kriterleri, gelir ve sigorta şartları ile eş ve çocukların hakları.'
        },
        {
          slug: 'babasi-turk-olan-kisinin-18-yasindan-sonra-turk-vatandasliginin-tescili',
          title: '18 Yaşından Sonra Soybağı ile Türk Vatandaşlığı Tescili',
          badge: 'Soybağı Tescili',
          description: 'Evlilik dışı doğum, babalık davası, DNA raporu ve Nüfus Müdürlüğü başvuru adımları.'
        },
        {
          slug: 'turkiyede-insani-ikamet-izni-nasil-alinir',
          title: 'Türkiye’de İnsani İkamet İzni Nasıl Alınır?',
          badge: 'İnsani İkamet',
          description: '6458 sayılı YUKK m.46, sınır dışı edilememe halleri ve olağanüstü koruma şartları.'
        }
      ],
      en: [
        {
          slug: 'yatirim-yoluyla-kazanilan-turk-vatandasliginin-iptali-ve-geri-alinmasi',
          title: 'Annulment & Revocation of Granted Turkish Citizenship: Court Precedents',
          badge: 'Litigation & Defense',
          description: 'Defense mechanics against administrative revocation under Law No. 5901 Articles 31 and 40.'
        },
        {
          slug: 'turkish-citizenship-by-investment-legal-guide',
          title: 'Turkish Citizenship by Investment: The Comprehensive Legal Guide',
          badge: 'Investment Naturalization',
          description: 'Detailed roadmap on the USD 400K real estate threshold, conformity certification, and land registry clearance.'
        },
        {
          slug: 'turkiyede-sinir-disi-karari-ve-idari-gozetim-sureci',
          title: 'Deportation Decisions & Administrative Detention in Turkey',
          badge: 'Removal Defense',
          description: 'Crucial 7-day court appeal timeline, removal center release procedures, and entry ban removals.'
        },
        {
          slug: 'turkiyede-ikamet-izni-turleri-kritik-farklar-ve-basvuru-rehberi',
          title: 'Turkish Residence Permits: Strategic Guide & Rejection Remedies',
          badge: 'Residency Guidance',
          description: 'Navigating real estate criteria, quota limits, and administrative court stay of execution filings.'
        },
        {
          slug: 'turkiyede-ikamet-izni-uzatma-basvurusu-nasil-yapilir',
          title: 'How to Renew a Turkish Residence Permit: Deadlines & UETS Compliance',
          badge: 'Residency Renewal',
          description: 'The 60-day renewal timeline, electronic postal notifications, and civil registry address verification.'
        },
        {
          slug: 'turkey-family-reunification-residence-permit-spouse-child',
          title: 'Family Reunification Residence Permits in Turkey',
          badge: 'Family Reunification',
          description: 'Sponsor qualification, medical insurance mandates, and derivative residency rights for spouses and children.'
        },
        {
          slug: 'babasi-turk-olan-kisinin-18-yasindan-sonra-turk-vatandasliginin-tescili',
          title: 'Registration of Turkish Citizenship by Paternity After Age 18',
          badge: 'Lineage Naturalization',
          description: 'Out-of-wedlock birth determinations, DNA evidence, paternity lawsuits, and civil registry naturalization.'
        },
        {
          slug: 'turkiyede-insani-ikamet-izni-nasil-alinir',
          title: 'How to Obtain a Humanitarian Residence Permit in Turkey',
          badge: 'Humanitarian Relief',
          description: 'LFIP Article 46 statutory criteria, non-refoulement protections, and exceptional residency grants.'
        }
      ]
    },
    faqList: {
      tr: [
        {
          question: 'Yatırım yoluyla vatandaşlık başvurusunda birden fazla tapu birleştirilebilir mi?',
          answer: 'Evet; aynı gün veya farklı zamanlarda satın alınan birden fazla gayrimenkulün toplam bedeli en az 400.000 Amerikan Doları karşılığına ulaşıyorsa tek bir dosyada birleştirilerek Uygunluk Belgesi alınabilir. Ancak taşınmazların SPK değerleme raporlarının da bu toplamı teyit etmesi ve her bir tapu için DAB belgesinin düzenlenmiş olması zorunludur.'
        },
        {
          question: 'Kazanılmış Türk vatandaşlığı hangi durumlarda iptal edilir ve dava süresi nedir?',
          answer: '5901 sayılı Kanun m.31 uyarınca vatandaşlık; yalan beyan veya önemli hususların gizlenmesi suretiyle kazanılmışsa iptal edilebilir. Bu karara karşı tebliğden itibaren 60 gün içinde Ankara İdare Mahkemelerinde yürütmenin durdurulması istemli iptal davası açılmalıdır. İptal kararı aile fertlerine otomatik olarak uygulanamaz.'
        },
        {
          question: 'İkamet izni reddedilen bir yabancı ne kadar süre içinde dava açmalıdır?',
          answer: 'Ret kararının tebliğ edildiği tarihten itibaren 60 gün içinde yetkili İdare Mahkemesinde yürütmenin durdurulması istemli iptal davası açılmalıdır. Ancak tebliğde 10 günlük terk süresi yer aldığı için, dava ve yürütmeyi durdurma talebinin derhal mahkemeye intikal ettirilmesi önerilir.'
        },
        {
          question: 'Sınır dışı (deport) kararına karşı açılan dava sınır dışı işlemini otomatik durdurur mu?',
          answer: 'Evet. 6458 sayılı Kanun m.53/3 uyarınca, sınır dışı etme kararına karşı 7 gün içinde açılan iptal davası, mahkemece karar verilinceye kadar sınır dışı etme işlemini kanunen kendiliğinden durdurur (kamu güvenliği ve terör istisnaları hariç).'
        }
      ],
      en: [
        {
          question: 'Can multiple property acquisitions be combined for the USD 400,000 threshold?',
          answer: 'Yes. Multiple real estate purchases whose aggregate valuation equals or exceeds USD 400,000 can be consolidated to obtain a unified Certificate of Conformity, provided certified SPK valuations and DAB records authenticate the cumulative value.'
        },
        {
          question: 'Under what circumstances can granted Turkish citizenship be revoked?',
          answer: 'Pursuant to Law No. 5901 Art. 31, citizenship can only be annulled if acquired through fraudulent disclosure or concealment of material facts. Annulments must be contested within 60 days before the Ankara Administrative Courts with an urgent stay of execution request.'
        },
        {
          question: 'What is the exact litigation deadline for a rejected residence permit?',
          answer: 'An annulment lawsuit requesting a stay of execution must be submitted to the Administrative Court within 60 days of formal service. Because departure is demanded within 10 days, immediate court filings are essential.'
        },
        {
          question: 'Does filing an appeal against a deportation order suspend removal automatically?',
          answer: 'Yes. Pursuant to Article 53/3 of Law No. 6458, filing an annulment action within the mandatory 7-day period suspends removal proceedings by operation of law until judicial adjudication.'
        }
      ]
    }
  },

  'global-mobility-visa': {
    id: 'global-mobility-visa',
    wordCountTarget: '1,200 - 1,500 words',
    metaKeywords: [
      'Portekiz D7 vizesi',
      'Portekiz D8 dijital göçebe vizesi',
      'Portekiz D2 girişimci vizesi',
      'İngiltere şirket kuruluşu',
      'UK Innovator Founder',
      'UK Self-Sponsorship',
      'Schengen vize reddi itiraz',
      'küresel oturum danışmanlığı',
      'İngiltere ev alımı vergi SDLT',
      'İspanya Golden Visa',
      'AIMA oturum kartı',
      'çifte vergilendirmeyi önleme ÇVÖA'
    ],
    leadSummary: {
      tr: 'Resen Hukuk & Danışmanlık, İstanbul ve Londra ekseninde küresel hareketlilik, Avrupa Birliği oturum programları, Birleşik Krallık şirketleşme ve sponsorluk modelleri ile vize retlerine karşı idari itiraz alanında uzmanlaşmış uluslararası bir hukuk kadrosuna sahiptir. Müvekkillerimizin sermaye, mesleki birikim ve aile hedeflerini; Portekiz (D7, D8, D2), Birleşik Krallık (Expansion Worker, Self-Sponsorship) ve Schengen coğrafyasındaki en sağlam yasal koruma kalkanıyla buluşturuyoruz. Süreçleri yalnızca vize formu doldurma düzeyinde değil; sınır ötesi vergi hukuku, şirketler hukuku ve mülkiyet haklarını gözeten bütüncül bir mimariyle yönetiyoruz.',
      en: 'Operating seamlessly across Istanbul and London, Resen Legal delivers bespoke legal architectures for cross-border global mobility, European Union residency programs, UK corporate sponsorship pathways, and administrative appeals against consular visa rejections. We harmonize family wealth, enterprise capital, and professional careers with robust statutory residency pathways across Portugal (D7, D8, D2), the United Kingdom (Expansion, Self-Sponsorship), and the Schengen area. We design these matters not merely as bureaucratic filings, but as integrated fiscal, corporate, and private-client strategies.'
    },
    sections: {
      tr: [
        {
          title: '1. Portekiz Oturum Programları: D7, D8 ve D2 Vizesi Hukuki Mimarisi',
          subtitle: 'AIMA Entegrasyonu, Portekiz Konsoloslukları ve 5 Yılda AB Vatandaşlığı Yolu',
          paragraphs: [
            'Portekiz, Avrupa Birliği içinde sağladığı 5 yıl sonunda vatandaşlık başvurusu hakkı ve Schengen serbest dolaşım ayrıcalığı ile uluslararası yatırımcıların ve profesyonellerin ilk tercihidir. Sürecin başarısı; Türkiye’deki Portekiz Konsolosluğu başvuru aşaması ile Portekiz’deki AIMA (Göç ve İltica Ajansı), vergi dairesi (Finanças) ve banka entegrasyonunun eşzamanlı ve senkronize yürütülmesine bağlıdır.',
            'Büromuz, Portekiz’de NIF (Vergi Numarası) alımı, yerel banka hesabı açılışı, kira sözleşmesi temini ve dosya hukuki hazırlık sürecini doğrudan yöneterek konsolosluk randevusundan Lizbon veya Porto’daki biyometri randevusuna kadar eksiksiz temsil sağlar. Başvuru sahibinin gelir türüne göre (emekli maaşı, temettü, kira, uzaktan çalışma bordrosu veya girişim sermayesi) en uygun vize kategorisi belirlenir.',
            'Portekiz Parlamentosu tarafından onaylanan güncel vatandaşlık kanunu reformu uyarınca, 5 yıllık yasal ikamet süresi ilk vize başvuru tarihinden itibaren hesaplanmaya başlamaktadır. Bu reform, AIMA nezdindeki bürokratik randevu gecikmelerinin başvuru sahibinin aleyhine işlemesini engellemekte ve vatandaşlık takvimini hızlandırmaktadır.',
            'Ayrıntılı prosedürler, banka mevduat tutarları ve konsolosluk dosya hazırlığı için hazırladığımız özel rehberlerimizi inceleyebilirsiniz: "Portekiz D7 Vizesi: Pasif Gelir ve Emekli Oturum Rehberi", "Portekiz D8 Vizesi: Dijital Göçebe Rehberi" ve "Portekiz D2 Vizesi: Girişimci Oturum Rehberi".'
          ],
          bulletPoints: [
            {
              title: 'Portekiz D7 Vizesi (Pasif Gelir & Emeklilik)',
              description: 'Kira, şirket kâr payı, telif, faiz veya emekli maaşı gibi düzenli pasif gelire sahip bireyler için tasarlanmıştır. Asgari Portekiz asgari ücreti baz alınarak yıllık gelirin hukuki delillerle kanıtlanması gerekir.'
            },
            {
              title: 'Portekiz D8 Vizesi (Dijital Göçebe & Uzaktan Çalışma)',
              description: 'Portekiz dışındaki şirketlere uzaktan hizmet veren sözleşmeli profesyoneller veya uzaktan çalışan bordrolu çalışanlar için Portekiz asgari ücretinin 4 katı aylık gelir şartına dayanır.'
            },
            {
              title: 'Portekiz D2 Vizesi (Girişimci ve Şirket Kuruluşu)',
              description: 'Portekiz ekonomisine katma değer sağlayan yenilikçi girişimler veya yerel şube yatırımları için onaylı iş planı (Business Plan) eşliğinde yürütülen oturum modelidir.'
            }
          ]
        },
        {
          title: '2. Birleşik Krallık (İngiltere) Global Mobility & Şirket Üzerinden Oturum (Self-Sponsorship)',
          subtitle: 'UK Expansion Worker, Innovator Founder ve Self-Sponsorship Modelleri',
          paragraphs: [
            'Birleşik Krallık ile Türkiye arasındaki ticari köprüler Brexit sonrasında yeni ve kurumsal göçmenlik modelleri üzerinden sürdürülmektedir. Türkiye’de faal bir ticari işletmeye sahip şirketler, İngiltere’de açacakları şube veya iştirak üzerinden "UK Expansion Worker" vizesiyle kilit yöneticilerini Londra’ya transfer edebilmektedir.',
            'Ayrıca, sermaye sahibi profesyoneller için Birleşik Krallık’ta kurulan Ltd. şirketin Home Office nezdinde Sponsor Lisansı alması ve işletme kurucusuna Certificate of Sponsorship (CoS) tahsis etmesi esasına dayanan "Self-Sponsorship" mimarisi, ekibimizce hukuki ve operasyonel olarak yapılandırılmaktadır. Bu model, kurucuya 5 yıl sonunda süresiz oturum (ILR - Indefinite Leave to Remain) ve ardından İngiliz vatandaşlığı hakkı kazandırır.',
            'İngiltere’de şirket kuruluşu, Companies House sicil tescili, kurumsal bankacılık hesaplarının açılması ve HMRC vergi kayıtları, göçmenlik dosyasının sağlamlığıyla doğrudan ilintilidir. Şirketin İngiltere pazarında gerçek ve sürdürülebilir bir ticari varlık göstereceğini kanıtlayan sözleşmeler, kira kontratları ve mali projeksiyonlar büromuzca hazırlanır. Detaylar: "İngiltere’de Şirket Kuruluşu ve Global Mobility Süreçleri".'
          ],
          calloutBox: {
            type: 'strategy',
            title: 'Sponsor Lisansı Denetimleri ve Uyum',
            content: 'Home Office, sponsor lisansı alan şirketleri fiziki ve dijital denetimlere tabi tutmaktadır. Yöneticinin bordro ödemeleri, çalışma saatleri takibi ve şirket adresinin gerçekliği eksiksiz belgelenmelidir.'
          }
        },
        {
          title: '3. İngiltere’de Gayrimenkul Yatırımı, SDLT Vergisi ve Sınır Ötesi Varlık Mimarisi',
          subtitle: 'Stamp Duty Land Tax, Konsolosluk Vekaletnamesi ve Mülkiyetin Hukuki Güvencesi',
          paragraphs: [
            'Birleşik Krallık’ta gayrimenkul edinimi tek başına doğrudan oturum izni sağlamasa da; kurulan şirket yapısıyla birleştirildiğinde güçlü bir ikamet ve finansal güvenilirlik profili inşa eder. Türk vatandaşlarının İngiltere’de konut veya ticari mülk satın almasında conveyancing (tapu devir) süreci, Türkiye’den tamamen farklı kurallara tabidir.',
            'İngiltere’de yerleşik olmayan (non-resident) alıcılar için %2 ek Stamp Duty Land Tax (SDLT) ve ikinci mülk alımlarında %3 ila %5 ek vergi dilimleri devreye girmektedir. Satın alma fonlarının kaynağının Birleşik Krallık Kara Para Aklamayı Önleme (AML) mevzuatına uygun şekilde belgelenmesi, avukatlık denetiminin en hassas aşamasıdır.',
            'Müvekkillerimizin Türkiye’den ayrılmadan, konsolosluk onaylı vekaletnameler ve lisanslı conveyancer ortaklarımız aracılığıyla Londra ve çevre şehirlerde güvenli mülk edinmesini sağlıyoruz. Konunun ayrıntıları için "Türk Vatandaşları İngiltere’de Ev Alabilir mi? Vergi ve Hukuk Rehberi" başlıklı makalemizi inceleyebilirsiniz.'
          ]
        },
        {
          title: '4. İspanya ve Yunanistan Golden Visa Programları ile Schengen Dinamikleri',
          subtitle: 'Gayrimenkul ve Fon Yatırımı ile Schengen Serbest Dolaşımının Karşılaştırmalı Analizi',
          paragraphs: [
            'Güney Avrupa oturum programları arasında İspanya (500.000 EUR gayrimenkul veya sermaye yatırımı) ve Yunanistan (bölgeye göre 250.000 EUR - 800.000 EUR eşikleri) en çok talep gören modellerdir. İspanya, yatırımcılara ülkede fiziki ikamet zorunluluğu koymaksızın yenilenebilir oturum hakkı tanırken; vergi mukimliği (Tax Residency) risklerinin alım öncesinde doğru kurgulanması zorunludur.',
            'Yunanistan ise son dönemde Atina, Selanik, Mikonos ve Santorini gibi yoğun bölgelerde yatırım eşiğini 800.000 Euro’ya çıkarmış; diğer bölgelerde 400.000 ve 250.000 Euro seviyelerini korumuştur. Resen Hukuk ekibi, gayrimenkul alımının yerel tapu sicilinde denetlenmesi, fon katılım sözleşmelerinin incelenmesi ve çoklu yargı alanlarında (cross-border) çifte vergilendirmeyi önleme anlaşmalarının optimize edilmesini sağlar.'
          ]
        },
        {
          title: '5. Vize Retlerine Karşı İdari İtiraz ve Yargısal Denetim Yolları',
          subtitle: 'Schengen 8, 9, 10. Maddeler, UK Administrative Review ve Judicial Review',
          paragraphs: [
            'Konsolosluklarca verilen vize ret kararları (özellikle Schengen ret formundaki 8. "seyahat amacının kanıtlanamaması", 9. "geri dönmeme şüphesi" ve 10. "sahte belge iddiası"), başvuranın uluslararası seyahat sicilinde ciddi lekeler oluşturur. Haksız vize retlerine karşı sessiz kalmak veya eksikleri gidermeden alelacele yeni başvuru yapmak yerine, gerekçeli hukuki itiraz dilekçesi (Appeal / Remonstrance) sunulmalıdır.',
            'Birleşik Krallık vize retlerinde ise göçmenlik kurallarının vize memuru tarafından yanlış uygulandığı hallerde Home Office nezdinde "Administrative Review" süreci başlatılır; açık hukuka aykırılık hallerinde ise Upper Tribunal (Üst Mahkeme) nezdinde "Judicial Review" (Yargısal İnceleme) davası açılarak ret kararının iptali talep edilir. Başarılı bir itiraz, konsolosluğun haksız kanaatini çürütür ve vizenin onaylanmasını sağlar. Türkiye vize mekanizmaları ve konsolosluk süreçleri için "How to Obtain a Turkish Visa" rehberimiz mevcuttur.'
          ]
        },
        {
          title: '6. Sınır Ötesi Vergi Mukimliği ve Çifte Vergilendirmeyi Önleme Anlaşmaları',
          subtitle: 'Portekiz NHR 2.0 (IFICI), İngiltere FIG Reformu ve Uluslararası Varlık Koruma',
          paragraphs: [
            'Küresel oturum programlarında oturum izni almak sürecin yalnızca ilk adımıdır; asıl kritik hukuki ve mali risk, yeni ülkede doğacak vergi mukimliği (Tax Residency) ve dünya genelindeki gelirlerin vergilendirilmesidir. Portekiz’de geleneksel NHR rejiminin yerini alan IFICI (Bilimsel Araştırma ve İnovasyon Vergi Teşviki), nitelikli profesyoneller ve girişimciler için %20 sabit gelir vergisi ve yabancı kaynaklı temettü gelirlerinde geniş istisnalar sağlamaktadır.',
            'Birleşik Krallık’ta ise 2025 yılı itibarıyla yürürlüğe giren yeni 4 yıllık yabancı gelir ve kazançlar rejimi (Foreign Income and Gains - FIG), eski non-dom kurallarını kökten değiştirmiştir. Resen Hukuk, Türkiye-İngiltere ve Türkiye-Portekiz Çifte Vergilendirmeyi Önleme Anlaşmaları (ÇVÖA) ışığında müvekkillerinin sınır ötesi varlık ve gelir akışlarını çifte vergi yükünden koruyarak hukuki güvenlik sağlar.'
          ]
        }
      ],
      en: [
        {
          title: '1. Portuguese Residency Schemes: The Legal Architecture of D7, D8 & D2',
          subtitle: 'AIMA Integration, Consular Frameworks, and the 5-Year Path to EU Citizenship',
          paragraphs: [
            'Portugal remains a premier gateway for cross-border investors due to its clear statutory route toward European citizenship within 5 years. Navigating this successfully mandates meticulous synchronization between the Portuguese Consulates abroad and AIMA (Agency for Integration, Migration and Asylum), the Tax Authority (Finanças), and banking institutions within Portugal.',
            'Our cross-border practice handles NIF fiscal registrations, corporate/personal banking establishments, compliant lease acquisitions, and biometric representation across Lisbon, Porto, and Algarve. Depending on the income stream (such as corporate dividends, real estate lease yields, intellectual property royalties, remote tech salaries, or venture capital), we craft tailored evidentiary portfolios that satisfy consular thresholds on first submission.',
            'Crucially, under recent Portuguese nationality law revisions, the statutory 5-year waiting period for European citizenship starts calculating from the exact date the residency visa application was filed, rather than the delayed issuance date of the physical card. This prevents administrative appointment backlogs from prejudicing foreign investors.',
            'Consult our exhaustive guides for exact evidentiary requirements and consular protocols: "Portugal D7 Passive Income & Retirement Pathway", "Portugal D8 Digital Nomad Visa Compliance", and "Portugal D2 Visa: Entrepreneurial Incorporation".'
          ],
          bulletPoints: [
            {
              title: 'Portugal D7 Passive Income & Retiree Visa',
              description: 'Tailored for individuals demonstrating steady recurring passive earnings (rentals, dividends, royalties, intellectual property, pensions) surpassing statutory thresholds.'
            },
            {
              title: 'Portugal D8 Digital Nomad & Remote Worker Visa',
              description: 'For remote employees and independent tech contractors servicing foreign corporations, requiring certified earnings at 4 times the Portuguese national minimum.'
            },
            {
              title: 'Portugal D2 Entrepreneurial & Commercial Setup Visa',
              description: 'A dedicated commercial pathway requiring an approved economic business plan, Portuguese enterprise incorporation, and capital deployment.'
            }
          ]
        },
        {
          title: '2. United Kingdom Global Mobility & Enterprise Sponsorship Models (Self-Sponsorship)',
          subtitle: 'Navigating UK Expansion Worker, Innovator Founder, and Self-Sponsorship',
          paragraphs: [
            'Post-Brexit trade linkages between the UK and international markets necessitate sophisticated corporate mobility structures. Established international enterprises can establish UK wholly-owned subsidiaries and transfer pivotal corporate officers under the UK Expansion Worker mechanism.',
            'For visionary entrepreneurs, our London-affiliated team devises "Self-Sponsorship" pathways: incorporating an English Limited Company, obtaining Home Office Sponsor Licence approval, and issuing intra-corporate Certificates of Sponsorship (CoS). This establishes a defined 5-year pathway toward Indefinite Leave to Remain (ILR) and British citizenship.',
            'Corporate incorporation with Companies House, HMRC corporate tax integration, and compliant commercial premises leases form the evidentiary pillar of the UK immigration dossier. Our lawyers curate the commercial contracts, business plan projections, and corporate governance records required to clear Home Office scrutiny. Review: "UK Company Formation & Corporate Mobility Roadmap".'
          ],
          calloutBox: {
            type: 'strategy',
            title: 'Sponsor Licence Audit Preparedness',
            content: 'The Home Office conducts both unannounced physical inspections and digital compliance audits on sponsor licence holders. Real payroll disbursements, statutory HR tracking, and authentic commercial operations must be documented flawlessly.'
          }
        },
        {
          title: '3. UK Real Estate Conveyancing, SDLT Tax & Cross-Border Wealth Architecture',
          subtitle: 'Stamp Duty Land Tax Surcharges, Consular Powers of Attorney & AML Compliance',
          paragraphs: [
            'While real estate purchases in England do not automatically convey residency rights, combining UK property acquisition with an active Limited company establishes an impeccable domicile profile for immigration scrutiny. Conveyancing under English property law requires stringent procedural compliance.',
            'Overseas purchasers are subject to the 2% Non-Resident SDLT Surcharge, combined with additional property stamp duty surcharges ranging from 3% to 5%. Verifying the lawful source of acquisition capital under UK Anti-Money Laundering (AML) statutory rules represents the most sensitive phase of conveyancing.',
            'Resen Legal enables overseas clients to execute property purchases in London and throughout the UK through consular powers of attorney and accredited solicitor partnerships without requiring physical presence. Explore our analysis: "Can Turkish Citizens Buy Real Estate in the UK? Tax and Legal Guide".'
          ]
        },
        {
          title: '4. Comparative Analysis: Spain & Greece Golden Visas',
          subtitle: 'Evaluating Real Estate vs. Capital Fund Structures under EU Free Movement',
          paragraphs: [
            'Southern European residency frameworks continue to appeal to high-net-worth families. Spain requires a EUR 500,000 real estate or equivalent capital investment without requiring physical residency minimums to maintain valid status. Meanwhile, Greece operates varying investment tiers (EUR 250,000 to EUR 800,000) depending on geographic zones, having increased thresholds across prime metropolitan areas such as Athens, Thessaloniki, Mykonos, and Santorini.',
            'Resen Legal executes cross-border conveyancing due diligence, audits regulatory fund compliance, and structures cross-border tax liabilities to mitigate unexpected residency tax domicile traps.'
          ]
        },
        {
          title: '5. Strategic Appeals Against Visa Refusals & Judicial Review',
          subtitle: 'Schengen Clauses 8-10, UK Administrative Review & High Court Judicial Review',
          paragraphs: [
            'Unjustified visa denials (notably Schengen grounds 8 "justification of purpose", 9 "intention to return", and 10 "authenticity concerns") damage global credibility. Rather than submitting repetitive reapplications, applicants must lodge formal legal remonstrance petitions addressing specific legal misinterpretations.',
            'For UK refusals, we initiate formal Administrative Reviews against case-worker errors, escalating to Judicial Review proceedings before the Upper Tribunal (Immigration and Asylum Chamber) to overturn unlawful Home Office determinations. Persuasive legal advocacy successfully dismantles speculative consular inferences. For entry protocols to Turkey, consult our publication: "How to Obtain a Turkish Visa".'
          ]
        },
        {
          title: '6. Cross-Border Tax Domicile & International Wealth Structuring',
          subtitle: 'Portugal NHR 2.0 (IFICI), UK Foreign Income Regime & Treaty Compliance',
          paragraphs: [
            'Securing a residency permit represents merely the initial threshold of international relocation. The pivotal long-term legal exposure lies in cross-border tax residency and the global taxation of worldwide income and capital gains. In Portugal, the innovative IFICI (Tax Incentive for Scientific Research and Innovation / NHR 2.0) affords eligible executives and entrepreneurs a 20% flat tax rate alongside sweeping exemptions on qualified foreign-source dividends and capital appreciation.',
            'Concurrently, the United Kingdom’s transition to a 4-year Foreign Income and Gains (FIG) regime radically restructures historic non-dom privileges. Our cross-border practice optimizes private client balance sheets under the Double Taxation Avoidance Treaties linking Turkey, the UK, and Portugal, ensuring lawful wealth protection across concurrent tax jurisdictions.'
          ]
        }
      ]
    },
    relatedArticles: {
      tr: [
        {
          slug: 'portekiz-d7-vizesi-pasif-gelir-ve-emekli-oturum-rehberi',
          title: 'Portekiz D7 Vizesi: Pasif Gelir ve Emekli Oturum Rehberi',
          badge: 'Portekiz D7',
          description: 'Konsolosluk dosya hazırlığı, NIF, banka hesabı ve AIMA onay süreçlerinin tüm ayrıntıları.'
        },
        {
          slug: 'portekiz-d8-vizesi-dijital-gocebe-ve-uzaktan-calisma-rehberi',
          title: 'Portekiz D8 Vizesi: Dijital Göçebe ve Uzaktan Çalışma Rehberi',
          badge: 'Portekiz D8',
          description: 'Aylık gelir şartı, uzaktan çalışma sözleşmeleri ve vergi avantajları analizi.'
        },
        {
          slug: 'portekiz-d2-vizesi-girisimci-oturum-basvurusu-rehberi',
          title: 'Portekiz D2 Vizesi: Girişimci ve Şirket Kuruluşu Rehberi',
          badge: 'Portekiz D2',
          description: 'İş planı hazırlığı, Portekiz’de şirket kuruluşu ve girişimci oturum aşamaları.'
        },
        {
          slug: 'ingilterede-sirket-kurulusu',
          title: 'İngiltere’de Şirket Kuruluşu ve Global Mobility Süreçleri',
          badge: 'Birleşik Krallık',
          description: 'Companies House tescili, kurumsal bankacılık ve İngiltere oturum vizesi bağlantıları.'
        },
        {
          slug: 'turk-vatandaslari-ingilterede-ev-alabilir-mi-vergi-ve-surec-rehberi',
          title: 'Türk Vatandaşları İngiltere’de Ev Alabilir mi? Vergi ve Hukuk Rehberi',
          badge: 'UK Gayrimenkul',
          description: 'SDLT vergisi, vekaletname ile uzaktan alım ve İngiltere oturum planlaması.'
        },
        {
          slug: 'how-to-obtain-a-turkish-visa',
          title: 'Türkiye Vizesi Nasıl Alınır? Başvuru ve İtiraz Rehberi',
          badge: 'Vize Rehberi',
          description: 'Konsolosluk başvuruları, e-Vize şartları ve vize retlerine karşı hukuki adımlar.'
        }
      ],
      en: [
        {
          slug: 'portekiz-d7-vizesi-pasif-gelir-ve-emekli-oturum-rehberi',
          title: 'Portugal D7 Visa Guide: Passive Income & Retirement Pathway',
          badge: 'Portugal D7',
          description: 'Exhaustive legal breakdown of consular filings, NIF, banking, and AIMA biometrics.'
        },
        {
          slug: 'portekiz-d8-vizesi-dijital-gocebe-ve-uzaktan-calisma-rehberi',
          title: 'Portugal D8 Digital Nomad Visa: Remote Worker Compliance Guide',
          badge: 'Portugal D8',
          description: 'Earnings verification, cross-border remote contracts, and Portuguese residency privileges.'
        },
        {
          slug: 'portekiz-d2-vizesi-girisimci-oturum-basvurusu-rehberi',
          title: 'Portugal D2 Visa: Entrepreneurial Incorporation & Residency',
          badge: 'Portugal D2',
          description: 'Corporate registration, accredited business plans, and enterprise expansion in the EU.'
        },
        {
          slug: 'ingilterede-sirket-kurulusu',
          title: 'UK Company Formation & Corporate Mobility Roadmap',
          badge: 'UK Mobility',
          description: 'Navigating Companies House registration, director appointments, and sponsor licensing.'
        },
        {
          slug: 'turk-vatandaslari-ingilterede-ev-alabilir-mi-vergi-ve-surec-rehberi',
          title: 'Can Turkish Nationals Acquire UK Property? Tax and Legal Guide',
          badge: 'UK Real Estate',
          description: 'Navigating SDLT surcharges, remote consular execution, and AML compliance in the UK.'
        },
        {
          slug: 'how-to-obtain-a-turkish-visa',
          title: 'How to Obtain a Turkish Visa: Consular Application & Appeals',
          badge: 'Visa Protocols',
          description: 'Consular processing tiers, e-Visa eligibility, and legal remedies against visa rejections.'
        }
      ]
    },
    faqList: {
      tr: [
        {
          question: 'Portekiz D7 veya D8 vizesi alan bir kişi ailesini de getirebilir mi?',
          answer: 'Evet. Portekiz Göç Kanunu uyarınca, aile birleşimi (Reagrupamento Familiar) hükümleri kapsamında başvuru sahibinin eşi, 18 yaşından küçük çocukları ve bakmakla yükümlü olduğu ebeveynleri de aynı haklarla Portekiz oturum kartı alabilmektedir.'
        },
        {
          question: 'Schengen vize reddi alındığında yeniden başvuru yapmak mı yoksa itiraz etmek mi daha doğrudur?',
          answer: 'Eğer ret gerekçesi konsolosluğun bariz bir evrak inceleme hatasından veya yanlış değerlendirmesinden kaynaklanıyorsa mutlaka hukuki itiraz dilekçesi (Remonstrance) verilmelidir. Dosyadaki temel eksik giderilmeden yapılan acele yeni başvurular sistemde peş peşe ret sicili doğurabilir.'
        },
        {
          question: 'İngiltere’de şirket kurarak oturum izni almak mümkün müdür?',
          answer: 'İngiltere’de yalnızca şirket kurmak doğrudan oturum izni vermez. Ancak kurulan şirketin Home Office kriterlerini sağlayarak Sponsor Lisansı alması ve bu kapsamda kişiye Skilled Worker / Expansion Worker çalışma vizesi tahsis edilmesi mümkündür (Self-Sponsorship modeli).'
        },
        {
          question: 'Portekiz vatandaşlığına başvuru için gereken 5 yıl ne zaman başlar?',
          answer: 'Son yasal reform uyarınca 5 yıllık süre, Portekiz oturum kartının fiziki basım tarihinden değil; konsolosluğa yapılan ilk resmi vize başvuru tarihinden itibaren hesaplanmaktadır.'
        }
      ],
      en: [
        {
          question: 'Can family dependants join under a Portugal D7 or D8 visa?',
          answer: 'Yes. Under Portuguese Family Reunification regulations, spouses, minor children, and dependent parents qualify for identical residency privileges tied to the principal visa holder.'
        },
        {
          question: 'Is it better to reapply or file a formal appeal after a Schengen visa refusal?',
          answer: 'If the refusal was premised on consular factual errors or misread evidence, an official legal appeal (remonstrance) is essential. Rushing into immediate duplicate filings without curing underlying objections compounds the adverse immigration record.'
        },
        {
          question: 'Can you secure UK residency simply by incorporating a company?',
          answer: 'Incorporation alone does not grant indefinite leave. However, structuring the enterprise to attain Home Office Sponsor Licence accreditation enables the issuance of sponsored worker visas to corporate principals (Self-Sponsorship).'
        },
        {
          question: 'When does the 5-year Portuguese citizenship statutory clock begin?',
          answer: 'Under recent legislative reforms, the 5-year timeline is calculated retrospectively from the initial date the residency visa application was lodged, preventing bureaucratic appointment backlogs from prejudicing applicants.'
        }
      ]
    }
  },

  'real-estate-property-law': {
    id: 'real-estate-property-law',
    wordCountTarget: '1,200 - 1,500 words',
    metaKeywords: [
      'Gayrimenkul hukuki denetimi',
      'tapu due diligence',
      'yabancıların mülk edinimi',
      'kira tespit davası',
      'belirsiz alacak davası kira',
      'tahliye taahhütnamesi',
      'kentsel dönüşüm 6306',
      'vekaletname ile gayrimenkul alımı',
      'tapu iptali ve tescil',
      'muris muvazaası',
      'DAB döviz alım belgesi tapu'
    ],
    leadSummary: {
      tr: 'Resen Hukuk & Danışmanlık, Türkiye genelinde ve uluslararası alanda gayrimenkul yatırımlarının hukuki risk denetimi (Due Diligence), tapu devirleri, yabancıların mülk edinimi, imar ve kentsel dönüşüm uyuşmazlıkları ile 6098 sayılı Türk Borçlar Kanunu kapsamındaki kira davalarında kurumsal ve bireysel müvekkillerine stratejik danışmanlık sunar. Taşınmaz edinimlerinin her aşaması, tapu kütüğünden belediye imar arşivlerine kadar titizlikle incelenerek sermaye güvenceye alınır.',
      en: 'Resen Legal provides high-stakes real estate counsel spanning cross-border acquisitions, title deed due diligence, foreign ownership protocols, urban transformation disputes (Law No. 6306), and commercial/residential tenancy litigation under the Turkish Code of Obligations (Law No. 6098). We protect property capital from initial municipal archival screening to contested title deed cancellation disputes before the civil courts.'
    },
    sections: {
      tr: [
        {
          title: '1. Taşınmaz Alımında Hukuki İnceleme (Due Diligence) ve Risk Yönetimi',
          subtitle: 'Tapu Kütüğü, Kadastro, İmar Planı ve Belediye İskân Uygunluk Denetimi',
          paragraphs: [
            'Gayrimenkul yatırımlarında en sık karşılaşılan tuzaklar; tapu kaydında görünmeyen veya şerhler sütununda gizlenen ipotekler, hacizler, ihtiyati tedbirler, intifa hakları, aile konutu şerhleri ve kamu yararı kısıtlamalarıdır. Bir taşınmazın satın alınmasından önce yalnızca tapu senedine güvenmek telafisi imkansız sermaye kayıplarına yol açabilir.',
            'Büromuz, ilgili Tapu ve Kadastro Müdürlüklerinde kütük taranması, belediye imar arşivlerinde yapı ruhsatı ve yapı kullanma izin belgesi (iskân) kontrolleri ve bağımsız bölümün projeye aykırı kaçak eklentilerinin bulunup bulunmadığının tespiti yönünde bağımsız hukuki denetim raporu (Due Diligence Report) düzenler.',
            'Özellikle proje aşamasındaki veya inşaatı devam eden taşınmazlarda, müteahhidin arsa sahibiyle imzaladığı Kat Karşılığı İnşaat Sözleşmesi incelenmeli, bağımsız bölümlerin inşaat seviyesine göre hakediş durumları doğrulanmalı ve teslim teminatları denetlenmelidir. Bu inceleme yapılmadan ödenen peşinatlar, müteahhidin temerrüdü durumunda alıcıyı korumasız bırakır.'
          ],
          bulletPoints: [
            {
              title: 'Takidat ve Şerh Denetimi',
              description: 'Taşınmaz üzerindeki tüm rehin, haciz, kamu haczi, intifa ve ön alım haklarının taranarak temiz tescilin sağlanması.'
            },
            {
              title: 'İskân ve Mimari Proje Kontrolü',
              description: 'Binanın statik ve mimari onaylı projesiyle fiili durumunun karşılaştırılarak kaçak kat veya imar cezası risklerinin bertaraf edilmesi.'
            },
            {
              title: 'Yönetim Planı İncelemesi',
              description: 'Kat mülkiyeti yönetim planında bağımsız bölüme tahsis edilen eklenti ve ortak alan haklarının hukuki sınırlarının tespiti.'
            }
          ]
        },
        {
          title: '2. Yabancıların Türkiye’de Mülk Edinimi ve Konsolosluk Vekaletnameleri',
          subtitle: '2644 Sayılı Tapu Kanunu m.35, DAB ve Askeri Yasak Bölge Tahditleri',
          paragraphs: [
            'Yabancı gerçek kişilerin Türkiye’de gayrimenkul edinimi, 2644 sayılı Tapu Kanunu m.35 uyarınca karşılıklılık (mütekabiliyet) kısıtlamalarından muaf tutulan ülke vatandaşları için mümkündür. Ancak yabancılar için askeri yasak bölgeler ve güvenlik bölgeleri tahkikatı, toplam mülk ediniminin ilçe bazında %10’u, ülke genelinde kişi başı 30 hektarı geçememesi gibi yasal sınırlar mevcuttur.',
            'Yurt dışındaki alıcıların Türkiye’ye fiziki olarak gelmeden mülk edinebilmesi için Türk Konsolosluklarında veya yabancı noterlerde düzenlenen vekaletnamelerin özel yetkili tapu ibarelerini, fotoğraf tasdikini ve apostil şerhini eksiksiz barındırması şarttır. Ayrıca gayrimenkul alım bedelinin Merkez Bankası’na bozdurularak Döviz Alım Belgesi’ne (DAB) bağlanması zorunluluğu büromuzca güvence altına alınır.',
            'Yabancı yatırımcı adına taşınmaz alım sürecinde noter satış vaadi sözleşmelerinin tapu kütüğüne şerh edilmesi, satıcının aynı taşınmazı üçüncü şahıslara devretmesini engelleyen en güçlü yasal teminattır. Konuyla ilgili rehberlerimiz: "Vekaletname ile Türkiye’de Gayrimenkul Alımı" ve "Yurt Dışında Düzenlenen Vekaletnamelerin Türkiye’de Geçerliliği".'
          ],
          calloutBox: {
            type: 'advisory',
            title: 'Vekaletname Metinlerinde Özel Yetki Zorunluluğu',
            content: 'Tapu müdürlükleri genel vekaletnameleri kabul etmez. Taşınmazın ada, parsel ve bağımsız bölüm bilgilerini içeren, fotoğraf yapıştırılmış ve açıkça "gayrimenkul satın almaya, ferağ takririni vermeye ve almaya" yetki veren özel vekaletname düzenlenmelidir.'
          }
        },
        {
          title: '3. Gayrimenkul Yatırımı ile Vatandaşlık ve 3 Yıl Satılamaz Şerhi Dinamikleri',
          subtitle: '400.000 USD Eşiği, Uygunluk Belgesi ve Tapu Sicili Restriksiyonları',
          paragraphs: [
            'Taşınmaz yatırımı yoluyla Türk vatandaşlığı iktisabında, tapu sicilinde tanzim edilen resmi senede "5901 sayılı Türk Vatandaşlığı Kanunu’nun Uygulanmasına İlişkin Yönetmelik’in 20. maddesi kapsamında 3 yıl süreyle satılmayacağı" yönünde kanuni taahhüt şerhi işlenir.',
            'Yatırımcı adına düzenlenen Döviz Alım Belgesi’ndeki (DAB) kayıtlı Amerikan Doları tutarı, tapuda beyan edilen satış bedeli ve SPK lisanslı bağımsız gayrimenkul değerleme uzmanı tarafından hazırlanan değerleme raporundaki tutar birbirini tam olarak teyit etmelidir. Birden fazla gayrimenkulün birleştirilmesi halinde tapu ferağ işlemlerinin zamanlaması ve uygunluk belgesi müracaatı büromuzca koordine edilir. İnceleme: "Yatırım Yoluyla Türk Vatandaşlığı Hukuki Rehberi".'
          ]
        },
        {
          title: '4. Kira Uyuşmazlıkları: Kira Tespit Davaları, Belirsiz Alacak Tartışması ve Tahliye',
          subtitle: '6098 Sayılı TBK m.344 ve m.350-352 Kapsamında Uyuşmazlık Mimarisi',
          paragraphs: [
            'Son yıllarda enflasyonist dinamikler nedeniyle konut ve çatılı işyeri kira sözleşmelerinde uyuşmazlıklar katlanarak artmıştır. 6098 sayılı Türk Borçlar Kanunu m.344/3 uyarınca, 5 yılı dolduran kira sözleşmelerinde taraflar emsal rayiçlere ve hakkaniyete uygun yeni kira bedelinin belirlenmesi amacıyla "Kira Tespit Davası" açma hakkına sahiptir.',
            'Hukuk ekibimiz; kira tespit davalarının belirsiz alacak davası olarak açılıp açılamayacağına dair Yargıtay Hukuk Genel Kurulu kararlarını yakından takip ederek dava harçlarının ve ıslah süreçlerinin müvekkil lehine optimize edilmesini sağlar. Ayrıca tahliye taahhütnamelerinin geçerlilik şartları (tanzim ve tahliye tarihi ayrımı), 10 yıllık uzama süresi sonunda gerekçesiz tahliye ve iki haklı ihtar davaları yürütülür.',
            'Kira uyuşmazlıklarında 7445 sayılı Kanun ile yürürlüğe giren zorunlu dava şartı arabuluculuk süreci, taraflar arasında uzun süren dava masraflarını önleme fırsatı sunar. Arabuluculuk masasında hazırlanan anlaşma belgeleri ilam niteliğinde icra edilebilir belge hükmündedir. Konunun Yargıtay analizi için "Kira Tespit Davası Belirsiz Alacak Davası Olarak Açılabilir mi?" makalemizi inceleyebilirsiniz.'
          ],
          bulletPoints: [
            {
              title: 'Zorunlu Arabuluculuk Süreci (7445 Sayılı Kanun)',
              description: 'Kira tespit ve tahliye davalarında dava açmadan önce arabuluculuğa başvurulması zorunlu dava şartıdır. Süreç büromuzca bizzat yürütülür.'
            },
            {
              title: 'İhtiyaç Sebebiyle Tahliye (TBK m.350)',
              description: 'Kiraya verenin veya birinci derece yakınlarının konut veya işyeri ihtiyacının samimi, zorunlu ve devamlı olduğunun ispatı gereklidir.'
            },
            {
              title: 'Tahliye Taahhütnamesi Denetimi',
              description: 'Kira sözleşmesiyle aynı gün imzalanan taahhütnameler müzayaka (baskı) altında verildiği kabul edilerek geçersiz kılınabilmektedir.'
            }
          ]
        },
        {
          title: '5. Kentsel Dönüşüm Hukuku ve Arsa Payı Karşılığı İnşaat Uyuşmazlıkları',
          subtitle: '6306 Sayılı Kanun Değişiklikleri, Salt Çoğunluk (%50+1) ve Müteahhit Temerrüdü',
          paragraphs: [
            '6306 sayılı Afet Riski Altındaki Alanların Dönüştürülmesi Hakkında Kanun’da yapılan son reformlarla, riskli yapılarda karar alma nisabı 2/3’ten **salt çoğunluğa (arsa payı %50+1)** indirilmiştir. Bu düzenleme kentsel dönüşüm süreçlerini hızlandırırken, azınlıkta kalan kat maliklerinin mülkiyet haklarının ve taşınmaz değerlerinin korunmasını daha da kritik hale getirmiştir.',
            'Resen Hukuk; kat malikleri ve müteahhitler arasındaki Arsa Payı Karşılığı İnşaat Sözleşmelerinin (Kat Karşılığı) teknik ve cezai şartlarının tanzimi, inşaat tamamlama teminatları, arsa payı düzeltme davaları ve müteahhidin temerrüdü halinde tapu iptal ve tescil davalarında yetkin temsil sunar. Salt çoğunluk kararına katılmayan maliklerin hisselerinin rayiç bedelin altında satılmasını önleyecek tespit davaları yürütülür.'
          ]
        },
        {
          title: '6. Tapu İptali ve Tescil Davaları ile Kat Mülkiyeti İhtilafları',
          subtitle: 'Muris Muvazaası, Şufa (Ön Alım), Vekaletin Kötüye Kullanımı ve İpoteğin Fekki',
          paragraphs: [
            'Mülkiyet hakkının en sert yargısal ihtilafları, Asliye Hukuk Mahkemelerinde görülen tapu iptali ve tescil davalarında yaşanır. Mirasbırakanın diğer mirasçılardan mal kaçırmak amacıyla yaptığı muvazaalı temliklere karşı açılan Muris Muvazaası davaları, vekalet görevinin kötüye kullanılması ve inançlı işlem kaynaklı tapu uyuşmazlıkları büromuzca yürütülür.',
            'Ayrıca paylı mülkiyette paydaşların yasal ön alım (şufa) hakkını kullanması, haksız zilyetlik halinde müdahalenin men-i ve ecrimisil (haksız işgal tazminatı) talepleri ile banka veya özel şahıs ipoteklerinin süresi dolmasına rağmen kaldırılmaması halinde ipoteğin fekki davaları ekibimizce kararlılıkla yönetilir.'
          ]
        },
        {
          title: '7. Sınır Ötesi Gayrimenkul Yatırımları ve Birleşik Krallık Mülk Alımı',
          subtitle: 'İngiltere’de Gayrimenkul Alımı, SDLT Vergisi ve Uluslararası Portföy Yönetimi',
          paragraphs: [
            'Müvekkillerimizin yalnızca Türkiye’deki değil, Birleşik Krallık’taki mülk yatırımları da Londra bağlantılı hukuk ağımızla koordine edilmektedir. İngiltere’de ev veya ticari gayrimenkul alımında conveyancing denetimi, Stamp Duty Land Tax (SDLT) yabancı alıcı ek dilimleri ve kira gelirlerinin çifte vergilendirmeden korunması sağlanır. Detaylı rehberimiz: "Türk Vatandaşları İngiltere’de Ev Alabilir mi?".'
          ]
        }
      ],
      en: [
        {
          title: '1. Real Estate Legal Due Diligence & Pre-Acquisition Risk Audits',
          subtitle: 'Land Registry Encumbrance Audits, Zoning Legitimacy & Habitation Permits',
          paragraphs: [
            'The principal hazards in commercial and luxury residential transactions stem from concealed encumbrances: hidden judicial mortgages, executive liens, interim injunctions, usufruct rights, family dwelling reservations, and zoning sanctions. Relying exclusively on surface-level title certificates exposes investors to substantial capital loss.',
            'Resen Legal performs full-scope Title Deed Due Diligence: auditing the Land Registry registers, inspecting municipal zoning archives for certified architectural licenses and Habitation Permits (İskân), and confirming that physical units conform exactly to registered architectural blueprints.',
            'In off-plan development projects, the construction agreement in return for land share signed between developer and landowner must be scrutinized. We authenticate completion milestones, escrow mechanisms, and structural delay penalties to guarantee that payments made prior to handover are backed by legally enforceable instruments.'
          ],
          bulletPoints: [
            {
              title: 'Encumbrance & Lien Clearance',
              description: 'Purging judicial attachments, mortgages, preliminary injunctions, and statutory rights of pre-emption to achieve clear title.'
            },
            {
              title: 'Habitation Permit (İskân) Verification',
              description: 'Cross-referencing building blueprints against municipal archives to ensure the structure carries zero unauthorized modifications.'
            },
            {
              title: 'Condominium Management Plan Review',
              description: 'Scrutinizing common area rights, allocated storage/parking covenants, and maintenance fee apportionment.'
            }
          ]
        },
        {
          title: '2. Foreign Real Estate Acquisition & Consular Power of Attorney Protocols',
          subtitle: 'Law No. 2644 Art. 35, Foreign Exchange Certificates (DAB) & Statutory Limits',
          paragraphs: [
            'Foreign natural persons may acquire Turkish real estate pursuant to Article 35 of the Land Registry Law No. 2644. Foreign acquisition remains subject to statutory restrictions, including district and national surface-area limits, security-zone controls, and country/person/region-based restrictions that may be imposed by the Presidency.',
            'For overseas buyers completing purchases remotely, Powers of Attorney (PoA) drafted at Turkish Consulates or notarized with Apostille stamps abroad must contain explicit statutory authority, physical photographs, and precise parcel identifiers. We also ensure full compliance with Central Bank foreign exchange sales certificates (DAB) under applicable central bank circulars.',
            'Annotating preliminary promise-to-sell deeds at the title registry creates statutory in rem protection, preventing the vendor from conveying title to conflicting third-party buyers, subject to case-specific assessment and statutory registration requirements. Explore our guides: "Executing Real Estate Purchases in Turkey via Power of Attorney" and "Cross-Border Recognition of Foreign Powers of Attorney".'
          ],
          calloutBox: {
            type: 'advisory',
            title: 'Mandatory Specific Authority Clauses in PoA',
            content: 'Turkish land registry directorates summarily reject general powers of attorney. The instrument must explicitly describe parcel identifiers, bear an embossed photograph, and explicitly authorize purchasing and conveyance registration.'
          }
        },
        {
          title: '3. Real Estate Investment for Citizenship: Registry Annotation Mechanics',
          subtitle: 'USD 400K Valuation Benchmark, DAB Certification & 3-Year Covenant',
          paragraphs: [
            'For naturalization filings based on property acquisition, a statutory restrictive covenant is registered onto the title deed prohibiting sale or transfer for a duration of 3 continuous years pursuant to Article 20 of the Citizenship Enforcement Regulation.',
            'The foreign currency valuation transcribed on the Central Bank DAB certificate, the purchase price declared on the official title deed, and the appraised market value certified by an SPK-licensed real estate valuer must demonstrate total mathematical alignment. Review: "Turkish Citizenship by Investment Legal Guide".'
          ]
        },
        {
          title: '4. Tenancy Disputes: Rent Determination & Eviction Litigation',
          subtitle: 'Navigating Turkish Code of Obligations Arts. 344 & 350-352',
          paragraphs: [
            'Inflationary shifts have spurred widespread tenancy disputes across commercial and residential leases. Under Article 344/3 of Law No. 6098, leases exceeding 5 years are subject to judicial "Rent Determination Lawsuits" (Kira Tespit Davası) where courts evaluate prevailing market comparables in light of statutory criteria and equitable considerations.',
            'Our litigation team monitors Court of Cassation (Yargıtay) precedents on lease claims, developing case-specific legal strategies. We also litigate written eviction commitments (Tahliye Taahhütnamesi), personal dwelling necessity evictions (Art. 350), and the 10-year statutory lease extension rule.',
            'Most lease-related disputes are subject to mandatory mediation before litigation under Law No. 7445, except for eviction proceedings pursued through the specific non-judicial enforcement route under the Enforcement and Bankruptcy Law. An executed mediation accord constitutes an enforceable title equivalent to a court decree, bypassing prolonged judicial calendars. See our analysis: "Rent Determination Lawsuits under Turkish Tenancy Jurisprudence".'
          ],
          bulletPoints: [
            {
              title: 'Mandatory Mediation (Law No. 7445)',
              description: 'Most lease-related disputes require pre-litigation mediation, with statutory exceptions such as non-judicial eviction proceedings under the Enforcement and Bankruptcy Law.'
            },
            {
              title: 'Dwelling Necessity Evictions (Art. 350)',
              description: 'Demanding eviction requires substantiating genuine, sincere, and mandatory housing necessity for the landlord or first-degree relatives.'
            },
            {
              title: 'Eviction Commitments Scrutiny',
              description: 'Scrutinizing date of execution vs. date of delivery to uphold or challenge eviction enforcement proceedings.'
            }
          ]
        },
        {
          title: '5. Urban Transformation Law & Construction Agreements in Return for Land Share',
          subtitle: 'Law No. 6306 Legislative Reforms, Simple Majority Decision Framework & Contractor Default',
          paragraphs: [
            'Under Law No. 6306, certain redevelopment decisions may be adopted by a simple majority calculated according to ownership shares / land share ratios, rather than unanimity. While accelerating urban regeneration projects, this underscores the necessity of a case-specific assessment to protect equitable property valuations and minority owners\' statutory rights.',
            'We negotiate Construction Agreements in Return for Land Share (Kat Karşılığı İnşaat Sözleşmeleri), structuring completion guarantees, delayed delivery penalty clauses, share correction lawsuits, and title remedies against contractor insolvency under current legislation and administrative practice.'
          ]
        },
        {
          title: '6. Title Deed Annulment Lawsuits & Fiduciary Pre-Emption Litigation',
          subtitle: 'Sham Conveyance (Muris Muvazaası), Breach of PoA, Statutory Pre-Emption & Mortgages',
          paragraphs: [
            'The most contested property disputes involve Title Deed Annulment and Registration Lawsuits (Tapu İptal ve Tescil Davaları). These arise when properties are transferred through fraudulent collusive transactions designed to disinherit legal heirs (Muris Muvazaası), or where attorneys-in-fact exceed their fiduciary authority under executed powers of attorney.',
            'Furthermore, we enforce statutory pre-emption rights (Şufa Davası) among shared tenancy co-owners, file eviction actions coupled with mesne profit damages (Ecrimisil) against wrongful possessors, and initiate court proceedings to release obsolete or expired mortgages and lis pendens annotations.'
          ]
        },
        {
          title: '7. Cross-Border Property Investments: Acquiring UK Real Estate',
          subtitle: 'Conveyancing in England, SDLT Surcharges & Portfolio Wealth Coordination',
          paragraphs: [
            'Our cross-border real estate practice assists international investors acquiring property in London and across England. We navigate conveyancing searches, non-resident Stamp Duty Land Tax (SDLT) surcharges, and cross-border rental income tax mitigation. Read our guide: "Can Turkish Nationals Acquire UK Property?".'
          ]
        }
      ]
    },
    relatedArticles: {
      tr: [
        {
          slug: 'kira-tespit-davasi-belirsiz-alacak-davasi-olarak-acilabilir-mi',
          title: 'Kira Tespit Davası Belirsiz Alacak Davası Olarak Açılabilir mi?',
          badge: 'Kira Hukuku',
          description: 'Yargıtay içtihatları, 5 yıllık süre şartı, dava harçları ve hakkaniyet indirimi analizi.'
        },
        {
          slug: 'power-of-attorney-turkish-real-estate-purchase',
          title: 'Vekaletname ile Türkiye’de Gayrimenkul Alımı ve Güvenlik Adımları',
          badge: 'Tapu & Vekalet',
          description: 'Yurt dışından tapu devrinde konsolosluk vekaletnamesi, apostil ve özel yetki şartları.'
        },
        {
          slug: 'turkish-citizenship-by-investment-legal-guide',
          title: 'Gayrimenkul Yatırımı ile Vatandaşlık ve 3 Yıl Satılamaz Şerhi',
          badge: 'Yatırım & Tapu',
          description: '$400.000 tapu devri, DAB belgesi ve uygunluk onayının tapu boyutları.'
        },
        {
          slug: 'yurt-disinda-duzenlenmis-vekletnamelerin-turkiyede-kullanimi',
          title: 'Yurt Dışında Düzenlenen Vekaletnamelerin Türkiye’de Geçerliliği',
          badge: 'Uluslararası Usul',
          description: 'Noter tasdikleri, tercüme kuralları ve gayrimenkul işlemlerinde geçerlilik denetimi.'
        },
        {
          slug: 'turk-vatandaslari-ingilterede-ev-alabilir-mi-vergi-ve-surec-rehberi',
          title: 'İngiltere’de Gayrimenkul Alımı ve Vergi Rehberi',
          badge: 'Sınır Ötesi Yatırım',
          description: 'SDLT damga vergisi, mülk edinim süreci ve uluslararası yatırımcı güvenceleri.'
        }
      ],
      en: [
        {
          slug: 'kira-tespit-davasi-belirsiz-alacak-davasi-olarak-acilabilir-mi',
          title: 'Rent Determination Lawsuits under Turkish Tenancy Jurisprudence',
          badge: 'Tenancy Law',
          description: '5-year statutory review thresholds, appraisal benchmarks, and Court of Cassation rulings.'
        },
        {
          slug: 'power-of-attorney-turkish-real-estate-purchase',
          title: 'Executing Real Estate Purchases in Turkey via Power of Attorney',
          badge: 'Conveyancing PoA',
          description: 'Apostille certification, consular execution, and special authority clauses in title transactions.'
        },
        {
          slug: 'turkish-citizenship-by-investment-legal-guide',
          title: 'Real Estate Investment for Naturalization: Title Covenants',
          badge: 'Property & Citizenship',
          description: 'Navigating USD 400K title deeds, DAB certifications, and 3-year restrictive covenants.'
        },
        {
          slug: 'yurt-disinda-duzenlenmis-vekletnamelerin-turkiyede-kullanimi',
          title: 'Cross-Border Recognition of Foreign Powers of Attorney in Turkey',
          badge: 'Cross-Border Procedure',
          description: 'Hague Apostille Convention, sworn translation, and Land Registry compliance standards.'
        },
        {
          slug: 'turk-vatandaslari-ingilterede-ev-alabilir-mi-vergi-ve-surec-rehberi',
          title: 'Can Turkish Nationals Acquire UK Property? Tax and Legal Guide',
          badge: 'Cross-Border Conveyancing',
          description: 'SDLT stamp taxes, offshore acquisition procedures, and international investor protections.'
        }
      ]
    },
    faqList: {
      tr: [
        {
          question: 'Kira tespit davası açabilmek için 5 yıllık sürenin dolması şart mıdır?',
          answer: 'Evet. TBK m.344/3 uyarınca taraflarca emsal rayiçlere göre kira tespiti istenebilmesi için sözleşmenin başlangıcından itibaren 5 yılın geçmiş olması gerekir. 5 yıldan kısa sözleşmelerde ise artış yalnızca TÜFE 12 aylık ortalaması tavanıyla sınırlıdır.'
        },
        {
          question: 'Yabancıların gayrimenkul alımında Döviz Alım Belgesi (DAB) neden zorunludur?',
          answer: 'Merkez Bankası Sermaye Hareketleri Genelgesi uyarınca, yabancıların Türkiye’de mülk edinirken bedeli döviz olarak Türkiye’deki bir bankaya transfer edip Merkez Bankası’na bozdurarak DAB alması zorunludur. DAB olmadan tapuda devir yapılamaz.'
        },
        {
          question: 'Kentsel dönüşümde salt çoğunluk kararına katılmayan maliklerin hakları ne olur?',
          answer: 'Salt çoğunlukla (%50+1) alınan karara katılmayan maliklere noter kanalıyla karar tebliğ edilir ve 15 günlük süre verilir. Bu sürede sözleşmeyi imzalamayanların arsa payları Çevre ve Şehircilik Müdürlüğü gözetiminde açık artırma usulüyle diğer paydaşlara satılır.'
        },
        {
          question: 'Yurt dışından düzenlenen vekaletname ile tapuda işlem yapılabilir mi?',
          answer: 'Evet. Türk Konsolosluklarında düzenlenen veya yabancı noterlerde düzenlenip Lahey Apostil Şerhi taşıyan, fotoğraflı ve özel yetkili vekaletnamelerle tapu devir işlemleri güvenle tamamlanabilir.'
        }
      ],
      en: [
        {
          question: 'Is the 5-year tenancy threshold mandatory for rent revision lawsuits?',
          answer: 'Yes. Pursuant to Article 344/3 of the Turkish Code of Obligations, an open-ended rent determination lawsuit realigning rent with market values requires that 5 full lease years have elapsed.'
        },
        {
          question: 'Why is the Foreign Exchange Purchase Certificate (DAB) mandatory for foreign property buyers?',
          answer: 'Central Bank regulations dictate that foreign buyers must route foreign currency through authorized Turkish banks to be sold to the Central Bank. The resulting DAB is a statutory condition precedent for title conveyance.'
        },
        {
          question: 'What happens to minority owners refusing the simple majority urban transformation agreement?',
          answer: 'Minority owners are formally served a 15-day notice to sign the majority resolution. If they decline, their land shares are auctioned to the remaining owners under the auspices of the Ministry of Environment.'
        },
        {
          question: 'Can Turkish real estate conveyancing be executed via foreign Powers of Attorney?',
          answer: 'Yes. Powers of Attorney executed at Turkish Consulates abroad or notarized with Hague Apostille legalization, containing embossed photographs and specific property authority, are fully enforceable.'
        }
      ]
    }
  },

  'commercial-corporate-law': {
    id: 'commercial-corporate-law',
    wordCountTarget: '1,200 - 1,500 words',
    metaKeywords: [
      'Şirketler ve ticaret hukuku',
      'yabancı sermayeli şirket kuruluşu',
      'Anonim ve Limited şirket',
      '6102 sayılı TTK',
      'hissedarlar sözleşmesi SHA',
      'birleşme ve devralma M&A',
      'kurumsal yönetim ve uyum',
      'İngiltere şirket kuruluşu Ltd',
      'yatırım teşvik belgesi',
      'ticari dava ve tahkim',
      'yabancı çalışma izni şirket ortağı'
    ],
    leadSummary: {
      tr: 'Resen Hukuk & Danışmanlık, 6102 sayılı Türk Ticaret Kanunu (TTK), 4875 sayılı Doğrudan Yabancı Yatırımlar Kanunu ve sınır ötesi kurumsal düzenlemeler tahtında yerli ve uluslararası şirketlere komple hukuki mimarlık sunar. Şirket kuruluşlarından birleşme ve devralmalara (M&A), yatırım teşvik belgelerinden hissedarlar sözleşmelerine (SHA) ve yönetim kurulu sorumluluklarına kadar tüm kurumsal süreçleri ticari hedeflerle uyumlu bir risk kalkanıyla yönetiyoruz.',
      en: 'Resen Legal delivers premier corporate and commercial counsel under the Turkish Commercial Code No. 6102 (TCC), the Foreign Direct Investment Law No. 4875, and cross-border commercial frameworks. From entity incorporation and investment incentives to cross-border M&A transactions, Shareholder Agreements (SHA), and executive fiduciary compliance, we safeguard multi-market enterprise capital.'
    },
    sections: {
      tr: [
        {
          title: '1. Şirket Kuruluşu, Sermaye Yapılandırması ve Yabancı Yatırımcı Mevzuatı',
          subtitle: 'Anonim Şirket (A.Ş.) ve Limited Şirket (LTD) Karşılaştırmalı Mimarisi',
          paragraphs: [
            'Türkiye’de yerli veya yabancı sermayeli ticari faaliyete başlarken şirket türünün seçimi (Anonim Şirket vs. Limited Şirket), kurucuların vergi yükümlülükleri, kamu borçlarından kişisel sorumlulukları ve gelecekteki hisse devri esneklikleri açısından en kritik stratejik karardır. 4875 sayılı Doğrudan Yabancı Yatırımlar Kanunu uyarınca yabancı yatırımcılar yerli yatırımcılarla tamamen eşit haklara sahiptir ve %100 yabancı ortaklı şirketler kurulabilir.',
            'TTK uyarınca Anonim Şirketlerde pay sahipleri şirket borçlarından ötürü yalnızca taahhüt ettikleri sermaye payıyla sınırlı sorumluyken, Limited Şirket ortakları ödenmeyen amme borçlarından (vergi, SGK primleri) şahsi malvarlıklarıyla doğrudan ve müteselsilen sorumludur. Ayrıca A.Ş.\'lerde hisse senedi veya geçici ilmühaber çıkarılmasından itibaren 2 yıl sonra yapılan pay devirleri gelir vergisinden (değer artış kazancı) tamamen muaftır.',
            'Büromuz, MERSİS kayıtlarının oluşturulması, şirket ana sözleşmesinin kurumsal yönetim ilkelerine uygun tanzimi, Rekabet Kurumu payı ödemeleri, imza sirküleri çıkarılması ve yabancı tüzel kişi ortakların apostilli ticaret sicil evraklarının tercümesini anahtar teslim yönetir. Rehberimiz: "Yabancı Yatırımcılar İçin Şirket Kuruluşu ve Yatırım Teşvikleri Rehberi".'
          ],
          bulletPoints: [
            {
              title: 'Anonim Şirket (A.Ş.) Avantajları',
              description: 'Hisse devirlerinde 2 yıl sonraki değer artış kazancı vergisi muafiyeti, noter onayı gerektirmeyen pay devri ve amme borçlarından kişisel dokunulmazlık.'
            },
            {
              title: 'Limited Şirket (LTD) Dinamikleri',
              description: 'Daha sade yönetim modeli; ancak hisse devirlerinin noter onayı ve ticaret sicili tescili zorunluluğu ve ortakların kamu borçlarından şahsi sorumluluğu.'
            },
            {
              title: 'Şube ve İrtibat Bürosu (Liaison Office)',
              description: 'Ticari faaliyette bulunmaksızın pazar araştırması ve temsil yürütecek yabancı şirketler için Sanayi Bakanlığı izinli irtibat bürosu kuruluşu.'
            }
          ]
        },
        {
          title: '2. Sanayi ve Teknoloji Bakanlığı Yatırım Teşvik Sistemi ve Muafiyetler',
          subtitle: 'KDV Muafiyeti, Gümrük Vergisi İstisnası ve Kurumlar Vergisi İndirimi',
          paragraphs: [
            'Türkiye’de sermaye yatırımı gerçekleştiren şirketler; Sanayi ve Teknoloji Bakanlığı tarafından verilen Yatırım Teşvik Belgeleri (YTB) ile devasa mali avantajlar elde edebilir. Teşvik sistemi; genel, bölgesel, öncelikli ve stratejik yatırımlar olmak üzere 4 temel kategoride yapılandırılmıştır.',
            'Bölgesel teşvik uygulamalarında Türkiye 6 yatırım bölgesine ayrılmış olup, yatırımın yapıldığı bölgeye göre KDV istisnası, makine-teçhizat ithalatında gümrük vergisi muafiyeti, vergi indirimi (indirimli kurumlar vergisi), sigorta primi işveren hissesi desteği ve faiz/kâr payı desteği sağlanır. Büromuz, teşvik belgesi fizibilite raporlarının hazırlanmasından belgenin kapatılması ve tamamlama vizesine kadar tüm idari süreci koordine eder.'
          ]
        },
        {
          title: '3. Hissedarlar Sözleşmesi (SHA) ve Ortaklar Arası Uyuşmazlıkların Önlenmesi',
          subtitle: 'Tag-Along, Drag-Along, Deadlock (Kilitlenme) ve Veto Hakları Mimarisi',
          paragraphs: [
            'Ticaret siciline tescil edilen Şirket Esas Sözleşmesi kamuya açık genel hükümleri içerirken, ortaklar arasındaki asıl ticari güç dengesini ve yönetim kurallarını belirleyen metin "Hissedarlar Sözleşmesi"dir (Shareholders Agreement - SHA). Türk Borçlar Kanunu kapsamında geçerli bir SHA, ortaklar arasındaki pay devir kısıtlamalarını ve veto haklarını bağlayıcı kılar.',
            'Hukuk ekibimiz; azınlık pay sahiplerini koruyan Birlikte Satma Hakkı (Tag-Along), çoğunluk pay sahiplerine şirketin tamamını satma yetkisi veren Birlikte Satışa Zorlama Hakkı (Drag-Along) ve %50-%50 ortaklıklarda karar alınamadığında devreye giren Kilitlenme Çözüm Mekanizmalarını (Russian Roulette, Texas Shootout vb.) tanzim eder.',
            'Esas sözleşmeye yansıtılamayan özel borç ilişkileri, cezai şartlar, rekabet etmeme taahhütleri ve uyuşmazlık durumunda İstanbul Tahkim Merkezi (ISTAC) veya Londra Uluslararası Tahkim Mahkemesi (LCIA) yetkisi SHA bünyesinde güvenceye alınır.'
          ],
          calloutBox: {
            type: 'strategy',
            title: 'Yönetim Kurulu ve Genel Kurul Karar Yeter Sayıları',
            content: 'Önemli sermaye artırımları, borçlanma limitleri, taşınmaz alım-satımı ve üst düzey yönetici atamaları gibi stratejik konularda Esas Sözleşme ile ağırlaştırılmış karar nisapları belirlenmeli ve bu kurallar SHA ile tahkim şartına bağlanmalıdır.'
          }
        },
        {
          title: '4. Birleşme ve Devralmalar (M&A) ile Kurumsal Hukuki Due Diligence',
          subtitle: 'Hisse Alım Sözleşmesi (SPA), Varlık Devirleri ve Rekabet Kurumu İzinleri',
          paragraphs: [
            'Şirket alım-satım ve devralma süreçleri, kapsamlı bir Hukuki Durum Tespiti (Legal Due Diligence) ile başlar. Şirketin geçmiş dönem vergi riskleri, iş hukuku ihtilafları, devam eden davaları, fikri mülkiyet haklarının aidiyeti ve üçüncü kişilerle yapılan sözleşmelerdeki kontrol değişikliği (Change of Control) maddeleri taranarak risk matrisi çıkarılır.',
            'Due Diligence sonrasında düzenlenen Hisse Alım Sözleşmesi (Share Purchase Agreement - SPA) ve Varlık Devir Sözleşmeleri ile satıcının beyan ve tekeffülleri (Reps & Warranties), tazminat limitleri (Cap/Basket) ve emanet hesap (Escrow) mekanizmaları düzenlenerek alıcının ve satıcının sermaye güvenliği sağlanır. Rekabet Kurulu tebliğlerindeki ciro eşiklerini aşan devirlerde izin başvuruları yürütülür.'
          ]
        },
        {
          title: '5. Sınır Ötesi Şirket Yapılanması ve İngiltere (UK) - Türkiye Ticari Köprüsü',
          subtitle: 'İngiltere’de LTD Kuruluşu, Holding Mimarisi ve Çifte Vergilendirmeyi Önleme',
          paragraphs: [
            'Uluslararası pazarlara açılan şirketler için İngiltere (Companies House) merkezli bir Ltd. şirket kuruluşu, küresel ödeme altyapılarına (Stripe, PayPal) erişim ve uluslararası prestij açısından büyük avantaj sunar. Türkiye ve Birleşik Krallık arasındaki Çifte Vergilendirmeyi Önleme Anlaşması (ÇVÖA) çerçevesinde temettü dağıtımları, stopaj oranları ve transfer fiyatlandırması kuralları uyumlu hale getirilir.',
            'Resen Hukuk, kurucuların Türkiye’deki operasyonları ile Londra’daki ana holding yapılarını uluslararası mevzuat standartlarında koordine ederek hem vergi hem de fikri haklar açısından korumalı bir küresel yapı tesis eder. Detaylı analiz için "İngiltere’de Şirket Kuruluşu: Süreç, Vergi ve Hukuk Rehberi" çalışmamızı okuyabilirsiniz.'
          ]
        },
        {
          title: '6. Dijital Çağda Kurumsal Yönetim, Uyum ve Yönetim Kurulu Sorumlulukları',
          subtitle: 'TTK m.553 Yönetim Kurulu Hukuki Sorumluluğu, İbra ve EGKS Sistemleri',
          paragraphs: [
            'Yönetim kurulu üyelerinin TTK m.553 uyarınca özen ve sadakat borçlarına aykırı eylemlerinden doğan şahsi sorumlulukları, şirket içi yetki devri yönergeleri (İç Yönerge) ve genel kurul ibra kararları ile hukuki denetim altına alınmalıdır. Elektronik Genel Kurul Sistemi (EGKS) ve Yönetim Kurulu Karar Defteri süreçlerinin dijitalleştirilmesi kurumsal güvenliği pekiştirir.',
            'Ayrıca şirketlerin istihdam ettiği kilit yöneticiler için rekabet yasağı taahhütnameleri, gizlilik sözleşmeleri (NDA) ve kişisel verilerin korunması (KVKK/GDPR) uyum projeleri büromuzca tanzim edilir. İnceleme: "Dijital Çağda Kurumsal Yönetim, Uyum ve Şirketler Hukuku".'
          ]
        },
        {
          title: '7. Yabancı Şirket Ortakları ve Kilit Personel İçin Çalışma İzinleri',
          subtitle: 'Uluslararası İşgücü Kanunu, 5 Türk İstihdam Kriteri ve Sermaye Muafiyetleri',
          paragraphs: [
            'Şirket ortağı olan yabancıların ve yönetim kurulu üyesi yabancı yöneticilerin Türkiye’de yasal olarak imza atabilmesi ve faaliyette bulunabilmesi için Çalışma ve Sosyal Güvenlik Bakanlığı’ndan çalışma izni alınması şarttır.',
            'Uygulamada her bir yabancı çalışan için 5 Türk vatandaşı istihdam edilmesi kuralı bulunmakla birlikte, yabancı sermayeli şirket ortakları için sermaye payı (en az 40.000 TL veya ödenmiş sermaye baremleri) ve doğrudan yabancı yatırım kriterleri kapsamında muafiyetler mevcuttur. Büromuz tüm izin süreçlerini Çalışma Bakanlığı portalı üzerinden sonuçlandırır. Ayrıntılar: "Yabancı Şirket Ortakları ve Personel Çalışma İzni Süreci".'
          ]
        },
        {
          title: '8. Ticari Uyuşmazlıklar, Tahkim ve Sermaye Kaybı Yönetimi (TTK m.376)',
          subtitle: 'Teknik İflas Tedbirleri, Genel Kurul İptal Davaları ve ISTAC Tahkimi',
          paragraphs: [
            'Döviz kurlarındaki dalgalanmalar nedeniyle şirket bilançolarında sermaye ve kanuni yedek akçelerin karşılıksız kalması (TTK m.376 - Borca Batıklık ve Sermaye Kaybı), yönetim kuruluna derhal genel kurulu toplantıya çağırma ve sermaye tamamlama veya azaltım tedbirlerini alma yükümlülüğü yükler.',
            'Büromuz, teknik iflas durumundaki şirketlerin sermaye restorasyonunu yönetir; hukuka aykırı genel kurul kararlarının iptali davalarında (TTK m.445) ve uluslararası ticari sözleşmelerden doğan alacak uyuşmazlıklarında İstanbul Tahkim Merkezi (ISTAC) ve ICC nezdinde şirketleri temsil eder.'
          ]
        }
      ],
      en: [
        {
          title: '1. Entity Formation, Capital Structuring & Foreign Investor Regulation',
          subtitle: 'Joint Stock Company (A.Ş.) vs. Limited Liability Company (Ltd. Şti.) Architecture',
          paragraphs: [
            'Selecting an operating entity in Turkey, principally between an Anonim Şirket (A.Ş.) and a Limited Şirket (Ltd. Şti.), determines shareholder tax exposure, public debt liability mechanisms, and capital transfer agility. Under Foreign Direct Investment Law No. 4875, foreign investors enjoy full national treatment, enabling 100% foreign-owned single-shareholder corporate structures.',
            'Limited company shareholders are generally not liable for ordinary company debts under the Turkish Commercial Code. However, under Law No. 6183, they may be directly liable for public receivables that cannot be collected from the company, limited to their capital share ratio. Joint and several liability may arise in specific share-transfer or period-based public debt scenarios. Share transfers in joint stock companies may offer significant tax advantages, particularly where share certificates of a fully liable Turkish corporation are held for more than two years, subject to the conditions of the Income Tax Law and the taxpayer’s status.',
            'Our corporate department develops case-specific legal strategies for end-to-end setups: Central Registry (MERSİS) filings, tailored Articles of Association embodying corporate governance standards, Competition Authority statutory levies, and sworn legalization of foreign corporate parent entities. Read our guide: "Foreign Investors Guide: Company Formation & Investment Incentives in Turkey".'
          ],
          bulletPoints: [
            {
              title: 'Joint Stock Company (A.Ş.) Merits',
              description: 'Potential capital gains tax advantages on share transfers where share certificates are held for more than two years under Income Tax Law criteria; flexible share transfer mechanics; limitation of shareholder liability for ordinary corporate debts.'
            },
            {
              title: 'Limited Company (Ltd. Şti.) Parameters',
              description: 'Accessible minimum capitalization; notarial authentication and Trade Registry registration required for share transfers; direct liability for uncollectible public debts limited to capital share ratios under Law No. 6183.'
            },
            {
              title: 'Liaison & Representative Offices',
              description: 'Enabling foreign corporations to conduct non-commercial market assessments and regional coordination under Ministry of Industry licensing.'
            }
          ]
        },
        {
          title: '2. Ministry of Industry & Technology Investment Incentive Schemes',
          subtitle: 'VAT Exemptions, Customs Duty Waivers & Corporate Income Tax Relief',
          paragraphs: [
            'Corporations deploying capital in Turkey can secure immense fiscal advantages via Investment Incentive Certificates (YTB) granted by the Ministry of Industry and Technology. The system spans general, regional, priority, and strategic investment frameworks.',
            'Under regional schemes, Turkey is mapped into 6 incentive zones. Depending on location, investments qualify for VAT exemptions, customs duty waivers on machinery imports, substantial corporate income tax reductions, employer social security premium subsidies, and interest/profit-share support. Our firm handles technical feasibility drafting through final completion audits.'
          ]
        },
        {
          title: '3. Shareholder Agreements (SHA) & Corporate Governance Control Mechanisms',
          subtitle: 'Structuring Tag-Along, Drag-Along, Deadlock Solutions & Pre-Emption Rights',
          paragraphs: [
            'While registered Articles of Association govern public-facing statutory affairs, the private Shareholder Agreement (SHA) dictates actual commercial power distribution, veto thresholds, and exit covenants. Under Turkish corporate law, an expertly crafted SHA establishes legally enforceable transfer restrictions and operational covenants.',
            'Our lawyers structure robust Tag-Along minority protection clauses, Drag-Along liquidity enforcement rights, pre-emptive option rights, and Deadlock resolution mechanisms (e.g., Russian Roulette, Texas Shootout, or valuation-based call options).',
            'Confidential governance stipulations, including liquidated damages covenants, non-solicitation undertakings, and international arbitration provisions under the Istanbul Arbitration Centre (ISTAC) or London Court of International Arbitration (LCIA), are preserved inside the SHA.'
          ],
          calloutBox: {
            type: 'strategy',
            title: 'Super-Majority Governance Thresholds',
            content: 'Strategic operational decisions, including capital restructuring, significant indebtedness, real estate conveyancing, and C-level executive removals, must require super-majority voting quotas coupled with arbitration clauses.'
          }
        },
        {
          title: '4. Mergers & Acquisitions (M&A) and Legal Due Diligence Audits',
          subtitle: 'Share Purchase Agreements (SPA), Asset Deals, and Regulatory Clearances',
          paragraphs: [
            'Corporate acquisitions mandate comprehensive Legal Due Diligence to expose retroactive liabilities: historical corporate tax exposures, labor litigations, intellectual property ownership chains, and change-of-control covenants across commercial agreements.',
            'Following the due diligence assessment, we draft customized Share Purchase Agreements (SPA) and Asset Transfer Deeds, integrating balanced Representations & Warranties, indemnity caps, de minimis thresholds, and escrow retention mechanisms. We also file formal clearance notifications before the Turkish Competition Authority when mandatory turnover thresholds are triggered.'
          ]
        },
        {
          title: '5. Cross-Border Corporate Structuring & The UK-Turkey Commercial Corridor',
          subtitle: 'UK Limited Formations, International Holding Structuring & Double Tax Treaties',
          paragraphs: [
            'For enterprises expanding across European and global markets, establishing an English Limited Company registered with Companies House unlocks international payment gateways and corporate stature. We align corporate architectures under the UK-Turkey Double Taxation Avoidance Treaty, harmonizing dividend withholding taxes and transfer pricing compliance.',
            'Resen Legal unifies Turkish headquarters operations with London-based holding structures, safeguarding intellectual assets and operating cashflows under international commercial standards. Review: "UK Company Formation: Strategic Tax & Legal Guidance".'
          ]
        },
        {
          title: '6. Corporate Governance, Compliance & Executive Fiduciary Liabilities',
          subtitle: 'Director Liability under TCC Art. 553, Internal Guidelines & Electronic General Assemblies',
          paragraphs: [
            'Corporate directors face personal fiduciary liability under Article 553 of the TCC for breaches of duty and care. We insulate executive boards through internal governance guidelines (İç Yönerge) and structured General Assembly release resolutions (İbra). Implementing Electronic General Assembly (EGKS) protocols solidifies digital governance integrity.',
            'In tandem, we structure non-compete covenants, non-disclosure agreements (NDA), and corporate personal data protection compliance (KVKK/GDPR) to shield enterprises from regulatory fines and litigation. See our brief: "Corporate Governance in the Digital Era: Fiduciary Compliance".'
          ]
        },
        {
          title: '7. Work Permits for Foreign Corporate Shareholders & Executive Personnel',
          subtitle: 'International Labor Force Law, Ministry Evaluation Criteria & Exemption Frameworks',
          paragraphs: [
            'Foreign shareholders and directors must be assessed according to their role and residence status. A limited company shareholder-manager or a shareholder board member of a joint stock company may require a work permit to actively work in Turkey, while non-resident board members of joint stock companies and non-manager shareholders may fall within work permit exemption categories.',
            'As a general evaluation criterion, work permit applications often require at least five Turkish citizen employees for each foreign employee. However, exemptions and sector-specific criteria may apply depending on investment quality, turnover, technology sector status, the foreigner’s prior lawful stay in Turkey, and Ministry practice. Our corporate team formulates the appropriate legal strategy and coordinates applications through competent authority portals, subject to current legislation and administrative practice. Consult: "Work Permits for Foreign Shareholders & Key Personnel in Turkey".'
          ]
        },
        {
          title: '8. Commercial Dispute Resolution, Arbitration & Corporate Restructuring',
          subtitle: 'Capital Impairment Measures (TCC Art. 376), Annulment Lawsuits & ISTAC Arbitration',
          paragraphs: [
            'Fluctuations in foreign exchange parity frequently precipitate equity deficits where capital and statutory legal reserves become impaired under Article 376 of the TCC (Technical Insolvency). In such instances, executive boards must convene extraordinary general assemblies to execute capital replenishment or debt-to-equity debt conversions.',
            'Resen Legal counsels corporate clients through equity restorations, represents shareholders in General Assembly decision annulment actions (TCC Art. 445), and represents parties in cross-border commercial disputes before the Istanbul Arbitration Centre (ISTAC), LCIA, and ICC tribunals, tailoring legal strategies to jurisdictional requirements.'
          ]
        }
      ]
    },
    relatedArticles: {
      tr: [
        {
          slug: 'foreign-investors-guide-company-formation-investment-incentives-turkiye',
          title: 'Yabancı Yatırımcılar İçin Şirket Kuruluşu ve Yatırım Teşvikleri Rehberi',
          badge: 'Şirket Kuruluşu',
          description: 'Doğrudan yabancı yatırımlar, A.Ş. ve LTD kuruluş adımları, teşvik bölgeleri ve vergi indirimleri.'
        },
        {
          slug: 'corporate-governance-in-the-digital-age',
          title: 'Dijital Çağda Kurumsal Yönetim, Uyum ve Şirketler Hukuku',
          badge: 'Kurumsal Uyum',
          description: 'Yönetim kurulu sorumlulukları, dijital genel kurullar ve hissedarlar arası denetim mekanizmaları.'
        },
        {
          slug: 'ingilterede-sirket-kurulusu',
          title: 'İngiltere’de Şirket Kuruluşu: Süreç, Vergi ve Hukuk Rehberi',
          badge: 'UK Şirket',
          description: 'Companies House tescili, kurumsal bankacılık, çifte vergilendirme ve holding yapıları.'
        },
        {
          slug: 'turkiyede-calisma-izni-basvurusu-nasil-yapilir',
          title: 'Yabancı Şirket Ortakları ve Personel Çalışma İzni Süreci',
          badge: 'Çalışma İzinleri',
          description: 'Bakanlık değerlendirme kriterleri, 5 Türk istihdam kuralı ve sermaye gereksinimleri.'
        }
      ],
      en: [
        {
          slug: 'foreign-investors-guide-company-formation-investment-incentives-turkiye',
          title: 'Foreign Investors Guide: Company Formation & Investment Incentives in Turkey',
          badge: 'Entity Setup',
          description: 'Step-by-step roadmap on incorporation, incentive certificate tiers, and tax exemptions.'
        },
        {
          slug: 'corporate-governance-in-the-digital-age',
          title: 'Corporate Governance in the Digital Era: Fiduciary Compliance',
          badge: 'Governance & Risk',
          description: 'Board responsibilities, digital general assemblies, and intra-shareholder controls.'
        },
        {
          slug: 'ingilterede-sirket-kurulusu',
          title: 'UK Company Formation: Strategic Tax & Legal Guidance',
          badge: 'UK Expansion',
          description: 'Companies House registration, holding company architectures, and international banking.'
        },
        {
          slug: 'turkiyede-calisma-izni-basvurusu-nasil-yapilir',
          title: 'Work Permits for Foreign Shareholders & Key Personnel in Turkey',
          badge: 'Executive Mobility',
          description: 'Ministry criteria, statutory workforce quotas, and corporate compliance.'
        }
      ]
    },
    faqList: {
      tr: [
        {
          question: 'Yabancı bir kişi veya şirket Türkiye’de tek başına %100 pay sahibi olarak şirket kurabilir mi?',
          answer: 'Evet. 4875 sayılı Doğrudan Yabancı Yatırımlar Kanunu ve 6102 sayılı TTK uyarınca yabancı gerçek veya tüzel kişiler, Türk vatandaşı bir ortağa ihtiyaç duymaksızın %100 yabancı sermayeli tek ortaklı Anonim veya Limited şirket kurabilir.'
        },
        {
          question: 'Anonim Şirket mi yoksa Limited Şirket mi kurmak daha avantajlıdır?',
          answer: 'Büyük ölçekli yatırımlar, dış finansman veya ortak alma hedefi olan ya da ileride hisse devri planlayan işletmeler için Anonim Şirket (A.Ş.) vergi muafiyetleri ve kamu borçlarından kişisel sorumluluğun olmaması nedeniyle çok daha avantajlıdır. Küçük ölçekli aile işletmeleri için ise Limited Şirket daha sade bir yönetim yapısı sunar.'
        },
        {
          question: 'Hissedarlar Sözleşmesi (SHA) ile Esas Sözleşme arasında fark nedir?',
          answer: 'Esas sözleşme Ticaret Sicili’nde yayınlanan ve üçüncü kişileri de bağlayan resmi kurallardır. Hissedarlar Sözleşmesi (SHA) ise ortaklar arasında gizli kalan, veto hakları, hisse devir kısıtlamaları (Tag/Drag along) ve kilitlenme çözümlerini düzenleyen özel borçlar hukuku sözleşmesidir.'
        },
        {
          question: 'Yatırım Teşvik Belgesi yabancı yatırımcılara hangi avantajları sağlar?',
          answer: 'Sanayi ve Teknoloji Bakanlığı’ndan alınan teşvik belgesi; KDV istisnası, gümrük vergisi muafiyeti, indirimli kurumlar vergisi, SGK işveren hissesi desteği ve faiz/kâr payı desteği gibi doğrudan maliyet düşürücü destekler sağlar.'
        }
      ],
      en: [
        {
          question: 'Can a foreign national or foreign company incorporate a 100% owned Turkish entity without local partners?',
          answer: 'Yes. Under the Foreign Direct Investment Law No. 4875 and the TCC, foreign natural persons or corporations can incorporate single-shareholder Anonim or Limited companies with 100% foreign ownership.'
        },
        {
          question: 'What is the primary operational advantage of an A.Ş. over an Ltd. in Turkey?',
          answer: 'In a Joint Stock Company (A.Ş.), shareholder liability for ordinary corporate obligations is limited to subscribed share capital under the TCC, and public debts are pursued against the legal entity and its legal representatives under Law No. 6183. In addition, share transfers may provide capital gains tax relief where share certificates are held for more than two years, subject to statutory conditions. In a Limited Company, shareholders may be directly liable for uncollectible public debts in proportion to their capital share ratio under Law No. 6183.'
        },
        {
          question: 'What distinguishes a Shareholders Agreement (SHA) from Articles of Association?',
          answer: 'The Articles of Association constitute public constitutional records registered at the Trade Registry. The SHA is a confidential, legally binding contract governing veto thresholds, transfer restrictions (tag/drag along), and deadlock remedies.'
        },
        {
          question: 'What specific benefits does an Investment Incentive Certificate (YTB) offer foreign investors?',
          answer: 'Issued by the Ministry of Industry, an incentive certificate affords full VAT exemption, customs duty waivers on machinery imports, reduced corporate tax rates, employer social security premium relief, and interest subsidies.'
        }
      ]
    }
  }
};
