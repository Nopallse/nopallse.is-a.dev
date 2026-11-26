window.portfolioData = {
  owner: 'Naufal',
  disciplines: ['Web Development', 'Mobile Development', 'UI/UX Design', 'Digital Product Development'],
  projects: [
    {
      number: '01',
      title: 'Oblix Pilates',
      type: 'Web platform',
      category: 'web',
      description: 'Comprehensive pilates studio management platform with real-time class booking, trainer scheduling, waitlists, and Midtrans payments.',
      fullDescription: 'Sistem manajemen studio pilates premium yang komprehensif dengan fitur booking kelas real-time, manajemen member, pembayaran online terintegrasi Midtrans, serta dashboard admin dan pengelolaan konten studio.',
      image: 'https://rnaghyoscswiizdtyrlz.supabase.co/storage/v1/object/public/portofolio/projects/oblix-pilates---premium-pilates-studio-management-system/oblix-pilates---premium-pilates-studio-management-system-cover.png',
      images: [],
      features: [
        'Booking Kelas: Sistem booking kelas real-time dengan kalender interaktif',
        'Manajemen Paket: Pembelian dan manajemen paket membership, trial, dan promo',
        'Pembayaran Online: Integrasi Midtrans untuk pembayaran yang aman',
        'Sistem Waitlist: Bergabung dalam antrian otomatis jika kelas penuh',
        'Manajemen Member, Staff, Jadwal & Konten Website'
      ],
      techStack: ['React', 'Vite', 'Tailwind CSS', 'Zustand', 'JWT', 'Midtrans'],
      demoLink: 'https://oblixpilates.id',
      repositoryLink: '',
      alt: 'Oblix Pilates studio management system cover',
      orientation: 'wide'
    },
    {
      number: '02',
      title: 'StunBy',
      type: 'HealthTech mobile app',
      category: 'mobile',
      description: 'Indonesian baby growth tracking app with photo height estimation, WHO growth curves, nutrition tracking, and stunting screening.',
      fullDescription: 'Aplikasi pelacak pertumbuhan bayi Indonesia untuk membantu mengatasi masalah stunting melalui pemantauan kurva WHO, estimasi tinggi badan berbasis foto, tracking nutrisi harian, dan deteksi dini risiko stunting.',
      image: 'https://rnaghyoscswiizdtyrlz.supabase.co/storage/v1/object/public/portofolio/projects/stunby-indonesian-baby-growth-tracking-app/stunby-indonesian-baby-growth-tracking-app-cover.png',
      images: [],
      features: [
        'Mengukur tinggi badan bayi melalui foto',
        'Sistem deteksi & skrining risiko stunting',
        'Grafik pertumbuhan bayi dengan standar WHO',
        'Tracking kebutuhan nutrisi harian & artikel edukasi'
      ],
      techStack: ['Kotlin', 'XML', 'Express', 'PostgreSQL'],
      demoLink: '',
      repositoryLink: 'https://github.com/StunBy-Bangkit-Capstone/Mobile',
      alt: 'StunBy baby growth tracking application cover',
      orientation: 'portrait'
    },
    {
      number: '03',
      title: 'Presensi PNS Pariaman',
      type: 'GovTech mobile app',
      category: 'mobile',
      description: 'Geo-location civil servant attendance system featuring 1-device validation, fake-GPS prevention, and HMAC request signing.',
      fullDescription: 'Sistem presensi mobile berbasis geo-location untuk Pegawai Negeri Sipil Kota Pariaman dengan validasi perangkat tunggal, deteksi fake GPS, proteksi integritas payload menggunakan HMAC, serta pengajuan cuti dan izin.',
      image: 'https://rnaghyoscswiizdtyrlz.supabase.co/storage/v1/object/public/portofolio/projects/presensi-pegawai-negeri-sipil-kota-pariaman/presensi-pegawai-negeri-sipil-kota-pariaman-cover.png',
      images: [],
      features: [
        'Validasi perangkat (1 akun hanya untuk 1 device)',
        'Deteksi dan pencegahan fake GPS',
        'Proteksi data presensi menggunakan HMAC',
        'Pengajuan cuti, izin terlambat, dan riwayat presensi'
      ],
      techStack: ['Flutter', 'Dart', 'Express', 'MySQL'],
      demoLink: '',
      repositoryLink: 'https://github.com/Nopallse/geo-attendance-app',
      alt: 'Presensi Pegawai Negeri Sipil Kota Pariaman application cover',
      orientation: 'wide'
    },
    {
      number: '04',
      title: 'RuangEase',
      type: 'Mobile booking app',
      category: 'mobile',
      description: 'Room reservation mobile app with real-time availability, approval workflows, notifications, and booking history.',
      fullDescription: 'Aplikasi peminjaman ruangan berbasis mobile yang memudahkan pengguna memesan, memantau status persetujuan admin, dan mengelola jadwal ketersediaan ruangan secara efisien.',
      image: 'https://rnaghyoscswiizdtyrlz.supabase.co/storage/v1/object/public/portofolio/projects/ruangease/ruangease-cover.png',
      images: [],
      features: [
        'Booking ruangan dengan detail waktu dan keperluan',
        'Sistem persetujuan peminjaman (approve/reject oleh admin)',
        'Notifikasi status peminjaman & riwayat booking'
      ],
      techStack: ['Kotlin', 'Jetpack Compose', 'Express', 'MySQL'],
      demoLink: '',
      repositoryLink: '',
      alt: 'RuangEase mobile booking application cover',
      orientation: 'portrait'
    },
    {
      number: '05',
      title: 'Kasirku',
      type: 'Mobile POS app',
      category: 'mobile',
      description: 'Retail point-of-sale mobile app with stock management, margin tracking, receipt printing, and transaction search.',
      fullDescription: 'Aplikasi kasir berbasis mobile untuk UMKM dan toko ritel dengan manajemen kategori barang, harga modal dan harga jual terpisah, pembaruan stok otomatis, serta cetak struk.',
      image: 'https://rnaghyoscswiizdtyrlz.supabase.co/storage/v1/object/public/portofolio/projects/kasirku/kasirku-cover.png',
      images: [],
      features: [
        'Manajemen stok barang secara otomatis & fleksibel',
        'Simpan harga modal dan harga jual terpisah',
        'Cetak struk/faktur pembelian & riwayat transaksi'
      ],
      techStack: ['Flutter', 'Dart', 'Firebase'],
      demoLink: '',
      repositoryLink: 'https://github.com/Nopallse/kasirku',
      alt: 'Kasirku mobile POS application cover',
      orientation: 'wide'
    },
    {
      number: '06',
      title: 'Akira',
      type: 'Field data mobile app',
      category: 'mobile',
      description: 'Field data capture mobile app replacing paper forms with structured local storage and one-tap Excel (.xlsx) export.',
      fullDescription: 'Aplikasi pencatatan data lapangan yang menggantikan proses input manual berbasis kertas dengan penyimpanan lokal dan ekspor langsung ke file Excel (.xlsx).',
      image: 'https://rnaghyoscswiizdtyrlz.supabase.co/storage/v1/object/public/portofolio/projects/akira/akira-cover.png',
      images: [],
      features: [
        'Input data lapangan terstruktur sesuai format formulir',
        'Export data langsung ke file Excel (.xlsx)',
        'Riwayat data tersimpan offline di perangkat'
      ],
      techStack: ['Flutter', 'Dart', 'Local Storage'],
      demoLink: '',
      repositoryLink: 'https://github.com/Nopallse/akira',
      alt: 'Akira field data capture application cover',
      orientation: 'portrait'
    }
  ],
  capabilities: [
    { index: 'A', title: 'Enterprise systems', body: 'Configurable workflows, risk processes, and dependable releases for complex operations.' },
    { index: 'B', title: 'Web products', body: 'End-to-end engineering from APIs and databases to responsive product interfaces.' },
    { index: 'C', title: 'Mobile development', body: 'Android and Flutter applications with secure integrations, real-time data, and considered flows.' },
    { index: 'D', title: 'Data & integration', body: 'Relational data design, REST APIs, payment gateways, and production-ready deployment.' }
  ],
  skills: [
    { category: 'Languages', items: ['JavaScript', 'TypeScript', 'Kotlin', 'Dart', 'Java', 'Python'] },
    { category: 'Frameworks', items: ['React', 'Next.js', 'Express.js', 'Flutter', 'Node.js'] },
    { category: 'Tools', items: ['Git', 'Docker', 'Firebase', 'Supabase', 'Figma', 'Postman'] },
    { category: 'Databases', items: ['MySQL', 'MongoDB', 'PostgreSQL'] }
  ],
  timeline: [
    { number: '01', date: 'Feb 2026 — Present', location: 'PT. Bank Negara Indonesia (Persero) Tbk.', title: 'Back End Developer', text: 'Developing internal enterprise projects as a backend engineer using .NET framework and Oracle DB.' },
    { number: '02', date: 'Feb 2025 — Mar 2026', location: 'PT Metro Indonesian Software, Padang', title: 'Software Engineer', text: 'Built scalable systems including Invitation Website, IoT-based Billing System, and Pilates Booking Application.' },
    { number: '03', date: 'Jan 2025 — Feb 2025', location: 'Bank Nagari, Padang', title: 'Fullstack Developer Intern', text: 'Developed and maintained internal banking web features across frontend and backend services.' },
    { number: '04', date: 'Aug 2024 — Dec 2024', location: 'Bangkit Academy (Remote)', title: 'Mobile Development Cohort', text: 'Completed a 900+ hour Google-certified program on Android development and capstone delivery, graduated with Distinction.' }
  ],
  education: [
    {
      institution: 'Universitas Andalas',
      degree: 'Bachelor of Information Systems (GPA 3.80)',
      dateRange: '2022 – 2026',
      location: 'Padang, Indonesia',
      image: 'https://unand.ac.id/images/konten/Logo%20Unand%20PTNBH.png'
    }
  ],
  certificates: [
    { title: 'Android Developer Certificate', issuer: 'Bangkit Academy (Google, Gojek, Tokopedia)', credentialLink: 'https://drive.google.com/file/d/1SMuLwISXbaHD7jI0jZhqTXGwC9uPqpJ6/edit' },
    { title: 'Menjadi Android Developer Expert', issuer: 'Dicoding Indonesia', credentialLink: 'https://www.dicoding.com/certificates/L4PQEL897PO1' },
    { title: 'Belajar Membuat Aplikasi Android dengan Jetpack Compose', issuer: 'Dicoding Indonesia', credentialLink: 'https://www.dicoding.com/certificates/RVZKWJ4JMZD5' },
    { title: 'Belajar Penerapan Machine Learning untuk Android', issuer: 'Dicoding Indonesia', credentialLink: 'https://www.dicoding.com/certificates/07Z64J4EWPQR' },
    { title: 'IDEA REGENERATION EXPO 2025', issuer: 'Management and Science University', credentialLink: '' }
  ],
  contact: {
    email: 'noppal.901@gmail.com',
    location: 'Jakarta / Padang, Indonesia',
    linkedin: 'https://linkedin.com/in/naaufaal',
    github: 'https://github.com/naaufaal',
    photo: 'https://rnaghyoscswiizdtyrlz.supabase.co/storage/v1/object/public/portofolio/profile/cekx0ywturp.jpg',
    cvUrl: 'cv_naufal.pdf'
  }
};
