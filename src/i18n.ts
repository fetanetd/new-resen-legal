import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      nav: {
        services: 'Services',
        team: 'Team',
        blog: 'Blog',
        contact: 'Contact',
        about: 'About Us',
      },
      common: {
        learnMore: 'Learn More',
        readArticle: 'Read Article',
        minRead: 'min read',
        processing: 'Processing...',
        close: 'Close',
        getInTouch: 'Get in Touch',
        backToHome: 'Back to Home',
        promptTitle: 'Need Legal Assistance?',
        promptText: 'Our expert legal consultants are ready to guide you. Contact us today for professional solutions.',
        promptCTA: 'Get Free Consultation',
      },
      accessibility: {
        serviceCard: 'Service details for {{service}}',
      },
      cookies: {
        title: 'Cookie Policy',
        text: 'We use cookies to enhance your experience and analyze our traffic. By clicking "Accept", you consent to our use of cookies.',
        accept: 'Accept All',
        decline: 'Reject Non-Essential',
        manage: 'Manage Preferences'
      },
      team: {
        subtitle: 'Our Experts',
        title: 'Legal minds focused on your success.',
        readBio: 'Read Biography',
        defaultBio: 'Dedicated to providing diligent legal solutions for international mobility and corporate stability.',
        updatingBio: 'Biography information is currently being updated.'
      },
      legal: {
        dataProtection: {
          label: 'Data Protection',
          title: 'Data Protection Notice (KVKK)',
          content: `
            <h3 class="text-xl font-serif mb-4">Data Protection Notice (KVKK)</h3>
            <p class="mb-4"><strong>Data Controller</strong></p>
            <p class="mb-4">Resen Legal ("Firm") acts as a data controller within the scope of the Turkish Personal Data Protection Law No. 6698 ("KVKK").</p>
            <p class="mb-4"><strong>Purpose of Processing Personal Data</strong></p>
            <p class="mb-4">Your personal data is processed for the following purposes: execution of legal consultancy, conducting communication activities, fulfilling legal obligations.</p>
            <p class="mb-4"><strong>Rights of the Data Subject</strong></p>
            <p class="mb-4">Under Article 11 of the KVKK, you have rights to learn if your data is processed, request information, request correction, deletion or object to results.</p>
            <p class="mb-4"><strong>Contact</strong></p>
            <p class="mb-8">To exercise your rights, you may contact info@resenlegal.com</p>
          `
        },
        cookiePolicy: {
          label: 'Cookie Policy',
          title: 'Cookie Policy',
          content: `
            <h3 class="text-xl font-serif mb-4">Cookie Policy</h3>
            <p class="mb-4"><strong>Cookie Usage</strong></p>
            <p class="mb-4">Resen Legal website uses cookies to improve user experience. Cookies are small text files placed on your device.</p>
            <p class="mb-4"><strong>Types of Cookies Used</strong></p>
            <p class="mb-4">Analytical, essential and preference cookies are used to analyze traffic and remember settings.</p>
            <p class="mb-4"><strong>Contact</strong></p>
            <p class="mb-8">For questions about our cookie policy, you may contact info@resenlegal.com</p>
          `
        },
        privacyPolicy: {
          label: 'Privacy Policy',
          title: 'Privacy Policy',
          content: `
            <h3 class="text-xl font-serif mb-4">Privacy Policy</h3>
            <p class="mb-4">At Resen Legal, we respect your privacy and attach great importance to the protection of your personal data.</p>
            <p class="mb-4"><strong>Information Collection</strong></p>
            <p class="mb-4">We collect information through contact forms and website usage statistics.</p>
            <p class="mb-4"><strong>Information Security</strong></p>
            <p class="mb-4">Appropriate technical measures are taken to secure your personal data.</p>
            <p class="mb-4"><strong>Contact</strong></p>
            <p class="mb-8">For questions about our privacy policy, you may contact info@resenlegal.com</p>
          `
        }
      },
      hero: {
        slogan: 'We handle the matters that matter.',
        subtext: 'High-end legal consultancy delivering precise solutions for immigration, corporate, and GDPR challenges.',
        cta: 'Book a Consultation',
        secondaryCta: 'Explore Our Services',
        floatingAccent: 'Trusted Legal Guidance',
      },
      form: {
        title: 'Direct advice from lawyers who know the law and the land.',
        name: 'Full Name',
        email: 'Email Address',
        message: 'How can we help you?',
        submit: 'Send Message',
        getInTouch: 'Get in Touch',
        offices: 'Offices',
        emailCorrespondence: 'Email Correspondence',
        phoneInquiry: 'Phone Inquiry',
        legalDepartment: 'Legal Department',
        otherMatter: 'Other Matter',
        messagePlaceholder: 'Tell us about the matters that matter...',
        success: 'Success! Your message has been sent successfully.',
        errorPermission: 'Submission failed: Permission denied. Please check if you filled everything correctly.',
        errorUnexpected: 'An unexpected error occurred: ',
        errorNameShort: 'Name must be at least 2 characters long.',
        errorEmailInvalid: 'Please enter a valid email address.',
        errorMessageShort: 'Message must be at least 5 characters long.',
      },
      footer: {
        tagline: 'Professional. Diligent. Future-proof.',
        rights: 'All rights reserved.',
      },
      blogSection: {
        tagline: 'Legal Insights',
        title: 'Deep dives into legal trends and advisory.',
        addNewPost: 'Add New Post',
        filter: 'Filter:',
        sortBy: 'Sort By:',
        all: 'All',
        clearAll: 'Clear all',
        newest: 'Newest First',
        oldest: 'Oldest First',
        categoryAZ: 'Category (A-Z)',
        languageSort: 'Language',
        by: 'By',
        writtenBy: 'Written By',
        backToBlog: 'Back to Blog',
        shareInsights: 'Share Insights',
        contents: 'Contents',
        backToTop: 'Back to top',
        aboutAuthor: 'About the Author',
        continueReading: 'Continue Reading',
        relatedInsights: 'Related Insights',
        exploreAllPosts: 'Explore all posts',
        deleteConfirm: 'Are you sure you want to delete this post?'
      },
      about: {
        tagline: 'Excellence in Legal Practice',
        title: 'Crafting legal solutions with a heritage of excellence and a vision for the future.',
        subtitle: 'At Resen Legal & Consultancy, we bridge the gap between tradition and innovation. Our firm is built on a foundation of rigorous legal analysis and a commitment to personalized service.',
        excellenceIntegrity: 'Excellence & Integrity',
        ourMission: 'Our Mission',
        missionText: 'To provide high-quality legal services with a focus on integrity, excellence, and client success. We strive to navigate the complexities of the law so our clients don\'t have to.',
        ourVision: 'Our Vision',
        visionText: 'To be the leading boutique legal consultancy recognized for innovative solutions and unwavering commitment to ethical standards in international and local law.',
        ourValues: 'Our Values',
        valuesText: 'Integrity, client-centric approach, excellence in research, and a collaborative spirit define everything we do at Resen Legal.',
        history: {
          title: 'Our Heritage',
          text: 'Founded by senior legal professionals with decades of combined experience, Resen has evolved from a boutique practice into a leading multidisciplinary consultancy.'
        },
        mission: {
          title: 'Our Mission',
          text: 'To provide sophisticated legal guidance that empowers our international and local clients to navigate complex regulatory landscapes with confidence and clarity.'
        },
        values: {
          title: 'Our Values',
          text: 'Integrity, Diligence, and Innovation. We believe that the best legal solutions are those that anticipate future challenges while respecting established principles.'
        }
      },
      servicesPage: {
        specializedExpertise: 'Specialized Expertise',
        customSolutionTitle: 'Need a customized legal solution?',
        customSolutionText: 'Our team is ready to discuss your specific needs and create a tailored roadmap for your legal challenges.',
        scheduleConsultation: 'Schedule a Consultation'
      },
      blogPage: {
        subtitle: 'Our perspectives on the evolving legal landscape and matters that matter to you.'
      },
      blogAdmin: {
        editPost: 'Edit Blog Post',
        createPost: 'Create New Blog Post',
        category: 'Category',
        newCategoryPlaceholder: 'New category...',
        selectCategory: 'Select Category',
        addNewCategory: 'Add New Category',
        author: 'Author',
        selectAuthor: 'Select Author',
        date: 'Date',
        imageUrl: 'Image URL',
        imageGallery: 'Image Gallery',
        autoFindImage: 'Auto-Find Image',
        magicTranslation: 'Magic Translation',
        magicSub: 'Fill one language and translate to others',
        from: 'From:',
        translating: 'Translating...',
        autoTranslate: 'Auto-Translate',
        version: 'Version',
        required: 'Required',
        title: 'Title',
        excerpt: 'Excerpt',
        content: 'Content',
        cancel: 'Cancel',
        saving: 'Saving...',
        updatePost: 'Update Post',
        publishPost: 'Publish Post'
      },
      teamPage: {
        meetExperts: 'Meet the Experts',
        professionalTeam: 'Our Professional Team',
        commitmentExcellence: 'Commitment to Excellence',
        commitmentText: 'At Resen Legal, our team is more than just a group of legal professionals. We are a collective of strategic thinkers, problem solvers, and dedicated advocates for our clients. We believe that legal consultancy is not just about knowing the law, but about understanding the human and business elements behind every case.',
        collaborativeApproach: 'Collaborative Approach',
        collaborativeText: 'We work across borders and disciplines to provide comprehensive support. Whether you are dealing with local regulations or complex international matters, our team collaborates seamlessly to ensure you receive the highest standard of service.'
      },
      serviceDetail: {
        backToHome: 'Back to Home',
        expertPracticeArea: 'Expert Practice Area',
        ourMethodology: 'Our Methodology',
        sharePracticeArea: 'Share This Practice Area:',
        beginConsultation: 'Begin a Consultation',
        consultationSubtext: 'Discuss your specific legal matter with our specialists in {{service}}.',
        discussMatter: 'Discuss Your Matter',
        relatedInsights: 'Related Insights',
        notFound: 'Service Not Found',
        introText: 'At Resen Legal, we understand that jurisdictional complexities require not just legal knowledge, but strategic foresight. Our team specializes in the nuanced application of international law to ensure your interests are protected across borders.',
        methodologyText: 'We handle the matters that matter through a rigorous, four-stage process that combines in-depth research, multi-disciplinary consultation, and aggressive advocacy. Whether you are an enterprise seeking global stability or an individual navigating life-changing transitions, our counsel is direct, diligent, and future-proof.'
      }
    }
  },
  tr: {
    translation: {
      nav: {
        services: 'Hizmetler',
        team: 'Ekibimiz',
        blog: 'Blog',
        contact: 'İletişim',
        about: 'Hakkımızda',
      },
      common: {
        learnMore: 'Daha Fazla Bilgi',
        readArticle: 'Makaleyi Oku',
        minRead: 'dk okuma',
        processing: 'İşleniyor...',
        close: 'Kapat',
        getInTouch: 'İletişime Geçin',
        backToHome: 'Ana Sayfaya Dön',
        promptTitle: 'Hukuki Desteğe mi İhtiyacınız Var?',
        promptText: 'Uzman hukuk danışmanlarımız size rehberlik etmeye hazır. Profesyonel çözümler için bugün bizimle iletişime geçin.',
        promptCTA: 'Ücretsiz Danışmanlık Alın',
      },
      accessibility: {
        serviceCard: '{{service}} için hizmet detayları',
      },
      cookies: {
        title: 'Çerez Politikası',
        text: 'Deneyiminizi geliştirmek ve trafiğimizi analiz etmek için çerezler kullanıyoruz. "Kabul Et"e tıklayarak, çerez kullanımımızı onaylamış olursunuz.',
        accept: 'Hepsini Kabul Et',
        decline: 'Gerekli Olmayanları Reddet',
        manage: 'Tercihleri Yönet'
      },
      team: {
        subtitle: 'Uzmanlarımız',
        title: 'Başarınıza odaklanmış hukukçular.',
        readBio: 'Biyografiyi Oku',
        defaultBio: 'Uluslararası hareketlilik ve kurumsal istikrar için titiz hukuki çözümler sunmaya adanmış.',
        updatingBio: 'Biyografi bilgileri şu anda güncellenmektedir.'
      },
      legal: {
        dataProtection: {
          label: 'Veri Koruma',
          title: 'Veri Koruma Bildirimi (KVKK)',
          content: `
            <h3 class="text-xl font-serif mb-4">Veri Koruma Bildirimi (KVKK)</h3>
            <p class="mb-4"><strong>Veri Sorumlusu</strong></p>
            <p class="mb-4">Resen Legal ("Firma"), 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu olarak hareket etmektedir.</p>
            <p class="mb-4"><strong>Kişisel Verilerin İşlenme Amacı</strong></p>
            <p class="mb-4">Kişisel verileriniz; hukuki danışmanlık hizmetlerinin yürütülmesi, iletişim faaliyetlerinin sürdürülmesi ve yasal yükümlülüklerin yerine getirilmesi amaçlarıyla işlenmektedir.</p>
            <p class="mb-4"><strong>İlgili Kişinin Hakları</strong></p>
            <p class="mb-4">KVKK 11. maddesi uyarınca; verilerinizin işlenip işlenmediğini öğrenme, bilgi talep etme, düzeltme, silme veya sonuçlara itiraz etme haklarına sahipsiniz.</p>
            <p class="mb-4"><strong>İletişim</strong></p>
            <p class="mb-8">Haklarınızı kullanmak için info@resenlegal.com adresi üzerinden bizimle iletişime geçebilirsiniz.</p>
          `
        },
        cookiePolicy: {
          label: 'Çerez Politikası',
          title: 'Çerez Politikası',
          content: `
            <h3 class="text-xl font-serif mb-4">Çerez Politikası</h3>
            <p class="mb-4"><strong>Çerez Kullanımı</strong></p>
            <p class="mb-4">Resen Legal web sitesi, kullanıcı deneyimini geliştirmek için çerezler kullanır. Çerezler cihazınıza yerleştirilen küçük metin dosyalarıdır.</p>
            <p class="mb-4"><strong>Kullanılan Çerez Türleri</strong></p>
            <p class="mb-4">Trafiği analiz etmek ve ayarları hatırlamak için analitik, zorunlu ve tercih çerezleri kullanılmaktadır.</p>
            <p class="mb-4"><strong>İletişim</strong></p>
            <p class="mb-8">Çerez politikamız hakkındaki sorularınız için info@resenlegal.com adresi üzerinden iletişime geçebilirsiniz.</p>
          `
        },
        privacyPolicy: {
          label: 'Gizlilik Politikası',
          title: 'Gizlilik Politikası',
          content: `
            <h3 class="text-xl font-serif mb-4">Gizlilik Politikası</h3>
            <p class="mb-4">Resen Legal olarak gizliliğinize saygı duyuyor ve kişisel verilerinizin korunmasına büyük önem veriyoruz.</p>
            <p class="mb-4"><strong>Bilgi Toplama</strong></p>
            <p class="mb-4">İletişim formları ve web sitesi kullanım istatistikleri aracılığıyla bilgi toplamaktayız.</p>
            <p class="mb-4"><strong>Bilgi Güvenliği</strong></p>
            <p class="mb-4">Kişisel verilerinizin güvenliğini sağlamak için uygun teknik tedbirler alınmaktadır.</p>
            <p class="mb-4"><strong>İletişim</strong></p>
            <p class="mb-8">Gizlilik politikamız hakkındaki sorularınız için info@resenlegal.com adresi üzerinden iletişime geçebilirsiniz.</p>
          `
        }
      },
      hero: {
        slogan: 'Sizin için önemli olanı önemsiyoruz.',
        subtext: 'Göçmenlik, kurumsal ve GDPR zorlukları için hassas çözümler sunan üst düzey hukuk danışmanlığı.',
        cta: 'Danışmanlık Alın',
        secondaryCta: 'Hizmetlerimizi Keşfedin',
        floatingAccent: 'Güvenilir Hukuki Rehberlik',
      },
      form: {
        title: 'Yasayı ve toprakları bilen avukatlardan doğrudan tavsiye.',
        name: 'Ad Soyad',
        email: 'E-posta Adresi',
        message: 'Size nasıl yardımcı olabiliriz?',
        submit: 'Mesaj Gönder',
        getInTouch: 'Bize Ulaşın',
        offices: 'Ofislerimiz',
        emailCorrespondence: 'E-posta İletişimi',
        phoneInquiry: 'Telefon Sorgusu',
        legalDepartment: 'Hukuk Departmanı',
        otherMatter: 'Diğer Konular',
        messagePlaceholder: 'Size nasıl yardımcı olabiliriz anlatın...',
        success: 'Başarılı! Mesajınız başarıyla gönderildi.',
        errorPermission: 'Gönderim başarısız: İzin reddedildi. Lütfen alanları doğru doldurduğunuzdan emin olun.',
        errorUnexpected: 'Beklenmedik bir hata oluştu: ',
        errorNameShort: 'İsim en az 2 karakter olmalıdır.',
        errorEmailInvalid: 'Lütfen geçerli bir e-posta adresi girin.',
        errorMessageShort: 'Mesaj en az 5 karakter olmalıdır.',
      },
      footer: {
        tagline: 'Profesyonel. Titiz. Gelecek Odaklı.',
        rights: 'Tüm hakları saklıdır.',
      },
      blogSection: {
        tagline: 'Hukuki Görüşler',
        title: 'Hukuki trendler ve danışmanlık üzerine derinlemesine incelemeler.',
        addNewPost: 'Yeni Yazı Ekle',
        filter: 'Filtrele:',
        sortBy: 'Sırala:',
        all: 'Hepsi',
        clearAll: 'Hepsini temizle',
        newest: 'En Yeni',
        oldest: 'En Eski',
        categoryAZ: 'Kategori (A-Z)',
        languageSort: 'Dil',
        by: 'Yazar:',
        writtenBy: 'Yazılı:',
        backToBlog: 'Blog\'a Dön',
        shareInsights: 'Paylaş',
        contents: 'İçindekiler',
        backToTop: 'Başa Dön',
        aboutAuthor: 'Yazar Hakkında',
        continueReading: 'Okumaya Devam Et',
        relatedInsights: 'İlgili Yazılar',
        exploreAllPosts: 'Tüm yazıları keşfet',
        deleteConfirm: 'Bu yazıyı silmek istediğinizden emin misiniz?'
      },
      about: {
        tagline: 'Hukuk Pratiğinde Mükemmellik',
        title: 'Geçmişin birikimi ve geleceğin vizyonuyla hukuki çözümler üretiyoruz.',
        subtitle: 'Resen Legal & Consultancy olarak gelenek ile inovasyon arasındaki köprüyü kuruyoruz. Firmamız, titiz hukuki analizler ve kişiselleştirilmiş hizmet anlayışı üzerine inşa edilmiştir.',
        excellenceIntegrity: 'Mükemmellik ve Dürüstlük',
        ourMission: 'Misyonumuz',
        missionText: 'Dürüstlük, mükemmellik ve müvekkil başarısına odaklanarak yüksek kaliteli hukuk hizmetleri sunmak. Müvekkillerimizin yasanın karmaşıklıklarıyla uğraşmak zorunda kalmaması için çalışıyoruz.',
        ourVision: 'Vizyonumuz',
        visionText: 'Uluslararası ve yerel hukukta yenilikçi çözümler ve etik standartlara sarsılmaz bağlılığı ile tanınan lider butik hukuk danışmanlığı olmak.',
        ourValues: 'Değerlerimiz',
        valuesText: 'Dürüstlük, müvekkil odaklı yaklaşım, araştırmada mükemmellik ve işbirlikçi ruh, Resen Legal\'de yaptığımız her şeyi tanımlar.',
        history: {
          title: 'Geçmişimiz',
          text: 'Onlarca yıllık birleşik deneyime sahip kıdemli hukuk profesyonelleri tarafından kurulan Resen, butik bir danışmanlıktan lider bir multidisipliner yapıya dönüşmüştür.'
        },
        mission: {
          title: 'Misyonumuz',
          text: 'Uluslararası ve yerel müvekkillerimizin karmaşık düzenleyici süreçleri güvenle ve netlikle yönetmelerini sağlayacak sofistike hukuki rehberlik sunmak.'
        },
        values: {
          title: 'Değerlerimiz',
          text: 'Dürüstlük, Titizlik ve İnovasyon. En iyi hukuki çözümlerin, yerleşik ilkelere saygı duyarken gelecekteki zorlukları öngören çözümler olduğuna inanıyoruz.'
        }
      },
      servicesPage: {
        specializedExpertise: 'Uzmanlık Alanları',
        customSolutionTitle: 'Özel bir hukuki çözüme mi ihtiyacınız var?',
        customSolutionText: 'Ekibimiz ihtiyaçlarınızı görüşmeye ve hukuki zorluklarınız için size özel bir yol haritası oluşturmaya hazır.',
        scheduleConsultation: 'Danışmanlık Randevusu Alın'
      },
      blogPage: {
        subtitle: 'Sürekli gelişen hukuki manzara ve sizi ilgilendiren konular hakkındaki perspektiflerimiz.'
      },
      blogAdmin: {
        editPost: 'Blog Yazısını Düzenle',
        createPost: 'Yeni Blog Yazısı Oluştur',
        category: 'Kategori',
        newCategoryPlaceholder: 'Yeni kategori...',
        selectCategory: 'Kategori Seçin',
        addNewCategory: 'Yeni Kategori Ekle',
        author: 'Yazar',
        selectAuthor: 'Yazar Seçin',
        date: 'Tarih',
        imageUrl: 'Resim URL',
        imageGallery: 'Resim Galerisi',
        autoFindImage: 'Otomatik Resim Bul',
        magicTranslation: 'Sihirli Çeviri',
        magicSub: 'Bir dili doldurun ve diğerlerine otomatik çevirin',
        from: 'Kaynak:',
        translating: 'Çevriliyor...',
        autoTranslate: 'Otomatik Çevir',
        version: 'Versiyonu',
        required: 'Gerekli',
        title: 'Başlık',
        excerpt: 'Özet',
        content: 'İçerik',
        cancel: 'İptal',
        saving: 'Kaydediliyor...',
        updatePost: 'Yazıyı Güncelle',
        publishPost: 'Yazıyı Yayınla'
      },
      teamPage: {
        meetExperts: 'Uzmanlarla Tanışın',
        professionalTeam: 'Profesyonel Ekibimiz',
        commitmentExcellence: 'Mükemmelliğe Bağlılık',
        commitmentText: 'Resen Legal\'de ekibimiz sadece bir grup hukuk profesyonelinden ibaret değildir. Biz stratejik düşünenlerin, problem çözenlerin ve müvekkillerimiz için adanmış savunucuların bir topluluğuyuz. Hukuk danışmanlığının sadece yasayı bilmekle değil, her vakanın arkasındaki insan ve iş unsurlarını anlamakla ilgili olduğuna inanıyoruz.',
        collaborativeApproach: 'İşbirlikçi Yaklaşım',
        collaborativeText: 'Kapsamlı destek sağlamak için sınırlar ve disiplinler arası çalışıyoruz. İster yerel düzenlemelerle ister karmaşık uluslararası meselelerle uğraşmak zorunda kalmayasınız diye ekibimiz sorunsuz bir şekilde işbirliği yapar.'
      },
      serviceDetail: {
        backToHome: 'Ana Sayfaya Dön',
        expertPracticeArea: 'Uzmanlık Alanı',
        ourMethodology: 'Metodolojimiz',
        sharePracticeArea: 'Bu Çalışma Alanını Paylaş:',
        beginConsultation: 'Danışmanlık Başlatın',
        consultationSubtext: '{{service}} alanındaki uzmanlarımızla meselenizi görüşün.',
        discussMatter: 'Meseleyi Görüşün',
        relatedInsights: 'İlgili İçerikler',
        notFound: 'Hizmet Bulunamadı',
        introText: 'Resen Hukuk & Danışmanlık olarak, yetki alanı karmaşıklıklarının yalnızca hukuki bilgi değil, aynı zamanda stratejik öngörü gerektirdiğinin bilincindeyiz. Ekibimiz, çıkarlarınızın sınır ötesinde korunmasını sağlamak amacıyla uluslararası hukukun incelikli bir şekilde uygulanmasında uzmanlaşmıştır.',
        methodologyText: 'Bize emanet edilen önemli hukuki meseleleri; derinlemesine araştırma, disiplinler arası danışmanlık ve kararlı savunuculuğu birleştiren titiz, dört aşamalı bir süreçle ele alıyoruz. İster küresel istikrar arayan bir kuruluş, ister hayat değiştiren dönüm noktalarında yol alan bir birey olun, danışmanlığımız doğrudan, özenli ve gelecek odaklıdır.'
      }
    }
  },
  es: {
    translation: {
      nav: {
        services: 'Servicios',
        team: 'Equipo',
        blog: 'Blog',
        contact: 'Contacto',
        about: 'Sobre Nosotros',
      },
      common: {
        learnMore: 'Más Información',
        readArticle: 'Leer Artículo',
        minRead: 'min de lectura',
        processing: 'Procesando...',
        close: 'Cerrar',
        getInTouch: 'Ponte en Contacto',
        backToHome: 'Volver al Inicio'
      },
      accessibility: {
        serviceCard: 'Detalles del servicio para {{service}}',
      },
      cookies: {
        title: 'Política de Cookies',
        text: 'Utilizamos cookies para mejorar su experiencia y analizar nuestro tráfico. Al hacer clic en "Aceptar", usted acepta nuestro uso de cookies.',
        accept: 'Aceptar Todas',
        decline: 'Rechazar No Esenciales',
        manage: 'Gestionar Preferencias'
      },
      team: {
        subtitle: 'Nuestros Expertos',
        title: 'Mentes legales centradas en su éxito.',
        readBio: 'Leer Biografía',
        defaultBio: 'Dedicados a proporcionar soluciones legales diligentes para la movilidad internacional y la estabilidad corporativa.',
        updatingBio: 'La información de la biografía se está actualizando actualmente.'
      },
      legal: {
        dataProtection: {
          label: 'Protección de Datos',
          title: 'Aviso de Protección de Datos (KVKK)',
          content: `
            <h3 class="text-xl font-serif mb-4">Aviso de Protección de Datos (KVKK)</h3>
            <p class="mb-4"><strong>Responsable del Tratamiento</strong></p>
            <p class="mb-4">Resen Legal ("Firma") actúa como responsable del tratamiento de datos en el ámbito de la Ley Turca de Protección de Datos Personales No. 6698 ("KVKK").</p>
            <p class="mb-4"><strong>Finalidad del Tratamiento de Datos Personales</strong></p>
            <p class="mb-4">Sus datos personales se procesan para los siguientes fines: ejecución de consultoría legal, realización de actividades de comunicación, cumplimiento de obligaciones legales.</p>
            <p class="mb-4"><strong>Derechos del Interesado</strong></p>
            <p class="mb-4">Según el Artículo 11 de la KVKK, usted tiene derecho a saber si sus datos se procesan, solicitar información, solicitar corrección, eliminación u oponerse a los resultados.</p>
            <p class="mb-4"><strong>Contacto</strong></p>
            <p class="mb-8">Para ejercer sus derechos, puede contactar a info@resenlegal.com</p>
          `
        },
        cookiePolicy: {
          label: 'Política de Cookies',
          title: 'Política de Cookies',
          content: `
            <h3 class="text-xl font-serif mb-4">Política de Cookies</h3>
            <p class="mb-4"><strong>Uso de Cookies</strong></p>
            <p class="mb-4">El sitio web de Resen Legal utiliza cookies para mejorar la experiencia del usuario. Las cookies son pequeños archivos de texto colocados en su dispositivo.</p>
            <p class="mb-4"><strong>Tipos de Cookies Utilizadas</strong></p>
            <p class="mb-4">Se utilizan cookies analíticas, esenciales y de preferencia para analizar el tráfico y recordar configuraciones.</p>
            <p class="mb-4"><strong>Contacto</strong></p>
            <p class="mb-8">Para preguntas sobre nuestra política de cookies, puede contactar a info@resenlegal.com</p>
          `
        },
        privacyPolicy: {
          label: 'Política de Privacidad',
          title: 'Política de Privacidad',
          content: `
            <h3 class="text-xl font-serif mb-4">Política de Privacidad</h3>
            <p class="mb-4">En Resen Legal, respetamos su privacidad y damos gran importancia a la protección de sus datos personales.</p>
            <p class="mb-4"><strong>Recopilación de Información</strong></p>
            <p class="mb-4">Recopilamos información a través de formularios de contacto y estadísticas de uso del sitio web.</p>
            <p class="mb-4"><strong>Seguridad de la Información</strong></p>
            <p class="mb-4">Se toman las medidas técnicas adecuadas para asegurar sus datos personales.</p>
            <p class="mb-4"><strong>Contacto</strong></p>
            <p class="mb-8">Para preguntas sobre nuestra política de privacidad, puede contactar a info@resenlegal.com</p>
          `
        }
      },
      hero: {
        slogan: 'Nos ocupamos de los asuntos que importan.',
        subtext: 'Consultoría legal de alto nivel que ofrece soluciones precisas para desafíos de inmigración, corporativos y GDPR.',
        cta: 'Reservar una Consulta',
        secondaryCta: 'Explorar Nuestros Servicios',
        floatingAccent: 'Guía Legal Confiable',
      },
      form: {
        title: 'Asesoramiento directo de abogados que conocen la ley y el terreno.',
        name: 'Nombre Completo',
        email: 'Dirección de Correo Electrónico',
        message: '¿Cómo podemos ayudarle?',
        submit: 'Enviar Mensaje',
        getInTouch: 'Ponte en Contacto',
        offices: 'Oficinas',
        emailCorrespondence: 'Correspondencia por Correo',
        phoneInquiry: 'Consulta Telefónica',
        legalDepartment: 'Departamento Legal',
        otherMatter: 'Otro Asunto',
        messagePlaceholder: 'Cuéntenos sobre los asuntos que importan...',
        success: '¡Éxito! Su mensaje ha sido enviado correctamente.',
        errorPermission: 'Error en el envío: Permiso denegado. Por favor, compruebe si ha rellenado todo correctamente.',
        errorUnexpected: 'Ocurrió un error inesperado: ',
        errorNameShort: 'El nombre debe tener al menos 2 caracteres.',
        errorEmailInvalid: 'Por favor, introduzca una dirección de correo válida.',
        errorMessageShort: 'El mensaje debe tener al menos 5 caracteres.',
      },
      footer: {
        tagline: 'Profesional. Diligente. Preparado para el futuro.',
        rights: 'Todos los derechos reservados.',
      },
      blogSection: {
        tagline: 'Perspectivas Legales',
        title: 'Análisis profundos sobre tendencias legales y asesoramiento.',
        addNewPost: 'Añadir Nueva Entrada',
        filter: 'Filtrar:',
        sortBy: 'Ordenar Por:',
        all: 'Todos',
        clearAll: 'Limpiar todo',
        newest: 'Más Recientes',
        oldest: 'Más Antiguos',
        categoryAZ: 'Categoría (A-Z)',
        languageSort: 'Idioma',
        by: 'Por',
        writtenBy: 'Escrito Por',
        backToBlog: 'Volver al Blog',
        shareInsights: 'Compartir Perspectivas',
        contents: 'Contenidos',
        backToTop: 'Volver arriba',
        aboutAuthor: 'Sobre el Autor',
        continueReading: 'Continuar Leyendo',
        relatedInsights: 'Perspectivas Relacionadas',
        exploreAllPosts: 'Explorar todas las entradas',
        deleteConfirm: '¿Está seguro de que desea eliminar esta entrada?'
      },
      about: {
        tagline: 'Excelencia en la Práctica Legal',
        title: 'Creando soluciones legales con un legado de excelencia y una visión de futuro.',
        subtitle: 'En Resen Legal & Consultancy, cerramos la brecha entre la tradición y la innovación. Nuestra firma se basa en una base de análisis legal riguroso y un compromiso con el servicio personalizado.',
        excellenceIntegrity: 'Excelencia e Integridad',
        ourMission: 'Nuestra Misión',
        missionText: 'Proporcionar servicios legales de alta calidad con un enfoque en la integridad, la excelencia y el éxito del cliente. Nos esforzamos por navegar las complejidades de la ley para que nuestros clientes no tengan que hacerlo.',
        ourVision: 'Nuestra Visión',
        visionText: 'Ser la consultoría legal boutique líder reconocida por soluciones innovadoras y un compromiso inquebrantable con los estándares éticos en el derecho internacional y local.',
        ourValues: 'Nuestros Valores',
        valuesText: 'Integridad, enfoque centrado en el cliente, excelencia en la investigación y espíritu colaborativo definen todo lo que hacemos en Resen Legal.',
        history: {
          title: 'Nuestro Legado',
          text: 'Fundada por profesionales legales senior con décadas de experiencia combinada, Resen ha evolucionado de una práctica boutique a una consultoría multidisciplinaria líder.'
        },
        mission: {
          title: 'Nuestra Misión',
          text: 'Proporcionar orientación legal sofisticada que permita a nuestros clientes internacionales y locales navegar paisajes regulatorios complejos con confianza y claridad.'
        },
        values: {
          title: 'Nuestros Valores',
          text: 'Integridad, Diligencia e Innovación. Creemos que las mejores soluciones legales son aquellas que anticipan desafíos futuros respetando los principios establecidos.'
        }
      },
      servicesPage: {
        specializedExpertise: 'Experiencia Especializada',
        customSolutionTitle: '¿Necesita una solución legal personalizada?',
        customSolutionText: 'Nuestro equipo está listo para discutir sus necesidades específicas y crear una hoja de ruta a medida para sus desafíos legales.',
        scheduleConsultation: 'Programar una Consulta'
      },
      blogPage: {
        subtitle: 'Nuestras perspectivas sobre el panorama legal en evolución y los asuntos que le importan.'
      },
      blogAdmin: {
        editPost: 'Editar Entrada de Blog',
        createPost: 'Crear Nueva Entrada de Blog',
        category: 'Categoría',
        newCategoryPlaceholder: 'Nueva categoría...',
        selectCategory: 'Seleccionar Categoría',
        addNewCategory: 'Añadir Nueva Categoría',
        author: 'Autor',
        selectAuthor: 'Seleccionar Autor',
        date: 'Fecha',
        imageUrl: 'URL de la Imagen',
        imageGallery: 'Galería de Imágenes',
        autoFindImage: 'Auto-Buscar Imagen',
        magicTranslation: 'Traducción Mágica',
        magicSub: 'Rellene un idioma y traduzca a los demás',
        from: 'Desde:',
        translating: 'Traduciendo...',
        autoTranslate: 'Auto-Traducir',
        version: 'Versión',
        required: 'Requerido',
        title: 'Título',
        excerpt: 'Extracto',
        content: 'Contenido',
        cancel: 'Cancelar',
        saving: 'Guardando...',
        updatePost: 'Actualizar Entrada',
        publishPost: 'Publicar Entrada'
      },
      teamPage: {
        meetExperts: 'Conozca a los Expertos',
        professionalTeam: 'Nuestro Equipo Profesional',
        commitmentExcellence: 'Compromiso con la Excelencia',
        commitmentText: 'En Resen Legal, nuestro equipo es más que un grupo de profesionales legales. Somos un colectivo de pensadores estratégicos, solucionadores de problemas y defensores dedicados de nuestros clientes. Creemos que la consultoría legal no se trata solo de conocer la ley, sino de comprender los elementos humanos y comerciales detrás de cada caso.',
        collaborativeApproach: 'Enfoque Colaborativo',
        collaborativeText: 'Trabajamos a través de fronteras y disciplinas para proporcionar un apoyo integral. Ya sea que esté tratando con regulaciones locales o asuntos internacionales complejos, nuestro equipo colabora sin problemas para garantizar que reciba el más alto estándar de servicio.'
      },
      serviceDetail: {
        backToHome: 'Volver al Inicio',
        expertPracticeArea: 'Área de Práctica Experta',
        ourMethodology: 'Nuestra Metodología',
        sharePracticeArea: 'Compartir esta Área de Práctica:',
        beginConsultation: 'Comenzar una Consulta',
        consultationSubtext: 'Discuta su asunto legal específico con nuestros especialistas en {{service}}.',
        discussMatter: 'Discutir su Asunto',
        relatedInsights: 'Perspectivas Relacionadas',
        notFound: 'Servicio No Encontrado',
        introText: 'En Resen Legal, entendemos que las complejas jurisdicciones requieren no solo conocimiento legal, sino también previsión estratégica. Nuestro equipo se especializa en la aplicación matizada del derecho internacional para garantizar que sus intereses estén protegidos más allá de las fronteras.',
        methodologyText: 'Manejamos los asuntos que importan a través de un proceso riguroso de cuatro etapas que combina investigación profunda, consulta multidisciplinaria y una defensa decidida. Ya sea que se trate de una empresa que busca estabilidad global o de una persona que atraviesa transiciones de vida importantes, nuestro asesoramiento es directo, diligente y preparado para el futuro.'
      }
    }
  },
  ar: {
    translation: {
      nav: {
        services: 'الخدمات',
        team: 'الفريق',
        blog: 'المدونة',
        contact: 'اتصل بنا',
        about: 'من نحن',
      },
      common: {
        learnMore: 'اقرأ المزيد',
        readArticle: 'اقرأ المقال',
        minRead: 'دقيقة قراءة',
        processing: 'جاري المعالجة...',
        close: 'إغلاق',
        getInTouch: 'تواصل معنا',
        backToHome: 'العودة للرئيسية'
      },
      accessibility: {
        serviceCard: 'تفاصيل الخدمة لـ {{service}}',
      },
      cookies: {
        title: 'سياسة ملفات الارتباط',
        text: 'نحن نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتحليل حركة المرور لدينا. بالنقر على "قبول"، فإنك توافق على استخدامنا لملفات تعريف الارتباط.',
        accept: 'قبول الكل',
        decline: 'رفض غير الضروري'
      },
      team: {
        subtitle: 'خبراؤنا',
        title: 'عقول قانونية تركز على نجاحك.',
        readBio: 'اقرأ السيرة الذاتية',
        defaultBio: 'مكرسون لتقديم حلول قانونية دقيقة للتنقل الدولي والاستقرار المؤسسي.',
        updatingBio: 'يتم تحديث معلومات السيرة الذاتية حالياً.'
      },
      legal: {
        dataProtection: {
          label: 'حماية البيانات',
          title: 'إشعار حماية البيانات (KVKK)',
          content: `
            <h3 class="text-xl font-serif mb-4">إشعار حماية البيانات (KVKK)</h3>
            <p class="mb-4"><strong>مراقب البيانات</strong></p>
            <p class="mb-4">تعمل Resen Legal ("الشركة") كمراقب للبيانات في نطاق قانون حماية البيانات الشخصية التركي رقم 6698 ("KVKK").</p>
            <p class="mb-4"><strong>الغرض من معالجة البيانات الشخصية</strong></p>
            <p class="mb-4">تتم معالجة بياناتك الشخصية للأغراض التالية: تنفيذ الاستشارات القانونية، إجراء أنشطة الاتصال، الوفاء بالالتزامات القانونية.</p>
            <p class="mb-4"><strong>حقوق صاحب البيانات</strong></p>
            <p class="mb-4">بموجب المادة 11 من قانون KVKK، لديك الحق في معرفة ما إذا كانت بياناتك قد تمت معالجتها، وطلب المعلومات، وطلب التصحيح أو الحذف أو الاعتراض على النتائج.</p>
            <p class="mb-4"><strong>اتصال</strong></p>
            <p class="mb-8">لممارسة حقوقك، يمكنك التواصل عبر info@resenlegal.com</p>
          `
        },
        cookiePolicy: {
          label: 'سياسة ملفات الارتباط',
          title: 'سياسة ملفات الارتباط',
          content: `
            <h3 class="text-xl font-serif mb-4">سياسة ملفات الارتباط</h3>
            <p class="mb-4"><strong>استخدام ملفات الارتباط</strong></p>
            <p class="mb-4">يستخدم موقع Resen Legal ملفات تعريف الارتباط لتحسين تجربة المستخدم. ملفات تعريف الارتباط هي ملفات نصية صغيرة يتم وضعها على جهازك.</p>
            <p class="mb-4"><strong>أنواع ملفات الارتباط المستخدمة</strong></p>
            <p class="mb-4">تستخدم ملفات تعريف الارتباط التحليلية والأساسية وتفضيلات لتحليل حركة المرور وتذكر الإعدادات.</p>
            <p class="mb-4"><strong>اتصال</strong></p>
            <p class="mb-8">للأسئلة حول سياسة ملفات تعريف الارتباط الخاصة بنا، يمكنك التواصل عبر info@resenlegal.com</p>
          `
        },
        privacyPolicy: {
          label: 'سياسة الخصوصية',
          title: 'سياسة الخصوصية',
          content: `
            <h3 class="text-xl font-serif mb-4">سياسة الخصوصية</h3>
            <p class="mb-4">في Resen Legal، نحترم خصوصيتك ونولي أهمية كبيرة لحماية بياناتك الشخصية.</p>
            <p class="mb-4"><strong>جمع المعلومات</strong></p>
            <p class="mb-4">نجمع المعلومات من خلال نماذج الاتصال وإحصائيات استخدام الموقع.</p>
            <p class="mb-4"><strong>أمن المعلومات</strong></p>
            <p class="mb-4">يتم اتخاذ التدابير التقنية المناسبة لتأمين بياناتك الشخصية.</p>
            <p class="mb-4"><strong>اتصال</strong></p>
            <p class="mb-8">للأسئلة حول سياسة الخصوصية الخاصة بنا، يمكنك التواصل عبر info@resenlegal.com</p>
          `
        }
      },
      hero: {
        slogan: 'نحن نتولى الأمور التي تهم.',
        subtext: 'استشارات قانونية راقية تقدم حلولاً دقيقة لتحديات الهجرة، والشركات، والقانون العام لحماية البيانات (GDPR).',
        cta: 'احجز استشارة',
        secondaryCta: 'استكشف خدماتنا',
        floatingAccent: 'توجيه قانوني موثوق',
      },
      form: {
        title: 'نصيحة مباشرة من محامين يعرفون القانون والأرض.',
        name: 'الاسم الكامل',
        email: 'عنوان البريد الإلكتروني',
        message: 'كيف يمكننا مساعدتك؟',
        submit: 'إرسال الرسالة',
        getInTouch: 'تواصل معنا',
        offices: 'المكاتب',
        emailCorrespondence: 'المراسلات عبر البريد الإلكتروني',
        phoneInquiry: 'الاستفسار الهاتفي',
        legalDepartment: 'الدائرة القانونية',
        otherMatter: 'موضوع آخر',
        messagePlaceholder: 'أخبرنا عن الأمور التي تهم...',
        success: 'نجاح! تم إرسال رسالتك بنجاح.',
        errorPermission: 'فشل الإرسال: تم رفض الإذن. يرجى التحقق مما إذا كنت قد ملأت كل شيء بشكل صحيح.',
        errorUnexpected: 'حدث خطأ غير متوقع: ',
        errorNameShort: 'يجب أن يتكون الاسم من حرفين على الأقل.',
        errorEmailInvalid: 'يرجى إدخال عنوان بريد إلكتروني صالح.',
        errorMessageShort: 'يجب أن تتكون الرسالة من 5 أحرف على الأقل.',
      },
      footer: {
        tagline: 'احترافية. دقة. جاهزية للمستقبل.',
        rights: 'جميع الحقوق محفوظة.',
      },
      blogSection: {
        tagline: 'رؤى قانونية',
        title: 'تعمق في الاتجاهات القانونية والاستشارية.',
        addNewPost: 'إضافة مقال جديد',
        filter: 'تصفية:',
        sortBy: 'فرز حسب:',
        all: 'الكل',
        clearAll: 'مسح الكل',
        newest: 'الأحدث أولاً',
        oldest: 'الأقدم أولاً',
        categoryAZ: 'الفئة (أ-ي)',
        languageSort: 'اللغة',
        by: 'بواسطة',
        writtenBy: 'كُتب بواسطة',
        backToBlog: 'العودة للمدونة',
        shareInsights: 'مشاركة الرؤى',
        contents: 'المحتويات',
        backToTop: 'العودة للأعلى',
        aboutAuthor: 'حول الكاتب',
        continueReading: 'مواصلة القراءة',
        relatedInsights: 'رؤى ذات صلة',
        exploreAllPosts: 'استكشف جميع المقالات',
        deleteConfirm: 'هل أنت متأكد أنك تريد حذف هذا المقال؟'
      },
      about: {
        tagline: 'التميز في الممارسة القانونية',
        title: 'صياغة حلول قانونية مع إرث من التميز ورؤية للمستقبل.',
        subtitle: 'في Resen Legal & Consultancy، نسد الفجوة بين التقاليد والابتكار. شركتنا مبنية على أساس من التحليل القانوني الدقيق والالتزام بالخدمة الشخصية.',
        excellenceIntegrity: 'التميز والنزاهة',
        ourMission: 'مهمتنا',
        missionText: 'تقديم خدمات قانونية عالية الجودة مع التركيز على النزاهة والتميز ونجاح العميل. نحن نسعى لتجاوز تعقيدات القانون حتى لا يضطر عملاؤنا للقيام بذلك.',
        ourVision: 'رؤيتنا',
        visionText: 'أن نكون الاستشارات القانونية الرائدة المعترف بها للحلول المبتكرة والالتزام الراسخ بالمعايير الأخلاقية في القانون الدولي والمحلي.',
        ourValues: 'قيمنا',
        valuesText: 'النزاهة، والنهج المتمحور حول العميل، والتميز في البحث، والروح التعاونية تحدد كل ما نقوم به في Resen Legal.',
        history: {
          title: 'تراثنا',
          text: 'تأسست Resen على يد متخصصين قانونيين رفيعي المستوى يتمتعون بعقود من الخبرة المشتركة، وتطورت من ممارسة متخصصة إلى استشارات رائدة متعددة التخصصات.'
        },
        mission: {
          title: 'مهمتنا',
          text: 'تقديم إرشادات قانونية متطورة تمكن عملاءنا الدوليين والمحليين من التنقل في المشاهد التنظيمية المعقدة بثقة ووضوح.'
        },
        values: {
          title: 'قيمنا',
          text: 'النزاهة والمثابرة والابتكار. نحن نؤمن بأن أفضل الحلول القانونية هي تلك التي تتوقع تحديات المستقبل مع احترام المبادئ الراسخة.'
        }
      },
      servicesPage: {
        specializedExpertise: 'خبرة متخصصة',
        customSolutionTitle: 'هل تحتاج إلى حل قانوني مخصص؟',
        customSolutionText: 'فريقنا مستعد لمناقشة احتياجاتك الخاصة وإنشاء خارطة طريق مفصلة لتحدياتك القانونية.',
        scheduleConsultation: 'تحديد موعد استشارة'
      },
      blogPage: {
        subtitle: 'منظورنا حول المشهد القانوني المتطور والأمور التي تهمك.'
      },
      blogAdmin: {
        editPost: 'تعديل المقال',
        createPost: 'إنشاء مقال جديد',
        category: 'الفئة',
        newCategoryPlaceholder: 'فئة جديدة...',
        selectCategory: 'اختر فئة',
        addNewCategory: 'إضافة فئة جديدة',
        author: 'الكاتب',
        selectAuthor: 'اختر كاتباً',
        date: 'التاريخ',
        imageUrl: 'رابط الصورة',
        imageGallery: 'معرض الصور',
        autoFindImage: 'البحث التلقائي عن صورة',
        magicTranslation: 'الترجمة السحرية',
        magicSub: 'املأ لغة واحدة وترجم للغات الأخرى',
        from: 'من:',
        translating: 'جاري الترجمة...',
        autoTranslate: 'ترجمة تلقائية',
        version: 'الإصدار',
        required: 'مطلوب',
        title: 'العنوان',
        excerpt: 'مقتطف',
        content: 'المحتوى',
        cancel: 'إلغاء',
        saving: 'جاري الحفظ...',
        updatePost: 'تحديث المقال',
        publishPost: 'نشر المقال'
      },
      teamPage: {
        meetExperts: 'تعرف على الخبراء',
        professionalTeam: 'فريقنا الاحترافي',
        commitmentExcellence: 'الالتزام بالتميز',
        commitmentText: 'في Resen Legal، فريقنا هو أكثر من مجرد مجموعة من المتخصصين القانونيين. نحن مجموعة من المفكرين الاستراتيجيين، وحلالي المشكلات، والمدافعين المكرسين لعملائنا. نحن نؤمن بأن الاستشارات القانونية لا تقتصر فقط على معرفة القانون، بل تتعلق بفهم العناصر البشرية والتجارية وراء كل قضية.',
        collaborativeApproach: 'النهج التعاوني',
        collaborativeText: 'نعمل عبر الحدود والتخصصات لتقديم دعم شامل. سواء كنت تتعامل مع اللوائح المحلية أو المسائل الدولية المعقدة، فإن فريقنا يتعاون بسلاسة لضمان حصولك على أعلى معايير الخدمة.'
      },
      serviceDetail: {
        backToHome: 'العودة للرئيسية',
        expertPracticeArea: 'منطقة الممارسة الخبيرة',
        ourMethodology: 'منهجيتنا',
        sharePracticeArea: 'مشاركة منطقة الممارسة هذه:',
        beginConsultation: 'بدء استشارة',
        consultationSubtext: 'ناقش مسألتك القانونية الخاصة مع المتخصصين لدينا في {{service}}.',
        discussMatter: 'ناقش مسألتك',
        relatedInsights: 'رؤى ذات صلة',
        notFound: 'الخدمة غير موجودة',
        introText: 'في Resen Legal، ندرك أن التعقيدات القضائية لا تتطلب معرفة قانونية فحسب، بل تتطلب أيضًا بصيرة استراتيجية. يتخصص فريقنا في التطبيق الدقيق للقانون الدولي لضمان حماية مصالحك عبر الحدود.',
        methodologyText: 'نحن نتعامل مع المسائل المهمة من خلال عملية صارمة من أربع مراحل تجمع بين البحث العميق والاستشارة متعددة التخصصات والمرافعة الفعالة. وسواء كنت شركة تسعى إلى الاستقرار العالمي أو فردًا يمر بتحولات تغير مجرى حياته، فإن مشورتنا مباشرة ودقيقة وجاهزة للمستقبل.'
      }
    }
  },
  zh: {
    translation: {
      nav: {
        services: '服务',
        team: '团队',
        blog: '博客',
        contact: '联系我们',
        about: '关于我们',
      },
      common: {
        learnMore: '了解更多',
        readArticle: '阅读文章',
        minRead: '分钟阅读',
        processing: '处理中...',
        close: '关闭',
        getInTouch: '联系我们',
        backToHome: '回到首页'
      },
      accessibility: {
        serviceCard: '{{service}} 的服务详情',
      },
      cookies: {
        title: 'Cookie 政策',
        text: '我们使用 cookie 来提升您的体验并分析流量。点击“接受”，即表示您同意我们使用 cookie。',
        accept: '全部接受',
        decline: '拒绝非必要',
        manage: '管理偏好'
      },
      team: {
        subtitle: '我们的专家',
        title: '专注于您成功的法律头脑。',
        readBio: '阅读传记',
        defaultBio: '致力于为国际流动和企业稳定提供勤勉的法律解决方案。',
        updatingBio: '传记信息目前正在更新中。'
      },
      legal: {
        dataProtection: {
          label: '数据保护',
          title: '数据保护通知 (KVKK)',
          content: `
            <h3 class="text-xl font-serif mb-4">数据保护通知 (KVKK)</h3>
            <p class="mb-4"><strong>数据控制者</strong></p>
            <p class="mb-4">Resen Legal ("事务所") 在土耳其第 6698 号个人数据保护法 ("KVKK") 范围内担任数据控制者。</p>
            <p class="mb-4"><strong>处理个人数据的目的</strong></p>
            <p class="mb-4">您的个人数据用于以下目的：执行法律咨询、开展沟通活动、履行法律义务。</p>
            <p class="mb-4"><strong>数据主体的权利</strong></p>
            <p class="mb-4">根据 KVKK 第 11 条，您有权了解您的数据是否被处理、请求信息、请求更正、删除或对结果提出异议。</p>
            <p class="mb-4"><strong>联系方式</strong></p>
            <p class="mb-8">要行使您的权利，您可以联系 info@resenlegal.com</p>
          `
        },
        cookiePolicy: {
          label: 'Cookie 政策',
          title: 'Cookie 政策',
          content: `
            <h3 class="text-xl font-serif mb-4">Cookie 政策</h3>
            <p class="mb-4"><strong>Cookie 使用</strong></p>
            <p class="mb-4">Resen Legal 网站使用 cookie 来改善用户体验。Cookie 是放置在您设备上的小文本文件。</p>
            <p class="mb-4"><strong>所使用的 Cookie 类型</strong></p>
            <p class="mb-4">使用分析型、基本型和偏好型 cookie 来分析流量并记住设置。</p>
            <p class="mb-4"><strong>联系方式</strong></p>
            <p class="mb-8">有关我们 cookie 政策的问题，您可以联系 info@resenlegal.com</p>
          `
        },
        privacyPolicy: {
          label: '隐私政策',
          title: '隐私政策',
          content: `
            <h3 class="text-xl font-serif mb-4">隐私政策</h3>
            <p class="mb-4">在 Resen Legal，我们尊重您的隐私，并高度重视保护您的个人数据。</p>
            <p class="mb-4"><strong>信息收集</strong></p>
            <p class="mb-4">我们通过联系表单和网站使用统计数据收集信息。</p>
            <p class="mb-4"><strong>信息安全</strong></p>
            <p class="mb-4">采取适当的技术措施来保障您的个人数据安全。</p>
            <p class="mb-4"><strong>联系方式</strong></p>
            <p class="mb-8">有关我们隐私政策的问题，您可以联系 info@resenlegal.com</p>
          `
        }
      },
      hero: {
        slogan: '我们处理关乎重大的事务。',
        subtext: '高端法律咨询，为移民、公司和 GDPR 挑战提供精确的解决方案。',
        cta: '预约咨询',
        secondaryCta: '探索我们的服务',
        floatingAccent: '值得信赖的法律指导',
      },
      form: {
        title: '来自了解法律和当地情况的律师的直接建议。',
        name: '全名',
        email: '电子邮件地址',
        message: '我们能如何帮您？',
        submit: '发送消息',
        getInTouch: '联系我们',
        offices: '办公室',
        emailCorrespondence: '邮件沟通',
        phoneInquiry: '电话咨询',
        legalDepartment: '法律部门',
        otherMatter: '其他事项',
        messagePlaceholder: '告诉我们关乎重大的事务...',
        success: '成功！您的消息已成功发送。',
        errorPermission: '提交失败：权限被拒绝。请检查是否已正确填写所有内容。',
        errorUnexpected: '发生意外错误：',
        errorNameShort: '姓名必须至少包含 2 个字符。',
        errorEmailInvalid: '请输入有效的电子邮件地址。',
        errorMessageShort: '消息必须至少包含 5 个字符。',
      },
      footer: {
        tagline: '专业。勤勉。着眼未来。',
        rights: '保留所有权利。',
      },
      blogSection: {
        tagline: '法律见解',
        title: '深入探讨法律趋势和建议。',
        addNewPost: '添加新文章',
        filter: '筛选：',
        sortBy: '排序：',
        all: '全部',
        clearAll: '清除全部',
        newest: '最新优先',
        oldest: '最早优先',
        categoryAZ: '类别 (A-Z)',
        languageSort: '语言',
        by: '作者',
        writtenBy: '作者',
        backToBlog: '回到博客',
        shareInsights: '分享见解',
        contents: '目录',
        backToTop: '回到顶部',
        aboutAuthor: '关于作者',
        continueReading: '继续阅读',
        relatedInsights: '相关见解',
        exploreAllPosts: '探索所有文章',
        deleteConfirm: '您确定要删除这篇文章吗？'
      },
      about: {
        tagline: '卓越的法律实践',
        title: '以卓越的传承和对未来的愿景打造法律解决方案。',
        subtitle: '在 Resen Legal & Consultancy，我们架起传统与创新之间的桥梁。我们事务所建立在严谨的法律分析和对个性化服务的承诺基础之上。',
        excellenceIntegrity: '卓越与诚信',
        ourMission: '我们的使命',
        missionText: '提供高质量的法律服务，专注于诚信、卓越和客户成功。我们努力应对法律的复杂性，以便我们的客户不必这样做。',
        ourVision: '我们的愿景',
        visionText: '成为全球公认的领先精品法律咨询公司，在国际法和本地法中提供创新解决方案并坚定不移地遵守伦理标准。',
        ourValues: '我们的价值',
        valuesText: '诚信、以客户为中心、卓越的研究和协作精神定义了我们在 Resen Legal 所做的一切。',
        history: {
          title: '我们的传承',
          text: '由拥有数十年综合经验的高级法律专业人士创立，Resen 已从一家精品事务所发展成为领先的多学科咨询公司。'
        },
        mission: {
          title: '我们的使命',
          text: '提供先进的法律指导，使我们的国际和本地客户能够充满信心和清晰地应对复杂的监管环境。'
        },
        values: {
          title: '我们的价值',
          text: '诚信、勤勉和创新。我们相信最好的法律解决方案是在尊重既定原则的同时预见未来挑战的方案。'
        }
      },
      servicesPage: {
        specializedExpertise: '专业特长',
        customSolutionTitle: '需要定制化的法律解决方案吗？',
        customSolutionText: '我们的团队已准备好讨论您的具体需求，并为您的法律挑战创建量身定制的路线图。',
        scheduleConsultation: '预约咨询'
      },
      blogPage: {
        subtitle: '我们对不断演变的法律景观以及关乎您的事务的看法。'
      },
      blogAdmin: {
        editPost: '编辑博文',
        createPost: '创建新博文',
        category: '类别',
        newCategoryPlaceholder: '新类别...',
        selectCategory: '选择类别',
        addNewCategory: '添加新类别',
        author: '作者',
        selectAuthor: '选择作者',
        date: '日期',
        imageUrl: '图片 URL',
        imageGallery: '图库',
        autoFindImage: '自动查找图片',
        magicTranslation: '魔术翻译',
        magicSub: '填写一种语言并翻译成其他语言',
        from: '来源：',
        translating: '翻译中...',
        autoTranslate: '自动翻译',
        version: '版本',
        required: '必填',
        title: '标题',
        excerpt: '摘录',
        content: '内容',
        cancel: '取消',
        saving: '保存中...',
        updatePost: '更新文章',
        publishPost: '发布文章'
      },
      teamPage: {
        meetExperts: '会见专家',
        professionalTeam: '我们的专业团队',
        commitmentExcellence: '对卓越的承诺',
        commitmentText: '在 Resen Legal，我们的团队不仅是一群法律专业人士。我们是一个战略思想家、问题解决者和致力于客户的倡导者的集合体。我们相信法律咨询不仅仅是了解法律，还在于理解每个案件背后的人物和业务要素。',
        collaborativeApproach: '协作方法',
        collaborativeText: '我们跨国界和跨学科工作，提供全面的支持。无论您是在处理当地法规还是复杂的国际事务，我们的团队都会无缝协作，确保您获得最高标准的服务。'
      },
      serviceDetail: {
        backToHome: '回到首页',
        expertPracticeArea: '专家执业领域',
        ourMethodology: '我们的方法论',
        sharePracticeArea: '分享此执业领域：',
        beginConsultation: '开始咨询',
        consultationSubtext: '与我们在 {{service}} 方面的专家讨论您的具体法律事项。',
        discussMatter: '讨论您的事项',
        relatedInsights: '相关见解',
        notFound: '未找到服务',
        introText: '在 Resen Legal，我们深知复杂的司法辖区需要的不仅仅是法律知识，更需要战略前瞻。我们的团队专注于国际法的细致应用，以确保您的利益跨越边境得到保护。',
        methodologyText: '我们通过严格的四阶段流程来处理关乎重大的事务，该流程结合了深入的研究、多学科咨询和强有力的辩护。无论您是寻求全球稳定的企业，还是正经历人生重大转折的个人，我们的咨询都直接、勤勉且着眼未来。'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
