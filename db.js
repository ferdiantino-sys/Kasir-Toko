import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { 
    getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, 
    onSnapshot, query, orderBy, writeBatch 
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDueRrFWU5cCLjcTg2kFLkDk8McBAayfFY",
    authDomain: "kasir-warung-berkah.firebaseapp.com",
    projectId: "kasir-warung-berkah",
    storageBucket: "kasir-warung-berkah.firebasestorage.app",
    messagingSenderId: "287545338617",
    appId: "1:287545338617:web:07419b119fe176b6acd028"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
    { id: "P002", name: "Minyak Goreng Bimoli 1L", barcode: "8991234560029", price: 19000, costPrice: 16500, stock: 30, category: "Sembako" }
];

// Local state for fast synchronous reads
let localProducts = [];
let localTransactions = [];
let localShopProfile = DEFAULT_SHOP_PROFILE;
let onDataUpdatedCallback = null;

const AppDB = {
    // Initializer to seed database if empty and setup listeners
    async init(onReady, onUpdate) {
        onDataUpdatedCallback = onUpdate;
        
        try {
            // Check Profile
            const profileRef = doc(db, "settings", "profile");
            const profileSnap = await getDoc(profileRef);
            if (!profileSnap.exists()) {
                await setDoc(profileRef, DEFAULT_SHOP_PROFILE);
            }
            
            // Listeners
            onSnapshot(collection(db, "products"), (snapshot) => {
                localProducts = snapshot.docs.map(doc => doc.data());
                if (onDataUpdatedCallback) onDataUpdatedCallback('products');
            });

            onSnapshot(query(collection(db, "transactions"), orderBy("time", "desc")), (snapshot) => {
                localTransactions = snapshot.docs.map(doc => doc.data());
                if (onDataUpdatedCallback) onDataUpdatedCallback('transactions');
            });

            onSnapshot(profileRef, (docSnap) => {
                if (docSnap.exists()) {
                    localShopProfile = docSnap.data();
                    if (onDataUpdatedCallback) onDataUpdatedCallback('profile');
                }
            });

            // If products are completely empty, seed defaults
            const prodSnap = await getDocs(collection(db, "products"));
            if (prodSnap.empty) {
                const batch = writeBatch(db);
                DEFAULT_PRODUCTS.forEach(p => {
                    const docRef = doc(db, "products", p.id);
                    batch.set(docRef, p);
                });
                await batch.commit();
            }

            if (onReady) onReady();
        } catch (error) {
            console.error("Firebase Init Error:", error);
            alert("Koneksi ke database gagal. Pastikan Firestore Database sudah dibuat dan rules disetujui.");
        }
    },

    // --- MANAJEMEN PRODUK ---
    getProducts() { return localProducts; },

    async addProduct(product) {
        if (localProducts.some(p => p.id === product.id)) return { success: false, message: `ID Produk sudah digunakan.` };
        try {
            await setDoc(doc(db, "products", product.id), product);
            return { success: true };
        } catch (e) {
            return { success: false, message: e.message };
        }
    },

    async updateProduct(product) {
        try {
            await setDoc(doc(db, "products", product.id), product);
            return { success: true };
        } catch (e) {
            return { success: false, message: e.message };
        }
    },

    async deleteProduct(productId) {
        try {
            await deleteDoc(doc(db, "products", productId));
            return { success: true };
        } catch (e) {
            return { success: false, message: e.message };
        }
    },

    // --- MANAJEMEN TRANSAKSI ---
    getTransactions() { return localTransactions; },

    async addTransaction(transaction) {
        try {
            const batch = writeBatch(db);
            
            // Insert transaction
            const txRef = doc(db, "transactions", transaction.id);
            batch.set(txRef, transaction);

            // Update stocks
            transaction.items.forEach(item => {
                const prodRef = doc(db, "products", item.id);
                const currentProd = localProducts.find(p => p.id === item.id);
                if (currentProd) {
                    batch.update(prodRef, { stock: Math.max(0, currentProd.stock - item.qty) });
                }
            });

            await batch.commit();
            return { success: true, transactionId: transaction.id };
        } catch (e) {
            console.error(e);
            return { success: false, message: e.message };
        }
    },

    // --- PROFIL TOKO & PENGATURAN ---
    getShopProfile() { return localShopProfile; },

    async saveShopProfile(profile) {
        try {
            await setDoc(doc(db, "settings", "profile"), profile);
            return { success: true };
        } catch (e) {
            return { success: false, message: e.message };
        }
    },

    // --- BACKUP & RESTORE DATA ---
    exportData() {
        alert("Backup sekarang dikelola otomatis oleh Cloud Firebase.");
    },

    importData(jsonData) {
        return { success: false, message: "Import lokal dimatikan saat menggunakan Cloud." };
    },

    async resetAllData() {
        return { success: false, message: "Untuk mereset cloud, silakan hapus koleksi langsung di Firebase Console." };
    }
};

window.AppDB = AppDB;
export default AppDB;
