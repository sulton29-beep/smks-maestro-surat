// ============================================================
// KONFIGURASI SUPABASE
// ============================================================
const SUPABASE_URL = 'https://nuscvbuoqejmnffozhzm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_q4ieU2qJBlIBRUlazwvDuw_AcNn11HW';

console.log('✅ supabase-config.js dimuat!');
console.log('📡 URL:', SUPABASE_URL);
console.log('🔑 Key:', SUPABASE_ANON_KEY.substring(0, 20) + '...');

// ============================================================
// FUNGSI DASAR
// ============================================================
async function supabaseRequest(endpoint, method = 'GET', body = null) {
    const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
    const headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
    };

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(url, options);
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Supabase error: ${response.status} - ${error}`);
    }
    return response.json();
}

// ============================================================
// FUNGSI DATA - DIPAKAI DI SCRIPT.JS
// ============================================================

// --- ADMIN ---
async function getAdmin() {
    console.log('📡 getAdmin() dipanggil...');
    try {
        const result = await supabaseRequest('admin?select=*');
        console.log('📦 Data admin:', result);
        return result[0] || null;
    } catch (error) {
        console.error('❌ Error getAdmin:', error);
        return null;
    }
}

// --- GURU ---
async function getGuru() {
    console.log('📡 getGuru() dipanggil...');
    try {
        const result = await supabaseRequest('guru?select=*&order=nama.asc');
        console.log('📦 Data guru dari Supabase:', result);
        
        // Jika result kosong, coba tanpa order
        if (!result || result.length === 0) {
            console.log('⚠️ Data guru kosong, coba tanpa order...');
            const result2 = await supabaseRequest('guru?select=*');
            console.log('📦 Data guru (tanpa order):', result2);
            return result2 || [];
        }
        return result || [];
    } catch (error) {
        console.error('❌ Error getGuru:', error);
        return [];
    }
}

// --- PERMINTAAN ---
async function getPermintaan() {
    console.log('📡 getPermintaan() dipanggil...');
    try {
        const result = await supabaseRequest('permintaan?select=*&order=created_at.desc');
        console.log('📦 Data permintaan:', result);
        return result;
    } catch (error) {
        console.error('❌ Error getPermintaan:', error);
        return [];
    }
}

// --- TAMBAH PERMINTAAN ---
async function tambahPermintaan(data) {
    return await supabaseRequest('permintaan', 'POST', data);
}

// --- UPDATE PERMINTAAN ---
async function updatePermintaan(id, data) {
    return await supabaseRequest(`permintaan?id=eq.${id}`, 'PATCH', data);
}

// --- LOG ---
async function tambahLog(aktivitas, admin = 'Admin') {
    const tanggal = new Date().toLocaleDateString('id-ID');
    const waktu = new Date().toLocaleTimeString('id-ID');
    return await supabaseRequest('log', 'POST', { tanggal, waktu, aktivitas, admin });
}

async function getLog() {
    return await supabaseRequest('log?select=*&order=created_at.desc');
}

// --- PENGATURAN ---
async function getPengaturan() {
    try {
        const result = await supabaseRequest('pengaturan?select=*');
        return result[0] || { tahun: '2026', nomor_terakhir: 0 };
    } catch (error) {
        return { tahun: '2026', nomor_terakhir: 0 };
    }
}

async function updatePengaturan(data) {
    return await supabaseRequest(`pengaturan?id=eq.1`, 'PATCH', data);
}

// --- UPDATE ADMIN ---
async function updateAdmin(username, password) {
    return await supabaseRequest('admin?id=eq.1', 'PATCH', { username, password });
}

// --- TAMBAH GURU ---
async function tambahGuru(nama) {
    return await supabaseRequest('guru', 'POST', { nama });
}

// --- HAPUS GURU ---
async function hapusGuru(id) {
    return await supabaseRequest(`guru?id=eq.${id}`, 'DELETE');
}

console.log('✅ Semua fungsi Supabase siap digunakan!');