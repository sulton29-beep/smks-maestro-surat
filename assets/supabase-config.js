// ============================================================
// KONFIGURASI SUPABASE - PASTE PUNYA ANDA
// ============================================================
const SUPABASE_URL = 'https://nuscvbuoqejmnffozhzm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_q4ieU2qJBlIBRUlazwvDuw_AcNn11HW';

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
// FUNGSI DATA
// ============================================================
async function getAdmin() {
    const result = await supabaseRequest('admin?select=*');
    return result[0] || null;
}

async function updateAdmin(username, password) {
    return await supabaseRequest('admin?id=eq.1', 'PATCH', { username, password });
}

async function getGuru() {
    const result = await supabaseRequest('guru?select=*&order=nama.asc');
    console.log('📋 Data guru dari Supabase:', result); // CEK DI CONSOLE
    return result;
}

async function tambahGuru(nama) {
    return await supabaseRequest('guru', 'POST', { nama });
}

async function hapusGuru(id) {
    return await supabaseRequest(`guru?id=eq.${id}`, 'DELETE');
}

async function getPermintaan() {
    return await supabaseRequest('permintaan?select=*&order=created_at.desc');
}

async function tambahPermintaan(data) {
    return await supabaseRequest('permintaan', 'POST', data);
}

async function updatePermintaan(id, data) {
    return await supabaseRequest(`permintaan?id=eq.${id}`, 'PATCH', data);
}

async function tambahLog(aktivitas, admin = 'Admin') {
    const tanggal = new Date().toLocaleDateString('id-ID');
    const waktu = new Date().toLocaleTimeString('id-ID');
    return await supabaseRequest('log', 'POST', { tanggal, waktu, aktivitas, admin });
}

async function getLog() {
    return await supabaseRequest('log?select=*&order=created_at.desc');
}

async function getPengaturan() {
    const result = await supabaseRequest('pengaturan?select=*');
    return result[0] || { tahun: '2026', nomor_terakhir: 0 };
}

async function updatePengaturan(data) {
    return await supabaseRequest(`pengaturan?id=eq.1`, 'PATCH', data);
}