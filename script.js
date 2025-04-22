// --- State Variables ---
let sales = [];
let models = [];
let currentEditSaleId = null;
let currentEditModelId = null;
let currentSort = 'date-desc';
let currentSearchTerm = '';
let currentModelSearchTerm = '';
let currentScreen = 'homeScreen';
let selectedMonth = ''; // For month filter
let notificationTimeout = null;
let confirmationCallback = null;

// --- LocalStorage Keys ---
const SALES_STORAGE_KEY = 'mobileSalesData';
const MODELS_STORAGE_KEY = 'mobileModelsList';
const SORT_STORAGE_KEY = 'mobileSalesSort';
const MONTH_FILTER_KEY = 'mobileSalesMonthFilter'; // For month filter

// --- DOM Elements ---
let appContainer, homeScreen, modelListScreen, screens, navHomeBtn, navModelsBtn, navButtons,
    saleListContainer, valueLabelEl, volumeLabelEl, incentiveLabelEl,
    overallValueEl, overallVolumeEl, overallIncentiveEl, noSalesText,
    // Controls moved to menu - references updated/added
    searchInput, sortOptions, monthFilter, // These will now point to elements inside the menu
    exportCsvBtn, backupBtn, restoreBtn, restoreFileInput, // These will now point to elements inside the menu
    quickAddBtn, modelListContainer, noModelsText,
    modelSearchInput, openModelModalBtn, addEditSaleModal, addEditSaleForm, saveSaleBtn,
    cancelSaleBtn, closeSaleModalBtn, saleDateInput, saleModalTitle,
    saleIdInput, saleModelNameInput, saleModelNameInputDisplay, saleModelSuggestionsContainer,
    selectedModelIdInput, salePriceInput, saleIncentiveInput,
    saleImeiInput, scanImeiBtn, saleSelloutSupportInput, saleUpgradeInput,
    modelModal, modelForm, modelModalTitle, closeModelModalBtn, modelIdInput,
    modelNameInput, modelPriceInput, modelIncentiveInput, cancelModelBtn, saveModelBtn,
    quickAddSection, quickAddModelNameInput, quickAddModelSuggestions, cancelQuickAddBtn,
    notificationArea,
    confirmationModal, confirmationTitle, confirmationMessage, confirmOkBtn, confirmCancelBtn,
    // Menu Elements
    menuToggleBtn, sideMenu, closeMenuBtn, menuOverlay;


/**
 * Selects and assigns all necessary DOM elements to variables.
 */
function initializeDOMElements() {
    appContainer = document.getElementById('appContainer');
    homeScreen = document.getElementById('homeScreen');
    modelListScreen = document.getElementById('modelListScreen');
    screens = { homeScreen, modelListScreen };
    navHomeBtn = document.getElementById('navHomeBtn');
    navModelsBtn = document.getElementById('navModelsBtn');
    navButtons = [navHomeBtn, navModelsBtn];

    // Notification & Confirmation
    notificationArea = document.getElementById('notificationArea');
    confirmationModal = document.getElementById('confirmationModal');
    confirmationTitle = document.getElementById('confirmationTitle');
    confirmationMessage = document.getElementById('confirmationMessage');
    confirmOkBtn = document.getElementById('confirmOkBtn');
    confirmCancelBtn = document.getElementById('confirmCancelBtn');

    // Home Screen Elements (Main content)
    saleListContainer = document.getElementById("saleListContainer");
    valueLabelEl = document.getElementById("valueLabel");
    volumeLabelEl = document.getElementById("volumeLabel");
    incentiveLabelEl = document.getElementById("incentiveLabel");
    overallValueEl = document.getElementById("overallValue");
    overallVolumeEl = document.getElementById("overallVolume");
    overallIncentiveEl = document.getElementById("overallIncentive");
    noSalesText = document.getElementById("noSalesText");
    quickAddBtn = document.getElementById("quickAddBtn");

    // Controls (Now inside the side menu) - Ensure IDs match HTML
    searchInput = document.getElementById("searchInputMenu");
    sortOptions = document.getElementById("sortOptionsMenu");
    monthFilter = document.getElementById("monthFilterMenu");
    exportCsvBtn = document.getElementById("exportCsvBtnMenu");
    backupBtn = document.getElementById("backupBtnMenu");
    restoreBtn = document.getElementById("restoreBtnMenu");
    restoreFileInput = document.getElementById("restoreFileMenu");

    // Model List Screen Elements
    modelListContainer = document.getElementById("modelListContainer");
    noModelsText = document.getElementById("noModelsText");
    modelSearchInput = document.getElementById("modelSearchInput");
    openModelModalBtn = document.getElementById("openModelModalBtn");

    // Sale Add/Edit Modal Elements
    addEditSaleModal = document.getElementById("addEditSaleModal");
    addEditSaleForm = document.getElementById("addEditSaleForm");
    saveSaleBtn = document.getElementById("saveSaleBtn");
    cancelSaleBtn = document.getElementById("cancelSaleBtn");
    closeSaleModalBtn = document.getElementById("closeSaleModalBtn");
    saleDateInput = document.getElementById("saleDate");
    saleModalTitle = document.getElementById("saleModalTitle");
    saleIdInput = document.getElementById("saleId");
    saleModelNameInputDisplay = document.getElementById("saleModelNameInput");
    saleModelNameInput = document.getElementById("saleModelName");
    selectedModelIdInput = document.getElementById("selectedModelId");
    saleModelSuggestionsContainer = document.getElementById("saleModelSuggestions");
    salePriceInput = document.getElementById("salePrice");
    saleIncentiveInput = document.getElementById("saleIncentive");
    saleImeiInput = document.getElementById("saleImei");
    scanImeiBtn = document.getElementById("scanImeiBtn");
    saleSelloutSupportInput = document.getElementById("saleSelloutSupport");
    saleUpgradeInput = document.getElementById("saleUpgrade");

    // Model Add/Edit Modal Elements
    modelModal = document.getElementById("modelModal");
    modelForm = document.getElementById("modelForm");
    modelModalTitle = document.getElementById("modelModalTitle");
    closeModelModalBtn = document.getElementById("closeModelModalBtn");
    modelIdInput = document.getElementById("modelId");
    modelNameInput = document.getElementById("modelNameInput");
    modelPriceInput = document.getElementById("modelPriceInput");
    modelIncentiveInput = document.getElementById("modelIncentiveInput");
    cancelModelBtn = document.getElementById("cancelModelBtn");
    saveModelBtn = document.getElementById("saveModelBtn");

    // Quick Add Elements
    quickAddSection = document.getElementById("quickAddSection");
    quickAddModelNameInput = document.getElementById("quickAddModelNameInput");
    quickAddModelSuggestions = document.getElementById("quickAddModelSuggestions");
    cancelQuickAddBtn = document.getElementById("cancelQuickAddBtn");

    // Menu Elements
    menuToggleBtn = document.getElementById("menuToggleBtn");
    sideMenu = document.getElementById("sideMenu");
    closeMenuBtn = document.getElementById("closeMenuBtn");
    menuOverlay = document.getElementById("menuOverlay");

    console.log("DOM elements initialized.");
}

// --- Utility Functions ---
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
const formatCurrency = (amount) => { const num = Number(amount); return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(isNaN(num) ? 0 : num); };
const formatDate = (dateString) => { try { return new Date(dateString + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric'}); } catch (e) { return "Invalid Date"; } };
const getCurrentMonthYYYYMM = () => { const now = new Date(); return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`; };
const formatMonthYearForLabel = (yyyyMM) => { if (!yyyyMM || yyyyMM === 'all') return 'Overall'; try { const [y, m] = yyyyMM.split('-'); return new Date(y, m - 1, 1).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }); } catch (e) { return yyyyMM; } };
const formatMonthYearForDropdown = (yyyyMM) => { if (!yyyyMM || yyyyMM === 'all') return 'All Months'; try { const [y, m] = yyyyMM.split('-'); return new Date(y, m - 1, 1).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }); } catch (e) { return yyyyMM; } };

// --- Notification System ---
function showNotification(message, type = 'info', duration = 3000) { if (!notificationArea) return; if (notificationTimeout) clearTimeout(notificationTimeout); notificationArea.textContent = message; notificationArea.className = 'fixed top-0 left-1/2 transform -translate-x-1/2 w-11/12 max-w-md p-3 mt-4 rounded-md shadow-lg text-center text-white z-[60] animate-fadeIn'; switch (type) { case 'success': notificationArea.classList.add('bg-green-500'); break; case 'error': notificationArea.classList.add('bg-red-500'); break; case 'info': default: notificationArea.classList.add('bg-blue-500'); break; } notificationArea.style.opacity = 1; notificationTimeout = setTimeout(() => { notificationArea.style.opacity = 0; setTimeout(() => notificationArea.classList.add('hidden'), 500); }, duration); }

// --- Confirmation Modal ---
function showConfirmation(message, onConfirm, title = 'Confirm Action', okButtonClass = 'bg-red-600 hover:bg-red-700') { if (!confirmationModal) return; confirmationMessage.textContent = message; confirmationTitle.textContent = title; confirmationCallback = onConfirm; confirmOkBtn.className = `py-2 px-4 text-white rounded-md transition duration-150 ease-in-out ${okButtonClass}`; confirmationModal.classList.remove('hidden'); }
function hideConfirmation() { if (confirmationModal) confirmationModal.classList.add('hidden'); confirmationCallback = null; }

// --- Navigation ---
function showScreen(screenId) { console.log("Showing screen:", screenId); currentScreen = screenId; if (!screens || !quickAddBtn || !quickAddSection || !navButtons) return; Object.values(screens).forEach(s => s.classList.add('hidden')); if (screens[screenId]) screens[screenId].classList.remove('hidden'); navButtons.forEach(b => { b.classList.toggle('active', b.dataset.screen === screenId); b.classList.toggle('hover:bg-indigo-100', b.dataset.screen !== screenId); }); quickAddBtn.classList.toggle('hidden', screenId !== 'homeScreen' || !quickAddSection.classList.contains('hidden')); }

// --- Hamburger Menu Logic --- (NEW)
/** Opens the side menu */
function openMenu() {
    if (!sideMenu || !menuOverlay) return;
    menuOverlay.classList.remove('hidden');
    menuOverlay.classList.add('opacity-100'); // Fade in overlay
    sideMenu.classList.remove('translate-x-full');
    sideMenu.classList.add('translate-x-0');
    console.log("Menu opened");
}

/** Closes the side menu */
function closeMenu() {
    if (!sideMenu || !menuOverlay) return;
    menuOverlay.classList.remove('opacity-100');
    menuOverlay.classList.add('opacity-0'); // Fade out overlay
    sideMenu.classList.remove('translate-x-0');
    sideMenu.classList.add('translate-x-full');
    // Hide overlay after transition
    setTimeout(() => {
        menuOverlay.classList.add('hidden');
    }, 300); // Match transition duration
    console.log("Menu closed");
}


// --- Sale Modal Handling ---
function openSaleModal(mode = 'add', data = null) { console.log("Open Sale Modal. Mode:", mode, "Data:", data); addEditSaleForm.reset(); saleModalTitle.textContent = mode === 'edit' ? "Edit Sale" : "Add New Sale"; saleIdInput.value = ''; saleDateInput.value = new Date().toISOString().split("T")[0]; saleModelNameInputDisplay.value = ''; saleModelNameInput.value = ''; selectedModelIdInput.value = ''; saleModelSuggestionsContainer.innerHTML = ''; saleModelSuggestionsContainer.classList.add('hidden'); saleImeiInput.value = ''; saleSelloutSupportInput.value = '0'; saleUpgradeInput.value = '0'; salePriceInput.placeholder = "Auto-filled from model"; saleIncentiveInput.placeholder = "Auto-filled from model"; currentEditSaleId = null; if (mode === 'edit' && data) { const sale = sales.find(s => s.id === data); if (!sale) { showNotification("Error: Sale not found.", "error"); return; } saleIdInput.value = sale.id; saleDateInput.value = sale.date; saleModelNameInputDisplay.value = sale.modelName; saleModelNameInput.value = sale.modelName; const model = models.find(m => m.name === sale.modelName); selectedModelIdInput.value = model ? model.id : ''; salePriceInput.value = sale.price; saleIncentiveInput.value = sale.incentive; saleImeiInput.value = sale.imei || ''; saleSelloutSupportInput.value = sale.selloutSupport || '0'; saleUpgradeInput.value = sale.upgrade || '0'; currentEditSaleId = sale.id; } else if (mode === 'prefill' && data) { saleModelNameInputDisplay.value = data.name; saleModelNameInput.value = data.name; selectedModelIdInput.value = data.id; salePriceInput.value = data.price; saleIncentiveInput.value = data.incentive; saleModalTitle.textContent = "Add New Sale"; } addEditSaleModal.classList.remove('hidden'); setTimeout(() => { (mode === 'prefill' ? saleDateInput : saleModelNameInputDisplay).focus(); }, 50); }
function closeSaleModal() { addEditSaleModal.classList.add('hidden'); addEditSaleForm.reset(); if(saleModelSuggestionsContainer) { saleModelSuggestionsContainer.innerHTML = ''; saleModelSuggestionsContainer.classList.add('hidden'); } currentEditSaleId = null; }

 // --- Model Modal Handling ---
function openModelModal(mode = 'add', data = null, prefillName = null) { console.log("Open Model Modal. Mode:", mode, "Data:", data, "Prefill:", prefillName); modelForm.reset(); currentEditModelId = null; modelModalTitle.textContent = mode === 'edit' ? "Edit Model" : "Add New Model"; modelIdInput.value = ''; if (mode === 'edit' && data) { const model = models.find(m => m.id === data); if (!model) { showNotification("Error: Model not found.", "error"); return; } Object.assign(modelIdInput, { value: model.id }); Object.assign(modelNameInput, { value: model.name }); Object.assign(modelPriceInput, { value: model.price }); Object.assign(modelIncentiveInput, { value: model.incentive }); currentEditModelId = model.id; } else if (prefillName) { modelNameInput.value = prefillName; modelModalTitle.textContent = "Add New Model"; } modelModal.classList.remove('hidden'); setTimeout(() => { (prefillName ? modelPriceInput : modelNameInput).focus(); }, 50); }
function closeModelModal() { modelModal.classList.add('hidden'); modelForm.reset(); currentEditModelId = null; }

// --- Data Handling (Sales) ---
function loadSales() { const d=localStorage.getItem(SALES_STORAGE_KEY);sales=[];if(d){try{const p=JSON.parse(d);if(Array.isArray(p)){sales=p.map(s=>({id:s.id||generateId(),date:(s.date&&s.date.match(/^\d{4}-\d{2}-\d{2}$/))?s.date:new Date().toISOString().split("T")[0],modelName:String(s.modelName||'').trim(),price:Number(s.price)||0,incentive:Number(s.incentive)||0,imei:s.imei||'',selloutSupport:Number(s.selloutSupport)||0,upgrade:Number(s.upgrade)||0}));}}catch(e){console.error("Error parsing sales:",e);localStorage.removeItem(SALES_STORAGE_KEY);}} currentSort=localStorage.getItem(SORT_STORAGE_KEY)||'date-desc';if(sortOptions)sortOptions.value=currentSort;const m=localStorage.getItem(MONTH_FILTER_KEY);const v=m&&(m==='all'||m.match(/^\d{4}-\d{2}$/));selectedMonth=v?m:getCurrentMonthYYYYMM();console.log("Sales loaded:",sales.length,"Selected month:",selectedMonth);}
function saveSales() { try{localStorage.setItem(SALES_STORAGE_KEY,JSON.stringify(sales));}catch(e){console.error("Error saving data:",e);showNotification("Error saving data.","error",5000);} localStorage.setItem(SORT_STORAGE_KEY,currentSort);localStorage.setItem(MONTH_FILTER_KEY,selectedMonth);}
function addOrUpdateSale() { const d={id:saleIdInput.value||generateId(),date:saleDateInput.value,modelName:saleModelNameInput.value.trim(),price:parseFloat(salePriceInput.value)||0,incentive:parseFloat(saleIncentiveInput.value)||0,imei:saleImeiInput.value.trim(),selloutSupport:parseFloat(saleSelloutSupportInput.value)||0,upgrade:parseFloat(saleUpgradeInput.value)||0};if(!d.date||!d.modelName||!d.price||!d.incentive){showNotification("Please fill all mandatory fields (*).","error");return;} if(!d.date.match(/^\d{4}-\d{2}-\d{2}$/)){showNotification("Invalid date format.","error");return;} if(d.modelName&&!models.some(m=>m.name===d.modelName)){showNotification(`Model "${d.modelName}" not found. Select valid model.`,"error");return;} let u=false;if(currentEditSaleId){const i=sales.findIndex(s=>s.id===currentEditSaleId);if(i!==-1){sales[i]=d;u=true;}else{sales.push(d);}}else{sales.push(d);} console.log(u?"Sale updated:":"Sale added:",d.id);updateUI();closeSaleModal();showNotification(u?"Sale updated!":"Sale added!","success");}
function confirmDeleteSale(id) { if(!id)return;const s=sales.find(s=>s.id===id);if(!s){showNotification("Sale not found.","error");return;} showConfirmation(`Delete sale for "${s.modelName}" on ${formatDate(s.date)}?`,()=>{sales=sales.filter(s=>s.id!==id);showNotification("Sale deleted!","success");updateUI();hideConfirmation();},'Delete Sale','bg-red-600 hover:bg-red-700');}

// --- Data Handling (Models) ---
function loadModels() { const d=localStorage.getItem(MODELS_STORAGE_KEY);models=[];if(d){try{const p=JSON.parse(d);if(Array.isArray(p)){models=p.map(m=>({id:m.id||generateId(),name:String(m.name||'').trim(),price:Number(m.price)||0,incentive:Number(m.incentive)||0})).filter(m=>m.name);}}catch(e){localStorage.removeItem(MODELS_STORAGE_KEY);}} console.log("Models loaded:",models.length);}
function saveModels() { try{localStorage.setItem(MODELS_STORAGE_KEY,JSON.stringify(models));console.log("Models saved.");}catch(e){console.error("Error saving models:",e);showNotification("Could not save models list.","error");}}
function addOrUpdateModel() { const d={id:modelIdInput.value||generateId(),name:modelNameInput.value.trim(),price:parseFloat(modelPriceInput.value)||0,incentive:parseFloat(modelIncentiveInput.value)||0};if(!d.name){showNotification("Model Name required.","error");return;} const ex=models.find(m=>m.name.toLowerCase()===d.name.toLowerCase()&&m.id!==d.id);if(ex){showNotification(`Model name "${d.name}" already exists.`,"error");return;} let u=false;if(currentEditModelId){const i=models.findIndex(m=>m.id===currentEditModelId);if(i!==-1){models[i]=d;u=true;}else{models.push(d);}}else{models.push(d);} console.log(u?"Model updated:":"Model added:",d.id);saveModels();renderModelList();closeModelModal();showNotification(u?"Model updated!":"Model added!","success");}
function confirmDeleteModel(id) { if(!id)return;const m=models.find(m=>m.id===id);if(!m){showNotification("Model not found.","error");return;} showConfirmation(`Delete model "${m.name}"?`,()=>{models=models.filter(m=>m.id!==id);saveModels();renderModelList();showNotification("Model deleted!","success");hideConfirmation();},'Delete Model','bg-red-600 hover:bg-red-700');}

// --- Model Selection Logic ---
function selectModelForSale(modelId) { const model=models.find(m=>m.id===modelId);if(model){showScreen('homeScreen');openSaleModal('prefill',model);}else{showNotification("Error: Selected model not found.","error");}}

// --- Quick Add Workflow ---
function toggleQuickAdd(show=true){if(!quickAddSection||!quickAddBtn)return;if(show){quickAddSection.classList.remove('hidden');quickAddBtn.classList.add('hidden');quickAddModelNameInput.value='';quickAddModelSuggestions.innerHTML='';quickAddModelNameInput.focus();}else{quickAddSection.classList.add('hidden');quickAddModelNameInput.value='';quickAddModelSuggestions.innerHTML='';quickAddBtn.classList.toggle('hidden',currentScreen!=='homeScreen');}}
function quickAddSale(model){if(!model)return;const s={id:generateId(),date:new Date().toISOString().split("T")[0],modelName:model.name,price:model.price,incentive:model.incentive,imei:'',selloutSupport:0,upgrade:0};sales.push(s);console.log("Quick Add sale:",s.id);updateUI();toggleQuickAdd(false);showNotification(`Sale added for ${model.name}.`,"success");}

// --- Sorting, Filtering, Grouping ---
function sortSales(salesToSort){const d=[...salesToSort];const[s,o]=currentSort.split('-');d.sort((a,b)=>{let c=0;const k=s==='name'?'modelName':s;const vA=a?.[k];const vB=b?.[k];try{if(s==='date'){const dA=new Date(vA+'T00:00:00');const dB=new Date(vB+'T00:00:00');if(!isNaN(dA)&&!isNaN(dB))c=dA-dB;else if(!isNaN(dA))c=-1;else if(!isNaN(dB))c=1;}else if(s==='price'||s==='incentive'){c=(Number(vA)||0)-(Number(vB)||0);}else if(s==='name'){c=String(vA||'').localeCompare(String(vB||''));}}catch(e){} return o==='asc'?(c||0):-(c||0);});return d;}
function filterSales(salesToFilter){if(!currentSearchTerm)return salesToFilter;const t=currentSearchTerm.toLowerCase();return salesToFilter.filter(s=>s?.modelName?.toLowerCase().includes(t));}
function filterModels(modelsToFilter){if(!currentModelSearchTerm)return modelsToFilter;const t=currentModelSearchTerm.toLowerCase();return modelsToFilter.filter(m=>m?.name?.toLowerCase().includes(t));}
function groupSalesByDate(salesToGroup){return salesToGroup.reduce((a,s)=>{const d=s.date;if(!d)return a;(a[d]=a[d]||[]).push(s);return a;},{});}

// --- Month Filtering ---
function populateMonthFilter(){if(!monthFilter)return;const c=selectedMonth;const m=new Set();sales.forEach(s=>{if(s?.date?.length>=7)m.add(s.date.substring(0,7));});m.add(getCurrentMonthYYYYMM());const s=Array.from(m).sort().reverse();monthFilter.innerHTML=`<option value="all">${formatMonthYearForDropdown('all')}</option>`;s.forEach(m=>monthFilter.innerHTML+=`<option value="${m}">${formatMonthYearForDropdown(m)}</option>`);monthFilter.value=c;if(!monthFilter.querySelector(`option[value="${c}"]`)){monthFilter.value=getCurrentMonthYYYYMM();if(!monthFilter.querySelector(`option[value="${getCurrentMonthYYYYMM()}"]`))monthFilter.value='all';}}

// --- CSV Export ---
function escapeCsvCell(c){const s=String(c??'');return(s.includes(',')||s.includes('\n')||s.includes('"'))?`"${s.replace(/"/g,'""')}"`:s;}
function exportFilteredSalesToCsv(f){let m=sales;if(selectedMonth&&selectedMonth!=='all')m=sales.filter(s=>s?.date?.startsWith(selectedMonth));let d=sortSales(filterSales(m));if(!d.length){showNotification("No data for current filter.","info");return;}const h=["Date","Model Name","Price","Incentive","IMEI","Sellout Support","Upgrade"];const r=[h.join(','),...d.map(s=>[escapeCsvCell(s.date),escapeCsvCell(s.modelName),escapeCsvCell(s.price),escapeCsvCell(s.incentive),escapeCsvCell(s.imei),escapeCsvCell(s.selloutSupport),escapeCsvCell(s.upgrade)].join(','))];const c=r.join('\n');const b=new Blob([c],{type:'text/csv;charset=utf-8;'});const l=document.createElement("a");if(l.download!==undefined){const u=URL.createObjectURL(b);l.setAttribute("href",u);l.setAttribute("download",f);l.style.visibility='hidden';document.body.appendChild(l);l.click();document.body.removeChild(l);URL.revokeObjectURL(u);showNotification("Filtered data exported.","success");}else{showNotification("CSV export not supported.","error");}}

// --- Data Backup & Restore ---
function backupData(){try{const d={sales:sales,models:models};const j=JSON.stringify(d,null,2);const b=new Blob([j],{type:'application/json'});const t=new Date().toISOString().split('T')[0];const f=`sales_backup_${t}.json`;const l=document.createElement("a");if(l.download!==undefined){const u=URL.createObjectURL(b);l.setAttribute("href",u);l.setAttribute("download",f);l.style.visibility='hidden';document.body.appendChild(l);l.click();document.body.removeChild(l);URL.revokeObjectURL(u);showNotification("Backup successful!","success");}else{showNotification("Backup download not supported.","error");}}catch(e){console.error("Backup error:",e);showNotification("Error creating backup.","error");}}
function handleRestoreFile(e){const f=e.target.files[0];if(!f){showNotification("No file selected.","info");return;}if(!f.name.toLowerCase().endsWith('.json')){showNotification("Invalid file type. Select '.json' file.","error");e.target.value=null;return;}const r=new FileReader();r.onload=(ev)=>{try{const d=JSON.parse(ev.target.result);if(typeof d!=='object'||!Array.isArray(d.sales)||!Array.isArray(d.models))throw new Error("Invalid backup structure.");showConfirmation(`Restore from "${f.name}"? This overwrites current data.`,()=>{console.log("Restoring...");sales=d.sales.map(s=>({id:s.id||generateId(),date:(s.date&&s.date.match(/^\d{4}-\d{2}-\d{2}$/))?s.date:new Date().toISOString().split("T")[0],modelName:String(s.modelName||'').trim(),price:Number(s.price)||0,incentive:Number(s.incentive)||0,imei:s.imei||'',selloutSupport:Number(s.selloutSupport)||0,upgrade:Number(s.upgrade)||0}));models=d.models.map(m=>({id:m.id||generateId(),name:String(m.name||'').trim(),price:Number(m.price)||0,incentive:Number(m.incentive)||0})).filter(m=>m.name);saveSales();saveModels();updateUI();renderModelList();showNotification("Data restored!","success");hideConfirmation();},'Confirm Restore','bg-yellow-500 hover:bg-yellow-600');}catch(err){console.error("Restore error:",err);showNotification(`Error restoring: ${err.message}`,"error",5000);}finally{e.target.value=null;}};r.onerror=(ev)=>{console.error("File read error:",ev);showNotification("Error reading backup file.","error");e.target.value=null;};r.readAsText(f);}

// --- UI Update (Home Screen) ---
function updateUI(){saveSales();let m=sales;if(selectedMonth&&selectedMonth!=='all')m=sales.filter(s=>s?.date?.startsWith(selectedMonth));let v=0,o=0,i=0;m.forEach(s=>{v+=s.price;i+=s.incentive;o++;});const l=formatMonthYearForLabel(selectedMonth);valueLabelEl.textContent=`${l} Value`;volumeLabelEl.textContent=`${l} Volume`;incentiveLabelEl.textContent=`${l} Earning`;overallValueEl.innerText=formatCurrency(v);overallVolumeEl.innerText=o;overallIncentiveEl.innerText=formatCurrency(i);let f=sortSales(filterSales(m));let g=groupSalesByDate(f);saleListContainer.innerHTML='';let c=0;const sd=Object.keys(g).sort((a,b)=>new Date(b+'T00:00:00')-new Date(a+'T00:00:00'));sd.forEach(date=>{let dv=0,dl=0,di=0,h='';g[date].forEach(s=>{c++;dv+=s.price;di+=s.incentive;dl++;h+=`<div class="sale-item bg-white border border-gray-200 rounded-lg p-4 mb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm hover:shadow-md transition-shadow duration-150"><div class="flex-grow mb-2 sm:mb-0"><p class="font-semibold text-base text-gray-800">${s.modelName||'N/A'}</p><p class="text-sm text-gray-600">Price: ${formatCurrency(s.price)} | Inc: ${formatCurrency(s.incentive)} ${s.imei?`| IMEI: ${s.imei}`:''}</p></div><div class="flex-shrink-0 flex gap-2 mt-2 sm:mt-0"><button data-action="edit-sale" data-id="${s.id}" class="text-sm py-1 px-3 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-md transition duration-150" aria-label="Edit Sale ${s.modelName}">Edit</button><button data-action="delete-sale" data-id="${s.id}" class="text-sm py-1 px-3 bg-red-500 hover:bg-red-600 text-white rounded-md transition duration-150" aria-label="Delete Sale ${s.modelName}">Delete</button></div></div>`;});saleListContainer.innerHTML+=`<div class="date-group mb-6"><h2 class="date-header mt-1 mb-3 font-semibold text-gray-700 text-lg flex flex-col sm:flex-row justify-between items-start sm:items-center flex-wrap gap-2"><span>${formatDate(date)}</span><span class="daily-total-tile bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm">Daily: ${formatCurrency(dv)} (${dl} unit${dl!==1?'s':''}) | Earn: ${formatCurrency(di)}</span></h2>${h}</div>`;});const d=c>0;noSalesText.classList.toggle('hidden',d);if(!d){const md=formatMonthYearForDropdown(selectedMonth);if(currentSearchTerm&&selectedMonth!=='all')noSalesText.textContent=`No sales found for "${currentSearchTerm}" in ${md}.`;else if(currentSearchTerm)noSalesText.textContent=`No sales found for "${currentSearchTerm}".`;else if(selectedMonth!=='all')noSalesText.textContent=`No sales found for ${md}.`;else noSalesText.textContent=sales.length===0?"No sales found. Add one using the '+' button.":"No sales match filter/search.";}populateMonthFilter();if(monthFilter)monthFilter.value=selectedMonth;if(sortOptions)sortOptions.value=currentSort;}

// --- UI Update (Model List Screen) ---
function renderModelList(){if(!modelListContainer||!noModelsText)return;const f=filterModels(models);modelListContainer.innerHTML='';if(models.length===0){noModelsText.textContent="No models found. Add one using 'Add Model' button.";noModelsText.classList.remove('hidden');return;}if(f.length===0){noModelsText.textContent=`No models found matching search "${currentModelSearchTerm}".`;noModelsText.classList.remove('hidden');return;}noModelsText.classList.add('hidden');const s=[...f].sort((a,b)=>(a.name||'').localeCompare(b.name||''));s.forEach(m=>{modelListContainer.innerHTML+=`<div class="model-item bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center hover:shadow-md transition-shadow duration-150"><div class="flex-grow mb-2 sm:mb-0 sm:mr-4"><h3 class="font-semibold text-lg text-gray-800 mb-1">${m.name||'N/A'}</h3><p class="text-sm text-gray-600 mb-1">Price: ${formatCurrency(m.price)}</p><p class="text-sm text-gray-600">Incentive: ${formatCurrency(m.incentive)}</p></div><div class="flex-shrink-0 flex flex-wrap gap-2 mt-2 sm:mt-0 self-start sm:self-center"><button data-action="select-model" data-id="${m.id}" class="text-sm py-1 px-3 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition duration-150" aria-label="Select ${m.name}">Select</button><button data-action="edit-model" data-id="${m.id}" class="text-sm py-1 px-3 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-md transition duration-150" aria-label="Edit ${m.name}">Edit</button><button data-action="delete-model" data-id="${m.id}" class="text-sm py-1 px-3 bg-red-500 hover:bg-red-600 text-white rounded-md transition duration-150" aria-label="Delete ${m.name}">Delete</button></div></div>`;});}

// --- Event Delegation Handler ---
function handleAppClick(e){const t=e.target.closest('button[data-action]');if(!t)return;const a=t.dataset.action;const i=t.dataset.id;switch(a){case'edit-sale':if(i)openSaleModal('edit',i);break;case'delete-sale':if(i)confirmDeleteSale(i);break;case'select-model':if(i)selectModelForSale(i);break;case'edit-model':if(i)openModelModal('edit',i);break;case'delete-model':if(i)confirmDeleteModel(i);break;default:console.warn("Unhandled action:",a);}}

// --- Initialize Application ---
function initializeApp(){console.log("Initializing app...");initializeDOMElements();if(!appContainer){console.error("App container not found. Initialization failed.");return;} // Check if main container exists

    // --- Attach Event Listeners ---
    if(navButtons.length>0)navButtons.forEach(b=>b.addEventListener('click',()=>showScreen(b.dataset.screen)));
    if(quickAddBtn)quickAddBtn.addEventListener("click",()=>toggleQuickAdd(true));
    // Listeners for controls inside the menu
    if(searchInput)searchInput.addEventListener('input',(e)=>{currentSearchTerm=e.target.value;updateUI();});
    if(sortOptions)sortOptions.addEventListener('change',(e)=>{currentSort=e.target.value;updateUI();});
    if(monthFilter)monthFilter.addEventListener('change',(e)=>{selectedMonth=e.target.value;updateUI();});
    if(exportCsvBtn)exportCsvBtn.addEventListener('click',()=>exportFilteredSalesToCsv(`sales_${selectedMonth}_${new Date().toISOString().split('T')[0]}.csv`));
    if(backupBtn)backupBtn.addEventListener('click',backupData);
    if(restoreBtn)restoreBtn.addEventListener('click',()=>restoreFileInput.click());
    if(restoreFileInput)restoreFileInput.addEventListener('change',handleRestoreFile);
    // Sale Modal
    if(closeSaleModalBtn)closeSaleModalBtn.addEventListener("click",closeSaleModal);
    if(cancelSaleBtn)cancelSaleBtn.addEventListener("click",closeSaleModal);
    if(saveSaleBtn)saveSaleBtn.addEventListener("click",addOrUpdateSale);
    if(addEditSaleModal)window.addEventListener("click",(e)=>{if(e.target===addEditSaleModal)closeSaleModal();});
    if(addEditSaleForm)addEditSaleForm.addEventListener('submit',(e)=>{e.preventDefault();addOrUpdateSale();});
    // Model Modal
    if(openModelModalBtn)openModelModalBtn.addEventListener("click",()=>openModelModal('add'));
    if(closeModelModalBtn)closeModelModalBtn.addEventListener("click",closeModelModal);
    if(cancelModelBtn)cancelModelBtn.addEventListener("click",closeModelModal);
    if(saveModelBtn)saveModelBtn.addEventListener("click",addOrUpdateModel);
    if(modelModal)window.addEventListener("click",(e)=>{if(e.target===modelModal)closeModelModal();});
    if(modelForm)modelForm.addEventListener('submit',(e)=>{e.preventDefault();addOrUpdateModel();});
    // Quick Add
    if(cancelQuickAddBtn)cancelQuickAddBtn.addEventListener("click",()=>toggleQuickAdd(false));
    if(quickAddModelNameInput){quickAddModelNameInput.addEventListener('input',()=>{const t=quickAddModelNameInput.value.trim().toLowerCase();quickAddModelSuggestions.innerHTML='';if(t.length===0)return;const m=models.filter(m=>m.name.toLowerCase().includes(t)).slice(0,5);if(m.length>0){m.forEach(m=>{const d=document.createElement('div');d.textContent=`${m.name} (₹${m.price} | ₹${m.incentive})`;d.className='p-2 cursor-pointer border-b border-gray-200 last:border-b-0 hover:bg-indigo-100';d.dataset.id=m.id;quickAddModelSuggestions.appendChild(d);});}else{quickAddModelSuggestions.innerHTML='<div class="p-2 text-gray-500 text-sm">No model found. Enter to add.</div>';}});quickAddModelNameInput.addEventListener('keydown',(e)=>{if(e.key==='Enter'){e.preventDefault();const n=quickAddModelNameInput.value.trim();if(!n)return;const m=models.find(m=>m.name.toLowerCase()===n.toLowerCase());if(m)quickAddSale(m);else{showNotification(`Model "${n}" not found. Add first.`,"info");toggleQuickAdd(false);showScreen('modelListScreen');openModelModal('add',null,n);}}else if(e.key==='Escape'){toggleQuickAdd(false);}});}
    if(quickAddModelSuggestions)quickAddModelSuggestions.addEventListener('click',(e)=>{const t=e.target.closest('div[data-id]');if(t?.dataset.id){const m=models.find(m=>m.id===t.dataset.id);if(m)quickAddSale(m);}});
    // Confirmation Modal
    if(confirmCancelBtn)confirmCancelBtn.addEventListener('click',hideConfirmation);
    if(confirmOkBtn)confirmOkBtn.addEventListener('click',()=>{if(typeof confirmationCallback==='function')confirmationCallback();});
    if(confirmationModal)window.addEventListener('click',(e)=>{if(e.target===confirmationModal)hideConfirmation();});
    // Event Delegation
    if(appContainer)appContainer.addEventListener('click',handleAppClick);
    // Model Search
    if(modelSearchInput)modelSearchInput.addEventListener('input',(e)=>{currentModelSearchTerm=e.target.value;renderModelList();});
    // Sale Modal Model Search
    if(saleModelNameInputDisplay){saleModelNameInputDisplay.addEventListener('input',()=>{const t=saleModelNameInputDisplay.value.trim().toLowerCase();saleModelSuggestionsContainer.innerHTML='';saleModelSuggestionsContainer.classList.add('hidden');if(t.length>0){const m=models.filter(m=>m.name.toLowerCase().includes(t)).slice(0,5);if(m.length>0){m.forEach(m=>{const d=document.createElement('div');d.textContent=m.name;d.className='p-2 cursor-pointer border-b border-gray-200 last:border-b-0 hover:bg-indigo-100';d.dataset.id=m.id;d.dataset.name=m.name;d.dataset.price=m.price;d.dataset.incentive=m.incentive;saleModelSuggestionsContainer.appendChild(d);});saleModelSuggestionsContainer.classList.remove('hidden');}}const e=models.find(m=>m.name.toLowerCase()===t);if(!e){saleModelNameInput.value='';selectedModelIdInput.value='';}});saleModelNameInputDisplay.addEventListener('blur',()=>{setTimeout(()=>{if(saleModelSuggestionsContainer)saleModelSuggestionsContainer.classList.add('hidden');},150);});}
    // Sale Modal Suggestion Click
     if(saleModelSuggestionsContainer){saleModelSuggestionsContainer.addEventListener('mousedown',(e)=>{const t=e.target.closest('div[data-id]');if(t?.dataset.id){e.preventDefault();const{id,name,price,incentive}=t.dataset;saleModelNameInputDisplay.value=name;saleModelNameInput.value=name;selectedModelIdInput.value=id;salePriceInput.value=price;saleIncentiveInput.value=incentive;saleModelSuggestionsContainer.innerHTML='';saleModelSuggestionsContainer.classList.add('hidden');}});}
    // IMEI Scan Button (Placeholder)
    if(scanImeiBtn){scanImeiBtn.addEventListener('click',()=>{showNotification("Barcode scanning not implemented.","info");});}
    // NEW Menu Listeners
    if(menuToggleBtn)menuToggleBtn.addEventListener('click', openMenu);
    if(closeMenuBtn)closeMenuBtn.addEventListener('click', closeMenu);
    if(menuOverlay)menuOverlay.addEventListener('click', closeMenu);


    console.log("Event listeners attached.");

    // --- Load Initial Data & Set Initial State ---
    loadModels();loadSales();renderModelList();showScreen(currentScreen);updateUI();
    console.log("App initialized.");
}

// --- Start the app ---
initializeApp();
