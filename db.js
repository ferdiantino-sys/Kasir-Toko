/**
 * db.js - Modul Manajemen Database Lokal (LocalStorage)
 * Mengelola data produk, transaksi, profil toko, dan backup/restore.
 */

const DEFAULT_SHOP_PROFILE = {
    name: "Warung Kelontong Berkah",
    address: "Jl. Raya Transaksi No. 88, Jakarta",
    phone: "0812-3456-7890",
    bankName: "BCA",
    bankAccount: "123-456-7890",
    bankOwner: "Budi Santoso",
    qrisCode: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=qris-berkah-kelontong"
};

const DEFAULT_PRODUCTS = [
    { id: "P001", name: "Beras Pandan Wangi 1kg", barcode: "8991234560012", price: 15000, costPrice: 12500, stock: 50, category: "Sembako" },
    { id: "P002", name: "Minyak Goreng Bimoli 1L", barcode: "8991234560029", price: 19000, costPrice: 16500, stock: 30, category: "Sembako" },
    { id: "P003", name: "Gula Pasir Gulaku 1kg", barcode: "8991234560036", price: 16500, costPrice: 14000, stock: 40, category: "Sembako" },
    { id: "P004", name: "Telur Ayam Negeri 1kg", barcode: "", price: 28000, costPrice: 25000, stock: 15, category: "Sembako" },
    { id: "P005", name: "Indomie Goreng Spesial", barcode: "089686011388", price: 3500, costPrice: 2800, stock: 120, category: "Makanan & Minuman" },
    { id: "P006", name: "Kopi Kapal Api Mix 25g", barcode: "8991002100073", price: 2000, costPrice: 1600, stock: 150, category: "Makanan & Minuman" },
    { id: "P007", name: "Air Mineral Aqua 600ml", barcode: "8992696000035", price: 4000, costPrice: 3000, stock: 48, category: "Makanan & Minuman" },
    { id: "P008", name: "Teh Botol Sosro Kotak 250ml", barcode: "8996006850022", price: 3500, costPrice: 2700, stock: 36, category: "Makanan & Minuman" },
    { id: "P009", name: "Sabun Mandi Lifebuoy 85g", barcode: "8999999052028", price: 4500, costPrice: 3600, stock: 25, category: "Kebutuhan Rumah" },
    { id: "P010", name: "Detergen Rinso Cair 750ml", barcode: "8999999056071", price: 19500, costPrice: 16800, stock: 15, category: "Kebutuhan Rumah" },
    { id: "P011", name: "Pasta Gigi Pepsodent 190g", barcode: "8999999051014", price: 14000, costPrice: 11500, stock: 20, category: "Kebutuhan Rumah" },
    { id: "P012", name: "Rokok Sampoerna Mild 16", barcode: "8999909001320", price: 31000, costPrice: 28500, stock: 20, category: "Rokok & Korek" }
];

const AppDB = {
    // Inisialisasi Database
    init() {
        if (!localStorage.getItem("pos_products")) {
            localStorage.setItem("pos_products", JSON.stringify(DEFAULT_PRODUCTS));
        }
        if (!localStorage.getItem("pos_transactions")) {
            localStorage.setItem("pos_transactions", JSON.stringify([]));
        }
        if (!localStorage.getItem("pos_shop_profile")) {
            localStorage.setItem("pos_shop_profile", JSON.stringify(DEFAULT_SHOP_PROFILE));
        }
    },

    // --- MANAJEMEN PRODUK ---
    getProducts() {
        return JSON.parse(localStorage.getItem("pos_products")) || [];
    },

    saveProducts(products) {
        localStorage.setItem("pos_products", JSON.stringify(products));
    },

    addProduct(product) {
        const products = this.getProducts();
        // Cek duplikasi ID
        if (products.some(p => p.id === product.id)) {
            return { success: false, message: `ID Produk ${product.id} sudah digunakan.` };
        }
        products.push(product);
        this.saveProducts(products);
        return { success: true, message: "Produk berhasil ditambahkan." };
    },

    updateProduct(updatedProduct) {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id === updatedProduct.id);
        if (index === -1) {
            return { success: false, message: "Produk tidak ditemukan." };
        }
        products[index] = updatedProduct;
        this.saveProducts(products);
        return { success: true, message: "Produk berhasil diperbarui." };
    },

    deleteProduct(productId) {
        let products = this.getProducts();
        const initialLen = products.length;
        products = products.filter(p => p.id !== productId);
        if (products.length === initialLen) {
            return { success: false, message: "Produk tidak ditemukan." };
        }
        this.saveProducts(products);
        return { success: true, message: "Produk berhasil dihapus." };
    },

    updateStock(productId, qtyChange) {
        const products = this.getProducts();
        const product = products.find(p => p.id === productId);
        if (product) {
            product.stock = Math.max(0, product.stock + qtyChange);
            this.saveProducts(products);
            return true;
        }
        return false;
    },

    // --- MANAJEMEN TRANSAKSI ---
    getTransactions() {
        return JSON.parse(localStorage.getItem("pos_transactions")) || [];
    },

    saveTransactions(transactions) {
        localStorage.setItem("pos_transactions", JSON.stringify(transactions));
    },

    addTransaction(transaction) {
        const transactions = this.getTransactions();
        transactions.unshift(transaction); // Tambah di atas (terbaru)
        this.saveTransactions(transactions);

        // Kurangi stok produk secara otomatis
        transaction.items.forEach(item => {
            this.updateStock(item.id, -item.qty);
        });

        return { success: true, transactionId: transaction.id };
    },

    // --- PROFIL TOKO & PENGATURAN ---
    getShopProfile() {
        return JSON.parse(localStorage.getItem("pos_shop_profile")) || DEFAULT_SHOP_PROFILE;
    },

    saveShopProfile(profile) {
        localStorage.setItem("pos_shop_profile", JSON.stringify(profile));
    },

    // --- BACKUP & RESTORE DATA ---
    exportData() {
        const data = {
            products: this.getProducts(),
            transactions: this.getTransactions(),
            shopProfile: this.getShopProfile(),
            exportedAt: new Date().toISOString()
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `Backup_Kasir_${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    },

    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.products && data.transactions && data.shopProfile) {
                localStorage.setItem("pos_products", JSON.stringify(data.products));
                localStorage.setItem("pos_transactions", JSON.stringify(data.transactions));
                localStorage.setItem("pos_shop_profile", JSON.stringify(data.shopProfile));
                return { success: true, message: "Data berhasil dipulihkan." };
            } else {
                return { success: false, message: "Format file cadangan tidak valid." };
            }
        } catch (e) {
            return { success: false, message: "Gagal membaca file cadangan JSON." };
        }
    },

    resetAllData() {
        localStorage.removeItem("pos_products");
        localStorage.removeItem("pos_transactions");
        localStorage.removeItem("pos_shop_profile");
        this.init();
        return { success: true, message: "Aplikasi berhasil direset ke pengaturan awal." };
    }
};

// Jalankan inisialisasi awal
AppDB.init();

// Jadikan global agar diakses modul JS lain
window.AppDB = AppDB;
