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

    // 2. DOM ELEMENTS SELECTORS
    const loginOverlay = document.getElementById("login-overlay");
    const pinInput = document.getElementById("pin-input");
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
    const btnExportDb = document.getElementById("btn-export-db");
    const importDbInput = document.getElementById("import-db-input");
    const btnResetDb = document.getElementById("btn-reset-db");

    const receiptShopName = document.getElementById("receipt-shop-name");
    const receiptShopAddress = document.getElementById("receipt-shop-address");
    const receiptShopPhone = document.getElementById("receipt-shop-phone");
    const receiptId = document.getElementById("receipt-id");
    const receiptDate = document.getElementById("receipt-date");
    const receiptItemsList = document.getElementById("receipt-items-list");
    const receiptSubtotal = document.getElementById("receipt-subtotal");
    const receiptTax = document.getElementById("receipt-tax");
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

    // 4. SISTEM LOGIN PIN
    pinBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            if (pinInput.value.length < 4) pinInput.value += btn.textContent;
            loginError.textContent = "";
        });
    });

    pinBtnClear.addEventListener("click", () => {
        pinInput.value = pinInput.value.slice(0, -1);
        loginError.textContent = "";
    });

    pinBtnEnter.addEventListener("click", () => {
        const pin = pinInput.value;
        if (pin === "1234") {
            currentUserRole = "CASHIER";
            finishLogin();
        } else if (pin === "9999") {
            currentUserRole = "OWNER";
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
            
            // Atur Hak Akses UI (Role-Based Access Control)
            if (currentUserRole === "CASHIER") {
                document.querySelector('[data-tab="inventory"]').style.display = "none";
                document.querySelector('[data-tab="transactions"]').style.display = "none";
                document.querySelector('[data-tab="settings"]').style.display = "none";
            }

            // Inisialisasi Firebase & Tunggu Data Turun
            loginError.textContent = "Menghubungkan ke Cloud...";
            loginError.classList.replace("text-rose-500", "text-emerald-500");
            
            AppDB.init(
                // onReady (Dipanggil pertama kali saat data siap)
                () => {
                    shopProfile = AppDB.getShopProfile();
                    shopNameBrand.textContent = shopProfile.name;
                    renderCatalog();
                    if (currentUserRole === "OWNER") {
                        renderInventoryTable();
                        renderReportsAndHistory();
                        loadSettingsForm();
                    }
                },
                // onUpdate (Dipanggil saat ada perubahan dari device lain / cloud)
                (type) => {
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
                }
            );

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

    let calculatedTotal = 0, calculatedSubtotal = 0, calculatedTax = 0, calculatedDiscount = 0;
    function calculateTotals() {
        calculatedSubtotal = cart.reduce((sum, item) => sum + ((item.price - item.discountAmount) * item.qty), 0);
        calculatedTax = Math.round(calculatedSubtotal * 0.11);
        calculatedDiscount = parseInt(summaryDiscountInput.value) || 0;
        if (calculatedDiscount < 0) { calculatedDiscount = 0; summaryDiscountInput.value = 0; }
        calculatedTotal = Math.max(0, calculatedSubtotal + calculatedTax - calculatedDiscount);

        summarySubtotal.textContent = formatRupiah(calculatedSubtotal);
        summaryTax.textContent = formatRupiah(calculatedTax);
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
            subtotal: calculatedSubtotal, tax: calculatedTax, discount: calculatedDiscount,
            total: calculatedTotal, paymentMethod: paymentMethod, payAmount: payAmount, 
            changeAmount: Math.max(0, payAmount - calculatedTotal), cashier: currentUserRole
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
        const dateObj = new Date(tx.time);
        receiptDate.textContent = `${dateObj.getDate().toString().padStart(2,'0')}-${(dateObj.getMonth()+1).toString().padStart(2,'0')}-${dateObj.getFullYear()} ${dateObj.getHours().toString().padStart(2,'0')}:${dateObj.getMinutes().toString().padStart(2,'0')}`;
        receiptItemsList.innerHTML = "";
        tx.items.forEach(item => {
            const p = item.price - item.discountAmount;
            receiptItemsList.innerHTML += `<div class="receipt-item-block"><span class="receipt-item-title">${item.name}</span><div class="receipt-item-calc"><span>${item.qty} x Rp${p.toLocaleString("id-ID")}</span><span>Rp${(p*item.qty).toLocaleString("id-ID")}</span></div></div>`;
        });
        receiptSubtotal.textContent = formatRupiah(tx.subtotal); receiptTax.textContent = formatRupiah(tx.tax);
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
    function loadSettingsForm() {
        shopNameInput.value = shopProfile.name || ""; shopAddressInput.value = shopProfile.address || ""; shopPhoneInput.value = shopProfile.phone || "";
        bankNameInput.value = shopProfile.bankName || ""; bankAccountInput.value = shopProfile.bankAccount || ""; bankOwnerInput.value = shopProfile.bankOwner || ""; qrisLinkInput.value = shopProfile.qrisCode || "";
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

    btnExportDb.addEventListener("click", () => AppDB.exportData());
    importDbInput.addEventListener("change", (e) => { alert("Import lokal dimatikan saat menggunakan Cloud."); });
    btnResetDb.addEventListener("click", () => { alert("Untuk mereset cloud, silakan hapus koleksi langsung di Firebase Console."); });
});
