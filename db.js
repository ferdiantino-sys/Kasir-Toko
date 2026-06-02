import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { 
    getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, 
    onSnapshot, query, orderBy, writeBatch 
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import {
    getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, 
    onAuthStateChanged, signOut, sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

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
const auth = getAuth(app);

const DEFAULT_SHOP_PROFILE = {
    name: "Toko Baru",
    address: "Alamat Toko Anda",
    phone: "0800-0000-0000",
    bankName: "BCA",
    bankAccount: "1234567890",
    bankOwner: "Nama Anda",
    qrisCode: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=qris-toko",
    pinCashier: "1234",
    pinOwner: "9999"
};

const DEFAULT_PRODUCTS = [
    { id: "P001", name: "Produk Contoh 1", barcode: "8991234560012", price: 15000, costPrice: 12500, stock: 50, category: "Sembako" },
    { id: "P002", name: "Produk Contoh 2", barcode: "8991234560029", price: 19000, costPrice: 16500, stock: 30, category: "Sembako" }
];

// Local state
let currentUser = null;
let localProducts = [];
let localTransactions = [];
let localShopProfile = DEFAULT_SHOP_PROFILE;
let onDataUpdatedCallback = null;
let unsubProducts = null;
let unsubTransactions = null;
let unsubProfile = null;

const AppDB = {
    // --- AUTHENTICATION ---
    initAuth(onAuthStateChange) {
        onAuthStateChanged(auth, (user) => {
            currentUser = user;
            if (user) {
                // User logged in, attach DB listeners
                this.attachListeners(user.uid, onAuthStateChange);
            } else {
                // User logged out
                this.detachListeners();
                localProducts = [];
                localTransactions = [];
                localShopProfile = DEFAULT_SHOP_PROFILE;
                onAuthStateChange(null);
            }
        });
    },

    async signUp(email, password) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    async logIn(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    async logOut() {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    async resetPassword(email) {
        try {
            await sendPasswordResetEmail(auth, email);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // --- DATABASE LISTENERS (MULTI-TENANT) ---
    setDataCallback(cb) {
        onDataUpdatedCallback = cb;
    },

    async attachListeners(uid, onReady) {
        try {
            const profileRef = doc(db, `users/${uid}/settings`, "profile");
            const profileSnap = await getDoc(profileRef);
            
            // If new user, seed default data
            if (!profileSnap.exists()) {
                await setDoc(profileRef, DEFAULT_SHOP_PROFILE);
                const batch = writeBatch(db);
                DEFAULT_PRODUCTS.forEach(p => {
                    const docRef = doc(db, `users/${uid}/products`, p.id);
                    batch.set(docRef, p);
                });
                await batch.commit();
            }

            // Listen to Products
            unsubProducts = onSnapshot(collection(db, `users/${uid}/products`), (snapshot) => {
                localProducts = snapshot.docs.map(doc => doc.data());
                if (onDataUpdatedCallback) onDataUpdatedCallback('products');
            });

            // Listen to Transactions
            unsubTransactions = onSnapshot(query(collection(db, `users/${uid}/transactions`), orderBy("time", "desc")), (snapshot) => {
                localTransactions = snapshot.docs.map(doc => doc.data());
                if (onDataUpdatedCallback) onDataUpdatedCallback('transactions');
            });

            // Listen to Profile
            unsubProfile = onSnapshot(profileRef, (docSnap) => {
                if (docSnap.exists()) {
                    localShopProfile = docSnap.data();
                    if (onDataUpdatedCallback) onDataUpdatedCallback('profile');
                }
            });

            if (onReady) onReady(uid);
        } catch (error) {
            console.error("Firebase Sync Error:", error);
            alert("Koneksi ke database gagal. Pastikan Firebase Rules mengizinkan akses ke data Anda.");
        }
    },

    detachListeners() {
        if (unsubProducts) unsubProducts();
        if (unsubTransactions) unsubTransactions();
        if (unsubProfile) unsubProfile();
    },

    // --- MANAJEMEN PRODUK ---
    getProducts() { return localProducts; },

    async addProduct(product) {
        if (!currentUser) return { success: false, message: "Belum login." };
        if (localProducts.some(p => p.id === product.id)) return { success: false, message: `ID Produk sudah digunakan.` };
        try {
            await setDoc(doc(db, `users/${currentUser.uid}/products`, product.id), product);
            return { success: true };
        } catch (e) {
            return { success: false, message: e.message };
        }
    },

    async updateProduct(product) {
        if (!currentUser) return { success: false, message: "Belum login." };
        try {
            await setDoc(doc(db, `users/${currentUser.uid}/products`, product.id), product);
            return { success: true };
        } catch (e) {
            return { success: false, message: e.message };
        }
    },

    async deleteProduct(productId) {
        if (!currentUser) return { success: false, message: "Belum login." };
        try {
            await deleteDoc(doc(db, `users/${currentUser.uid}/products`, productId));
            return { success: true };
        } catch (e) {
            return { success: false, message: e.message };
        }
    },

    // --- MANAJEMEN TRANSAKSI ---
    getTransactions() { return localTransactions; },

    async addTransaction(transaction) {
        if (!currentUser) return { success: false, message: "Belum login." };
        try {
            const batch = writeBatch(db);
            
            // Insert transaction
            const txRef = doc(db, `users/${currentUser.uid}/transactions`, transaction.id);
            batch.set(txRef, transaction);

            // Update stocks
            transaction.items.forEach(item => {
                const prodRef = doc(db, `users/${currentUser.uid}/products`, item.id);
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
        if (!currentUser) return { success: false, message: "Belum login." };
        try {
            await setDoc(doc(db, `users/${currentUser.uid}/settings`, "profile"), profile);
            return { success: true };
        } catch (e) {
            return { success: false, message: e.message };
        }
    },

    // --- BACKUP & RESTORE DATA ---
    exportData() {
        alert("Gunakan fitur Export Excel di menu Riwayat untuk mengekspor data.");
    }
};

window.AppDB = AppDB;
export default AppDB;
