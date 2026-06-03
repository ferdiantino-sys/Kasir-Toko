/**
 * app.js - Logika Utama Aplikasi POS Kasir Kelontong (Firebase Edition)
 */

import AppDB from './db.js';

document.addEventListener("DOMContentLoaded", () => {
    // 1. STATE MANAGEMENT APLIKASI
    let cart = [];
    let currentTab = "pos";
    let selectedCategory = "Semua";
    let editingProductId = null;
    let shopProfile = {};
    let currentUserRole = null; // 'CASHIER' | 'OWNER'
    let currentCashierName = "Kasir";

    // 2. DOM ELEMENTS SELECTORS
    const authOverlay = document.getElementById("auth-overlay");
    const authForm = document.getElementById("auth-form");
    const authEmail = document.getElementById("auth-email");
    const authPassword = document.getElementById("auth-password");
    const authError = document.getElementById("auth-error");
    const btnLoginAuth = document.getElementById("btn-login-auth");
    const btnSignupAuth = document.getElementById("btn-signup-auth");
    const btnForgotPassword = document.getElementById("btn-forgot-password");
    const btnLockScreen = document.getElementById("btn-lock-screen");
    
    const loginOverlay = document.getElementById("login-overlay");
    const pinInput = document.getElementById("pin-input");
    const btnShowPin = document.getElementById("btn-show-pin");
    const loggedInEmail = document.getElementById("logged-in-email");
    const pinBtns = document.querySelectorAll(".pin-btn");
    const pinBtnClear = document.querySelector(".pin-btn-clear");
    const pinBtnEnter = document.querySelector(".pin-btn-enter");
    const loginError = document.getElementById("login-error");

    const tabButtons = document.querySelectorAll(".nav-btn");
    const tabContents = document.querySelectorAll(".tab-content");
    const liveClock = document.getElementById("live-clock");
    const shopNameBrand = document.getElementById("shop-name-brand");

    const searchProductInput = document.getElementById("search-product");
    const clearSearchBtn = document.getElementById("clear-search");
    const categoriesContainer = document.getElementById("categories-container");
    const productsGrid = document.getElementById("products-grid");
    
    const cartSummaryWrapper = document.getElementById("cart-summary-wrapper");
    const summaryTotal = document.getElementById("summary-total");
    const summaryQtyLabel = document.getElementById("summary-qty-label");
    const checkoutBtn = document.getElementById("checkout-btn");
    
    const cartAreaElement = document.getElementById("cart-area-element");
    const btnViewCartMobile = document.getElementById("btn-view-cart-mobile");
    const closeCartMobile = document.getElementById("close-cart-mobile");
    const cartItemsContainer = document.getElementById("cart-items");
    const clearCartBtn = document.getElementById("clear-cart-btn");
    
    const summarySubtotal = document.getElementById("summary-subtotal");
    const summaryTax = document.getElementById("summary-tax");
    const summaryDiscountInput = document.getElementById("summary-discount-input");
    const checkoutBtnMobile = document.getElementById("checkout-btn-mobile");

    const inventorySearchInput = document.getElementById("inventory-search-input");
    const addProductBtn = document.getElementById("add-product-btn");
    const inventoryList = document.getElementById("inventory-list");
    
    const productModal = document.getElementById("product-modal");
    const productForm = document.getElementById("product-form");
    const productModalTitle = document.getElementById("product-modal-title");
    const closeProductModal = document.getElementById("close-product-modal");
    const btnCancelProduct = document.getElementById("btn-cancel-product");
    const prodIdInput = document.getElementById("prod-id");
    const prodBarcodeInput = document.getElementById("prod-barcode");
    const prodNameInput = document.getElementById("prod-name");
    const prodCategoryInput = document.getElementById("prod-category");
    const prodStockInput = document.getElementById("prod-stock");
    const prodCostInput = document.getElementById("prod-cost");
    const prodPriceInput = document.getElementById("prod-price");

    const checkoutModal = document.getElementById("checkout-modal");
    const closeCheckoutModal = document.getElementById("close-checkout-modal");
    const btnCancelCheckout = document.getElementById("btn-cancel-checkout");
    const btnConfirmCheckout = document.getElementById("btn-confirm-checkout");
    const checkoutTotalBill = document.getElementById("checkout-total-bill");
    const paymentRadioButtons = document.querySelectorAll("input[name='payment_method']");
    const paymentMethodCards = document.querySelectorAll(".payment-method-card");
    const paymentPanels = document.querySelectorAll(".payment-panel");

    const cashReceivedInput = document.getElementById("cash-received");
    const quickCashContainer = document.getElementById("quick-cash-container");
    const cashChangeDisplay = document.getElementById("cash-change");

    const qrisImage = document.getElementById("qris-image");
    const qrisTotalBadgeVal = document.getElementById("qris-total-badge-val");

    const detailBankName = document.getElementById("detail-bank-name");
    const detailBankAccount = document.getElementById("detail-bank-account");
    const detailBankOwner = document.getElementById("detail-bank-owner");
    const detailBankTotal = document.getElementById("detail-bank-total");

    const statRevenue = document.getElementById("stat-revenue");
    const statProfit = document.getElementById("stat-profit");
    const statTxCount = document.getElementById("stat-tx-count");
    const historyList = document.getElementById("history-list");

    const settingsProfileForm = document.getElementById("settings-profile-form");
    const shopNameInput = document.getElementById("shop-name");
    const shopAddressInput = document.getElementById("shop-address");
    const shopPhoneInput = document.getElementById("shop-phone");
    const settingsPaymentForm = document.getElementById("settings-payment-form");
    const bankNameInput = document.getElementById("bank-name");
    const bankAccountInput = document.getElementById("bank-account");
    const bankOwnerInput = document.getElementById("bank-owner");
    const qrisLinkInput = document.getElementById("qris-link");
    const settingsPinForm = document.getElementById("settings-pin-form");
    const pinOwnerInput = document.getElementById("pin-owner");
    const cashiersContainer = document.getElementById("cashiers-container");
    const btnAddCashier = document.getElementById("btn-add-cashier");
    const btnExportExcel = document.getElementById("btn-export-excel");
    const btnLogout = document.getElementById("btn-logout");

    const receiptShopName = document.getElementById("receipt-shop-name");
    const receiptShopAddress = document.getElementById("receipt-shop-address");
    const receiptShopPhone = document.getElementById("receipt-shop-phone");
    const receiptId = document.getElementById("receipt-id");
    const receiptDate = document.getElementById("receipt-date");
    const receiptCashier = document.getElementById("receipt-cashier");
    const receiptItemsList = document.getElementById("receipt-items-list");
    const receiptSubtotal = document.getElementById("receipt-subtotal");
    const receiptDiscount = document.getElementById("receipt-discount");
    const receiptTotal = document.getElementById("receipt-total");
    const receiptPaymentMethod = document.getElementById("receipt-payment-method");
    const receiptPayAmount = document.getElementById("receipt-pay-amount");
    const receiptChange = document.getElementById("receipt-change");


    // 3. UTILITIES & FORMATTING
    function formatRupiah(number) {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);
    }
    function generateTxId() {
        const date = new Date();
        return `TX${date.getFullYear().toString().slice(-2)}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    function updateClock() {
        if (!liveClock) return;
        const now = new Date();
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        liveClock.textContent = `${now.toLocaleDateString("id-ID", options)} | ${now.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}`;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // 4. INISIALISASI & SISTEM LOGIN PIN
    loginError.textContent = "Menunggu otentikasi...";
    pinInput.disabled = true;

    // Set callback untuk update data realtime
    AppDB.setDataCallback((type) => {
        if (type === 'products') {
            renderCatalog();
            if (currentUserRole === "OWNER") renderInventoryTable();
        } else if (type === 'transactions' && currentUserRole === "OWNER") {
            renderReportsAndHistory();
        } else if (type === 'profile') {
            shopProfile = AppDB.getShopProfile();
            shopNameBrand.textContent = shopProfile.name;
            if (currentUserRole === "OWNER") loadSettingsForm();
        }
    });

    // Inisialisasi Auth
    AppDB.initAuth((uid) => {
        if (uid) {
            // Berhasil login email/pass
            authOverlay.classList.add("hidden");
            loginOverlay.classList.remove("hidden");
            btnLockScreen.classList.remove("hidden");
            
            const user = AppDB.getCurrentUser();
            if (user && loggedInEmail) {
                loggedInEmail.textContent = user.email;
                loggedInEmail.classList.remove("hidden");
            }
            
            shopProfile = AppDB.getShopProfile();
            loginError.textContent = "";
            pinInput.disabled = false;
        } else {
            // Belum login email/pass
            authOverlay.classList.remove("hidden");
            loginOverlay.classList.add("hidden");
            btnLockScreen.classList.add("hidden");
            authError.textContent = "";
            authEmail.value = "";
            authPassword.value = "";
        }
    });

    // Auth Actions
    authForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        authError.textContent = "Memproses log in...";
        const res = await AppDB.logIn(authEmail.value, authPassword.value);
        if (!res.success) {
            authError.textContent = "";
            alert("Salah Silahkan Cek lagi email/password");
        }
    });

    btnSignupAuth.addEventListener("click", async () => {
        if (!authEmail.value || !authPassword.value) {
            alert("Isi email dan password untuk mendaftar.");
            return;
        }
        authError.textContent = "Mendaftarkan akun...";
        const res = await AppDB.signUp(authEmail.value, authPassword.value);
        if (!res.success) {
            authError.textContent = res.message;
            alert(res.message);
        }
    });

    btnForgotPassword.addEventListener("click", async () => {
        const email = authEmail.value || prompt("Masukkan alamat email Anda untuk mereset password:");
        if (!email) return;
        
        authError.textContent = "Mengirim email reset password...";
        const res = await AppDB.resetPassword(email);
        if (res.success) {
            authError.textContent = "";
            alert("Link reset password telah dikirim ke email Anda! Silakan cek kotak masuk/spam.");
        } else {
            authError.textContent = res.message;
            alert("Gagal: " + res.message);
        }
    });

    if (btnShowPin) {
        const showPin = () => { pinInput.type = "text"; };
        const hidePin = () => { pinInput.type = "password"; };
        btnShowPin.addEventListener("mousedown", showPin);
        btnShowPin.addEventListener("touchstart", showPin, {passive: true});
        btnShowPin.addEventListener("mouseup", hidePin);
        btnShowPin.addEventListener("mouseleave", hidePin);
        btnShowPin.addEventListener("touchend", hidePin);
    }

    pinBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            if (pinInput.disabled) return;
            if (pinInput.value.length < 6) pinInput.value += btn.textContent;
            loginError.textContent = "";
        });
    });

    pinBtnClear.addEventListener("click", () => {
        pinInput.value = pinInput.value.slice(0, -1);
        loginError.textContent = "";
    });

    pinBtnEnter.addEventListener("click", () => {
        if (pinInput.disabled || !shopProfile) return;
        const pin = pinInput.value;
        const pinOwner = shopProfile.pinOwner || "999999";
        const cashiers = shopProfile.cashiers || [{ id: "c1", name: "Kasir 1", pin: "123456" }];
        
        let foundCashier = cashiers.find(c => c.pin === pin);
        
        if (foundCashier) {
            currentUserRole = "CASHIER";
            currentCashierName = foundCashier.name;
            finishLogin();
        } else if (pin === pinOwner) {
            currentUserRole = "OWNER";
            currentCashierName = "Pemilik";
            finishLogin();
        } else {
            loginError.textContent = "PIN Salah! Silakan coba lagi.";
            pinInput.value = "";
        }
    });

    function finishLogin() {
        loginOverlay.classList.add("opacity-0");
        setTimeout(() => {
            loginOverlay.style.display = "none";
            
            // Tampilkan kembali semua menu navigasi sebagai default (reset dari sesi sebelumnya)
            document.querySelector('[data-tab="inventory"]').style.display = "flex";
            document.querySelector('[data-tab="transactions"]').style.display = "flex";
            document.querySelector('[data-tab="settings"]').style.display = "flex";
            
            // Paksa masuk ke tab POS agar tidak terjebak di tab Pengaturan dari sesi sebelumnya
            switchTab('pos');
            
            // Atur Hak Akses UI (Role-Based Access Control)
            if (currentUserRole === "CASHIER") {
                document.querySelector('[data-tab="inventory"]').style.display = "none";
                document.querySelector('[data-tab="transactions"]').style.display = "none";
                document.querySelector('[data-tab="settings"]').style.display = "none";
            }

            shopNameBrand.textContent = shopProfile.name;
            renderCatalog();
            if (currentUserRole === "OWNER") {
                renderInventoryTable();
                renderReportsAndHistory();
                loadSettingsForm();
            }
        }, 300);
    }

    // 5. NAVIGASI TAB
    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => switchTab(btn.getAttribute("data-tab")));
    });

    function switchTab(tabId) {
        currentTab = tabId;
        tabButtons.forEach(b => {
            if (b.getAttribute("data-tab") === tabId) {
                b.classList.add("text-on-secondary-container", "bg-secondary-container");
                b.classList.remove("text-on-surface-variant", "hover:bg-surface-container-high");
                b.querySelector('.material-symbols-outlined').style.fontVariationSettings = "'FILL' 1";
            } else {
                b.classList.remove("text-on-secondary-container", "bg-secondary-container");
                b.classList.add("text-on-surface-variant", "hover:bg-surface-container-high");
                b.querySelector('.material-symbols-outlined').style.fontVariationSettings = "'FILL' 0";
            }
        });
        tabContents.forEach(c => {
            if (c.getAttribute("id") === `tab-${tabId}`) c.classList.add("active");
            else c.classList.remove("active");
        });
    }

    // 6. MANAJEMEN POS - KATALOG & CARI
    function renderCatalog() {
        const products = AppDB.getProducts();
        const query = searchProductInput.value.toLowerCase().trim();
        const categories = ["Semua", ...new Set(products.map(p => p.category))];
        renderCategoryFilter(categories);

        const filtered = products.filter(p => {
            const matchQuery = p.name.toLowerCase().includes(query) || p.id.toLowerCase().includes(query) || (p.barcode && p.barcode.includes(query));
            const matchCategory = selectedCategory === "Semua" || p.category === selectedCategory;
            return matchQuery && matchCategory;
        });

        productsGrid.innerHTML = "";
        if (filtered.length === 0) {
            productsGrid.innerHTML = `<div class="col-span-2 md:col-span-4 text-center py-12 text-slate-500 font-label-sm">Produk tidak ditemukan.</div>`;
            return;
        }

        filtered.forEach(p => {
            const cartItem = cart.find(item => item.id === p.id);
            const qtyInCart = cartItem ? cartItem.qty : 0;
            const remainingStock = p.stock - qtyInCart;
            const isOutOfStock = remainingStock <= 0;
            let catColorClass = remainingStock <= 5 ? "bg-rose-500/90" : "bg-emerald-500/90";

            const card = document.createElement("div");
            card.className = `bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant flex flex-col hover:shadow-md transition-all active:scale-95 duration-100 group ${isOutOfStock ? 'opacity-50' : ''}`;
            card.innerHTML = `
                <div class="relative h-32 md:h-40 bg-slate-200 overflow-hidden flex items-center justify-center text-slate-400">
                    <span class="material-symbols-outlined text-[48px]">inventory_2</span>
                    <div class="absolute top-sm right-sm ${catColorClass} text-white px-sm py-xs rounded-full font-label-sm text-[10px] md:text-label-sm backdrop-blur-sm shadow-sm">
                        Stok: ${remainingStock}
                    </div>
                </div>
                <div class="p-sm md:p-md flex flex-col flex-grow">
                    <h3 class="font-label-mono text-[13px] md:text-headline-md-mobile text-on-surface mb-xs truncate" title="${p.name}">${p.name}</h3>
                    <p class="font-label-sm text-[10px] md:text-label-sm text-on-surface-variant mb-sm uppercase tracking-wider truncate">${p.category}</p>
                    <div class="mt-auto flex justify-between items-end">
                        <span class="font-price-display text-[16px] md:text-price-display text-secondary">${formatRupiah(p.price)}</span>
                        ${!isOutOfStock ? `
                        <button class="add-to-cart-btn w-8 h-8 md:w-10 md:h-10 bg-emerald-600 text-white rounded-lg flex items-center justify-center shadow-md hover:bg-emerald-700 active:scale-90 transition-transform" data-id="${p.id}">
                            <span class="material-symbols-outlined text-[20px]">add</span>
                        </button>` : `<span class="text-rose-500 font-label-sm text-[10px]">Habis</span>`}
                    </div>
                </div>
            `;
            if (!isOutOfStock) card.querySelector(".add-to-cart-btn").addEventListener("click", () => addToCart(p));
            productsGrid.appendChild(card);
        });
    }

    function renderCategoryFilter(categories) {
        categoriesContainer.innerHTML = "";
        categories.forEach(cat => {
            const pill = document.createElement("button");
            const isActive = selectedCategory === cat;
            pill.className = `px-md py-sm rounded-full font-label-sm text-label-sm whitespace-nowrap active:scale-95 transition-all shadow-sm border border-outline-variant ${isActive ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high'}`;
            pill.textContent = cat;
            pill.addEventListener("click", () => { selectedCategory = cat; renderCatalog(); });
            categoriesContainer.appendChild(pill);
        });
    }

    searchProductInput.addEventListener("input", () => {
        clearSearchBtn.style.display = searchProductInput.value.length > 0 ? "block" : "none";
        renderCatalog();
    });
    clearSearchBtn.addEventListener("click", () => {
        searchProductInput.value = ""; clearSearchBtn.style.display = "none"; searchProductInput.focus(); renderCatalog();
    });

    // 7. LOGIKA KERANJANG
    function addToCart(product) {
        const cartItem = cart.find(item => item.id === product.id);
        const originalProduct = AppDB.getProducts().find(p => p.id === product.id);
        const maxStock = originalProduct ? originalProduct.stock : 0;

        if (cartItem) {
            if (cartItem.qty < maxStock) cartItem.qty++; else alert("Stok barang di toko tidak mencukupi.");
        } else {
            if (maxStock > 0) cart.push({ id: product.id, name: product.name, price: product.price, costPrice: product.costPrice, qty: 1, discountAmount: 0 });
        }
        renderCart(); renderCatalog();
    }

    function updateCartQty(productId, newQty) {
        const cartItem = cart.find(item => item.id === productId);
        if (!cartItem) return;
        const maxStock = (AppDB.getProducts().find(p => p.id === productId) || {}).stock || 999;
        if (newQty <= 0) cart = cart.filter(item => item.id !== productId);
        else if (newQty > maxStock) cartItem.qty = maxStock;
        else cartItem.qty = newQty;
        renderCart(); renderCatalog();
    }

    btnViewCartMobile.addEventListener("click", () => cartAreaElement.classList.remove("translate-y-full"));
    closeCartMobile.addEventListener("click", () => cartAreaElement.classList.add("translate-y-full"));
    clearCartBtn.addEventListener("click", () => {
        if (cart.length > 0 && confirm("Kosongkan daftar belanjaan?")) {
            cart = []; summaryDiscountInput.value = "0"; renderCart(); renderCatalog(); cartAreaElement.classList.add("translate-y-full");
        }
    });

    function renderCart() {
        cartItemsContainer.innerHTML = "";
        const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `<div class="flex-1 flex flex-col items-center justify-center text-slate-400"><span class="material-symbols-outlined text-[64px] mb-2">shopping_cart</span><p class="font-label-sm">Keranjang Kosong</p></div>`;
            checkoutBtn.classList.add("opacity-50", "pointer-events-none"); checkoutBtnMobile.classList.add("opacity-50", "pointer-events-none");
            cartSummaryWrapper.classList.add("hidden");
        } else {
            cartSummaryWrapper.classList.remove("hidden");
            checkoutBtn.classList.remove("opacity-50", "pointer-events-none"); checkoutBtnMobile.classList.remove("opacity-50", "pointer-events-none");
            summaryQtyLabel.textContent = `Total Belanja (${totalQty} Item)`;

            cart.forEach(item => {
                const itemTotal = (item.price - item.discountAmount) * item.qty;
                const row = document.createElement("div");
                row.className = "bg-white p-sm rounded-xl custom-shadow flex flex-col gap-sm border border-outline-variant";
                row.innerHTML = `
                    <div class="flex justify-between items-start">
                        <span class="font-label-mono text-navy-900">${item.name}</span>
                        <span class="font-label-mono text-emerald-600">${formatRupiah(itemTotal)}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <button class="btn-discount text-[12px] font-label-sm px-2 py-1 rounded bg-slate-100 text-slate-600 active:scale-95" data-id="${item.id}">
                            ${item.discountAmount > 0 ? ('Disc: -' + formatRupiah(item.discountAmount)) : '+ Diskon'}
                        </button>
                        <div class="flex items-center gap-2 bg-surface-container-highest rounded-lg p-1">
                            <button class="btn-minus w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm active:scale-90 text-navy-900" data-id="${item.id}"><span class="material-symbols-outlined text-[18px]">remove</span></button>
                            <span class="w-6 text-center font-label-mono">${item.qty}</span>
                            <button class="btn-plus w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm active:scale-90 text-navy-900" data-id="${item.id}"><span class="material-symbols-outlined text-[18px]">add</span></button>
                        </div>
                    </div>
                `;
                row.querySelector(".btn-minus").addEventListener("click", () => updateCartQty(item.id, item.qty - 1));
                row.querySelector(".btn-plus").addEventListener("click", () => updateCartQty(item.id, item.qty + 1));
                row.querySelector(".btn-discount").addEventListener("click", () => {
                    const discountStr = prompt(`Masukkan diskon untuk "${item.name}" (Rp per item):`, item.discountAmount);
                    if (discountStr !== null) {
                        const discountVal = parseInt(discountStr) || 0;
                        if (discountVal >= 0 && discountVal <= item.price) { item.discountAmount = discountVal; renderCart(); }
                        else alert("Diskon tidak valid.");
                    }
                });
                cartItemsContainer.appendChild(row);
            });
        }
        calculateTotals();
    }

    let calculatedTotal = 0, calculatedSubtotal = 0, calculatedDiscount = 0;
    function calculateTotals() {
        calculatedSubtotal = cart.reduce((sum, item) => sum + ((item.price - item.discountAmount) * item.qty), 0);
        calculatedDiscount = parseInt(summaryDiscountInput.value) || 0;
        if (calculatedDiscount < 0) { calculatedDiscount = 0; summaryDiscountInput.value = 0; }
        calculatedTotal = Math.max(0, calculatedSubtotal - calculatedDiscount);

        summarySubtotal.textContent = formatRupiah(calculatedSubtotal);
        summaryTotal.textContent = formatRupiah(calculatedTotal);
    }
    summaryDiscountInput.addEventListener("input", calculateTotals);

    // 8. CHECKOUT
    function openCheckout() {
        cartAreaElement.classList.add("translate-y-full"); checkoutTotalBill.textContent = formatRupiah(calculatedTotal);
        checkoutModal.classList.add("active"); cashReceivedInput.value = ""; cashChangeDisplay.textContent = "Rp 0";
        disableCheckoutBtn();
        document.querySelector("input[name='payment_method'][value='CASH']").checked = true;
        updatePaymentPanel("CASH"); generateQuickCashOptions(); setTimeout(() => cashReceivedInput.focus(), 150);
    }
    function closeCheckout() { checkoutModal.classList.remove("active"); }
    closeCheckoutModal.addEventListener("click", closeCheckout);
    btnCancelCheckout.addEventListener("click", closeCheckout);
    checkoutBtn.addEventListener("click", openCheckout);
    checkoutBtnMobile.addEventListener("click", openCheckout);

    paymentRadioButtons.forEach(radio => {
        radio.addEventListener("change", () => {
            const method = radio.value;
            paymentMethodCards.forEach(card => {
                if (card.querySelector("input").value === method) {
                    card.classList.replace("border-outline-variant", "border-emerald-500");
                    card.classList.add("border-2", "text-emerald-600"); card.classList.remove("text-slate-500", "border");
                } else {
                    card.classList.replace("border-emerald-500", "border-outline-variant");
                    card.classList.remove("border-2", "text-emerald-600"); card.classList.add("text-slate-500", "border");
                }
            });
            updatePaymentPanel(method);
        });
    });

    function updatePaymentPanel(method) {
        paymentPanels.forEach(panel => {
            if (panel.getAttribute("id") === `payment-panel-${method.toLowerCase()}`) panel.classList.add("active");
            else panel.classList.remove("active");
        });
        if (method === "CASH") { validateCashAmount(); cashReceivedInput.focus(); }
        else if (method === "QRIS") {
            const qrBase = shopProfile.qrisCode || "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=qris-toko";
            qrisImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrBase + '-total-' + calculatedTotal)}`;
            qrisTotalBadgeVal.textContent = formatRupiah(calculatedTotal); enableCheckoutBtn();
        } else if (method === "TRANSFER") {
            detailBankName.textContent = shopProfile.bankName || "BCA";
            detailBankAccount.textContent = shopProfile.bankAccount || "123-456-7890";
            detailBankOwner.textContent = shopProfile.bankOwner || "Budi Santoso";
            detailBankTotal.textContent = formatRupiah(calculatedTotal); enableCheckoutBtn();
        }
    }

    function enableCheckoutBtn() { btnConfirmCheckout.disabled = false; btnConfirmCheckout.classList.remove("opacity-50"); }
    function disableCheckoutBtn() { btnConfirmCheckout.disabled = true; btnConfirmCheckout.classList.add("opacity-50"); }

    function generateQuickCashOptions() {
        quickCashContainer.innerHTML = ""; const bill = calculatedTotal; const notes = [10000, 20000, 50000, 100000];
        const exactBtn = document.createElement("button");
        exactBtn.className = "bg-slate-100 text-slate-700 rounded-lg px-3 py-2 font-label-mono text-sm active:scale-95";
        exactBtn.textContent = "Uang Pas"; exactBtn.addEventListener("click", () => { cashReceivedInput.value = bill; validateCashAmount(); });
        quickCashContainer.appendChild(exactBtn);
        notes.forEach(note => {
            if (note >= bill) {
                const btn = document.createElement("button");
                btn.className = "bg-slate-100 text-slate-700 rounded-lg px-3 py-2 font-label-mono text-sm active:scale-95";
                btn.textContent = formatRupiah(note); btn.addEventListener("click", () => { cashReceivedInput.value = note; validateCashAmount(); });
                quickCashContainer.appendChild(btn);
            }
        });
    }

    cashReceivedInput.addEventListener("input", validateCashAmount);
    function validateCashAmount() {
        const amountReceived = parseInt(cashReceivedInput.value) || 0;
        if (amountReceived >= calculatedTotal) { cashChangeDisplay.textContent = formatRupiah(amountReceived - calculatedTotal); enableCheckoutBtn(); }
        else { cashChangeDisplay.textContent = "Uang Kurang"; disableCheckoutBtn(); }
    }

    btnConfirmCheckout.addEventListener("click", async () => {
        disableCheckoutBtn();
        btnConfirmCheckout.innerHTML = "Memproses...";
        
        const paymentMethod = document.querySelector("input[name='payment_method']:checked").value;
        const payAmount = paymentMethod === "CASH" ? (parseInt(cashReceivedInput.value) || calculatedTotal) : calculatedTotal;
        
        const transaction = {
            id: generateTxId(), time: new Date().toISOString(), items: cart.map(item => ({ ...item })),
            subtotal: calculatedSubtotal, discount: calculatedDiscount,
            total: calculatedTotal, paymentMethod: paymentMethod, payAmount: payAmount, 
            changeAmount: Math.max(0, payAmount - calculatedTotal), cashier: currentCashierName
        };

        const dbResult = await AppDB.addTransaction(transaction);
        
        if (dbResult.success) {
            updateThermalReceiptTemplate(transaction); closeCheckout();
            cart = []; summaryDiscountInput.value = "0"; renderCart();
            setTimeout(() => { window.print(); renderCatalog(); }, 300);
        } else {
            alert("Gagal memproses transaksi: " + dbResult.message);
        }
        
        btnConfirmCheckout.innerHTML = `<span class="material-symbols-outlined">print</span> Cetak Struk`;
    });

    function updateThermalReceiptTemplate(tx) {
        receiptShopName.textContent = shopProfile.name.toUpperCase();
        receiptShopAddress.textContent = shopProfile.address;
        receiptShopPhone.textContent = `Telp: ${shopProfile.phone}`;
        receiptId.textContent = tx.id;
        if (receiptCashier) receiptCashier.textContent = tx.cashier || "Admin";
        const dateObj = new Date(tx.time);
        receiptDate.textContent = `${dateObj.getDate().toString().padStart(2,'0')}-${(dateObj.getMonth()+1).toString().padStart(2,'0')}-${dateObj.getFullYear()} ${dateObj.getHours().toString().padStart(2,'0')}:${dateObj.getMinutes().toString().padStart(2,'0')}`;
        receiptItemsList.innerHTML = "";
        tx.items.forEach(item => {
            const p = item.price - item.discountAmount;
            receiptItemsList.innerHTML += `<div class="receipt-item-block"><span class="receipt-item-title">${item.name}</span><div class="receipt-item-calc"><span>${item.qty} x Rp${p.toLocaleString("id-ID")}</span><span>Rp${(p*item.qty).toLocaleString("id-ID")}</span></div></div>`;
        });
        receiptSubtotal.textContent = formatRupiah(tx.subtotal);
        receiptDiscount.textContent = formatRupiah(tx.discount); receiptTotal.textContent = formatRupiah(tx.total);
        receiptPaymentMethod.textContent = tx.paymentMethod; receiptPayAmount.textContent = formatRupiah(tx.payAmount);
        receiptChange.textContent = formatRupiah(tx.changeAmount);
    }

    // 9. INVENTARIS
    function renderInventoryTable() {
        const products = AppDB.getProducts();
        const query = inventorySearchInput.value.toLowerCase().trim();
        const filtered = products.filter(p => p.name.toLowerCase().includes(query) || p.id.toLowerCase().includes(query) || (p.barcode && p.barcode.includes(query)));
        
        inventoryList.innerHTML = "";
        if (filtered.length === 0) { inventoryList.innerHTML = `<div class="text-center p-md text-slate-500 font-label-sm">Belum ada produk.</div>`; return; }

        filtered.forEach(p => {
            const isLowStock = p.stock <= 5;
            const card = document.createElement("div");
            card.className = `bg-surface-container-lowest p-md rounded-xl custom-shadow border-l-4 ${isLowStock ? 'border-rose-500' : 'border-emerald-500'}`;
            card.innerHTML = `
                <div class="flex justify-between items-start mb-sm">
                    <div class="flex-1"><span class="font-label-mono text-[11px] text-on-surface-variant">SKU: ${p.id}</span><h3 class="font-headline-md text-[16px] text-navy-900 mt-1">${p.name}</h3><span class="text-label-sm text-slate-400">Kat: ${p.category}</span></div>
                    <div class="flex gap-xs"><button class="btn-edit w-10 h-10 flex items-center justify-center text-slate-600 bg-slate-100 rounded-full active:scale-95" data-id="${p.id}"><span class="material-symbols-outlined text-[18px]">edit</span></button><button class="btn-delete w-10 h-10 flex items-center justify-center text-rose-500 bg-rose-50 rounded-full active:scale-95" data-id="${p.id}"><span class="material-symbols-outlined text-[18px]">delete</span></button></div>
                </div>
                <div class="flex justify-between items-center mt-sm border-t border-slate-100 pt-sm">
                    <div class="flex flex-col"><span class="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Stok</span><div class="flex items-center gap-xs"><span class="font-price-display text-[18px] ${isLowStock ? 'text-rose-500' : 'text-navy-900'}">${p.stock}</span><span class="font-body-md text-on-surface-variant text-[12px]">pcs</span></div></div>
                    <div class="text-right"><span class="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Harga Jual</span><p class="font-price-display text-[16px] text-emerald-600">${formatRupiah(p.price)}</p></div>
                </div>
            `;
            card.querySelector(".btn-edit").addEventListener("click", () => openProductModal(p.id));
            card.querySelector(".btn-delete").addEventListener("click", () => handleDeleteProduct(p.id));
            inventoryList.appendChild(card);
        });
    }

    inventorySearchInput.addEventListener("input", renderInventoryTable);

    function openProductModal(productId = null) {
        editingProductId = productId; productModal.classList.add("active");
        if (productId) {
            productModalTitle.textContent = "Ubah Produk"; const prod = AppDB.getProducts().find(p => p.id === productId);
            if (prod) {
                prodIdInput.value = prod.id; prodIdInput.disabled = true; prodBarcodeInput.value = prod.barcode || "";
                prodNameInput.value = prod.name; prodCategoryInput.value = prod.category;
                prodStockInput.value = prod.stock; prodCostInput.value = prod.costPrice; prodPriceInput.value = prod.price;
            }
        } else {
            productModalTitle.textContent = "Tambah Produk Baru"; productForm.reset(); prodIdInput.disabled = false;
            prodIdInput.value = "P" + (AppDB.getProducts().length + 1).toString().padStart(3, '0');
        }
    }
    function closeProduct() { productModal.classList.remove("active"); editingProductId = null; }
    addProductBtn.addEventListener("click", () => openProductModal()); closeProductModal.addEventListener("click", closeProduct); btnCancelProduct.addEventListener("click", closeProduct);

    productForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const product = { id: prodIdInput.value.trim(), barcode: prodBarcodeInput.value.trim(), name: prodNameInput.value.trim(), category: prodCategoryInput.value, stock: parseInt(prodStockInput.value) || 0, costPrice: parseInt(prodCostInput.value) || 0, price: parseInt(prodPriceInput.value) || 0 };
        const result = editingProductId ? await AppDB.updateProduct(product) : await AppDB.addProduct(product);
        if (result.success) { closeProduct(); renderInventoryTable(); } else alert(result.message);
    });

    async function handleDeleteProduct(productId) {
        if (confirm(`Yakin ingin menghapus produk ID: ${productId}?`)) {
            const result = await AppDB.deleteProduct(productId);
            if (result.success) renderInventoryTable(); else alert(result.message);
        }
    }

    // 10. LAPORAN & RIWAYAT
    function renderReportsAndHistory() {
        const transactions = AppDB.getTransactions();
        let totalRevenue = 0, totalProfit = 0;
        
        transactions.forEach(tx => {
            totalRevenue += tx.total; let txProfit = 0;
            tx.items.forEach(item => { txProfit += ((item.price - item.costPrice - item.discountAmount) * item.qty); });
            totalProfit += (txProfit - tx.discount);
        });

        statRevenue.textContent = formatRupiah(totalRevenue); statProfit.textContent = formatRupiah(totalProfit); statTxCount.textContent = transactions.length;

        historyList.innerHTML = "";
        if (transactions.length === 0) { historyList.innerHTML = `<div class="text-center p-md text-slate-500 font-label-sm">Belum ada riwayat transaksi.</div>`; return; }

        transactions.forEach(tx => {
            const dateObj = new Date(tx.time); const timeStr = `${dateObj.toLocaleDateString("id-ID")} ${dateObj.toLocaleTimeString("id-ID", {hour: '2-digit', minute:'2-digit'})}`;
            let methodClass = "bg-secondary-container text-on-secondary-container";
            if (tx.paymentMethod === 'QRIS') methodClass = "bg-tertiary-fixed-dim/20 text-on-tertiary-container";
            else if (tx.paymentMethod === 'TRANSFER') methodClass = "bg-primary-fixed-dim text-navy-900";

            const card = document.createElement("div");
            card.className = "bg-white p-md rounded-xl transaction-card flex flex-col gap-sm border border-outline-variant";
            card.innerHTML = `
                <div class="flex justify-between items-start">
                    <div class="flex flex-col"><span class="font-label-mono text-[14px] text-navy-900 uppercase">#${tx.id}</span><span class="font-label-sm text-[11px] text-slate-500">${timeStr}</span></div>
                    <div class="flex flex-col items-end"><span class="font-label-mono text-[16px] text-emerald-600">${formatRupiah(tx.total)}</span><span class="text-[10px] font-bold px-sm rounded mt-1 uppercase tracking-wider ${methodClass}">${tx.paymentMethod}</span></div>
                </div>
                <div class="flex gap-sm mt-2">
                    <button class="reprint-btn flex-[2] h-10 bg-slate-100 text-slate-700 font-label-sm rounded-lg active:scale-95 flex items-center justify-center gap-xs" data-id="${tx.id}"><span class="material-symbols-outlined text-[18px]">print</span> Cetak Struk</button>
                </div>
            `;
            card.querySelector(".reprint-btn").addEventListener("click", () => { updateThermalReceiptTemplate(tx); setTimeout(() => window.print(), 200); });
            historyList.appendChild(card);
        });
    }

    // 11. PENGATURAN
    function renderCashiersSettings() {
        if (!cashiersContainer) return;
        cashiersContainer.innerHTML = "";
        const cashiers = shopProfile.cashiers || [{ id: "c1", name: "Kasir 1", pin: "123456" }];
        
        cashiers.forEach(c => {
            const row = document.createElement("div");
            row.className = "flex gap-sm items-end cashier-row";
            row.innerHTML = `
                <div class="flex-1">
                    <label class="block text-slate-500 font-label-sm mb-xs">Nama Karyawan</label>
                    <input type="text" class="cashier-name-input w-full bg-slate-50 border border-outline-variant rounded-md p-sm text-navy-900 focus:border-primary outline-none text-sm" placeholder="Contoh: Budi" value="${c.name}" required>
                </div>
                <div class="flex-1">
                    <label class="block text-slate-500 font-label-sm mb-xs">PIN Karyawan</label>
                    <input type="password" class="cashier-pin-input w-full bg-slate-50 border border-outline-variant rounded-md p-sm text-navy-900 focus:border-primary outline-none text-sm font-label-mono tracking-widest" placeholder="6 Angka" maxlength="6" value="${c.pin}" required>
                </div>
                <button type="button" class="btn-remove-cashier w-10 h-10 flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded-md">
                    <span class="material-symbols-outlined text-[20px]">delete</span>
                </button>
            `;
            row.querySelector('.btn-remove-cashier').addEventListener('click', () => {
                row.remove();
            });
            cashiersContainer.appendChild(row);
        });
    }

    if (btnAddCashier) {
        btnAddCashier.addEventListener('click', () => {
            const row = document.createElement("div");
            row.className = "flex gap-sm items-end cashier-row";
            row.innerHTML = `
                <div class="flex-1">
                    <label class="block text-slate-500 font-label-sm mb-xs">Nama Karyawan</label>
                    <input type="text" class="cashier-name-input w-full bg-slate-50 border border-outline-variant rounded-md p-sm text-navy-900 focus:border-primary outline-none text-sm" placeholder="Contoh: Budi" required>
                </div>
                <div class="flex-1">
                    <label class="block text-slate-500 font-label-sm mb-xs">PIN Karyawan</label>
                    <input type="password" class="cashier-pin-input w-full bg-slate-50 border border-outline-variant rounded-md p-sm text-navy-900 focus:border-primary outline-none text-sm font-label-mono tracking-widest" placeholder="6 Angka" maxlength="6" required>
                </div>
                <button type="button" class="btn-remove-cashier w-10 h-10 flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded-md">
                    <span class="material-symbols-outlined text-[20px]">delete</span>
                </button>
            `;
            row.querySelector('.btn-remove-cashier').addEventListener('click', () => {
                row.remove();
            });
            cashiersContainer.appendChild(row);
        });
    }

    function loadSettingsForm() {
        shopNameInput.value = shopProfile.name || ""; shopAddressInput.value = shopProfile.address || ""; shopPhoneInput.value = shopProfile.phone || "";
        bankNameInput.value = shopProfile.bankName || ""; bankAccountInput.value = shopProfile.bankAccount || ""; bankOwnerInput.value = shopProfile.bankOwner || ""; qrisLinkInput.value = shopProfile.qrisCode || "";
        pinOwnerInput.value = shopProfile.pinOwner || "999999";
        renderCashiersSettings();
    }

    settingsProfileForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        shopProfile = { ...shopProfile, name: shopNameInput.value.trim(), address: shopAddressInput.value.trim(), phone: shopPhoneInput.value.trim() };
        await AppDB.saveShopProfile(shopProfile); loadSettingsForm(); alert("Profil toko disimpan!");
    });

    settingsPaymentForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        shopProfile = { ...shopProfile, bankName: bankNameInput.value.trim(), bankAccount: bankAccountInput.value.trim(), bankOwner: bankOwnerInput.value.trim(), qrisCode: qrisLinkInput.value.trim() };
        await AppDB.saveShopProfile(shopProfile); loadSettingsForm(); alert("Data pembayaran disimpan!");
    });

    settingsPinForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        // Kumpulkan data kasir
        const cashierRows = cashiersContainer.querySelectorAll('.cashier-row');
        const newCashiers = [];
        let hasDuplicatePin = false;
        const usedPins = new Set();
        
        cashierRows.forEach((row, idx) => {
            const name = row.querySelector('.cashier-name-input').value.trim();
            const pin = row.querySelector('.cashier-pin-input').value.trim();
            if (name && pin) {
                if (usedPins.has(pin) || pin === pinOwnerInput.value.trim()) {
                    hasDuplicatePin = true;
                }
                usedPins.add(pin);
                newCashiers.push({ id: "c" + new Date().getTime() + idx, name: name, pin: pin });
            }
        });

        if (hasDuplicatePin) {
            alert("Setiap kasir (dan pemilik) harus memiliki PIN yang berbeda-beda agar sistem bisa mengenali siapa yang masuk. Silakan ubah PIN yang kembar.");
            return;
        }
        
        if (newCashiers.length === 0) {
            alert("Minimal harus ada 1 Kasir.");
            return;
        }

        shopProfile = { ...shopProfile, cashiers: newCashiers, pinOwner: pinOwnerInput.value.trim() };
        await AppDB.saveShopProfile(shopProfile); 
        loadSettingsForm(); 
        alert("Sistem Kunci dan Multi-Kasir berhasil diperbarui!");
    });

    btnExportExcel.addEventListener("click", () => {
        const transactions = AppDB.getTransactions();
        if (transactions.length === 0) {
            alert("Belum ada transaksi untuk diexport.");
            return;
        }
        
        // Generate CSV content
        const headers = ["Waktu", "ID Transaksi", "Kasir", "Metode Pembayaran", "Subtotal", "Diskon", "Total Bayar", "Modal/HPP", "Laba Bersih"];
        let csvContent = headers.join(",") + "\\n";
        
        transactions.forEach(tx => {
            const dateStr = `"${new Date(tx.time).toLocaleString('id-ID')}"`;
            let totalHpp = 0;
            tx.items.forEach(item => { totalHpp += (item.costPrice * item.qty); });
            const laba = tx.total - totalHpp;
            
            const row = [
                dateStr, tx.id, tx.cashier, tx.paymentMethod,
                tx.subtotal, tx.discount, tx.total, totalHpp, laba
            ];
            csvContent += row.join(",") + "\\n";
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Laporan_Penjualan_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    btnLogout.addEventListener("click", async () => {
        if(confirm("Yakin ingin keluar dari akun toko ini (Logout Email)? Perangkat ini akan membutuhkan email & password lagi untuk masuk.")) {
            await AppDB.logOut();
            currentUserRole = null;
            pinInput.value = "";
        }
    });

    btnLockScreen.addEventListener("click", () => {
        if(confirm("Kunci layar dan kembali ke menu PIN?")) {
            currentUserRole = null;
            pinInput.value = "";
            loginOverlay.style.display = "flex";
            loginOverlay.classList.remove("opacity-0");
        }
    });

    // 12. PWA SERVICE WORKER & OFFLINE SUPPORT
    const networkStatusIcon = document.getElementById("network-status-icon");

    function updateNetworkStatus() {
        if (!networkStatusIcon) return;
        if (navigator.onLine) {
            networkStatusIcon.textContent = "signal_cellular_alt";
            networkStatusIcon.className = "material-symbols-outlined text-emerald-400";
            networkStatusIcon.parentElement.title = "Online (Tersinkronisasi)";
        } else {
            networkStatusIcon.textContent = "wifi_off";
            networkStatusIcon.className = "material-symbols-outlined text-rose-500 animate-pulse";
            networkStatusIcon.parentElement.title = "Offline (Menunggu Sinyal)";
        }
    }

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    updateNetworkStatus();

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js').then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }).catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }
});
