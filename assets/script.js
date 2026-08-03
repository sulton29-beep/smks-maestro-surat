// ============================================================
// SMKS MAESTRO - SISTEM NOMOR SURAT OTOMATIS (TANPA DATABASE)
// ============================================================

// --- KONFIGURASI ---
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';
const STORAGE_KEY = 'smks_maestro_data';

// --- DATA DEFAULT ---
function getDefaultData() {
    return {
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
        log: [],
        nomor_terakhir: { tahun: '2026', nomor: 0 }
    };
}

// --- FUNGSI CRUD DATA ---
function getData() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const data = JSON.parse(raw);
            // Pastikan semua key ada
            const defaultData = getDefaultData();
            for (const key in defaultData) {
                if (!(key in data)) {
                    data[key] = defaultData[key];
                }
            }
            return data;
        }
    } catch (e) {
        console.error('Error baca data:', e);
    }
    // Jika belum ada data, buat default
    const defaultData = getDefaultData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    return defaultData;
}

function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// --- FUNGSI GURU ---
function getGuru() {
    const data = getData();
    return data.guru || [];
}

function tambahGuru(nama) {
    const data = getData();
    if (!data.guru.includes(nama)) {
        data.guru.push(nama);
        saveData(data);
        return true;
    }
    return false;
}

function hapusGuru(nama) {
    const data = getData();
    data.guru = data.guru.filter(g => g !== nama);
    saveData(data);
}

// --- FUNGSI PERMINTAAN ---
function getPermintaan() {
    const data = getData();
    return data.permintaan || [];
}

function tambahPermintaan(permintaan) {
    const data = getData();
    data.permintaan.push(permintaan);
    data.nomor_terakhir.nomor = permintaan.nomor_urut;
    saveData(data);
}

function updatePermintaan(id, updates) {
    const data = getData();
    const index = data.permintaan.findIndex(p => p.id === id);
    if (index !== -1) {
        data.permintaan[index] = { ...data.permintaan[index], ...updates };
        saveData(data);
        return true;
    }
    return false;
}

// --- FUNGSI LOG ---
function tambahLog(aktivitas, admin = 'Admin') {
    const data = getData();
    const tanggal = new Date().toLocaleDateString('id-ID');
    const waktu = new Date().toLocaleTimeString('id-ID');
    data.log.push({ tanggal, waktu, aktivitas, admin });
    saveData(data);
}

function getLog() {
    const data = getData();
    return data.log || [];
}

// --- FUNGSI PENGATURAN ---
function getPengaturan() {
    const data = getData();
    return data.nomor_terakhir || { tahun: '2026', nomor: 0 };
}

function updatePengaturan(nomor_terakhir) {
    const data = getData();
    data.nomor_terakhir.nomor = nomor_terakhir;
    saveData(data);
}

// --- FUNGSI WHATSAPP (Fonnte) ---
async function kirimWhatsApp(pesan) {
    // Jika ingin pakai WhatsApp, daftar di fonnte.com dan isi API Key di sini
    // const WHATSAPP_API_KEY = 'PASTE_API_KEY_ANDA';
    // const WHATSAPP_NOMOR = '089674280380';
    
    console.log('📱 [WhatsApp] Pesan:', pesan);
    alert('📱 WhatsApp terkirim! (Simulasi)\n\nPesan:\n' + pesan);
    
    // Buka kode di bawah jika sudah punya API Key
    /*
    try {
        const response = await fetch('https://api.fonnte.com/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                target: WHATSAPP_NOMOR,
                message: pesan,
                countryCode: '62'
            })
        });
        const result = await response.json();
        console.log('✅ WhatsApp terkirim:', result);
    } catch (error) {
        console.error('❌ Gagal kirim WA:', error);
    }
    */
}

// --- UTILITY ---
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

// --- LOGIN ---
function handleLogin(e) {
    if (e) e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorEl = document.getElementById('loginError');

    // Cek dari localStorage (jika admin sudah ganti)
    const savedUsername = localStorage.getItem('admin_username') || ADMIN_USERNAME;
    const savedPassword = localStorage.getItem('admin_password') || ADMIN_PASSWORD;

    if (username === savedUsername && password === savedPassword) {
        localStorage.setItem('admin_logged_in', 'true');
        window.location.href = 'dashboard.html';
    } else {
        errorEl.style.display = 'block';
        errorEl.textContent = '❌ Username atau password salah!';
    }
}

// --- DASHBOARD ---
function loadDashboard() {
    if (!localStorage.getItem('admin_logged_in')) {
        window.location.href = 'login.html';
        return;
    }

    const permintaan = getPermintaan();
    
    const total = permintaan.length;
    const menunggu = permintaan.filter(p => p.status === 'menunggu').length;
    const disetujui = permintaan.filter(p => p.status === 'disetujui').length;
    const ditolak = permintaan.filter(p => p.status === 'ditolak').length;

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statMenunggu').textContent = menunggu;
    document.getElementById('statDisetujui').textContent = disetujui;
    document.getElementById('statDitolak').textContent = ditolak;

    renderPermintaan(permintaan);

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

// --- FORM SURAT ---
function loadFormSurat() {
    const daftarGuru = getGuru();
    const guruSelect = document.getElementById('guru');
    if (guruSelect) {
        guruSelect.innerHTML = '<option value="">-- Pilih Nama Guru --</option>';
        if (daftarGuru && daftarGuru.length > 0) {
            daftarGuru.forEach(g => {
                guruSelect.innerHTML += `<option value="${g}">${g}</option>`;
            });
        } else {
            guruSelect.innerHTML += '<option value="" disabled>❌ Belum ada guru</option>';
        }
    }

    const today = new Date();
    const tanggalInput = document.getElementById('tanggalInput');
    if (tanggalInput) {
        tanggalInput.value = formatDate(today);
    }

    const lokasiInput = document.getElementById('lokasiDokumen');
    if (lokasiInput && !lokasiInput.value) {
        lokasiInput.value = 'Jl.Raya Keramat Pakuhaji Km.3,5 Kayu Agung Kec.Sepatan Kab.Tangerang 15520';
    }

    const perihalInput = document.getElementById('perihal');
    const tanggalSuratInput = document.getElementById('tanggalSurat');
    
    if (perihalInput) {
        perihalInput.addEventListener('input', updatePreview);
    }
    if (tanggalSuratInput) {
        tanggalSuratInput.addEventListener('change', updatePreview);
    }

    const form = document.getElementById('suratForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            ajukanSurat();
        });
    }

    updatePreview();
}

function updatePreview() {
    const perihal = document.getElementById('perihal').value.trim();
    const tanggalSurat = document.getElementById('tanggalSurat').value;
    const kodeSurat = document.getElementById('kodeSurat').value || '421.5';

    const pengaturan = getPengaturan();
    const nomorUrut = pengaturan.nomor + 1;

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
    const guru = document.getElementById('guru').value;
    const kodeSurat = document.getElementById('kodeSurat').value;
    const suratUntuk = document.getElementById('suratUntuk').value.trim();
    const perihal = document.getElementById('perihal').value.trim();
    const tanggalSurat = document.getElementById('tanggalSurat').value;
    const lokasiDokumen = document.getElementById('lokasiDokumen').value.trim();

    if (!guru || !suratUntuk || !perihal || !tanggalSurat) {
        showResult('formResult', 'Semua field wajib diisi!', 'danger');
        return;
    }

    const pengaturan = getPengaturan();
    const nomorUrut = pengaturan.nomor + 1;
    const date = new Date(tanggalSurat);
    const bulanRomawi = getBulanRomawi(date.getMonth());
    const tahun = date.getFullYear();
    const singkatan = singkatPerihal(perihal);

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
        nomor_surat: null,
        status: 'menunggu'
    };

    tambahPermintaan(permintaan);
    tambahLog(`Permintaan surat dari ${guru} - ${perihal}`);

    // Kirim WhatsApp
    const pesanWA = `📨 Permintaan Nomor Surat Baru!\n\n👤 Guru: ${guru}\n📝 Perihal: ${perihal}\n🏢 Untuk: ${suratUntuk}\n📅 Tanggal: ${formatDateFull(tanggalSurat)}\n\n⏳ Status: Menunggu persetujuan admin.\n🔗 Login untuk setujui: https://nsosmksmaestro.netlify.app/login`;
    kirimWhatsApp(pesanWA);

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

// --- ADMIN ACTIONS ---
function setujuiPermintaan(id) {
    if (!confirm('Setujui permintaan surat ini?')) return;

    const permintaan = getPermintaan();
    const p = permintaan.find(item => item.id === id);
    if (!p || p.status !== 'menunggu') return;

    const nomorSurat = generateNomorSurat(
        p.kode_surat || '421.5',
        p.nomor_urut,
        p.singkatan,
        p.tahun,
        p.bulan_romawi
    );

    updatePermintaan(id, {
        status: 'disetujui',
        nomor_surat: nomorSurat
    });
    updatePengaturan(p.nomor_urut);
    tambahLog(`Menyetujui surat ${nomorSurat}`);

    // Kirim WhatsApp
    const pesanWA = `📨 Nomor Surat Telah Disetujui!\n\n📌 Nomor Surat: ${nomorSurat}\n👤 Guru: ${p.guru}\n📝 Perihal: ${p.perihal}\n🏢 Untuk: ${p.surat_untuk}\n📅 Tanggal: ${p.tanggal_surat}`;
    kirimWhatsApp(pesanWA);

    loadDashboard();
    alert(`✅ Surat ${nomorSurat} telah disetujui!`);
}

function tolakPermintaan(id) {
    const alasan = prompt('Masukkan alasan penolakan:');
    if (alasan === null || !alasan.trim()) return;

    const permintaan = getPermintaan();
    const p = permintaan.find(item => item.id === id);
    if (!p || p.status !== 'menunggu') return;

    updatePermintaan(id, {
        status: 'ditolak',
        alasan_tolak: alasan.trim()
    });
    tambahLog(`Menolak surat dari ${p.guru} - ${alasan}`);

    // Kirim WhatsApp
    const pesanWA = `❌ Surat Ditolak!\n\n👤 Guru: ${p.guru}\n📝 Perihal: ${p.perihal}\n📋 Alasan: ${alasan}`;
    kirimWhatsApp(pesanWA);

    loadDashboard();
    alert(`❌ Surat dari ${p.guru} telah ditolak.`);
}

// --- CMS GURU ---
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
    const daftarGuru = getGuru();
    const tbody = document.getElementById('guruBody');
    if (!tbody) return;

    if (daftarGuru.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;color:#a0aec0;padding:30px;">Belum ada guru</td></tr>`;
        return;
    }

    let html = '';
    daftarGuru.forEach((g, index) => {
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

    if (tambahGuru(nama)) {
        tambahLog(`Menambahkan guru: ${nama}`);
        document.getElementById('namaGuru').value = '';
        renderGuruList();
        showResult('guruResult', `✅ Guru "${nama}" berhasil ditambahkan!`, 'success');
    } else {
        showResult('guruResult', `❌ Guru "${nama}" sudah terdaftar!`, 'danger');
    }
}

function hapusGuru(nama) {
    if (!confirm(`Hapus guru "${nama}"?`)) return;
    hapusGuru(nama);
    tambahLog(`Menghapus guru: ${nama}`);
    renderGuruList();
    alert(`✅ Guru "${nama}" berhasil dihapus.`);
}

// --- CMS PENGATURAN ---
function loadCMSPengaturan() {
    if (!localStorage.getItem('admin_logged_in')) {
        window.location.href = 'login.html';
        return;
    }

    const pengaturan = getPengaturan();
    document.getElementById('infoTahun').textContent = pengaturan.tahun || '2026';
    document.getElementById('infoNomor').textContent = String(pengaturan.nomor).padStart(3, '0');

    const permintaan = getPermintaan();
    const totalSurat = permintaan.filter(p => p.status === 'disetujui').length;
    document.getElementById('infoTotal').textContent = totalSurat;

    const tahunSelect = document.getElementById('tahunHapus');
    if (tahunSelect) {
        const tahunList = [...new Set(permintaan.map(p => p.tahun))].sort();
        tahunSelect.innerHTML = '<option value="">-- Pilih Tahun --</option>';
        tahunList.forEach(t => {
            tahunSelect.innerHTML += `<option value="${t}">${t}</option>`;
        });
        if (tahunList.length === 0) {
            tahunSelect.innerHTML += `<option value="" disabled>Belum ada data</option>`;
        }
    }

    renderLog();

    document.getElementById('aturNomorForm').addEventListener('submit', handleAturNomor);
    document.getElementById('resetNomorForm').addEventListener('submit', handleResetNomor);
    document.getElementById('hapusDataForm').addEventListener('submit', handleHapusData);
    document.getElementById('gantiAkunForm').addEventListener('submit', handleGantiAkun);
}

function renderLog() {
    const logs = getLog();
    const tbody = document.getElementById('logBody');
    if (!tbody) return;

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
    const nomorBaru = parseInt(document.getElementById('nomorBaru').value);
    const password = document.getElementById('passwordAtur').value.trim();

    if (isNaN(nomorBaru) || nomorBaru < 0) {
        showResult('aturNomorResult', 'Masukkan nomor urut yang valid (min 0)!', 'danger');
        return;
    }

    const savedPassword = localStorage.getItem('admin_password') || ADMIN_PASSWORD;
    if (password !== savedPassword) {
        showResult('aturNomorResult', '❌ Password admin salah!', 'danger');
        return;
    }

    const pengaturan = getPengaturan();
    const nomorLama = pengaturan.nomor;
    updatePengaturan(nomorBaru);
    tambahLog(`Mengubah nomor urut: ${String(nomorLama).padStart(3, '0')} → ${String(nomorBaru).padStart(3, '0')}`);

    document.getElementById('passwordAtur').value = '';
    document.getElementById('nomorBaru').value = '';
    showResult('aturNomorResult', `✅ Nomor urut berhasil diubah ke ${String(nomorBaru).padStart(3, '0')}`, 'success');
    loadCMSPengaturan();
}

function handleResetNomor(e) {
    e.preventDefault();
    const password = document.getElementById('passwordReset').value.trim();

    const savedPassword = localStorage.getItem('admin_password') || ADMIN_PASSWORD;
    if (password !== savedPassword) {
        showResult('resetNomorResult', '❌ Password admin salah!', 'danger');
        return;
    }

    if (!confirm('⚠️ Reset nomor urut ke 000?\n\nData tahun lalu TIDAK akan dihapus.')) return;

    updatePengaturan(0);
    tambahLog('Reset nomor urut ke 000');

    document.getElementById('passwordReset').value = '';
    showResult('resetNomorResult', '✅ Nomor urut berhasil direset ke 000', 'success');
    loadCMSPengaturan();
}

function handleHapusData(e) {
    e.preventDefault();
    const tahun = document.getElementById('tahunHapus').value;
    const password = document.getElementById('passwordHapus').value.trim();

    const savedPassword = localStorage.getItem('admin_password') || ADMIN_PASSWORD;
    if (password !== savedPassword) {
        showResult('hapusDataResult', '❌ Password admin salah!', 'danger');
        return;
    }

    const permintaan = getPermintaan();
    const jumlah = permintaan.filter(p => p.tahun === tahun).length;
    if (jumlah === 0) {
        showResult('hapusDataResult', `Tidak ada data surat tahun ${tahun}`, 'warning');
        return;
    }

    if (!confirm(`⚠️ HAPUS PERMANEN ${jumlah} data surat tahun ${tahun}?\n\nTINDAKAN INI TIDAK BISA DIBATALKAN!`)) return;

    const data = getData();
    data.permintaan = data.permintaan.filter(p => p.tahun !== tahun);
    saveData(data);
    tambahLog(`Menghapus ${jumlah} data surat tahun ${tahun}`);

    document.getElementById('passwordHapus').value = '';
    showResult('hapusDataResult', `✅ ${jumlah} data surat tahun ${tahun} berhasil dihapus`, 'success');
    loadCMSPengaturan();
}

function handleGantiAkun(e) {
    e.preventDefault();
    const usernameBaru = document.getElementById('usernameBaru').value.trim();
    const passwordBaru = document.getElementById('passwordBaru').value.trim();
    const passwordLama = document.getElementById('passwordLama').value.trim();

    const savedPassword = localStorage.getItem('admin_password') || ADMIN_PASSWORD;
    if (passwordLama !== savedPassword) {
        showResult('gantiAkunResult', '❌ Password lama salah!', 'danger');
        return;
    }

    if (!usernameBaru || !passwordBaru || passwordBaru.length < 6) {
        showResult('gantiAkunResult', 'Username dan password (min 6 karakter) wajib diisi!', 'danger');
        return;
    }

    localStorage.setItem('admin_username', usernameBaru);
    localStorage.setItem('admin_password', passwordBaru);
    tambahLog(`Mengganti username menjadi "${usernameBaru}"`);

    document.getElementById('usernameBaru').value = '';
    document.getElementById('passwordBaru').value = '';
    document.getElementById('passwordLama').value = '';
    showResult('gantiAkunResult', '✅ Username & password berhasil diubah! Silakan login ulang.', 'success');

    setTimeout(() => {
        localStorage.removeItem('admin_logged_in');
        window.location.href = 'login.html';
    }, 2000);
}

// --- EXPORT EXCEL ---
function exportToExcel(permintaan) {
    if (!permintaan || permintaan.length === 0) {
        alert('Tidak ada data untuk diexport!');
        return;
    }

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

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `data_surat_${formatDate(new Date()).replace(/\//g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);

    alert('✅ Data berhasil diexport! Buka file CSV dengan Excel.');
}

// --- INDEX PAGE STATS ---
function loadIndexStats() {
    const permintaan = getPermintaan();
    document.getElementById('totalSurat').textContent = permintaan.length;
    document.getElementById('menunggu').textContent = permintaan.filter(p => p.status === 'menunggu').length;
    document.getElementById('disetujui').textContent = permintaan.filter(p => p.status === 'disetujui').length;
}

// --- INITIALIZATION ---
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
        case 'logout.html':
            localStorage.removeItem('admin_logged_in');
            break;
    }
});

// --- EXPOSE FUNCTIONS ---
window.setujuiPermintaan = setujuiPermintaan;
window.tolakPermintaan = tolakPermintaan;
window.hapusGuru = hapusGuru;

console.log('✅ SMKS MAESTRO - Sistem Nomor Surat Otomatis');
console.log('📁 Menggunakan localStorage (tanpa database)');
console.log('👤 Login default: admin / admin123');
console.log('💡 Semua data tersimpan di browser Anda.');