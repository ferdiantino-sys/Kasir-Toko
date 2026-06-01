/**
 * app.js - Logika Utama Aplikasi POS Kasir Kelontong
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. STATE MANAGEMENT APLIKASI
    let cart = [];
    let currentTab = "pos";
    let selectedCategory = "Semua";
    let editingProductId = null;
    let shopProfile = AppDB.getShopProfile();

    // 2. DOM ELEMENTS SELECTORS
    // Navigation & Theme
    const tabButtons = document.querySelectorAll(".nav-btn");
    const tabContents = document.querySelectorAll(".tab-content");
    const themeToggleBtn = document.getElementById("theme-toggle");
    const themeText = document.getElementById("theme-text");
    const pageTitle = document.getElementById("page-title");
    const liveClock = document.getElementById("live-clock");
    const shopNameBrand = document.getElementById("shop-name-brand");
    const storeBadgeName = document.getElementById("store-badge-name");

    // POS Tab Elements
    const searchProductInput = document.getElementById("search-product");
    const clearSearchBtn = document.getElementById("clear-search");
    const categoriesContainer = document.getElementById("categories-container");
    const productsGrid = document.getElementById("products-grid");
    const cartItemsContainer = document.getElementById("cart-items");
    const clearCartBtn = document.getElementById("clear-cart-btn");
    const summarySubtotal = document.getElementById("summary-subtotal");
    const summaryTax = document.getElementById("summary-tax");
    const summaryDiscountInput = document.getElementById("summary-discount-input");
    const summaryTotal = document.getElementById("summary-total");
    const checkoutBtn = document.getElementById("checkout-btn");

    // POS Mobile Elements
    const cartAreaElement = document.getElementById("cart-area-element");
    const closeCartMobile = document.getElementById("close-cart-mobile");
    const mobileCartFab = document.getElementById("mobile-cart-fab");
    const mobileCartCount = document.getElementById("mobile-cart-count");

    // Inventory Tab Elements
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

    // Checkout Modal Elements
    const checkoutModal = document.getElementById("checkout-modal");
    const closeCheckoutModal = document.getElementById("close-checkout-modal");
    const btnCancelCheckout = document.getElementById("btn-cancel-checkout");
    const btnConfirmCheckout = document.getElementById("btn-confirm-checkout");
    const checkoutTotalBill = document.getElementById("checkout-total-bill");
    const paymentRadioButtons = document.querySelectorAll("input[name='payment_method']");
    const paymentMethodCards = document.querySelectorAll(".payment-method-card");
    const paymentPanels = document.querySelectorAll(".payment-panel");

    // Cash Payment Panel
    const cashReceivedInput = document.getElementById("cash-received");
    const quickCashContainer = document.getElementById("quick-cash-container");
    const cashChangeDisplay = document.getElementById("cash-change");

    // QRIS Payment Panel
    const qrisImage = document.getElementById("qris-image");
    const qrisTotalBadgeVal = document.getElementById("qris-total-badge-val");

    // Bank Payment Panel
    const detailBankName = document.getElementById("detail-bank-name");
    const detailBankAccount = document.getElementById("detail-bank-account");
    const detailBankOwner = document.getElementById("detail-bank-owner");
    const detailBankTotal = document.getElementById("detail-bank-total");

    // History & Reports Elements
    const statRevenue = document.getElementById("stat-revenue");
    const statProfit = document.getElementById("stat-profit");
    const statTxCount = document.getElementById("stat-tx-count");
    const statLowStock = document.getElementById("stat-low-stock");
    const historyList = document.getElementById("history-list");

    // Settings Elements
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

    // Receipt Print Elements
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
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0
        }).format(number);
    }

    function generateTxId() {
        const date = new Date();
        const y = date.getFullYear().toString().slice(-2);
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const d = date.getDate().toString().padStart(2, '0');
        const rand = Math.floor(1000 + Math.random() * 9000);
        return `TX${y}${m}${d}-${rand}`;
    }

    // Live Clock Update
    function updateClock() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateStr = now.toLocaleDateString("id-ID", options);
        const timeStr = now.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        liveClock.textContent = `${dateStr} | ${timeStr}`;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // 4. NAVIGASI TAB & TEMA
    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetTab = btn.getAttribute("data-tab");
            switchTab(targetTab);
        });
    });

    // Event listener untuk tombol Keranjang Mobile (FAB & Tutup)
    if (mobileCartFab) {
        mobileCartFab.addEventListener("click", () => {
            if (cartAreaElement) {
                cartAreaElement.classList.add("active");
            }
        });
    }

    if (closeCartMobile) {
        closeCartMobile.addEventListener("click", () => {
            if (cartAreaElement) {
                cartAreaElement.classList.remove("active");
            }
        });
    }

    function switchTab(tabId) {
        currentTab = tabId;
        
        // Update Nav Buttons
        tabButtons.forEach(b => {
            if (b.getAttribute("data-tab") === tabId) {
                b.classList.add("active");
            } else {
                b.classList.remove("active");
            }
        });

        // Update Tab Contents
        tabContents.forEach(c => {
            if (c.getAttribute("id") === `tab-${tabId}`) {
                c.classList.add("active");
            } else {
                c.classList.remove("active");
            }
        });

        // Update Header Title
        const titleMap = {
            pos: "Mesin Kasir POS",
            inventory: "Manajemen Inventaris Barang",
            transactions: "Riwayat & Laporan Laba Rugi",
            settings: "Pengaturan Kasir"
        };
        pageTitle.textContent = titleMap[tabId] || "Kasir";

        // Callback data reloading
        if (tabId === "pos") {
            renderCatalog();
        } else if (tabId === "inventory") {
            renderInventoryTable();
        } else if (tabId === "transactions") {
            renderReportsAndHistory();
        } else if (tabId === "settings") {
            loadSettingsForm();
        }

        // Tutup bottom sheet keranjang dan perbarui FAB untuk mobile saat berpindah tab
        if (cartAreaElement) {
            cartAreaElement.classList.remove("active");
        }
        updateMobileCartFab();
    }

    function updateMobileCartFab() {
        if (!mobileCartFab) return;
        const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
        if (currentTab === "pos" && totalQty > 0) {
            mobileCartFab.style.display = "flex";
            mobileCartCount.textContent = totalQty;
        } else {
            mobileCartFab.style.display = "none";
        }
    }

    // Theme Toggle Handler
    themeToggleBtn.addEventListener("click", () => {
        if (document.body.classList.contains("dark-theme")) {
            document.body.classList.replace("dark-theme", "light-theme");
            themeText.textContent = "Mode Gelap";
        } else {
            document.body.classList.replace("light-theme", "dark-theme");
            themeText.textContent = "Mode Terang";
        }
        lucide.createIcons();
    });

    // 5. MANAJEMEN POS - KATALOG & CARI
    function renderCatalog() {
        const products = AppDB.getProducts();
        const query = searchProductInput.value.toLowerCase().trim();
        
        // Dapatkan Kategori Unik
        const categories = ["Semua", ...new Set(products.map(p => p.category))];
        renderCategoryFilter(categories);

        // Filter Produk
        const filtered = products.filter(p => {
            const matchQuery = p.name.toLowerCase().includes(query) || 
                               p.id.toLowerCase().includes(query) || 
                               (p.barcode && p.barcode.includes(query));
            const matchCategory = selectedCategory === "Semua" || p.category === selectedCategory;
            return matchQuery && matchCategory;
        });

        productsGrid.innerHTML = "";

        if (filtered.length === 0) {
            productsGrid.innerHTML = `
                <div class="empty-cart-state" style="grid-column: span 12; height: 200px;">
                    <i data-lucide="package-search"></i>
                    <p>Produk tidak ditemukan. Coba kata kunci lain.</p>
                </div>`;
            lucide.createIcons();
            return;
        }

        filtered.forEach(p => {
            // Hitung sisa stok aktual (dikurangi stok di keranjang)
            const cartItem = cart.find(item => item.id === p.id);
            const qtyInCart = cartItem ? cartItem.qty : 0;
            const remainingStock = p.stock - qtyInCart;
            const isOutOfStock = remainingStock <= 0;

            const card = document.createElement("div");
            card.className = `product-card ${isOutOfStock ? 'out-of-stock' : ''}`;
            
            // Tentukan Badge Kategori
            let badgeClass = "badge-lain";
            if (p.category === "Sembako") badgeClass = "badge-sembako";
            else if (p.category === "Makanan & Minuman") badgeClass = "badge-makanan";
            else if (p.category === "Kebutuhan Rumah") badgeClass = "badge-kebutuhan";
            else if (p.category === "Rokok & Korek") badgeClass = "badge-rokok";

            card.innerHTML = `
                <span class="prod-badge ${badgeClass}">${p.category}</span>
                <div class="prod-details">
                    <h4 class="prod-card-name" title="${p.name}">${p.name}</h4>
                    <div class="prod-card-meta">
                        <span class="prod-card-price">${formatRupiah(p.price)}</span>
                        <span class="prod-card-stock ${remainingStock <= 5 ? 'stock-warning' : ''}">
                            Stok: ${remainingStock}
                        </span>
                    </div>
                </div>
                ${isOutOfStock ? '<div class="out-of-stock-overlay">HABIS</div>' : ''}
            `;

            if (!isOutOfStock) {
                card.addEventListener("click", () => addToCart(p));
            }

            productsGrid.appendChild(card);
        });

        lucide.createIcons();
    }

    function renderCategoryFilter(categories) {
        categoriesContainer.innerHTML = "";
        categories.forEach(cat => {
            const pill = document.createElement("button");
            pill.className = `category-pill ${selectedCategory === cat ? 'active' : ''}`;
            pill.textContent = cat;
            pill.addEventListener("click", () => {
                selectedCategory = cat;
                renderCatalog();
            });
            categoriesContainer.appendChild(pill);
        });
    }

    searchProductInput.addEventListener("input", () => {
        if (searchProductInput.value.length > 0) {
            clearSearchBtn.style.display = "block";
        } else {
            clearSearchBtn.style.display = "none";
        }
        renderCatalog();
    });

    clearSearchBtn.addEventListener("click", () => {
        searchProductInput.value = "";
        clearSearchBtn.style.display = "none";
        searchProductInput.focus();
        renderCatalog();
    });

    // 6. LOGIKA KERANJANG BELANJA
    function addToCart(product) {
        const cartItem = cart.find(item => item.id === product.id);
        const currentProducts = AppDB.getProducts();
        const originalProduct = currentProducts.find(p => p.id === product.id);
        const maxStock = originalProduct ? originalProduct.stock : 0;

        if (cartItem) {
            if (cartItem.qty < maxStock) {
                cartItem.qty++;
            } else {
                alert("Stok barang di toko tidak mencukupi.");
                return;
            }
        } else {
            if (maxStock > 0) {
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    costPrice: product.costPrice,
                    qty: 1,
                    discountAmount: 0 // diskon per barang
                });
            } else {
                alert("Stok barang kosong.");
                return;
            }
        }

        renderCart();
        renderCatalog(); // Segarkan stok di tampilan katalog
    }

    function updateCartQty(productId, newQty) {
        const cartItem = cart.find(item => item.id === productId);
        if (!cartItem) return;

        const currentProducts = AppDB.getProducts();
        const originalProduct = currentProducts.find(p => p.id === productId);
        const maxStock = originalProduct ? originalProduct.stock : 999;

        if (newQty <= 0) {
            cart = cart.filter(item => item.id !== productId);
        } else if (newQty > maxStock) {
            alert(`Stok produk terbatas! Stok maksimal: ${maxStock}`);
            cartItem.qty = maxStock;
        } else {
            cartItem.qty = newQty;
        }

        renderCart();
        renderCatalog();
    }

    function deleteCartItem(productId) {
        cart = cart.filter(item => item.id !== productId);
        renderCart();
        renderCatalog();
    }

    // Set diskon per item produk
    function setItemDiscount(productId) {
        const cartItem = cart.find(item => item.id === productId);
        if (!cartItem) return;

        const currentDiscount = cartItem.discountAmount;
        const discountStr = prompt(`Masukkan diskon untuk "${cartItem.name}" (Rp per item):`, currentDiscount);
        
        if (discountStr === null) return; // Batal

        const discountVal = parseInt(discountStr) || 0;
        if (discountVal < 0 || discountVal > cartItem.price) {
            alert("Nominal diskon tidak valid.");
            return;
        }

        cartItem.discountAmount = discountVal;
        renderCart();
    }

    // Mengosongkan Keranjang
    clearCartBtn.addEventListener("click", () => {
        if (cart.length > 0 && confirm("Kosongkan daftar belanjaan?")) {
            cart = [];
            summaryDiscountInput.value = "";
            renderCart();
            renderCatalog();
        }
    });

    function renderCart() {
        cartItemsContainer.innerHTML = "";

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart-state">
                    <i data-lucide="shopping-cart"></i>
                    <p>Keranjang kosong. Pilih barang di sebelah kiri atau ketik pencarian.</p>
                </div>`;
            checkoutBtn.disabled = true;
            summarySubtotal.textContent = "Rp0";
            summaryTax.textContent = "Rp0";
            summaryTotal.textContent = "Rp0";
            updateMobileCartFab();
            lucide.createIcons();
            return;
        }

        cart.forEach(item => {
            const itemTotal = (item.price - item.discountAmount) * item.qty;
            const itemRow = document.createElement("div");
            itemRow.className = "cart-item-row";
            itemRow.innerHTML = `
                <div class="cart-item-info">
                    <span class="cart-item-name">${item.name}</span>
                    <span class="cart-item-price">${formatRupiah(itemTotal)}</span>
                </div>
                <div class="cart-item-controls">
                    <div class="qty-controller">
                        <button class="qty-btn btn-minus" data-id="${item.id}"><i data-lucide="minus"></i></button>
                        <span class="qty-val">${item.qty}</span>
                        <button class="qty-btn btn-plus" data-id="${item.id}"><i data-lucide="plus"></i></button>
                    </div>
                    <div class="cart-item-actions">
                        <button class="item-discount-btn ${item.discountAmount > 0 ? 'has-discount' : ''}" data-id="${item.id}">
                            <i data-lucide="tag"></i>
                            <span>${item.discountAmount > 0 ? ('- ' + formatRupiah(item.discountAmount)) : 'Diskon'}</span>
                        </button>
                        <button class="btn-delete-item" data-id="${item.id}" title="Hapus"><i data-lucide="trash-2"></i></button>
                    </div>
                </div>
            `;

            // Pasang event listener
            itemRow.querySelector(".btn-minus").addEventListener("click", () => updateCartQty(item.id, item.qty - 1));
            itemRow.querySelector(".btn-plus").addEventListener("click", () => updateCartQty(item.id, item.qty + 1));
            itemRow.querySelector(".btn-delete-item").addEventListener("click", () => deleteCartItem(item.id));
            itemRow.querySelector(".item-discount-btn").addEventListener("click", () => setItemDiscount(item.id));

            cartItemsContainer.appendChild(itemRow);
        });

        calculateTotals();
        checkoutBtn.disabled = false;
        updateMobileCartFab();
        lucide.createIcons();
    }

    // Penghitungan pajak (PPN 11%) dan Diskon Total
    let calculatedTotal = 0;
    let calculatedSubtotal = 0;
    let calculatedTax = 0;
    let calculatedDiscount = 0;

    function calculateTotals() {
        // Subtotal adalah total harga barang (setelah dikurangi diskon masing-masing barang)
        calculatedSubtotal = cart.reduce((sum, item) => sum + ((item.price - item.discountAmount) * item.qty), 0);
        
        // PPN 11% dari subtotal
        calculatedTax = Math.round(calculatedSubtotal * 0.11);
        
        // Diskon global
        calculatedDiscount = parseInt(summaryDiscountInput.value) || 0;
        if (calculatedDiscount < 0) {
            calculatedDiscount = 0;
            summaryDiscountInput.value = 0;
        }

        calculatedTotal = Math.max(0, calculatedSubtotal + calculatedTax - calculatedDiscount);

        summarySubtotal.textContent = formatRupiah(calculatedSubtotal);
        summaryTax.textContent = formatRupiah(calculatedTax);
        summaryTotal.textContent = formatRupiah(calculatedTotal);
    }

    summaryDiscountInput.addEventListener("input", calculateTotals);

    // 7. KEYBOARD SHORTCUTS
    document.addEventListener("keydown", (e) => {
        if (e.key === "F2") {
            e.preventDefault();
            searchProductInput.focus();
        } else if (e.key === "F8") {
            e.preventDefault();
            if (!checkoutBtn.disabled && currentTab === "pos") {
                openCheckout();
            }
        } else if (e.key === "Escape") {
            closeCheckout();
            closeProduct();
        }
    });

    // 8. MODAL PROSES PEMBAYARAN (CHECKOUT)
    function openCheckout() {
        if (cartAreaElement) {
            cartAreaElement.classList.remove("active");
        }
        checkoutTotalBill.textContent = formatRupiah(calculatedTotal);
        checkoutModal.classList.add("active");
        
        // Reset inputs & panel
        cashReceivedInput.value = "";
        cashChangeDisplay.textContent = "Rp0";
        btnConfirmCheckout.disabled = true;

        // Reset Pilihan Metode Bayar
        document.querySelector("input[name='payment_method'][value='CASH']").checked = true;
        updatePaymentPanel("CASH");

        // Generate Quick Cash
        generateQuickCashOptions();
        
        // Otomatis focus ke input tunai
        setTimeout(() => cashReceivedInput.focus(), 150);
    }

    function closeCheckout() {
        checkoutModal.classList.remove("active");
    }

    closeCheckoutModal.addEventListener("click", closeCheckout);
    btnCancelCheckout.addEventListener("click", closeCheckout);

    // Toggle Metode Pembayaran
    paymentRadioButtons.forEach(radio => {
        radio.addEventListener("change", () => {
            const method = radio.value;
            
            // Visual Card update
            paymentMethodCards.forEach(card => {
                if (card.querySelector("input").value === method) {
                    card.classList.add("active");
                } else {
                    card.classList.remove("active");
                }
            });

            updatePaymentPanel(method);
        });
    });

    function updatePaymentPanel(method) {
        // Toggle panel kanan modal
        paymentPanels.forEach(panel => {
            if (panel.getAttribute("id") === `payment-panel-${method.toLowerCase()}`) {
                panel.classList.add("active");
            } else {
                panel.classList.remove("active");
            }
        });

        if (method === "CASH") {
            validateCashAmount();
            cashReceivedInput.focus();
        } else if (method === "QRIS") {
            // Setup QRIS image dinamis
            const qrBase = shopProfile.qrisCode || "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=qris-toko";
            qrisImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrBase + '-total-' + calculatedTotal)}`;
            qrisTotalBadgeVal.textContent = formatRupiah(calculatedTotal);
            btnConfirmCheckout.disabled = false; // QRIS siap konfirmasi (kasir validasi manual)
        } else if (method === "TRANSFER") {
            // Setup info transfer bank
            detailBankName.textContent = shopProfile.bankName || "BCA";
            detailBankAccount.textContent = shopProfile.bankAccount || "123-456-7890";
            detailBankOwner.textContent = shopProfile.bankOwner || "Budi Santoso";
            detailBankTotal.textContent = formatRupiah(calculatedTotal);
            btnConfirmCheckout.disabled = false; // Transfer siap konfirmasi
        }
    }

    // Pembayaran Cash - Logic Kembalian & Tombol Cepat
    function generateQuickCashOptions() {
        quickCashContainer.innerHTML = "";
        
        // Pilihan denominasi Rupiah
        const bill = calculatedTotal;
        const notes = [10000, 20000, 50000, 100000];
        
        // Tambahkan opsi uang pas
        const exactBtn = document.createElement("button");
        exactBtn.className = "btn-quick-cash";
        exactBtn.textContent = "Uang Pas";
        exactBtn.addEventListener("click", () => {
            cashReceivedInput.value = bill;
            validateCashAmount();
        });
        quickCashContainer.appendChild(exactBtn);

        // Cari denominasi yang lebih besar dari total tagihan
        notes.forEach(note => {
            if (note > bill) {
                const btn = document.createElement("button");
                btn.className = "btn-quick-cash";
                btn.textContent = formatRupiah(note);
                btn.addEventListener("click", () => {
                    cashReceivedInput.value = note;
                    validateCashAmount();
                });
                quickCashContainer.appendChild(btn);
            }
        });
    }

    cashReceivedInput.addEventListener("input", validateCashAmount);

    function validateCashAmount() {
        const amountReceived = parseInt(cashReceivedInput.value) || 0;
        const bill = calculatedTotal;

        if (amountReceived >= bill) {
            const change = amountReceived - bill;
            cashChangeDisplay.textContent = formatRupiah(change);
            btnConfirmCheckout.disabled = false;
        } else {
            cashChangeDisplay.textContent = "Uang Kurang";
            btnConfirmCheckout.disabled = true;
        }
    }

    // Selesaikan Checkout (Konfirmasi Bayar & Cetak Struk)
    btnConfirmCheckout.addEventListener("click", () => {
        const paymentMethod = document.querySelector("input[name='payment_method']:checked").value;
        const payAmount = paymentMethod === "CASH" ? (parseInt(cashReceivedInput.value) || calculatedTotal) : calculatedTotal;
        const changeAmount = paymentMethod === "CASH" ? Math.max(0, payAmount - calculatedTotal) : 0;
        
        const txId = generateTxId();
        const txTime = new Date().toISOString();

        // Buat Objek Transaksi
        const transaction = {
            id: txId,
            time: txTime,
            items: cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                costPrice: item.costPrice,
                qty: item.qty,
                discount: item.discountAmount
            })),
            subtotal: calculatedSubtotal,
            tax: calculatedTax,
            discount: calculatedDiscount,
            total: calculatedTotal,
            paymentMethod: paymentMethod,
            payAmount: payAmount,
            changeAmount: changeAmount,
            cashier: "Kasir Kelontong"
        };

        // Simpan ke DB & Potong Stok
        const dbResult = AppDB.addTransaction(transaction);

        if (dbResult.success) {
            // Update Tampilan Struk Cetak Thermal
            updateThermalReceiptTemplate(transaction);

            // Tutup modal
            closeCheckout();
            
            // Bersihkan Keranjang
            cart = [];
            summaryDiscountInput.value = "";
            renderCart();
            
            // Cetak struk langsung via browser window.print()
            setTimeout(() => {
                window.print();
                
                // Segarkan katalog (update visual sisa stok)
                renderCatalog();
            }, 300);
        } else {
            alert("Gagal memproses transaksi.");
        }
    });

    // Template printer thermal format 58mm
    function updateThermalReceiptTemplate(tx) {
        // Update header identitas toko dari pengaturan
        receiptShopName.textContent = shopProfile.name.toUpperCase();
        receiptShopAddress.textContent = shopProfile.address;
        receiptShopPhone.textContent = `Telp: ${shopProfile.phone}`;

        // Meta transaksi
        receiptId.textContent = tx.id;
        
        // Format Tanggal
        const dateObj = new Date(tx.time);
        const day = dateObj.getDate().toString().padStart(2, '0');
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const year = dateObj.getFullYear();
        const hrs = dateObj.getHours().toString().padStart(2, '0');
        const mins = dateObj.getMinutes().toString().padStart(2, '0');
        receiptDate.textContent = `${day}-${month}-${year} ${hrs}:${mins}`;

        // Item List
        receiptItemsList.innerHTML = "";
        tx.items.forEach(item => {
            const itemBlock = document.createElement("div");
            itemBlock.className = "receipt-item-block";
            
            const title = document.createElement("span");
            title.className = "receipt-item-title";
            title.textContent = item.name;
            
            const calc = document.createElement("div");
            calc.className = "receipt-item-calc";
            
            const priceAfterDiscount = item.price - item.discount;
            const sub = priceAfterDiscount * item.qty;
            
            // Jika ada diskon per barang, tampilkan info diskon
            if (item.discount > 0) {
                calc.innerHTML = `<span>${item.qty} x Rp${priceAfterDiscount.toLocaleString("id-ID")} (Disc: Rp${item.discount.toLocaleString("id-ID")})</span><span>Rp${sub.toLocaleString("id-ID")}</span>`;
            } else {
                calc.innerHTML = `<span>${item.qty} x Rp${item.price.toLocaleString("id-ID")}</span><span>Rp${sub.toLocaleString("id-ID")}</span>`;
            }

            itemBlock.appendChild(title);
            itemBlock.appendChild(calc);
            receiptItemsList.appendChild(itemBlock);
        });

        // Ringkasan
        receiptSubtotal.textContent = formatRupiah(tx.subtotal);
        receiptTax.textContent = formatRupiah(tx.tax);
        receiptDiscount.textContent = formatRupiah(tx.discount);
        receiptTotal.textContent = formatRupiah(tx.total);
        receiptPaymentMethod.textContent = tx.paymentMethod;
        receiptPayAmount.textContent = formatRupiah(tx.payAmount);
        receiptChange.textContent = formatRupiah(tx.changeAmount);
    }

    // trigger checkout button click
    checkoutBtn.addEventListener("click", openCheckout);


    // 9. INVENTARIS BARANG (CRUD)
    function renderInventoryTable() {
        const products = AppDB.getProducts();
        const query = inventorySearchInput.value.toLowerCase().trim();

        // Filter pencarian
        const filtered = products.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.id.toLowerCase().includes(query) || 
            (p.barcode && p.barcode.includes(query))
        );

        inventoryList.innerHTML = "";

        if (filtered.length === 0) {
            inventoryList.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; color: var(--text-secondary);">
                        Belum ada data produk terdaftar.
                    </td>
                </tr>`;
            return;
        }

        filtered.forEach(p => {
            const row = document.createElement("tr");
            
            // Hitung keuntungan & margin
            const profit = p.price - p.costPrice;
            const marginPct = p.costPrice > 0 ? Math.round((profit / p.price) * 100) : 100;

            row.innerHTML = `
                <td><strong>${p.id}</strong></td>
                <td>${p.name}</td>
                <td><span class="text-secondary font-mono" style="font-size:12px;">${p.barcode || '-'}</span></td>
                <td><span class="badge ${getCategoryBadgeClass(p.category)}">${p.category}</span></td>
                <td class="font-mono">${formatRupiah(p.costPrice)}</td>
                <td class="font-mono">${formatRupiah(p.price)}</td>
                <td>
                    <span class="text-emerald" style="font-size:12px; font-weight:600;">+${formatRupiah(profit)}</span> 
                    <small class="text-secondary">(${marginPct}%)</small>
                </td>
                <td class="font-mono ${p.stock <= 5 ? 'text-rose font-bold' : ''}">${p.stock} pcs</td>
                <td>
                    <button class="btn-icon edit" data-id="${p.id}" title="Edit"><i data-lucide="edit-3"></i></button>
                    <button class="btn-icon delete" data-id="${p.id}" title="Hapus"><i data-lucide="trash-2"></i></button>
                </td>
            `;

            // Attach actions
            row.querySelector(".edit").addEventListener("click", () => openProductModal(p.id));
            row.querySelector(".delete").addEventListener("click", () => handleDeleteProduct(p.id));

            inventoryList.appendChild(row);
        });

        lucide.createIcons();
    }

    function getCategoryBadgeClass(cat) {
        if (cat === "Sembako") return "badge-sembako";
        if (cat === "Makanan & Minuman") return "badge-makanan";
        if (cat === "Kebutuhan Rumah") return "badge-kebutuhan";
        if (cat === "Rokok & Korek") return "badge-rokok";
        return "badge-lain";
    }

    inventorySearchInput.addEventListener("input", renderInventoryTable);

    // CRUD - MODAL BUKA
    function openProductModal(productId = null) {
        editingProductId = productId;
        productModal.classList.add("active");

        if (productId) {
            // Mode EDIT produk
            productModalTitle.textContent = "Ubah Produk";
            const products = AppDB.getProducts();
            const prod = products.find(p => p.id === productId);
            if (prod) {
                prodIdInput.value = prod.id;
                prodIdInput.disabled = true; // ID tidak boleh diedit
                prodBarcodeInput.value = prod.barcode || "";
                prodNameInput.value = prod.name;
                prodCategoryInput.value = prod.category;
                prodStockInput.value = prod.stock;
                prodCostInput.value = prod.costPrice;
                prodPriceInput.value = prod.price;
            }
        } else {
            // Mode TAMBAH produk baru
            productModalTitle.textContent = "Tambah Produk Baru";
            productForm.reset();
            prodIdInput.disabled = false;
            
            // Auto generate ID produk baru
            const products = AppDB.getProducts();
            const nextIndex = products.length + 1;
            prodIdInput.value = "P" + nextIndex.toString().padStart(3, '0');
            prodBarcodeInput.focus();
        }
    }

    function closeProduct() {
        productModal.classList.remove("active");
        editingProductId = null;
    }

    addProductBtn.addEventListener("click", () => openProductModal());
    closeProductModal.addEventListener("click", closeProduct);
    btnCancelProduct.addEventListener("click", closeProduct);

    // Form Save Product
    productForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const product = {
            id: prodIdInput.value.trim(),
            barcode: prodBarcodeInput.value.trim(),
            name: prodNameInput.value.trim(),
            category: prodCategoryInput.value,
            stock: parseInt(prodStockInput.value) || 0,
            costPrice: parseInt(prodCostInput.value) || 0,
            price: parseInt(prodPriceInput.value) || 0
        };

        if (editingProductId) {
            // Simpan Update
            const result = AppDB.updateProduct(product);
            if (result.success) {
                closeProduct();
                renderInventoryTable();
            } else {
                alert(result.message);
            }
        } else {
            // Tambah Baru
            const result = AppDB.addProduct(product);
            if (result.success) {
                closeProduct();
                renderInventoryTable();
            } else {
                alert(result.message);
            }
        }
    });

    // Delete Product Action
    function handleDeleteProduct(productId) {
        if (confirm(`Apakah Anda yakin ingin menghapus produk dengan ID: ${productId}?`)) {
            const result = AppDB.deleteProduct(productId);
            if (result.success) {
                renderInventoryTable();
            } else {
                alert(result.message);
            }
        }
    }


    // 10. LAPORAN & RIWAYAT TRANSAKSI
    function renderReportsAndHistory() {
        const transactions = AppDB.getTransactions();
        const products = AppDB.getProducts();

        // 1. Hitung Statistik Ringkasan
        let totalRevenue = 0;
        let totalProfit = 0;
        let lowStockCount = products.filter(p => p.stock <= 5).length;

        transactions.forEach(tx => {
            totalRevenue += tx.total;
            
            // Hitung Profit: Pendapatan - Harga Beli Modal - diskon
            let txProfit = 0;
            tx.items.forEach(item => {
                const profitPerItem = item.price - item.costPrice - item.discount;
                txProfit += (profitPerItem * item.qty);
            });
            // Dikurangi diskon global proporsional (opsional, untuk kemudahan laba bersih sederhana: kurangi total diskon struk dari profit)
            totalProfit += (txProfit - tx.discount);
        });

        // Set Nilai Stat di UI
        statRevenue.textContent = formatRupiah(totalRevenue);
        statProfit.textContent = formatRupiah(totalProfit);
        statTxCount.textContent = transactions.length;
        statLowStock.textContent = lowStockCount;

        // 2. Render Daftar Riwayat
        historyList.innerHTML = "";

        if (transactions.length === 0) {
            historyList.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; color: var(--text-secondary);">
                        Belum ada transaksi terekam.
                    </td>
                </tr>`;
            return;
        }

        transactions.forEach(tx => {
            const row = document.createElement("tr");
            
            // Hitung total item qty
            const itemQtySum = tx.items.reduce((sum, i) => sum + i.qty, 0);

            // Format tanggal
            const dateObj = new Date(tx.time);
            const timeStr = dateObj.toLocaleDateString("id-ID") + " " + dateObj.toLocaleTimeString("id-ID", {hour: '2-digit', minute:'2-digit'});

            row.innerHTML = `
                <td><strong class="font-mono">${tx.id}</strong></td>
                <td>${timeStr}</td>
                <td>${itemQtySum} barang</td>
                <td class="font-mono text-emerald font-bold">${formatRupiah(tx.total)}</td>
                <td><span class="badge ${tx.paymentMethod === 'CASH' ? 'badge-sembako' : (tx.paymentMethod === 'QRIS' ? 'badge-kebutuhan' : 'badge-makanan')}">${tx.paymentMethod}</span></td>
                <td>${tx.cashier}</td>
                <td>
                    <button class="btn-secondary reprint-btn" data-id="${tx.id}" style="padding: 6px 12px; font-size:12px;">
                        <i data-lucide="printer" style="width:14px; height:14px; margin-right:4px;"></i> Cetak
                    </button>
                </td>
            `;

            row.querySelector(".reprint-btn").addEventListener("click", () => reprintTransactionReceipt(tx.id));

            historyList.appendChild(row);
        });

        lucide.createIcons();
    }

    // Cetak ulang struk dari riwayat
    function reprintTransactionReceipt(txId) {
        const transactions = AppDB.getTransactions();
        const tx = transactions.find(t => t.id === txId);
        if (tx) {
            updateThermalReceiptTemplate(tx);
            setTimeout(() => {
                window.print();
            }, 200);
        } else {
            alert("Transaksi tidak ditemukan.");
        }
    }


    // 11. PENGATURAN APLIKASI
    function loadSettingsForm() {
        shopProfile = AppDB.getShopProfile();

        // Profil
        shopNameInput.value = shopProfile.name || "";
        shopAddressInput.value = shopProfile.address || "";
        shopPhoneInput.value = shopProfile.phone || "";

        // Rekening & QRIS
        bankNameInput.value = shopProfile.bankName || "";
        bankAccountInput.value = shopProfile.bankAccount || "";
        bankOwnerInput.value = shopProfile.bankOwner || "";
        qrisLinkInput.value = shopProfile.qrisCode || "";
        
        // Update header & badge
        shopNameBrand.textContent = shopProfile.name;
        storeBadgeName.textContent = `${shopProfile.name} (Offline)`;
    }

    // Simpan Profil
    settingsProfileForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const profile = {
            ...shopProfile,
            name: shopNameInput.value.trim(),
            address: shopAddressInput.value.trim(),
            phone: shopPhoneInput.value.trim()
        };

        AppDB.saveShopProfile(profile);
        shopProfile = profile;
        
        // Update UI
        loadSettingsForm();
        alert("Profil toko berhasil diperbarui!");
    });

    // Simpan Info Bank & QRIS
    settingsPaymentForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const profile = {
            ...shopProfile,
            bankName: bankNameInput.value.trim(),
            bankAccount: bankAccountInput.value.trim(),
            bankOwner: bankOwnerInput.value.trim(),
            qrisCode: qrisLinkInput.value.trim()
        };

        AppDB.saveShopProfile(profile);
        shopProfile = profile;

        loadSettingsForm();
        alert("Informasi rekening & QRIS berhasil diperbarui!");
    });

    // Database Actions: Export
    btnExportDb.addEventListener("click", () => {
        AppDB.exportData();
    });

    // Database Actions: Import
    importDbInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const contents = event.target.result;
            const result = AppDB.importData(contents);
            alert(result.message);
            if (result.success) {
                // Reload halaman aktif
                switchTab(currentTab);
            }
        };
        reader.readAsText(file);
    });

    // Database Actions: Reset
    btnResetDb.addEventListener("click", () => {
        if (confirm("PERINGATAN! Ini akan menghapus data penjualan dan barang Anda selamanya. Apakah Anda yakin?")) {
            const result = AppDB.resetAllData();
            alert(result.message);
            if (result.success) {
                cart = [];
                summaryDiscountInput.value = "";
                switchTab("pos");
            }
        }
    });

    // 12. RUN INITIAL VIEW
    renderCatalog();
});

// 13. REGISTER PWA SERVICE WORKER
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js")
            .then(reg => console.log("Service Worker terdaftar!", reg))
            .catch(err => console.error("Gagal mendaftarkan Service Worker:", err));
    });
}
