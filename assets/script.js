// ============================================================
// DATA STORE (Simulasi Penyimpanan dengan localStorage)
// ============================================================

const STORE_KEY = 'smks_maestro_data';

// Data Default
const defaultData = {
    admin: {
        username: 'admin',
        password: 'admin123'
    },
    nomor_terakhir: {
        tahun: '2026',
        nomor: 0
    },
    guru: [
        'SITI ZULHULAIFAH',
        'SENENG KURNIATI, S.Pd',
        'NENENG SUSANTI, S.Pd',
        'LUSI KARTIKA, S.Pd',
        'IIN MARLINA, S.Pd',
        'DESSY NURMALASARI, S.Pd.',
        'DEWI ARISYANDI, S.Pd',
        'VIVI WAHYUNI, S.Pd',
        'TIA ROSLEINA, S.Pd.',
        'SITI ELIYAWATI, S.Pd.',
        'TESYA HASAN ZEIN MAHMUD, S.T',
        'ABDUL KADIR ZAELANI',
        'RONI VEBRINO, S.Kom',
        'IDZA TAZALLA',
        'TEGUH PRIYONO, S.T',
        'HILMAN MOCHAMMAD FAUZI, S.KOM',
        'SULTON HASANUDIN',
        'AHMAD YAYAN SOPIYAN, S.T'
    ],
    permintaan: [],
    log: []
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function getData() {
    try {
        const raw = localStorage.getItem(STORE_KEY);
        if (raw) {
            const data = JSON.parse(raw);
            // Merge dengan default untuk memastikan semua key ada
            return { ...defaultData, ...data };
        }
    } catch (e) {
        console.error('Error membaca data:', e);
    }
    // Inisialisasi data default
    localStorage.setItem(STORE_KEY, JSON.stringify(defaultData));
    return { ...defaultData };
}

function saveData(data) {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

function formatDateFull(date) {
    const d = new Date(date);
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function getBulanRomawi(month) {
    const romawi = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    return romawi[month] || 'I';
}

function singkatPerihal(text) {
    // Ambil huruf kapital awal setiap kata
    const words = text.trim().split(' ');
    let singkatan = '';
    for (const word of words) {
        const firstChar = word.charAt(0).toUpperCase();
        if (firstChar.match(/[A-Z]/)) {
            singkatan += firstChar;
        }
    }
    return singkatan || 'XXX';
}

function generateNomorSurat(kodeSurat, nomorUrut, singkatan, tahun, bulanRomawi) {
    const nomorStr = String(nomorUrut).padStart(3, '0');
    return `${kodeSurat}/${nomorStr}/${singkatan}/SMKS.Mst/${bulanRomawi}/${tahun}`;
}

function getStatusBadge(status) {
    const map = {
        'menunggu': '<span class="status-badge status-menunggu">⏳ Menunggu</span>',
        'disetujui': '<span class="status-badge status-disetujui">✅ Disetujui</span>',
        'ditolak': '<span class="status-badge status-ditolak">❌ Ditolak</span>'
    };
    return map[status] || status;
}

// ============================================================
// LOGIN
// ============================================================

function handleLogin(e) {
    if (e) e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorEl = document.getElementById('loginError');

    const data = getData();
    if (username === data.admin.username && password === data.admin.password) {
        localStorage.setItem('admin_logged_in', 'true');
        window.location.href = 'dashboard.html';
    } else {
        errorEl.style.display = 'block';
        errorEl.textContent = '❌ Username atau password salah!';
    }
}

// ============================================================
// DASHBOARD
// ============================================================

function loadDashboard() {
    // Cek login
    if (!localStorage.getItem('admin_logged_in')) {
        window.location.href = 'login.html';
        return;
    }

    const data = getData();
    const permintaan = data.permintaan || [];

    // Update stats
    const total = permintaan.length;
    const menunggu = permintaan.filter(p => p.status === 'menunggu').length;
    const disetujui = permintaan.filter(p => p.status === 'disetujui').length;
    const ditolak = permintaan.filter(p => p.status === 'ditolak').length;

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statMenunggu').textContent = menunggu;
    document.getElementById('statDisetujui').textContent = disetujui;
    document.getElementById('statDitolak').textContent = ditolak;

    // Tampilkan data di tabel
    renderPermintaan(permintaan);

    // Event listener filter
    document.querySelectorAll('.btn-filter').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const filter = this.dataset.filter;
            let filtered = permintaan;
            if (filter !== 'semua') {
                filtered = permintaan.filter(p => p.status === filter);
            }
            renderPermintaan(filtered);
        });
    });

    // Event listener export Excel
    document.getElementById('exportExcel').addEventListener('click', function(e) {
        e.preventDefault();
        exportToExcel(permintaan);
    });
}

function renderPermintaan(permintaan) {
    const tbody = document.getElementById('permintaanBody');
    if (!tbody) return;

    if (permintaan.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:#a0aec0;padding:30px;">Belum ada permintaan surat</td></tr>`;
        return;
    }

    let html = '';
    permintaan.forEach((p, index) => {
        const nomorSurat = p.nomor_surat || '-';
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${p.tanggal_input || '-'}</td>
                <td>${p.guru || '-'}</td>
                <td>${p.surat_untuk || '-'}</td>
                <td>${p.perihal || '-'}</td>
                <td><strong>${nomorSurat}</strong></td>
                <td>${getStatusBadge(p.status)}</td>
                <td>
                    ${p.status === 'menunggu' ? `
                        <button class="btn btn-success btn-sm" onclick="setujuiPermintaan('${p.id}')">Setujui</button>
                        <button class="btn btn-danger btn-sm" onclick="tolakPermintaan('${p.id}')">Tolak</button>
                    ` : `
                        <span style="color:#a0aec0;font-size:0.8rem;">-</span>
                    `}
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

// ============================================================
// PERMINTAAN SURAT (Guru)
// ============================================================

function loadFormSurat() {
    const data = getData();
    const guruSelect = document.getElementById('guru');
    if (guruSelect) {
        guruSelect.innerHTML = '<option value="">-- Pilih Nama Guru --</option>';
        data.guru.forEach(g => {
            guruSelect.innerHTML += `<option value="${g}">${g}</option>`;
        });
    }

    // Tanggal input otomatis
    const today = new Date();
    document.getElementById('tanggalInput').value = formatDate(today);

    // Set default lokasi
    const lokasiInput = document.getElementById('lokasiDokumen');
    if (lokasiInput && !lokasiInput.value) {
        lokasiInput.value = 'Jl.Raya Keramat Pakuhaji Km.3,5 Kayu Agung Kec.Sepatan Kab.Tangerang 15520';
    }

    // Event listener untuk preview
    const perihalInput = document.getElementById('perihal');
    const tanggalSuratInput = document.getElementById('tanggalSurat');
    
    if (perihalInput) {
        perihalInput.addEventListener('input', updatePreview);
    }
    if (tanggalSuratInput) {
        tanggalSuratInput.addEventListener('change', updatePreview);
    }

    // Event submit form
    const form = document.getElementById('suratForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            ajukanSurat();
        });
    }
}

function updatePreview() {
    const perihal = document.getElementById('perihal').value.trim();
    const tanggalSurat = document.getElementById('tanggalSurat').value;
    const kodeSurat = document.getElementById('kodeSurat').value || '421.5';

    const data = getData();
    const nomorUrut = data.nomor_terakhir.nomor + 1;

    const singkatan = perihal ? singkatPerihal(perihal) : '---';
    document.getElementById('previewSingkatan').textContent = singkatan;

    if (tanggalSurat) {
        const date = new Date(tanggalSurat);
        const bulanRomawi = getBulanRomawi(date.getMonth());
        const tahun = date.getFullYear();
        document.getElementById('previewBulan').textContent = `${bulanRomawi} (${tahun})`;
        document.getElementById('previewHasil').textContent = 
            generateNomorSurat(kodeSurat, 'XXX', singkatan, tahun, bulanRomawi);
    } else {
        document.getElementById('previewBulan').textContent = '-';
        document.getElementById('previewHasil').textContent = `${kodeSurat}/XXX/${singkatan}/SMKS.Mst/---/2026`;
    }

    document.getElementById('previewNomor').textContent = String(nomorUrut).padStart(3, '0');
    document.getElementById('previewKode').textContent = kodeSurat;
}

function ajukanSurat() {
    const data = getData();
    
    const guru = document.getElementById('guru').value;
    const kodeSurat = document.getElementById('kodeSurat').value;
    const suratUntuk = document.getElementById('suratUntuk').value.trim();
    const perihal = document.getElementById('perihal').value.trim();
    const tanggalSurat = document.getElementById('tanggalSurat').value;
    const lokasiDokumen = document.getElementById('lokasiDokumen').value.trim();

    // Validasi
    if (!guru) {
        showResult('formResult', 'Pilih nama guru terlebih dahulu!', 'danger');
        return;
    }
    if (!suratUntuk) {
        showResult('formResult', 'Isi field "Surat Untuk" terlebih dahulu!', 'danger');
        return;
    }
    if (!perihal) {
        showResult('formResult', 'Isi field "Perihal Surat" terlebih dahulu!', 'danger');
        return;
    }
    if (!tanggalSurat) {
        showResult('formResult', 'Pilih "Tanggal Surat" terlebih dahulu!', 'danger');
        return;
    }

    // Generate data
    const date = new Date(tanggalSurat);
    const bulanRomawi = getBulanRomawi(date.getMonth());
    const tahun = date.getFullYear();
    const nomorUrut = data.nomor_terakhir.nomor + 1;
    const singkatan = singkatPerihal(perihal);

    // Simpan permintaan
    const permintaan = {
        id: Date.now().toString(),
        guru: guru,
        kode_surat: kodeSurat,
        tanggal_input: formatDate(new Date()),
        surat_untuk: suratUntuk,
        perihal: perihal,
        tanggal_surat: formatDateFull(tanggalSurat),
        lokasi_dokumen: lokasiDokumen || 'Jl.Raya Keramat Pakuhaji Km.3,5 Kayu Agung Kec.Sepatan Kab.Tangerang 15520',
        nomor_urut: nomorUrut,
        bulan_romawi: bulanRomawi,
        tahun: tahun,
        singkatan: singkatan,
        // Nomor surat belum dibuat (disembunyikan sampai disetujui)
        nomor_surat: null,
        status: 'menunggu',
        created_at: new Date().toISOString()
    };

    data.permintaan.push(permintaan);
    
    // Update nomor terakhir (tapi belum disimpan karena masih menunggu)
    // Kita simpan dulu tapi status menunggu
    saveData(data);

    // Reset form
    document.getElementById('suratForm').reset();
    document.getElementById('tanggalInput').value = formatDate(new Date());
    document.getElementById('lokasiDokumen').value = 'Jl.Raya Keramat Pakuhaji Km.3,5 Kayu Agung Kec.Sepatan Kab.Tangerang 15520';
    updatePreview();

    showResult('formResult', 
        `✅ Permintaan nomor surat berhasil diajukan!<br>
         <strong>Nama:</strong> ${guru}<br>
         <strong>Perihal:</strong> ${perihal}<br>
         <strong>Status:</strong> Menunggu persetujuan admin<br>
         <br>
         ⏳ Silakan tunggu admin menyetujui permintaan Anda.`,
        'success'
    );
}

function showResult(elementId, message, type) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.style.display = 'block';
    el.className = `alert alert-${type}`;
    el.innerHTML = message;
    setTimeout(() => {
        el.style.display = 'none';
    }, 10000);
}

// ============================================================
// ADMIN ACTIONS
// ============================================================

function setujuiPermintaan(id) {
    if (!confirm('Setujui permintaan surat ini?')) return;

    const data = getData();
    const index = data.permintaan.findIndex(p => p.id === id);
    if (index === -1) return;

    const p = data.permintaan[index];
    if (p.status !== 'menunggu') return;

    // Update status
    p.status = 'disetujui';

    // Generate nomor surat
    const nomorUrut = p.nomor_urut;
    const singkatan = p.singkatan;
    const tahun = p.tahun;
    const bulanRomawi = p.bulan_romawi;
    const kodeSurat = p.kode_surat || '421.5';

    p.nomor_surat = generateNomorSurat(kodeSurat, nomorUrut, singkatan, tahun, bulanRomawi);

    // Update nomor terakhir
    data.nomor_terakhir.nomor = nomorUrut;
    data.nomor_terakhir.tahun = tahun;

    // Catat log
    data.log.push({
        tanggal: formatDate(new Date()),
        waktu: new Date().toLocaleTimeString(),
        aktivitas: `Menyetujui surat ${p.nomor_surat}`,
        admin: 'Admin'
    });

    saveData(data);

    // Kirim WhatsApp (simulasi)
    kirimWhatsApp(p);

    // Reload dashboard
    loadDashboard();
    alert(`✅ Surat ${p.nomor_surat} telah disetujui!`);
}

function tolakPermintaan(id) {
    const alasan = prompt('Masukkan alasan penolakan:');
    if (alasan === null) return; // Batal
    if (!alasan.trim()) {
        alert('Alasan penolakan wajib diisi!');
        return;
    }

    const data = getData();
    const index = data.permintaan.findIndex(p => p.id === id);
    if (index === -1) return;

    const p = data.permintaan[index];
    if (p.status !== 'menunggu') return;

    p.status = 'ditolak';
    p.alasan_tolak = alasan.trim();

    // Catat log
    data.log.push({
        tanggal: formatDate(new Date()),
        waktu: new Date().toLocaleTimeString(),
        aktivitas: `Menolak surat dari ${p.guru} - ${p.perihal}`,
        admin: 'Admin'
    });

    saveData(data);
    loadDashboard();
    alert(`❌ Surat dari ${p.guru} telah ditolak.`);
}

// ============================================================
// WHATSAPP SIMULASI
// ============================================================

function kirimWhatsApp(data) {
    const nomorWA = '089674280380';
    const pesan = `
📨 Nomor Surat Telah Disetujui!

━━━━━━━━━━━━━━━━━━━━━━━
📋 Detail Surat:
━━━━━━━━━━━━━━━━━━━━━━━
📌 Nomor Surat : ${data.nomor_surat}
👤 Diajukan oleh: ${data.guru}
🏢 Surat Untuk : ${data.surat_untuk}
📝 Perihal : ${data.perihal}
📅 Tanggal Surat : ${data.tanggal_surat}
📍 Lokasi : ${data.lokasi_dokumen}

━━━━━━━━━━━━━━━━━━━━━━━
✅ Status: DISETUJUI
🕐 Disetujui pada: ${formatDate(new Date())} ${new Date().toLocaleTimeString()}
━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();

    // Simulasi kirim WA (di console)
    console.log('📱 [WhatsApp] Mengirim ke:', nomorWA);
    console.log('📝 Pesan:', pesan);

    // Di real implementation, panggil API WhatsApp di sini
    // Contoh: fetch('https://api.fonnte.com/send', { ... })

    // Tampilkan notifikasi di dashboard
    const resultEl = document.getElementById('formResult');
    if (resultEl) {
        showResult('formResult', 
            `📱 WhatsApp terkirim ke ${nomorWA}<br>
             <strong>Nomor Surat:</strong> ${data.nomor_surat}`,
            'success'
        );
    }
}

// ============================================================
// CMS GURU
// ============================================================

function loadCMSGuru() {
    if (!localStorage.getItem('admin_logged_in')) {
        window.location.href = 'login.html';
        return;
    }

    renderGuruList();

    const form = document.getElementById('guruForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            tambahGuru();
        });
    }
}

function renderGuruList() {
    const data = getData();
    const tbody = document.getElementById('guruBody');
    if (!tbody) return;

    if (data.guru.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;color:#a0aec0;padding:30px;">Belum ada guru</td></tr>`;
        return;
    }

    let html = '';
    data.guru.forEach((g, index) => {
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${g}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="hapusGuru('${g}')">Hapus</button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

function tambahGuru() {
    const nama = document.getElementById('namaGuru').value.trim();
    if (!nama) {
        showResult('guruResult', 'Masukkan nama guru terlebih dahulu!', 'danger');
        return;
    }

    const data = getData();
    if (data.guru.includes(nama)) {
        showResult('guruResult', `Guru "${nama}" sudah terdaftar!`, 'warning');
        return;
    }

    data.guru.push(nama);
    data.log.push({
        tanggal: formatDate(new Date()),
        waktu: new Date().toLocaleTimeString(),
        aktivitas: `Menambahkan guru: ${nama}`,
        admin: 'Admin'
    });
    saveData(data);

    document.getElementById('namaGuru').value = '';
    renderGuruList();
    showResult('guruResult', `✅ Guru "${nama}" berhasil ditambahkan!`, 'success');
}

function hapusGuru(nama) {
    if (!confirm(`Hapus guru "${nama}"?`)) return;

    const data = getData();
    data.guru = data.guru.filter(g => g !== nama);
    data.log.push({
        tanggal: formatDate(new Date()),
        waktu: new Date().toLocaleTimeString(),
        aktivitas: `Menghapus guru: ${nama}`,
        admin: 'Admin'
    });
    saveData(data);
    renderGuruList();
    alert(`✅ Guru "${nama}" berhasil dihapus.`);
}

// ============================================================
// CMS PENGATURAN
// ============================================================

function loadCMSPengaturan() {
    if (!localStorage.getItem('admin_logged_in')) {
        window.location.href = 'login.html';
        return;
    }

    // Informasi
    const data = getData();
    document.getElementById('infoTahun').textContent = data.nomor_terakhir.tahun || '2026';
    document.getElementById('infoNomor').textContent = String(data.nomor_terakhir.nomor).padStart(3, '0');

    const totalSurat = (data.permintaan || []).filter(p => p.status === 'disetujui').length;
    document.getElementById('infoTotal').textContent = totalSurat;

    // Isi dropdown tahun untuk hapus data
    const tahunSelect = document.getElementById('tahunHapus');
    if (tahunSelect) {
        const tahunList = [...new Set((data.permintaan || []).map(p => p.tahun))].sort();
        tahunSelect.innerHTML = '<option value="">-- Pilih Tahun --</option>';
        tahunList.forEach(t => {
            tahunSelect.innerHTML += `<option value="${t}">${t}</option>`;
        });
        if (tahunList.length === 0) {
            tahunSelect.innerHTML += `<option value="" disabled>Belum ada data</option>`;
        }
    }

    // Log aktivitas
    renderLog();

    // Event listeners
    const aturForm = document.getElementById('aturNomorForm');
    if (aturForm) aturForm.addEventListener('submit', handleAturNomor);

    const resetForm = document.getElementById('resetNomorForm');
    if (resetForm) resetForm.addEventListener('submit', handleResetNomor);

    const hapusForm = document.getElementById('hapusDataForm');
    if (hapusForm) hapusForm.addEventListener('submit', handleHapusData);

    const gantiForm = document.getElementById('gantiAkunForm');
    if (gantiForm) gantiForm.addEventListener('submit', handleGantiAkun);
}

function renderLog() {
    const data = getData();
    const tbody = document.getElementById('logBody');
    if (!tbody) return;

    const logs = data.log || [];
    if (logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;color:#a0aec0;padding:20px;">Belum ada aktivitas</td></tr>`;
        return;
    }

    let html = '';
    logs.slice().reverse().forEach(log => {
        html += `
            <tr>
                <td>${log.tanggal || '-'} ${log.waktu || ''}</td>
                <td>${log.aktivitas || '-'}</td>
                <td>${log.admin || 'Admin'}</td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

function handleAturNomor(e) {
    e.preventDefault();
    const data = getData();
    const nomorBaru = parseInt(document.getElementById('nomorBaru').value);
    const password = document.getElementById('passwordAtur').value.trim();

    if (isNaN(nomorBaru) || nomorBaru < 0) {
        showResult('aturNomorResult', 'Masukkan nomor urut yang valid (min 0)!', 'danger');
        return;
    }

    if (password !== data.admin.password) {
        showResult('aturNomorResult', '❌ Password admin salah!', 'danger');
        return;
    }

    const nomorLama = data.nomor_terakhir.nomor;
    data.nomor_terakhir.nomor = nomorBaru;
    data.log.push({
        tanggal: formatDate(new Date()),
        waktu: new Date().toLocaleTimeString(),
        aktivitas: `Mengubah nomor urut: ${String(nomorLama).padStart(3, '0')} → ${String(nomorBaru).padStart(3, '0')}`,
        admin: 'Admin'
    });
    saveData(data);

    document.getElementById('passwordAtur').value = '';
    document.getElementById('nomorBaru').value = '';
    showResult('aturNomorResult', `✅ Nomor urut berhasil diubah ke ${String(nomorBaru).padStart(3, '0')}`, 'success');
    loadCMSPengaturan();
}

function handleResetNomor(e) {
    e.preventDefault();
    const data = getData();
    const password = document.getElementById('passwordReset').value.trim();

    if (password !== data.admin.password) {
        showResult('resetNomorResult', '❌ Password admin salah!', 'danger');
        return;
    }

    if (!confirm('⚠️ Reset nomor urut ke 000?\n\nData tahun lalu TIDAK akan dihapus.')) return;

    data.nomor_terakhir.nomor = 0;
    data.log.push({
        tanggal: formatDate(new Date()),
        waktu: new Date().toLocaleTimeString(),
        aktivitas: 'Reset nomor urut ke 000',
        admin: 'Admin'
    });
    saveData(data);

    document.getElementById('passwordReset').value = '';
    showResult('resetNomorResult', '✅ Nomor urut berhasil direset ke 000', 'success');
    loadCMSPengaturan();
}

function handleHapusData(e) {
    e.preventDefault();
    const data = getData();
    const tahun = document.getElementById('tahunHapus').value;
    const password = document.getElementById('passwordHapus').value.trim();

    if (!tahun) {
        showResult('hapusDataResult', 'Pilih tahun terlebih dahulu!', 'danger');
        return;
    }

    if (password !== data.admin.password) {
        showResult('hapusDataResult', '❌ Password admin salah!', 'danger');
        return;
    }

    const jumlah = data.permintaan.filter(p => p.tahun === tahun).length;
    if (jumlah === 0) {
        showResult('hapusDataResult', `Tidak ada data surat tahun ${tahun}`, 'warning');
        return;
    }

    if (!confirm(`⚠️ HAPUS PERMANEN ${jumlah} data surat tahun ${tahun}?\n\nTINDAKAN INI TIDAK BISA DIBATALKAN!`)) return;

    data.permintaan = data.permintaan.filter(p => p.tahun !== tahun);
    data.log.push({
        tanggal: formatDate(new Date()),
        waktu: new Date().toLocaleTimeString(),
        aktivitas: `Menghapus ${jumlah} data surat tahun ${tahun}`,
        admin: 'Admin'
    });
    saveData(data);

    document.getElementById('passwordHapus').value = '';
    showResult('hapusDataResult', `✅ ${jumlah} data surat tahun ${tahun} berhasil dihapus`, 'success');
    loadCMSPengaturan();
}

function handleGantiAkun(e) {
    e.preventDefault();
    const data = getData();
    const usernameBaru = document.getElementById('usernameBaru').value.trim();
    const passwordBaru = document.getElementById('passwordBaru').value.trim();
    const passwordLama = document.getElementById('passwordLama').value.trim();

    if (!usernameBaru) {
        showResult('gantiAkunResult', 'Masukkan username baru!', 'danger');
        return;
    }
    if (!passwordBaru || passwordBaru.length < 6) {
        showResult('gantiAkunResult', 'Password minimal 6 karakter!', 'danger');
        return;
    }
    if (passwordLama !== data.admin.password) {
        showResult('gantiAkunResult', '❌ Password lama salah!', 'danger');
        return;
    }

    data.admin.username = usernameBaru;
    data.admin.password = passwordBaru;
    data.log.push({
        tanggal: formatDate(new Date()),
        waktu: new Date().toLocaleTimeString(),
        aktivitas: `Mengganti username menjadi "${usernameBaru}"`,
        admin: 'Admin'
    });
    saveData(data);

    document.getElementById('usernameBaru').value = '';
    document.getElementById('passwordBaru').value = '';
    document.getElementById('passwordLama').value = '';
    showResult('gantiAkunResult', '✅ Username & password berhasil diubah! Silakan login ulang.', 'success');

    setTimeout(() => {
        localStorage.removeItem('admin_logged_in');
        window.location.href = 'login.html';
    }, 2000);
}

// ============================================================
// EXPORT EXCEL (Simulasi)
// ============================================================

function exportToExcel(permintaan) {
    if (!permintaan || permintaan.length === 0) {
        alert('Tidak ada data untuk diexport!');
        return;
    }

    // Buat data CSV sederhana (bisa di-import ke Excel)
    let csv = 'No,Tanggal Input,Guru,Surat Untuk,Perihal,Nomor Surat,Tanggal Surat,Status,Lokasi Dokumen\n';
    permintaan.forEach((p, i) => {
        const row = [
            i + 1,
            p.tanggal_input || '-',
            p.guru || '-',
            p.surat_untuk || '-',
            p.perihal || '-',
            p.nomor_surat || '-',
            p.tanggal_surat || '-',
            p.status || '-',
            (p.lokasi_dokumen || 'Jl.Raya Keramat Pakuhaji Km.3,5 Kayu Agung Kec.Sepatan Kab.Tangerang 15520').replace(/,/g, ';')
        ];
        csv += row.join(',') + '\n';
    });

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `data_surat_${formatDate(new Date()).replace(/\//g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);

    alert('✅ Data berhasil diexport! Buka file CSV dengan Excel.');
}

// ============================================================
// INDEX PAGE - STATS
// ============================================================

function loadIndexStats() {
    const data = getData();
    const permintaan = data.permintaan || [];

    document.getElementById('totalSurat').textContent = permintaan.length;
    document.getElementById('menunggu').textContent = permintaan.filter(p => p.status === 'menunggu').length;
    document.getElementById('disetujui').textContent = permintaan.filter(p => p.status === 'disetujui').length;
}

// ============================================================
// INITIALIZATION - Page Load
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname.split('/').pop() || 'index.html';

    switch (path) {
        case 'index.html':
        case '':
            loadIndexStats();
            break;
        case 'login.html':
            const loginForm = document.getElementById('loginForm');
            if (loginForm) loginForm.addEventListener('submit', handleLogin);
            break;
        case 'dashboard.html':
            loadDashboard();
            break;
        case 'form-surat.html':
            loadFormSurat();
            break;
        case 'cms-guru.html':
            loadCMSGuru();
            break;
        case 'cms-pengaturan.html':
            loadCMSPengaturan();
            break;
    }
});

// ============================================================
// EXPOSE FUNCTIONS TO GLOBAL SCOPE (untuk onclick di HTML)
// ============================================================

window.setujuiPermintaan = setujuiPermintaan;
window.tolakPermintaan = tolakPermintaan;
window.hapusGuru = hapusGuru;
window.exportToExcel = exportToExcel;

console.log('✅ SMKS MAESTRO - Sistem Nomor Surat Otomatis');
console.log('📁 Data tersimpan di localStorage browser.');
console.log('👤 Login default: admin / admin123');