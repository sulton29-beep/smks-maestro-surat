// ============================================================
// SMKS MAESTRO - SCRIPT UTAMA DENGAN SUPABASE
// ============================================================

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
// ============================================================
// LOGIN - VERSI TERBARU
// ============================================================
// ============================================================
// LOGIN
// ============================================================
async function handleLogin(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorEl = document.getElementById('loginError');

    console.log('🔍 Mencoba login dengan:', username);

    if (!username || !password) {
        errorEl.style.display = 'block';
        errorEl.textContent = '❌ Username dan password wajib diisi!';
        return;
    }

    try {
        console.log('📡 Mengambil data admin...');
        const admin = await getAdmin();
        console.log('📦 Data admin:', admin);

        if (!admin) {
            errorEl.style.display = 'block';
            errorEl.textContent = '❌ Data admin tidak ditemukan di database!';
            return;
        }

        if (username === admin.username && password === admin.password) {
            console.log('✅ Login berhasil!');
            localStorage.setItem('admin_logged_in', 'true');
            console.log('🔄 Redirect ke dashboard...');
            window.location.replace('dashboard.html');
        } else {
            errorEl.style.display = 'block';
            errorEl.textContent = '❌ Username atau password salah!';
        }
    } catch (error) {
        console.error('❌ Error:', error);
        errorEl.style.display = 'block';
        errorEl.textContent = '❌ Gagal terhubung ke database: ' + error.message;
    }
}

// Pastikan event listener terpasang
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        console.log('✅ Form login ditemukan, memasang event listener...');
        loginForm.addEventListener('submit', handleLogin);
    } else {
        console.log('❌ Form login tidak ditemukan!');
    }
});

// --- DASHBOARD ---
// --- DASHBOARD ---
async function loadDashboard() {
    if (!localStorage.getItem('admin_logged_in')) {
        window.location.href = 'login.html';
        return;
    }

    try {
        // Panggil fungsi getPermintaan dari supabase-config.js
        const permintaan = await getPermintaan();
        console.log('📋 Data permintaan:', permintaan);
        
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

    } catch (error) {
        console.error('❌ Error load dashboard:', error);
        alert('Gagal memuat data. Periksa koneksi internet.');
    }
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

// --- PERMINTAAN SURAT (Guru) ---
// --- PERMINTAAN SURAT (Guru) ---
async function loadFormSurat() {
    console.log('🔄 Memuat form surat...');
    try {
        const daftarGuru = await getGuru();
        console.log('📋 Daftar guru dari database:', daftarGuru);
        
        const guruSelect = document.getElementById('guru');
        if (guruSelect) {
            guruSelect.innerHTML = '<option value="">-- Pilih Nama Guru --</option>';
            if (daftarGuru && daftarGuru.length > 0) {
                daftarGuru.forEach(g => {
                    guruSelect.innerHTML += `<option value="${g.nama}">${g.nama}</option>`;
                });
                console.log('✅ Dropdown guru terisi:', daftarGuru.length, 'guru');
            } else {
                guruSelect.innerHTML += '<option value="" disabled>❌ Belum ada guru di database</option>';
                console.warn('⚠️ Tidak ada data guru!');
            }
        }

        // === PERBAIKI TANGGAL INPUT ===
        const today = new Date();
        const tanggalInput = document.getElementById('tanggalInput');
        if (tanggalInput) {
            tanggalInput.value = formatDate(today);
            console.log('📅 Tanggal input diisi:', tanggalInput.value);
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

    } catch (error) {
        console.error('❌ Error load form:', error);
        alert('Gagal memuat data guru. Periksa koneksi internet dan cek Console (F12).');
    }
}

async function updatePreview() {
    const perihal = document.getElementById('perihal').value.trim();
    const tanggalSurat = document.getElementById('tanggalSurat').value;
    const kodeSurat = document.getElementById('kodeSurat').value || '421.5';

    try {
        const pengaturan = await getPengaturan();
        const nomorUrut = pengaturan.nomor_terakhir + 1;

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

    } catch (error) {
        console.error('Error update preview:', error);
    }
}

async function ajukanSurat() {
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

    try {
        const pengaturan = await getPengaturan();
        const nomorUrut = pengaturan.nomor_terakhir + 1;
        const date = new Date(tanggalSurat);
        const bulanRomawi = getBulanRomawi(date.getMonth());
        const tahun = date.getFullYear();
        const singkatan = singkatPerihal(perihal);

        const data = {
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

        await tambahPermintaan(data);
        await tambahLog(`Permintaan surat dari ${guru} - ${perihal}`);

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

    } catch (error) {
        console.error('Error ajukan surat:', error);
        showResult('formResult', '❌ Gagal mengajukan surat. Periksa koneksi internet.', 'danger');
    }
}

// --- ADMIN ACTIONS ---
async function setujuiPermintaan(id) {
    if (!confirm('Setujui permintaan surat ini?')) return;

    try {
        const permintaan = await getPermintaan();
        const p = permintaan.find(item => String(item.id) === String(id));
        if (!p || p.status !== 'menunggu') return;

        const nomorSurat = generateNomorSurat(
            p.kode_surat || '421.5',
            p.nomor_urut,
            p.singkatan,
            p.tahun,
            p.bulan_romawi
        );

        await updatePermintaan(id, {
            status: 'disetujui',
            nomor_surat: nomorSurat
        });
        await updatePengaturan({ nomor_terakhir: p.nomor_urut });
        await tambahLog(`Menyetujui surat ${nomorSurat}`);

        kirimWhatsApp({ ...p, nomor_surat: nomorSurat });

        loadDashboard();
        alert(`✅ Surat ${nomorSurat} telah disetujui!`);

    } catch (error) {
        console.error('Error setujui:', error);
        alert('Gagal menyetujui surat.');
    }
}

async function tolakPermintaan(id) {
    const alasan = prompt('Masukkan alasan penolakan:');
    if (alasan === null || !alasan.trim()) return;

    try {
        const permintaan = await getPermintaan();
        const p = permintaan.find(item => String(item.id) === String(id));
        if (!p || p.status !== 'menunggu') return;

        await updatePermintaan(id, {
            status: 'ditolak',
            alasan_tolak: alasan.trim()
        });
        await tambahLog(`Menolak surat dari ${p.guru} - ${alasan}`);

        loadDashboard();
        alert(`❌ Surat dari ${p.guru} telah ditolak.`);

    } catch (error) {
        console.error('Error tolak:', error);
        alert('Gagal menolak surat.');
    }
}

// --- WHATSAPP SIMULASI ---
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

    console.log('📱 [WhatsApp] Mengirim ke:', nomorWA);
    console.log('📝 Pesan:', pesan);
    alert(`📱 WhatsApp terkirim ke ${nomorWA}\nNomor Surat: ${data.nomor_surat}`);
}

// --- CMS GURU ---
// --- CMS GURU ---
async function loadCMSGuru() {
    if (!localStorage.getItem('admin_logged_in')) {
        window.location.href = 'login.html';
        return;
    }
    console.log('🔄 Memuat halaman kelola guru...');
    await renderGuruList();

    const form = document.getElementById('guruForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            tambahGuru();
        });
    }
}

async function renderGuruList() {
    console.log('🔄 renderGuruList() dipanggil...');
    try {
        const daftarGuru = await getGuru();
        console.log('📋 Data guru untuk CMS:', daftarGuru);
        
        const tbody = document.getElementById('guruBody');
        if (!tbody) {
            console.error('❌ Elemen guruBody tidak ditemukan!');
            return;
        }

        if (!daftarGuru || daftarGuru.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;color:#a0aec0;padding:30px;">Belum ada guru</td></tr>`;
            return;
        }

        let html = '';
        daftarGuru.forEach((g, index) => {
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${g.nama}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="hapusGuru('${g.id}')">Hapus</button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
        console.log(`✅ ${daftarGuru.length} guru ditampilkan di CMS`);

    } catch (error) {
        console.error('❌ Error render guru:', error);
        alert('Gagal memuat data guru. Periksa koneksi internet.');
    }
}

// --- CMS PENGATURAN ---
async function loadCMSPengaturan() {
    if (!localStorage.getItem('admin_logged_in')) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const [pengaturan, permintaan, logs] = await Promise.all([
            getPengaturan(),
            getPermintaan(),
            getLog()
        ]);

        document.getElementById('infoTahun').textContent = pengaturan.tahun || '2026';
        document.getElementById('infoNomor').textContent = String(pengaturan.nomor_terakhir).padStart(3, '0');
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

        renderLog(logs);

        const aturForm = document.getElementById('aturNomorForm');
        if (aturForm) aturForm.addEventListener('submit', handleAturNomor);

        const resetForm = document.getElementById('resetNomorForm');
        if (resetForm) resetForm.addEventListener('submit', handleResetNomor);

        const hapusForm = document.getElementById('hapusDataForm');
        if (hapusForm) hapusForm.addEventListener('submit', handleHapusData);

        const gantiForm = document.getElementById('gantiAkunForm');
        if (gantiForm) gantiForm.addEventListener('submit', handleGantiAkun);

    } catch (error) {
        console.error('Error load pengaturan:', error);
        alert('Gagal memuat data pengaturan.');
    }
}

function renderLog(logs) {
    const tbody = document.getElementById('logBody');
    if (!tbody) return;

    if (!logs || logs.length === 0) {
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

async function handleAturNomor(e) {
    e.preventDefault();
    const nomorBaru = parseInt(document.getElementById('nomorBaru').value);
    const password = document.getElementById('passwordAtur').value.trim();

    if (isNaN(nomorBaru) || nomorBaru < 0) {
        showResult('aturNomorResult', 'Masukkan nomor urut yang valid (min 0)!', 'danger');
        return;
    }

    try {
        const admin = await getAdmin();
        if (password !== admin.password) {
            showResult('aturNomorResult', '❌ Password admin salah!', 'danger');
            return;
        }

        const pengaturan = await getPengaturan();
        const nomorLama = pengaturan.nomor_terakhir;
        await updatePengaturan({ nomor_terakhir: nomorBaru });
        await tambahLog(`Mengubah nomor urut: ${String(nomorLama).padStart(3, '0')} → ${String(nomorBaru).padStart(3, '0')}`);

        document.getElementById('passwordAtur').value = '';
        document.getElementById('nomorBaru').value = '';
        showResult('aturNomorResult', `✅ Nomor urut berhasil diubah ke ${String(nomorBaru).padStart(3, '0')}`, 'success');
        loadCMSPengaturan();

    } catch (error) {
        console.error('Error atur nomor:', error);
        showResult('aturNomorResult', '❌ Gagal mengubah nomor urut.', 'danger');
    }
}

async function handleResetNomor(e) {
    e.preventDefault();
    const password = document.getElementById('passwordReset').value.trim();

    try {
        const admin = await getAdmin();
        if (password !== admin.password) {
            showResult('resetNomorResult', '❌ Password admin salah!', 'danger');
            return;
        }

        if (!confirm('⚠️ Reset nomor urut ke 000?\n\nData tahun lalu TIDAK akan dihapus.')) return;

        await updatePengaturan({ nomor_terakhir: 0 });
        await tambahLog('Reset nomor urut ke 000');

        document.getElementById('passwordReset').value = '';
        showResult('resetNomorResult', '✅ Nomor urut berhasil direset ke 000', 'success');
        loadCMSPengaturan();

    } catch (error) {
        console.error('Error reset nomor:', error);
        showResult('resetNomorResult', '❌ Gagal reset nomor urut.', 'danger');
    }
}

async function handleHapusData(e) {
    e.preventDefault();
    const tahun = document.getElementById('tahunHapus').value;
    const password = document.getElementById('passwordHapus').value.trim();

    if (!tahun) {
        showResult('hapusDataResult', 'Pilih tahun terlebih dahulu!', 'danger');
        return;
    }

    try {
        const admin = await getAdmin();
        if (password !== admin.password) {
            showResult('hapusDataResult', '❌ Password admin salah!', 'danger');
            return;
        }

        const permintaan = await getPermintaan();
        const jumlah = permintaan.filter(p => p.tahun === tahun).length;
        if (jumlah === 0) {
            showResult('hapusDataResult', `Tidak ada data surat tahun ${tahun}`, 'warning');
            return;
        }

        if (!confirm(`⚠️ HAPUS PERMANEN ${jumlah} data surat tahun ${tahun}?\n\nTINDAKAN INI TIDAK BISA DIBATALKAN!`)) return;

        for (const p of permintaan) {
            if (p.tahun === tahun) {
                await supabaseRequest(`permintaan?id=eq.${p.id}`, 'DELETE');
            }
        }
        await tambahLog(`Menghapus ${jumlah} data surat tahun ${tahun}`);

        document.getElementById('passwordHapus').value = '';
        showResult('hapusDataResult', `✅ ${jumlah} data surat tahun ${tahun} berhasil dihapus`, 'success');
        loadCMSPengaturan();

    } catch (error) {
        console.error('Error hapus data:', error);
        showResult('hapusDataResult', '❌ Gagal menghapus data.', 'danger');
    }
}

async function handleGantiAkun(e) {
    e.preventDefault();
    const usernameBaru = document.getElementById('usernameBaru').value.trim();
    const passwordBaru = document.getElementById('passwordBaru').value.trim();
    const passwordLama = document.getElementById('passwordLama').value.trim();

    if (!usernameBaru || !passwordBaru || passwordBaru.length < 6) {
        showResult('gantiAkunResult', 'Username dan password (min 6 karakter) wajib diisi!', 'danger');
        return;
    }

    try {
        const admin = await getAdmin();
        if (passwordLama !== admin.password) {
            showResult('gantiAkunResult', '❌ Password lama salah!', 'danger');
            return;
        }

        await updateAdmin(usernameBaru, passwordBaru);
        await tambahLog(`Mengganti username menjadi "${usernameBaru}"`);

        document.getElementById('usernameBaru').value = '';
        document.getElementById('passwordBaru').value = '';
        document.getElementById('passwordLama').value = '';
        showResult('gantiAkunResult', '✅ Username & password berhasil diubah! Silakan login ulang.', 'success');

        setTimeout(() => {
            localStorage.removeItem('admin_logged_in');
            window.location.href = 'login.html';
        }, 2000);

    } catch (error) {
        console.error('Error ganti akun:', error);
        showResult('gantiAkunResult', '❌ Gagal mengubah akun.', 'danger');
    }
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
async function loadIndexStats() {
    try {
        const permintaan = await getPermintaan();
        document.getElementById('totalSurat').textContent = permintaan.length;
        document.getElementById('menunggu').textContent = permintaan.filter(p => p.status === 'menunggu').length;
        document.getElementById('disetujui').textContent = permintaan.filter(p => p.status === 'disetujui').length;
    } catch (error) {
        console.error('Error load index stats:', error);
    }
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
    }
});

// --- EXPOSE FUNCTIONS ---
window.setujuiPermintaan = setujuiPermintaan;
window.tolakPermintaan = tolakPermintaan;
window.hapusGuru = hapusGuru;

console.log('✅ SMKS MAESTRO - Sistem Nomor Surat Otomatis');
console.log('📁 Menggunakan Supabase database');
console.log('👤 Login default: admin / admin123');