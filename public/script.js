const KEY='stitchcraftDataV2';
const statusList=['Pending','In Progress','Trial','Ready','Delivered'];
const steps=['Pending','In Progress','Trial','Ready','Delivered'];
let data=JSON.parse(localStorage.getItem(KEY)||'null')||seedData();
let revenueChart,statusChart,customerChart,calendarDate=new Date();
function seedData(){const today=new Date();const d=n=>new Date(today.getTime()+n*86400000).toISOString().slice(0,10);return {customers:[{id:1,name:'Priya Kumar',phone:'+91 98765 11111',joined:d(-18)},{id:2,name:'Anitha S',phone:'+91 98765 22222',joined:d(-40)},{id:3,name:'Meena Raj',phone:'+91 98765 33333',joined:d(-7)},{id:4,name:'Divya M',phone:'+91 98765 44444',joined:d(-90)}],orders:[{id:1001,name:'Priya Kumar',phone:'+91 98765 11111',garment:'Bridal Blouse',type:'Blouse',delivery:d(2),status:'In Progress',amount:1800,paid:800,chest:34,waist:28,length:14,created:d(-2)},{id:1002,name:'Anitha S',phone:'+91 98765 22222',garment:'Designer Churidar',type:'Churidar',delivery:d(1),status:'Trial',amount:1400,paid:1000,chest:36,waist:30,length:40,created:d(-4)},{id:1003,name:'Meena Raj',phone:'+91 98765 33333',garment:'Office Kurti',type:'Kurti',delivery:d(5),status:'Pending',amount:900,paid:300,chest:38,waist:32,length:42,created:d(-1)},{id:1004,name:'Divya M',phone:'+91 98765 44444',garment:'Formal Shirt',type:'Shirt',delivery:d(0),status:'Ready',amount:750,paid:750,chest:40,waist:34,length:28,created:d(-8)},{id:1005,name:'Priya Kumar',phone:'+91 98765 11111',garment:'Silk Blouse',type:'Blouse',delivery:d(-2),status:'Delivered',amount:1200,paid:1200,chest:34,waist:28,length:13,created:d(-20)}],measurements:[{id:1,customer:'Priya Kumar',type:'Blouse',updated:d(0),m:{Bust:'34"',Waist:'28"',Shoulder:'14"',Sleeve:'10"',Length:'14"',Armhole:'15"'}},{id:2,customer:'Anitha S',type:'Churidar',updated:d(-3),m:{Bust:'36"',Waist:'30"',Shoulder:'14.5"',Sleeve:'21"',Length:'40"',Hip:'38"'}}],materials:[{name:'Silk Fabric',unit:'meters',stock:24,reorder:10,icon:'🧶'},{name:'Cotton Lining',unit:'meters',stock:8,reorder:10,icon:'🪡'},{name:'Embroidery Thread',unit:'spools',stock:42,reorder:15,icon:'🧵'},{name:'Hooks & Eyes',unit:'packs',stock:6,reorder:8,icon:'🔘'}],designs:[['Bridal Zari Blouse','Wedding · Traditional','👰'],['Classic Silk Blouse','Festive · Elegant','👗'],['Minimal Office Kurti','Office · Modern','🥻'],['Men’s Formal Shirt','Formal · Clean','👔'],['Pastel Churidar','Casual · Soft','🌸']],payments:[]};}
function save(){localStorage.setItem(KEY,JSON.stringify(data));updateAll();}
function money(n){return '₹'+Number(n||0).toLocaleString('en-IN');}
function fmtDate(s){if(!s)return '—';return new Date(s+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});}
function daysFromNow(s){return Math.ceil((new Date(s+'T00:00:00')-new Date(new Date().toDateString()))/86400000)}
function statusClass(s){return 'status s-'+s.toLowerCase().replaceAll(' ','-')}
function navigate(page){document.querySelectorAll('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.page===page));document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id==='page-'+page));document.getElementById('pageTitle').textContent=page==='ai'?'AI Assistant':page.split('-').map(x=>x[0].toUpperCase()+x.slice(1)).join(' ');if(page==='dashboard')renderDashboard();if(page==='orders')renderOrdersPage();if(page==='customers')renderCustomers();if(page==='measurements')renderMeasurements();if(page==='calendar')renderCalendar();if(page==='payments')renderPayments();if(page==='invoices')renderInvoices();if(page==='gallery')renderGallery();if(page==='materials')renderMaterials();if(page==='reports')renderReports();if(page==='settings')loadSettings();document.getElementById('sidebar').classList.remove('open');window.scrollTo({top:0,behavior:'smooth'});}
document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.page)));
function toggleSidebar(){document.getElementById('sidebar').classList.toggle('open')}
function updateAll(){renderDashboard();renderOrdersPage();renderCustomers();renderMeasurements();renderCalendar();renderPayments();renderInvoices();renderGallery();renderMaterials();renderReports();document.getElementById('navPending').textContent=data.orders.filter(o=>o.status==='Pending'||o.status==='In Progress').length}
function renderDashboard(){const o=data.orders,month=new Date().getMonth();const rev=o.filter(x=>new Date(x.created).getMonth()===month).reduce((a,x)=>a+x.amount,0);document.getElementById('statOrders').textContent=o.length;document.getElementById('statPending').textContent=o.filter(x=>['Pending','In Progress','Trial'].includes(x.status)).length;document.getElementById('statCompleted').textContent=o.filter(x=>['Ready','Delivered'].includes(x.status)).length;document.getElementById('statRevenue').textContent=money(rev);document.getElementById('donutTotal').textContent=o.length;document.getElementById('recentOrders').innerHTML=o.slice().sort((a,b)=>b.id-a.id).slice(0,6).map(x=>`<tr><td><strong>#${x.id}</strong></td><td>${esc(x.name)}</td><td>${esc(x.garment)}</td><td>${fmtDate(x.delivery)}</td><td><span class="status ${statusClass(x.status)}">${x.status}</span></td><td>${money(x.amount)}</td></tr>`).join('')||emptyRow(6);const upcoming=o.filter(x=>daysFromNow(x.delivery)>=0&&daysFromNow(x.delivery)<=7).sort((a,b)=>a.delivery.localeCompare(b.delivery)).slice(0,5);document.getElementById('upcomingList').innerHTML=upcoming.map(x=>`<div class="upcoming"><div class="datebox">${new Date(x.delivery+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}</div><div><strong>${esc(x.name)}</strong><small>${esc(x.garment)} · ${daysFromNow(x.delivery)===0?'Today':daysFromNow(x.delivery)+' day(s)'}</small></div></div>`).join('')||'<p>No upcoming deliveries.</p>';drawCharts();}
function drawCharts(){const counts=statusList.map(s=>data.orders.filter(o=>o.status===s).length);const months=Array.from({length:6},(_,i)=>{const d=new Date();d.setMonth(d.getMonth()-5+i);return d.toLocaleDateString('en-IN',{month:'short'})});const vals=months.map((_,i)=>{const d=new Date();d.setMonth(d.getMonth()-5+i);return data.orders.filter(o=>new Date(o.created).getMonth()===d.getMonth()&&new Date(o.created).getFullYear()===d.getFullYear()).reduce((a,x)=>a+x.amount,0)});if(revenueChart)revenueChart.destroy();revenueChart=new Chart(document.getElementById('revenueChart'),{type:'line',data:{labels:months,datasets:[{data:vals,borderColor:'#7656d6',backgroundColor:'#7656d622',fill:true,tension:.4,pointRadius:3}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{grid:{color:'#eee'},ticks:{font:{size:9}}},x:{grid:{display:false},ticks:{font:{size:9}}}}}});if(statusChart)statusChart.destroy();statusChart=new Chart(document.getElementById('statusChart'),{type:'doughnut',data:{labels:statusList,datasets:[{data:counts,backgroundColor:['#f0b65c','#7996e9','#9b75ed','#53bb8a','#aab2bb'],borderWidth:0}]},options:{cutout:'74%',plugins:{legend:{display:false}}}});document.getElementById('statusLegend').innerHTML=statusList.map((s,i)=>`<div><span><i class="dot" style="background:${['#f0b65c','#7996e9','#9b75ed','#53bb8a','#aab2bb'][i]}"></i>${s}</span><b>${counts[i]}</b></div>`).join('')}
function renderOrdersPage(){const q=(document.getElementById('orderSearch')?.value||'').toLowerCase(),f=document.getElementById('orderFilter')?.value||'All',sort=document.getElementById('orderSort')?.value||'date';let arr=data.orders.filter(o=>(!q||`${o.name} ${o.phone} ${o.garment}`.toLowerCase().includes(q))&&(f==='All'||o.status===f));arr.sort((a,b)=>sort==='amount'?b.amount-a.amount:sort==='delivery'?a.delivery.localeCompare(b.delivery):b.id-a.id);document.getElementById('ordersPageGrid').innerHTML=arr.map(o=>orderCard(o)).join('')||'<div class="panel"><p>No orders found.</p></div>'}
function orderCard(o){const idx=steps.indexOf(o.status);return `<div class="order-card"><div class="order-top"><div><h3>${esc(o.garment)}</h3><small>${esc(o.name)} · ${esc(o.phone)}</small></div><span class="status ${statusClass(o.status)}">${o.status}</span></div><div class="order-meta"><div><span>Delivery</span><strong>${fmtDate(o.delivery)}</strong></div><div><span>Amount</span><strong>${money(o.amount)}</strong></div><div><span>Paid</span><strong>${money(o.paid)}</strong></div><div><span>Balance</span><strong>${money(o.amount-o.paid)}</strong></div></div><div class="workflow">${steps.map((s,i)=>`<div class="step ${i<=idx?'done':''}">${i<=idx?'✓':''}</div>${i<steps.length-1?'<div class="step-line"></div>':''}`).join('')}</div><div class="card-actions"><button class="small-btn" onclick="editOrder(${o.id})">✏️ Edit</button><button class="small-btn" onclick="printInvoice(${o.id})">🧾 Invoice</button><button class="small-btn" onclick="whatsappOrder(${o.id})">💬 WhatsApp</button><button class="small-btn" onclick="deleteOrder(${o.id})">🗑</button></div></div>`}
function renderCustomers(){const counts={};data.orders.forEach(o=>counts[o.name]=(counts[o.name]||0)+1);document.getElementById('customerCount').textContent=data.customers.length;document.getElementById('repeatCount').textContent=Object.values(counts).filter(x=>x>1).length;const m=new Date().getMonth();document.getElementById('newCustomerCount').textContent=data.customers.filter(c=>new Date(c.joined).getMonth()===m).length;document.getElementById('customerGrid').innerHTML=data.customers.map(c=>{const os=data.orders.filter(o=>o.name===c.name);const total=os.reduce((a,o)=>a+o.amount,0);return `<div class="customer-card"><div class="customer-top"><div class="customer-avatar">${initials(c.name)}</div><div><h3>${esc(c.name)}</h3><p>📞 ${esc(c.phone)}</p></div></div><div class="pill-row"><span class="pill">${os.length} orders</span><span class="pill">${money(total)} lifetime</span></div><small style="color:var(--muted);font-size:9px">Joined ${fmtDate(c.joined)}</small><div class="card-actions" style="margin-top:13px"><button class="small-btn" onclick="customerHistory('${esc(c.name)}')">View History</button><button class="small-btn" onclick="openMeasurementModal('${esc(c.name)}')">📏 Measurements</button></div></div>`}).join('')}
function renderMeasurements(){document.getElementById('measurementGrid').innerHTML=data.measurements.map(m=>`<div class="measurement-card"><div class="customer-top"><div class="customer-avatar">${initials(m.customer)}</div><div><h3>${esc(m.customer)}</h3><p>${esc(m.type)} · Updated ${fmtDate(m.updated)}</p></div></div><div class="measurements">${Object.entries(m.m).slice(0,6).map(([k,v])=>`<div><span>${k}</span><strong>${v}</strong></div>`).join('')}</div><div class="card-actions" style="margin-top:13px"><button class="small-btn" onclick="openMeasurementModal('${esc(m.customer)}')">✏️ Edit</button><button class="small-btn" onclick="toast('Measurement card copied')">📋 Copy</button></div></div>`).join('')||'<div class="panel"><p>No measurements saved yet.</p></div>'}
function renderCalendar(){const y=calendarDate.getFullYear(),m=calendarDate.getMonth();document.getElementById('calendarTitle').textContent=new Date(y,m,1).toLocaleDateString('en-IN',{month:'long',year:'numeric'});const first=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate(),prev=new Date(y,m,0).getDate();let html='';for(let i=0;i<first;i++)html+=`<div class="day muted"><b>${prev-first+i+1}</b></div>`;for(let d=1;d<=days;d++){const ds=new Date(y,m,d);const key=ds.toISOString().slice(0,10);const os=data.orders.filter(o=>o.delivery===key);const today=new Date().toISOString().slice(0,10);html+=`<div class="day ${key===today?'today':''}"><b>${d}</b><div class="day-events">${os.slice(0,2).map(o=>`<div class="day-event" title="${esc(o.name)}">${esc(o.name.split(' ')[0])}</div>`).join('')}</div></div>`}const totalCells=Math.ceil((first+days)/7)*7;for(let i=1;i<=totalCells-first-days;i++)html+=`<div class="day muted"><b>${i}</b></div>`;document.getElementById('calendarGrid').innerHTML=html;const upcoming=data.orders.filter(o=>daysFromNow(o.delivery)>=0).sort((a,b)=>a.delivery.localeCompare(b.delivery)).slice(0,12);document.getElementById('calendarOrders').innerHTML=upcoming.map(o=>`<div class="upcoming"><div class="datebox">${new Date(o.delivery+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}</div><div><strong>${esc(o.name)} · ${esc(o.garment)}</strong><small>${o.status} · ${money(o.amount-o.paid)} balance</small></div></div>`).join('')}
function changeMonth(n){calendarDate.setMonth(calendarDate.getMonth()+n);renderCalendar()}
function renderPayments(){const billed=data.orders.reduce((a,o)=>a+o.amount,0),paid=data.orders.reduce((a,o)=>a+o.paid,0);document.getElementById('paidTotal').textContent=money(paid);document.getElementById('balanceTotal').textContent=money(billed-paid);document.getElementById('collectionRate').textContent=billed?Math.round(paid/billed*100)+'%':'0%';document.getElementById('paymentTable').innerHTML=data.orders.map(o=>`<tr><td>#INV-${o.id}</td><td>${esc(o.name)}</td><td>${money(o.amount)}</td><td>${money(o.paid)}</td><td>${money(o.amount-o.paid)}</td><td><span class="status ${o.paid>=o.amount?'s-ready':'s-pending'}">${o.paid>=o.amount?'Paid':'Due'}</span></td><td><button class="small-btn" onclick="openPaymentModal(${o.id})">Record</button></td></tr>`).join('')||emptyRow(7)}
function renderInvoices(){document.getElementById('invoiceGrid').innerHTML=data.orders.slice().sort((a,b)=>b.id-a.id).map(o=>`<div class="invoice-card"><span class="invoice-id">INV-${o.id}</span><h3>${esc(o.name)}</h3><small style="color:var(--muted)">${esc(o.garment)} · ${fmtDate(o.created)}</small><strong>${money(o.amount)}</strong><div class="invoice-actions"><button class="small-btn" onclick="printInvoice(${o.id})">🖨 Print</button><button class="small-btn" onclick="whatsappOrder(${o.id})">💬 Send</button></div></div>`).join('')}
function renderGallery(){document.getElementById('galleryGrid').innerHTML=data.designs.map((d,i)=>`<div class="design"><div class="design-art">${d[2]}</div><div class="design-info"><strong>${esc(d[0])}</strong><small>${esc(d[1])}</small></div></div>`).join('')}
function renderMaterials(){document.getElementById('materialGrid').innerHTML=data.materials.map(m=>{const pct=Math.min(100,m.stock/Math.max(m.stock,m.reorder)*100);return `<div class="material-card"><div class="material-icon">${m.icon}</div><h3 style="font-size:13px;margin:10px 0 3px">${esc(m.name)}</h3><small style="color:var(--muted)">${m.stock} ${m.unit} in stock · reorder at ${m.reorder}</small><div class="stock"><i style="width:${pct}%;background:${m.stock<m.reorder?'#df6b8d':''}"></i></div><span class="status ${m.stock<m.reorder?'s-pending':'s-ready'}">${m.stock<m.reorder?'Low Stock':'Healthy'}</span></div>`}).join('')}
function renderReports(){const map={};data.orders.forEach(o=>map[o.type||o.garment]=(map[o.type||o.garment]||0)+1);const max=Math.max(1,...Object.values(map));document.getElementById('popularGarments').innerHTML=Object.entries(map).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="bar-row"><span>${esc(k)}</span><div class="bar"><i style="width:${v/max*100}%"></i></div><b>${v}</b></div>`).join('');const billed=data.orders.reduce((a,o)=>a+o.amount,0),paid=data.orders.reduce((a,o)=>a+o.paid,0),expenses=Math.round(billed*.31);document.getElementById('profitSnapshot').innerHTML=`<div class="profit-list"><div class="profit-row"><span>Gross Revenue</span><strong>${money(billed)}</strong></div><div class="profit-row"><span>Estimated Expenses</span><strong>− ${money(expenses)}</strong></div><div class="profit-row"><span>Estimated Net</span><strong>${money(billed-expenses)}</strong></div><div class="profit-row"><span>Outstanding</span><strong>${money(billed-paid)}</strong></div></div>`;if(customerChart)customerChart.destroy();const labels=['Apr','May','Jun','Jul','Aug','Sep'];customerChart=new Chart(document.getElementById('customerChart'),{type:'bar',data:{labels,datasets:[{data:[2,3,4,5,6,data.customers.length],backgroundColor:'#9b75ed',borderRadius:6}]},options:{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{stepSize:1}}}}})}
function openOrderModal(existing=null){const o=existing?data.orders.find(x=>x.id===existing):null;document.getElementById('modalRoot').innerHTML=`<div class="modal-backdrop" onclick="if(event.target===this)closeModal()"><div class="modal"><div class="modal-head"><h3>${o?'Edit Order':'New Tailoring Order'}</h3><button class="close" onclick="closeModal()">×</button></div><form onsubmit="saveOrder(event,${o?o.id:'null'})"><div class="form-grid"><div class="form-field"><label>Customer Name</label><input name="name" required value="${esc(o?.name||'')}"></div><div class="form-field"><label>Phone</label><input name="phone" required value="${esc(o?.phone||'')}"></div><div class="form-field"><label>Garment</label><input name="garment" required placeholder="Bridal Blouse" value="${esc(o?.garment||'')}"></div><div class="form-field"><label>Garment Type</label><select name="type">${['Blouse','Churidar','Kurti','Shirt','Pants','Saree','Alteration','Other'].map(x=>`<option ${o?.type===x?'selected':''}>${x}</option>`).join('')}</select></div><div class="form-field"><label>Delivery Date</label><input name="delivery" type="date" required value="${o?.delivery||new Date().toISOString().slice(0,10)}"></div><div class="form-field"><label>Status</label><select name="status">${statusList.map(x=>`<option ${o?.status===x?'selected':''}>${x}</option>`).join('')}</select></div><div class="form-field"><label>Total Amount (₹)</label><input name="amount" type="number" required value="${o?.amount||''}"></div><div class="form-field"><label>Advance Paid (₹)</label><input name="paid" type="number" value="${o?.paid||0}"></div><div class="form-field"><label>Bust / Chest</label><input name="chest" value="${o?.chest||''}"></div><div class="form-field"><label>Waist</label><input name="waist" value="${o?.waist||''}"></div><div class="form-field"><label>Length</label><input name="length" value="${o?.length||''}"></div><div class="form-field"><label>Notes</label><input name="notes" value="${esc(o?.notes||'')}"></div></div><div class="modal-actions"><button type="button" class="secondary" onclick="closeModal()">Cancel</button><button class="primary">Save Order</button></div></form></div></div>`}
function saveOrder(e,id){e.preventDefault();const f=new FormData(e.target);const obj={id:id||Date.now(),name:f.get('name').trim(),phone:f.get('phone').trim(),garment:f.get('garment').trim(),type:f.get('type'),delivery:f.get('delivery'),status:f.get('status'),amount:+f.get('amount')||0,paid:+f.get('paid')||0,chest:f.get('chest')||'N/A',waist:f.get('waist')||'N/A',length:f.get('length')||'N/A',notes:f.get('notes')||'',created:id?(data.orders.find(x=>x.id===id)?.created||new Date().toISOString().slice(0,10)):new Date().toISOString().slice(0,10)};if(id){const i=data.orders.findIndex(x=>x.id===id);data.orders[i]=obj}else{data.orders.push(obj);if(!data.customers.some(c=>c.name.toLowerCase()===obj.name.toLowerCase()))data.customers.push({id:Date.now(),name:obj.name,phone:obj.phone,joined:new Date().toISOString().slice(0,10)})}save();closeModal();toast(id?'Order updated':'New order created');navigate('orders')}
function editOrder(id){openOrderModal(id)}
function deleteOrder(id){if(confirm('Delete this order?')){data.orders=data.orders.filter(x=>x.id!==id);save();toast('Order deleted')}}
function openCustomerModal(){document.getElementById('modalRoot').innerHTML=`<div class="modal-backdrop" onclick="if(event.target===this)closeModal()"><div class="modal"><div class="modal-head"><h3>Add Customer</h3><button class="close" onclick="closeModal()">×</button></div><form onsubmit="saveCustomer(event)"><div class="form-grid"><div class="form-field"><label>Name</label><input name="name" required></div><div class="form-field"><label>Phone</label><input name="phone" required></div></div><div class="modal-actions"><button type="button" class="secondary" onclick="closeModal()">Cancel</button><button class="primary">Save Customer</button></div></form></div></div>`}
function saveCustomer(e){e.preventDefault();const f=new FormData(e.target);data.customers.push({id:Date.now(),name:f.get('name'),phone:f.get('phone'),joined:new Date().toISOString().slice(0,10)});save();closeModal();toast('Customer added')}
function openMeasurementModal(customer=''){document.getElementById('modalRoot').innerHTML=`<div class="modal-backdrop" onclick="if(event.target===this)closeModal()"><div class="modal"><div class="modal-head"><h3>Digital Measurement Card</h3><button class="close" onclick="closeModal()">×</button></div><form onsubmit="saveMeasurement(event)"><div class="form-grid"><div class="form-field"><label>Customer</label><input name="customer" value="${esc(customer)}" required></div><div class="form-field"><label>Garment Type</label><select name="type"><option>Blouse</option><option>Churidar</option><option>Kurti</option><option>Shirt</option><option>Pants</option></select></div>${['Bust','Waist','Shoulder','Sleeve','Length','Hip'].map(x=>`<div class="form-field"><label>${x}</label><input name="${x.toLowerCase()}" placeholder="e.g. 34\""></div>`).join('')}</div><div class="modal-actions"><button type="button" class="secondary" onclick="closeModal()">Cancel</button><button class="primary">Save Measurement</button></div></form></div></div>`}
function saveMeasurement(e){e.preventDefault();const f=new FormData(e.target),m={};['Bust','Waist','Shoulder','Sleeve','Length','Hip'].forEach(k=>m[k]=f.get(k.toLowerCase())||'—');data.measurements.push({id:Date.now(),customer:f.get('customer'),type:f.get('type'),updated:new Date().toISOString().slice(0,10),m});save();closeModal();toast('Measurement saved')}
function openPaymentModal(id){const o=id?data.orders.find(x=>x.id===id):data.orders.find(x=>x.paid<x.amount);if(!o){toast('No outstanding order');return}document.getElementById('modalRoot').innerHTML=`<div class="modal-backdrop" onclick="if(event.target===this)closeModal()"><div class="modal"><div class="modal-head"><h3>Record Payment · #${o.id}</h3><button class="close" onclick="closeModal()">×</button></div><form onsubmit="savePayment(event,${o.id})"><p>${esc(o.name)} · ${esc(o.garment)} · Balance ${money(o.amount-o.paid)}</p><div class="form-field"><label>Payment Amount (₹)</label><input name="amount" type="number" min="1" max="${o.amount-o.paid}" required></div><div class="modal-actions"><button type="button" class="secondary" onclick="closeModal()">Cancel</button><button class="primary">Save Payment</button></div></form></div></div>`}
function savePayment(e,id){e.preventDefault();const amt=+new FormData(e.target).get('amount');const o=data.orders.find(x=>x.id===id);o.paid=Math.min(o.amount,o.paid+amt);save();closeModal();toast('Payment recorded')}
function printInvoice(id){const o=data.orders.find(x=>x.id===id);const html=`<html><head><title>Invoice ${o.id}</title><style>body{font-family:Arial;padding:40px;color:#222}header{display:flex;justify-content:space-between;border-bottom:2px solid #7656d6;padding-bottom:20px}table{width:100%;margin-top:30px;border-collapse:collapse}td,th{padding:12px;border-bottom:1px solid #ddd;text-align:left}.total{text-align:right;font-size:20px;margin-top:20px}small{color:#777}</style></head><body><header><div><h1>🧵 StitchCraft Studio</h1><small>Professional Home Tailoring · Chennai, Tamil Nadu</small></div><div><b>INVOICE</b><br>INV-${o.id}<br>${fmtDate(o.created)}</div></header><h3>Bill To: ${esc(o.name)}</h3><small>${esc(o.phone)}</small><table><tr><th>Garment</th><th>Delivery</th><th>Amount</th></tr><tr><td>${esc(o.garment)}</td><td>${fmtDate(o.delivery)}</td><td>${money(o.amount)}</td></tr></table><p class="total">Total: <b>${money(o.amount)}</b><br>Paid: ${money(o.paid)}<br>Balance: <b>${money(o.amount-o.paid)}</b></p><p>Thank you for choosing StitchCraft!</p><script>window.onload=()=>window.print()<\/script></body></html>`;const w=window.open('','_blank');w.document.write(html);w.document.close()}
function whatsappOrder(id){const o=data.orders.find(x=>x.id===id);const msg=`Hello ${o.name}, your ${o.garment} order (#${o.id}) is currently ${o.status}. Delivery: ${fmtDate(o.delivery)}. Balance: ${money(o.amount-o.paid)}. Thank you - StitchCraft.`;window.open('https://wa.me/'+o.phone.replace(/\D/g,'')+'?text='+encodeURIComponent(msg),'_blank')}
function customerHistory(name){const os=data.orders.filter(o=>o.name===name);alert(`${name}\n\nOrders: ${os.length}\nTotal spent: ${money(os.reduce((a,o)=>a+o.amount,0))}\nLast garment: ${os.at(-1)?.garment||'None'}`)}
function addDesign(){const name=prompt('Design name');if(!name)return;data.designs.push([name,'Custom · New','✨']);save();toast('Design added')}
function openMaterialModal(){document.getElementById('modalRoot').innerHTML=`<div class="modal-backdrop" onclick="if(event.target===this)closeModal()"><div class="modal"><div class="modal-head"><h3>Add Material</h3><button class="close" onclick="closeModal()">×</button></div><form onsubmit="saveMaterial(event)"><div class="form-grid"><div class="form-field"><label>Material</label><input name="name" required></div><div class="form-field"><label>Unit</label><input name="unit" placeholder="meters"></div><div class="form-field"><label>Current Stock</label><input name="stock" type="number"></div><div class="form-field"><label>Reorder Level</label><input name="reorder" type="number"></div></div><div class="modal-actions"><button type="button" class="secondary" onclick="closeModal()">Cancel</button><button class="primary">Add Material</button></div></form></div></div>`}
function saveMaterial(e){e.preventDefault();const f=new FormData(e.target);data.materials.push({name:f.get('name'),unit:f.get('unit')||'units',stock:+f.get('stock')||0,reorder:+f.get('reorder')||5,icon:'📦'});save();closeModal();toast('Material added')}
function closeModal(){document.getElementById('modalRoot').innerHTML=''}
function askAI(){const input=document.getElementById('aiInput');const q=input.value.trim();if(!q)return;addBubble(q,'user');input.value='';setTimeout(()=>{let a='For a polished result, use a clear neckline, comfortable seam allowance and confirm the customer measurements before cutting.';const x=q.toLowerCase();if(x.includes('wedding')||x.includes('bridal'))a='Wedding blouse suggestion: rich silk base, zari or thread embroidery, sweetheart/U neckline, elbow-length sleeves and a statement back. Suggested stitching range: ₹1,500–₹3,500 depending on embroidery. Workflow: measurement → pattern → cutting → embroidery → stitching → trial → finishing.';else if(x.includes('shirt'))a='Shirt pricing suggestion: basic formal shirt ₹650–₹900, premium fabric/design ₹900–₹1,500. Confirm fabric, collar, cuff and sleeve style before quoting.';else if(x.includes('kurti'))a='Office kurti suggestion: straight-cut silhouette, 3/4 sleeves, minimal neckline detailing and breathable cotton/rayon. Keep colors neutral for an easy professional look.';else if(x.includes('workflow'))a='Recommended workflow: receive order → verify measurements → cutting → stitching → quality check → trial → alterations → pressing → ready → delivery.';addBubble(a,'ai')},400)}
function addBubble(t,type){const box=document.getElementById('chatMessages');const d=document.createElement('div');d.className='bubble '+type;d.textContent=t;box.appendChild(d);box.scrollTop=box.scrollHeight}
function usePrompt(t){document.getElementById('aiInput').value=t;askAI()}
function saveSettings(){localStorage.setItem('shopName',document.getElementById('shopName').value);toast('Shop settings saved')}
function loadSettings(){document.getElementById('shopName').value=localStorage.getItem('shopName')||'StitchCraft Studio'}
function toggleTheme(){document.body.classList.toggle('dark');localStorage.setItem('dark',document.body.classList.contains('dark'));document.getElementById('darkToggle').checked=document.body.classList.contains('dark')}
function showNotifications(){const due=data.orders.filter(o=>daysFromNow(o.delivery)<=1&&o.status!=='Delivered');alert(`Notifications\n\n${due.length} order(s) due today/tomorrow.\n${data.materials.filter(m=>m.stock<m.reorder).length} material(s) need restocking.`)}
function resetDemo(){if(confirm('Reset all demo data?')){localStorage.removeItem(KEY);data=seedData();save();toast('Demo data reset')}}
function toast(t){const x=document.getElementById('toast');x.textContent=t;x.classList.add('show');clearTimeout(window.tt);window.tt=setTimeout(()=>x.classList.remove('show'),2400)}
function initials(n){return n.split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase()}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function emptyRow(n){return `<tr><td colspan="${n}" style="text-align:center;color:var(--muted)">No records</td></tr>`}
document.getElementById('globalSearch').addEventListener('input',e=>{if(e.target.value.trim()){navigate('orders');document.getElementById('orderSearch').value=e.target.value;renderOrdersPage()}});
window.addEventListener('load',()=>{if(localStorage.getItem('dark')==='true')toggleTheme();updateAll()});

/* ===== v3: Design Upload + Measurement History + Login + Customer Tracking + Automated Notifications ===== */
let loginRole=localStorage.getItem('stitchcraftRole')||'admin';
function setLoginRole(role){loginRole=role;document.getElementById('adminTab').classList.toggle('active',role==='admin');document.getElementById('customerTab').classList.toggle('active',role==='customer');document.getElementById('loginId').placeholder=role==='admin'?'admin@stitchcraft.local':'Customer phone, e.g. 9876511111';document.getElementById('loginPassword').placeholder=role==='admin'?'••••••••':'Optional for demo';document.getElementById('loginPassword').required=role==='admin';document.getElementById('demoLogin').textContent=role==='admin'?'Demo Admin: admin@stitchcraft.local / admin123':'Demo Customer: 9876511111 / customer123';}
function login(e){e.preventDefault();const id=document.getElementById('loginId').value.trim(),pw=document.getElementById('loginPassword').value.trim();if(loginRole==='admin'){if((id.toLowerCase()==='admin@stitchcraft.local'||id==='admin')&&pw==='admin123'){localStorage.setItem('stitchcraftRole','admin');localStorage.setItem('stitchcraftUser','Administrator');enterApp();}else toast('Admin login: admin@stitchcraft.local / admin123');}else{const phone=id.replace(/\D/g,'');const customer=data.customers.find(c=>c.phone.replace(/\D/g,'').endsWith(phone)||c.phone.replace(/\D/g,'')===phone);if((phone==='9876511111'||customer)&&(!pw||pw==='customer123')){localStorage.setItem('stitchcraftRole','customer');localStorage.setItem('stitchcraftCustomer',customer?.name||'Priya Kumar');localStorage.setItem('stitchcraftUser',customer?.name||'Priya Kumar');enterApp();navigate('tracking');}else toast('Use demo customer: 9876511111 / customer123');}}
function enterApp(){document.getElementById('authScreen').style.display='none';document.getElementById('appRoot').style.display='flex';applyRoleUI();updateAll();generateNotifications(false)}
function logout(){localStorage.removeItem('stitchcraftRole');localStorage.removeItem('stitchcraftUser');localStorage.removeItem('stitchcraftCustomer');location.reload()}
function customerLogout(){logout()}
function applyRoleUI(){const role=localStorage.getItem('stitchcraftRole')||'admin';const user=localStorage.getItem('stitchcraftUser')||'Administrator';document.getElementById('userAvatar').textContent=initials(user);document.querySelectorAll('.nav-item').forEach(b=>{if(role==='customer'){b.style.display=b.dataset.page==='tracking'?'flex':'none'}else b.style.display='flex'});if(role==='customer'){document.getElementById('pageTitle').textContent='Customer Tracking'}}
function navigateV3(page){const role=localStorage.getItem('stitchcraftRole')||'admin';if(role==='customer'&&page!=='tracking')page='tracking';document.querySelectorAll('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.page===page));document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id==='page-'+page));document.getElementById('pageTitle').textContent=page==='ai'?'AI Assistant':page.split('-').map(x=>x[0].toUpperCase()+x.slice(1)).join(' ');if(page==='dashboard')renderDashboard();if(page==='orders')renderOrdersPage();if(page==='customers')renderCustomers();if(page==='measurements')renderMeasurements();if(page==='calendar')renderCalendar();if(page==='payments')renderPayments();if(page==='invoices')renderInvoices();if(page==='gallery')renderGallery();if(page==='materials')renderMaterials();if(page==='reports')renderReports();if(page==='settings')loadSettings();if(page==='notifications')renderNotifications();if(page==='tracking'){const c=localStorage.getItem('stitchcraftCustomer');if(c)renderCustomerTrackingHome(c)}document.getElementById('sidebar').classList.remove('open');window.scrollTo({top:0,behavior:'smooth'});}
navigate=navigateV3;

function readImage(file,cb){if(!file){cb('');return}if(!file.type.startsWith('image/')){toast('Please select an image file');return}if(file.size>2*1024*1024){toast('Image should be below 2 MB');return}const r=new FileReader();r.onload=()=>cb(r.result);r.readAsDataURL(file)}
function previewDesignUpload(input){readImage(input.files[0],src=>{const p=document.getElementById('designPreview');if(p){p.innerHTML=src?`<img src="${src}" alt="Design preview"><span>Reference design attached</span>`:'';p.style.display=src?'flex':'none';p.dataset.src=src||'';}})}
function openOrderModalV3(existing=null){const o=existing?data.orders.find(x=>x.id===existing):null;document.getElementById('modalRoot').innerHTML=`<div class="modal-backdrop" onclick="if(event.target===this)closeModal()"><div class="modal"><div class="modal-head"><h3>${o?'Edit Order':'New Tailoring Order'}</h3><button class="close" onclick="closeModal()">×</button></div><form onsubmit="saveOrderV3(event,${o?o.id:'null'})"><div class="form-grid"><div class="form-field"><label>Customer Name</label><input name="name" required value="${esc(o?.name||'')}"></div><div class="form-field"><label>Phone</label><input name="phone" required value="${esc(o?.phone||'')}"></div><div class="form-field"><label>Garment</label><input name="garment" required placeholder="Bridal Blouse" value="${esc(o?.garment||'')}"></div><div class="form-field"><label>Garment Type</label><select name="type">${['Blouse','Churidar','Kurti','Shirt','Pants','Saree','Alteration','Other'].map(x=>`<option ${o?.type===x?'selected':''}>${x}</option>`).join('')}</select></div><div class="form-field"><label>Delivery Date</label><input name="delivery" type="date" required value="${o?.delivery||new Date().toISOString().slice(0,10)}"></div><div class="form-field"><label>Status</label><select name="status">${statusList.map(x=>`<option ${o?.status===x?'selected':''}>${x}</option>`).join('')}</select></div><div class="form-field"><label>Total Amount (₹)</label><input name="amount" type="number" required value="${o?.amount||''}"></div><div class="form-field"><label>Advance Paid (₹)</label><input name="paid" type="number" value="${o?.paid||0}"></div><div class="form-field"><label>Bust / Chest</label><input name="chest" value="${o?.chest||''}"></div><div class="form-field"><label>Waist</label><input name="waist" value="${o?.waist||''}"></div><div class="form-field"><label>Length</label><input name="length" value="${o?.length||''}"></div><div class="form-field"><label>Notes</label><input name="notes" value="${esc(o?.notes||'')}"></div><div class="form-field" style="grid-column:1/-1"><label>📸 Design Reference</label><div class="upload-box"><input type="file" accept="image/*" name="designFile" onchange="previewDesignUpload(this)"><div id="designPreview" class="upload-preview" style="display:${o?.designImage?'flex':'none'}" data-src="${o?.designImage||''}">${o?.designImage?`<img src="${o.designImage}" alt="Design"><span>Existing design reference</span>`:''}</div></div></div></div><div class="modal-actions"><button type="button" class="secondary" onclick="closeModal()">Cancel</button><button class="primary">Save Order</button></div></form></div></div>`}
openOrderModal=openOrderModalV3;
function saveOrderV3(e,id){e.preventDefault();const f=new FormData(e.target),existing=id?data.orders.find(x=>x.id===id):null;const preview=document.getElementById('designPreview');const designImage=preview?.dataset.src||existing?.designImage||'';const obj={id:id||Date.now(),name:f.get('name').trim(),phone:f.get('phone').trim(),garment:f.get('garment').trim(),type:f.get('type'),delivery:f.get('delivery'),status:f.get('status'),amount:+f.get('amount')||0,paid:+f.get('paid')||0,chest:f.get('chest')||'N/A',waist:f.get('waist')||'N/A',length:f.get('length')||'N/A',notes:f.get('notes')||'',designImage,created:existing?.created||new Date().toISOString().slice(0,10)};if(id){data.orders[data.orders.findIndex(x=>x.id===id)]=obj}else{data.orders.push(obj);if(!data.customers.some(c=>c.name.toLowerCase()===obj.name.toLowerCase()))data.customers.push({id:Date.now()+1,name:obj.name,phone:obj.phone,joined:new Date().toISOString().slice(0,10)})}save();closeModal();toast(id?'Order updated with design':'New order created');navigate('orders')}
saveOrder=saveOrderV3;

function renderMeasurementsV3(){const groups={};data.measurements.forEach(m=>(groups[m.customer]??=[]).push(m));document.getElementById('measurementGrid').innerHTML=Object.entries(groups).map(([customer,arr])=>{arr.sort((a,b)=>b.updated.localeCompare(a.updated));const latest=arr[0];return `<div class="measurement-card"><div class="customer-top"><div class="customer-avatar">${initials(customer)}</div><div><h3>${esc(customer)}</h3><p>${esc(latest.type)} · Latest ${fmtDate(latest.updated)}</p></div></div><div class="measurements">${Object.entries(latest.m||{}).slice(0,6).map(([k,v])=>`<div><span>${k}</span><strong>${esc(v)}</strong></div>`).join('')}</div><div class="history-list"><strong style="font-size:12px">Measurement History (${arr.length})</strong>${arr.slice(0,5).map((m,i)=>`<div class="history-row"><span>${fmtDate(m.updated)} · ${esc(m.type)}</span><span class="history-badge">${i===0?'Latest':'Version '+(i+1)}</span></div>`).join('')}</div><div class="card-actions" style="margin-top:13px"><button class="small-btn" onclick="openMeasurementModal('${esc(customer)}')">✏️ Add Version</button><button class="small-btn" onclick="copyLatestMeasurement('${esc(customer)}')">📋 Copy</button></div></div>`}).join('')||'<div class="panel"><p>No measurements saved yet.</p></div>'}
renderMeasurements=renderMeasurementsV3;
function copyLatestMeasurement(customer){const m=data.measurements.filter(x=>x.customer===customer).sort((a,b)=>b.updated.localeCompare(a.updated))[0];if(!m)return;navigator.clipboard?.writeText(Object.entries(m.m).map(([k,v])=>`${k}: ${v}`).join('\n'));toast('Latest measurements copied')}

function renderGalleryV3(){document.getElementById('galleryGrid').innerHTML=data.designs.map((d,i)=>`<div class="design"><div class="design-art ${d[3]?'design-thumb':''}">${d[3]?`<img src="${d[3]}" alt="${esc(d[0])}">`:d[2]}</div><div class="design-info"><strong>${esc(d[0])}</strong><small>${esc(d[1])}</small></div></div>`).join('')}
renderGallery=renderGalleryV3;
function addDesignV3(){const name=prompt('Design name');if(!name)return;const category=prompt('Category / style','Custom · New')||'Custom · New';const input=document.createElement('input');input.type='file';input.accept='image/*';input.onchange=()=>readImage(input.files[0],src=>{data.designs.push([name,category,'✨',src]);save();toast('Design uploaded to gallery')});input.click()}
addDesign=addDesignV3;

function trackOrder(){const id=String(document.getElementById('trackOrderId').value).trim().replace(/^#/,'');const phone=document.getElementById('trackPhone').value.replace(/\D/g,'');const customer=localStorage.getItem('stitchcraftCustomer');let o=data.orders.find(x=>String(x.id)===id&&x.phone.replace(/\D/g,'').endsWith(phone));if(!o&&customer)o=data.orders.find(x=>String(x.id)===id&&x.name===customer);const box=document.getElementById('trackingResult');if(!o){box.innerHTML='<div class="empty-track">🔎<h3>Order not found</h3><p>Check the order ID and registered phone number.</p></div>';return}renderTrackingOrder(o)}
function renderTrackingOrder(o){const idx=Math.max(0,steps.indexOf(o.status)), labels=['Order Received','Stitching','Trial','Ready','Delivered'];document.getElementById('trackingResult').innerHTML=`<div class="track-head"><div><div class="track-id">Order #${o.id}</div><p>${esc(o.name)} · ${esc(o.garment)}</p></div><span class="track-status">${esc(o.status)}</span></div><div class="track-progress">${labels.map((x,i)=>`<div class="track-step ${i<=idx?'done':''} ${i===idx?'current':''}">${i<=idx?'✓ ':''}${x}</div>`).join('')}</div><div class="track-meta"><div><span>Expected delivery</span><strong>${fmtDate(o.delivery)}</strong></div><div><span>Amount</span><strong>${money(o.amount)}</strong></div><div><span>Balance</span><strong>${money(o.amount-o.paid)}</strong></div></div>${o.designImage?`<div style="margin-top:16px"><strong>Design reference</strong><div class="upload-preview"><img src="${o.designImage}" alt="Design"><span>Attached to this order</span></div></div>`:''}<div style="margin-top:18px"><button class="small-btn" onclick="whatsappOrder(${o.id})">💬 Contact Tailor</button></div>`}
function renderCustomerTrackingHome(customer){const orders=data.orders.filter(o=>o.name===customer).sort((a,b)=>b.id-a.id);const box=document.getElementById('trackingResult');if(orders.length){const o=orders[0];document.getElementById('trackOrderId').value=o.id;document.getElementById('trackPhone').value=o.phone.replace(/\D/g,'');renderTrackingOrder(o)}}

function getNotifications(){const alerts=[];data.orders.forEach(o=>{const d=daysFromNow(o.delivery);if(o.status!=='Delivered'&&d<0)alerts.push({icon:'🚨',title:'Overdue delivery',text:`Order #${o.id} for ${o.name} was due ${fmtDate(o.delivery)}.`,time:'Overdue'});else if(o.status!=='Delivered'&&d<=1)alerts.push({icon:'📅',title:'Delivery due soon',text:`Order #${o.id} · ${o.garment} is due ${d===0?'today':'tomorrow'}.`,time:d===0?'Today':'Tomorrow'});if(o.paid<o.amount)alerts.push({icon:'💳',title:'Payment pending',text:`${o.name} has ${money(o.amount-o.paid)} outstanding on order #${o.id}.`,time:'Payment'});});data.materials.filter(m=>m.stock<m.reorder).forEach(m=>alerts.push({icon:'📦',title:'Low stock',text:`${m.name} is below the reorder level.`,time:'Inventory'}));return alerts}
function renderNotifications(){const a=getNotifications();document.getElementById('alertCount').textContent=a.length;document.getElementById('dueSoonCount').textContent=a.filter(x=>x.title==='Delivery due soon'||x.title==='Overdue delivery').length;document.getElementById('paymentAlertCount').textContent=a.filter(x=>x.title==='Payment pending').length;document.getElementById('navAlerts').textContent=a.length;document.getElementById('notificationList').innerHTML=a.map(x=>`<div class="notification-item"><div class="ni-icon">${x.icon}</div><div><h4>${esc(x.title)}</h4><p>${esc(x.text)}</p></div><span class="ni-time">${esc(x.time)}</span></div>`).join('')||'<div class="empty-track">🎉<h3>All clear</h3><p>No active alerts.</p></div>';document.getElementById('notifDot').style.display=a.length?'block':'none'}
function generateNotifications(showToast=true){const a=getNotifications();renderNotifications();if(showToast)toast(`${a.length} active notification${a.length===1?'':'s'}`);const today=new Date().toISOString().slice(0,10);if(a.length&&localStorage.getItem('lastAutoNotify')!==today){localStorage.setItem('lastAutoNotify',today);if('Notification' in window&&Notification.permission==='granted'){new Notification('StitchCraft alerts',{body:`You have ${a.length} tailoring alert${a.length===1?'':'s'} today.`})}}}
function requestNotificationPermission(){if('Notification' in window&&Notification.permission==='default')Notification.requestPermission()}

function updateAllV3(){renderDashboard();renderOrdersPage();renderCustomers();renderMeasurements();renderCalendar();renderPayments();renderInvoices();renderGallery();renderMaterials();renderReports();renderNotifications();document.getElementById('navPending').textContent=data.orders.filter(o=>o.status==='Pending'||o.status==='In Progress').length}
updateAll=updateAllV3;
window.addEventListener('load',()=>{setLoginRole(loginRole);const role=localStorage.getItem('stitchcraftRole');if(role){enterApp()}else{document.getElementById('authScreen').style.display='flex';document.getElementById('appRoot').style.display='none'}requestNotificationPermission();});

/* ===== v4: Role-based Login+Registration, Forgot Password OTP, Admin-only Staff Creation, Full Customer Portal ===== */

function ensureV4Data(){
  data.staffAccounts = data.staffAccounts || [{id:1,name:'Administrator',email:'admin@stitchcraft.local',phone:'',password:'admin123',role:'Admin'}];
  data.customerAccounts = data.customerAccounts || [{id:1,name:'Priya Kumar',phone:'9876511111',email:'priya@example.com',password:'customer123'}];
  data.feedback = data.feedback || [];
}
ensureV4Data();

/* ---- Login screen role switch (remember me + register link visibility) ---- */
function setLoginRoleV4(role){
  loginRole=role;
  document.getElementById('adminTab').classList.toggle('active',role==='admin');
  document.getElementById('customerTab').classList.toggle('active',role==='customer');
  document.getElementById('loginId').placeholder = role==='admin' ? 'admin@stitchcraft.local' : 'Mobile number or email';
  document.getElementById('loginPassword').placeholder = '••••••••';
  document.getElementById('loginPassword').required = true;
  document.getElementById('demoLogin').textContent = role==='admin' ? 'Demo Admin: admin@stitchcraft.local / admin123' : 'Demo Customer: 9876511111 / customer123';
  const reg=document.getElementById('authRegisterLink');
  if(reg) reg.style.display = role==='admin' ? 'none' : 'block';
}
setLoginRole = setLoginRoleV4;

/* ---- Login (checks staffAccounts for admin, customerAccounts for customer) ---- */
function loginV4(e){
  e.preventDefault();
  ensureV4Data();
  const id=document.getElementById('loginId').value.trim();
  const pw=document.getElementById('loginPassword').value;
  const remember=document.getElementById('rememberMe')?.checked;
  if(loginRole==='admin'){
    const staff=data.staffAccounts.find(s=>s.email.toLowerCase()===id.toLowerCase()&&s.password===pw);
    if(staff){
      localStorage.setItem('stitchcraftRole','admin');
      localStorage.setItem('stitchcraftUser',staff.name);
      localStorage.removeItem('stitchcraftCustomer');
      remember?localStorage.setItem('stitchcraftRemember','1'):localStorage.removeItem('stitchcraftRemember');
      enterApp();
    } else toast('Incorrect admin email or password');
  } else {
    const phone=id.replace(/\D/g,'');
    const acc=data.customerAccounts.find(c=>(phone&&c.phone.replace(/\D/g,'')===phone)||(c.email&&c.email.toLowerCase()===id.toLowerCase()));
    if(acc&&acc.password===pw){
      localStorage.setItem('stitchcraftRole','customer');
      localStorage.setItem('stitchcraftCustomer',acc.name);
      localStorage.setItem('stitchcraftUser',acc.name);
      remember?localStorage.setItem('stitchcraftRemember','1'):localStorage.removeItem('stitchcraftRemember');
      enterApp();
    } else toast('Incorrect phone/email or password');
  }
}
login = loginV4;

/* ---- Customer self-registration ---- */
function openRegisterModal(){
  document.getElementById('modalRoot').innerHTML=`<div class="modal-backdrop" onclick="if(event.target===this)closeModal()"><div class="modal"><div class="modal-head"><h3>🧵 Create Customer Account</h3><button class="close" onclick="closeModal()">×</button></div><form onsubmit="submitRegister(event)"><div class="form-grid"><div class="form-field"><label>Full Name</label><input name="name" required></div><div class="form-field"><label>Mobile Number</label><input name="phone" required placeholder="98765xxxxx"></div><div class="form-field"><label>Email</label><input name="email" type="email" required></div><div class="form-field"><label>Password</label><input name="password" type="password" required minlength="4"></div><div class="form-field"><label>Confirm Password</label><input name="confirm" type="password" required minlength="4"></div></div><div class="modal-actions"><button type="button" class="secondary" onclick="closeModal()">Cancel</button><button class="primary">Create Account</button></div></form></div></div>`;
}
function submitRegister(e){
  e.preventDefault();
  const f=new FormData(e.target);
  const name=f.get('name').trim(),phone=f.get('phone').trim(),email=f.get('email').trim(),pw=f.get('password'),cpw=f.get('confirm');
  if(pw!==cpw){toast('Passwords do not match');return}
  const clean=phone.replace(/\D/g,'');
  if(data.customerAccounts.some(c=>c.phone.replace(/\D/g,'')===clean)){toast('An account with this mobile number already exists');return}
  data.customerAccounts.push({id:Date.now(),name,phone,email,password:pw});
  if(!data.customers.some(c=>c.phone.replace(/\D/g,'')===clean))data.customers.push({id:Date.now()+1,name,phone,joined:new Date().toISOString().slice(0,10)});
  save();
  document.getElementById('modalRoot').innerHTML=`<div class="modal-backdrop" onclick="closeModal()"><div class="modal success-modal"><div class="success-icon">✓</div><h3>Account Created!</h3><p>Welcome to Home Tailoring, ${esc(name)}! You can now log in with your mobile number and password.</p><button class="primary" onclick="closeModal();setLoginRole('customer');document.getElementById('loginId').value='${esc(phone)}'">Continue to Login</button></div></div>`;
}

/* ---- Forgot password (simulated OTP), works for both Admin and Customer ---- */
let resetState=null;
function openForgotModal(){resetState={role:loginRole,id:'',otp:'',step:1};renderForgotStep();}
function renderForgotStep(){
  const s=resetState;let body='';
  if(s.step===1){
    body=`<p>Enter your registered ${s.role==='admin'?'admin email':'email or mobile number'}.</p><div class="form-field"><label>${s.role==='admin'?'Admin Email':'Email / Mobile Number'}</label><input id="resetId" required placeholder="${s.role==='admin'?'admin@stitchcraft.local':'98765xxxxx or you@email.com'}"></div><div class="modal-actions"><button type="button" class="secondary" onclick="closeModal()">Cancel</button><button type="button" class="primary" onclick="sendResetOTP()">Send OTP</button></div>`;
  } else if(s.step===2){
    body=`<p>We sent a one-time password to <b>${esc(s.id)}</b>. (Prototype: OTP is simulated, shown in the alert popup.)</p><div class="form-field"><label>Enter OTP</label><input id="resetOtp" required maxlength="6" placeholder="4-digit code"></div><div class="modal-actions"><button type="button" class="secondary" onclick="openForgotModal()">Back</button><button type="button" class="primary" onclick="verifyResetOTP()">Verify</button></div>`;
  } else if(s.step===3){
    body=`<p>Create a new password for your account.</p><div class="form-field"><label>New Password</label><input id="resetPw1" type="password" required minlength="4"></div><div class="form-field"><label>Confirm Password</label><input id="resetPw2" type="password" required minlength="4"></div><div class="modal-actions"><button type="button" class="secondary" onclick="closeModal()">Cancel</button><button type="button" class="primary" onclick="submitResetPassword()">Reset Password</button></div>`;
  }
  document.getElementById('modalRoot').innerHTML=`<div class="modal-backdrop" onclick="if(event.target===this)closeModal()"><div class="modal"><div class="modal-head"><h3>🔑 Forgot Password</h3><button class="close" onclick="closeModal()">×</button></div>${body}</div></div>`;
}
function sendResetOTP(){
  const id=document.getElementById('resetId').value.trim();
  if(!id){toast('Enter your email or mobile number');return}
  const list=resetState.role==='admin'?data.staffAccounts:data.customerAccounts;
  const clean=id.replace(/\D/g,'');
  const acc=list.find(a=>(a.email&&a.email.toLowerCase()===id.toLowerCase())||(a.phone&&clean&&a.phone.replace(/\D/g,'')===clean));
  if(!acc){toast('No account found with these details');return}
  resetState.id=id;resetState.otp=String(Math.floor(1000+Math.random()*9000));resetState.step=2;
  renderForgotStep();
  setTimeout(()=>alert('Simulated OTP (would normally arrive by SMS/Email): '+resetState.otp),200);
}
function verifyResetOTP(){
  const val=document.getElementById('resetOtp').value.trim();
  if(val!==resetState.otp){toast('Incorrect OTP, please try again');return}
  resetState.step=3;renderForgotStep();
}
function submitResetPassword(){
  const p1=document.getElementById('resetPw1').value,p2=document.getElementById('resetPw2').value;
  if(p1.length<4){toast('Password too short');return}
  if(p1!==p2){toast('Passwords do not match');return}
  const list=resetState.role==='admin'?data.staffAccounts:data.customerAccounts;
  const clean=resetState.id.replace(/\D/g,'');
  const acc=list.find(a=>(a.email&&a.email.toLowerCase()===resetState.id.toLowerCase())||(a.phone&&clean&&a.phone.replace(/\D/g,'')===clean));
  if(acc){acc.password=p1;save();}
  closeModal();
  toast('Password reset successful. Please log in.');
}

/* ---- Admin-only: Add Staff / Admin accounts (Settings page) ---- */
function renderStaffList(){
  const el=document.getElementById('staffList');if(!el)return;
  el.innerHTML=data.staffAccounts.map(s=>`<div class="staff-row"><div class="customer-avatar">${initials(s.name)}</div><div><strong>${esc(s.name)}</strong><small>${esc(s.email)} · ${esc(s.role||'Admin')}</small></div></div>`).join('');
}
function openStaffModal(){
  document.getElementById('modalRoot').innerHTML=`<div class="modal-backdrop" onclick="if(event.target===this)closeModal()"><div class="modal"><div class="modal-head"><h3>Add Staff / Admin</h3><button class="close" onclick="closeModal()">×</button></div><form onsubmit="saveStaff(event)"><div class="form-grid"><div class="form-field"><label>Name</label><input name="name" required></div><div class="form-field"><label>Email</label><input name="email" type="email" required></div><div class="form-field"><label>Role</label><select name="role"><option>Admin</option><option>Staff / Tailor</option><option>Accountant</option></select></div><div class="form-field"><label>Password</label><input name="password" type="password" required minlength="4"></div></div><div class="modal-actions"><button type="button" class="secondary" onclick="closeModal()">Cancel</button><button class="primary">Create Account</button></div></form></div></div>`;
}
function saveStaff(e){
  e.preventDefault();
  const f=new FormData(e.target);const email=f.get('email').trim();
  if(data.staffAccounts.some(s=>s.email.toLowerCase()===email.toLowerCase())){toast('An account with this email already exists');return}
  data.staffAccounts.push({id:Date.now(),name:f.get('name').trim(),email,role:f.get('role'),password:f.get('password')});
  save();closeModal();renderStaffList();toast('Staff/Admin account created');
}
const _loadSettingsV3=loadSettings;
function loadSettingsV4(){_loadSettingsV3();renderStaffList();}
loadSettings=loadSettingsV4;

/* ---- Role-aware sidebar + navigation ---- */
function applyRoleUIV4(){
  const role=localStorage.getItem('stitchcraftRole')||'admin';
  const user=localStorage.getItem('stitchcraftUser')||'Administrator';
  document.getElementById('userAvatar').textContent=initials(user);
  document.querySelectorAll('.nav-item').forEach(b=>{b.style.display=(b.dataset.role||'admin')===role?'flex':'none';});
  const searchBox=document.querySelector('.search');if(searchBox)searchBox.style.display=role==='customer'?'none':'flex';
  document.getElementById('pageTitle').textContent=role==='customer'?'My Dashboard':'Dashboard';
}
applyRoleUI=applyRoleUIV4;

const customerPageSet=['cdashboard','myorders','tracking','mymeasurements','mydesigns','cpayments','cinvoices','notifications','feedback','myprofile'];
const adminPageSet=['dashboard','orders','tracking','customers','measurements','calendar','payments','invoices','gallery','materials','reports','ai','notifications','settings'];
const pageTitlesV4={ai:'AI Assistant',cdashboard:'My Dashboard',myorders:'My Orders',mymeasurements:'My Measurements',mydesigns:'My Designs',cpayments:'Payments',cinvoices:'My Invoices',myprofile:'My Profile',tracking:'Track Order'};

function navigateV4(page){
  const role=localStorage.getItem('stitchcraftRole')||'admin';
  if(role==='customer'&&!customerPageSet.includes(page))page='cdashboard';
  if(role!=='customer'&&!adminPageSet.includes(page))page='dashboard';
  document.querySelectorAll('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.page===page&&(x.dataset.role||'admin')===role));
  document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id==='page-'+page));
  document.getElementById('pageTitle').textContent=pageTitlesV4[page]||page.split('-').map(x=>x[0].toUpperCase()+x.slice(1)).join(' ');
  if(page==='dashboard')renderDashboard();
  if(page==='orders')renderOrdersPage();
  if(page==='customers')renderCustomers();
  if(page==='measurements')renderMeasurements();
  if(page==='calendar')renderCalendar();
  if(page==='payments')renderPayments();
  if(page==='invoices')renderInvoices();
  if(page==='gallery')renderGallery();
  if(page==='materials')renderMaterials();
  if(page==='reports')renderReports();
  if(page==='settings')loadSettings();
  if(page==='notifications')renderNotifications();
  if(page==='tracking'&&role==='customer'){const c=localStorage.getItem('stitchcraftCustomer');if(c)renderCustomerTrackingHome(c);}
  if(page==='cdashboard')renderCustomerDashboard();
  if(page==='myorders')renderMyOrders();
  if(page==='mymeasurements')renderMyMeasurements();
  if(page==='mydesigns')renderMyDesigns();
  if(page==='cpayments')renderMyPayments();
  if(page==='cinvoices')renderMyInvoices();
  if(page==='feedback')renderFeedback();
  if(page==='myprofile')renderMyProfile();
  document.getElementById('sidebar').classList.remove('open');
  window.scrollTo({top:0,behavior:'smooth'});
}
navigate=navigateV4;

function enterAppV4(){
  document.getElementById('authScreen').style.display='none';
  document.getElementById('appRoot').style.display='flex';
  applyRoleUI();
  updateAll();
  generateNotifications(false);
  const role=localStorage.getItem('stitchcraftRole')||'admin';
  navigate(role==='customer'?'cdashboard':'dashboard');
}
enterApp=enterAppV4;

/* ---- Notifications scoped to the logged-in customer ---- */
function getNotificationsV4(){
  const role=localStorage.getItem('stitchcraftRole')||'admin';
  const custName=localStorage.getItem('stitchcraftCustomer');
  const alerts=[];
  data.orders.forEach(o=>{
    if(role==='customer'&&o.name!==custName)return;
    const d=daysFromNow(o.delivery);
    if(o.status!=='Delivered'&&d<0)alerts.push({icon:'🚨',title:'Overdue delivery',text:`Order #${o.id} for ${o.name} was due ${fmtDate(o.delivery)}.`,time:'Overdue'});
    else if(o.status!=='Delivered'&&d<=1)alerts.push({icon:'📅',title:'Delivery due soon',text:`Order #${o.id} · ${o.garment} is due ${d===0?'today':'tomorrow'}.`,time:d===0?'Today':'Tomorrow'});
    if(o.paid<o.amount)alerts.push({icon:'💳',title:'Payment pending',text:`${role==='customer'?'You have':o.name+' has'} ${money(o.amount-o.paid)} outstanding on order #${o.id}.`,time:'Payment'});
  });
  if(role!=='customer')data.materials.filter(m=>m.stock<m.reorder).forEach(m=>alerts.push({icon:'📦',title:'Low stock',text:`${m.name} is below the reorder level.`,time:'Inventory'}));
  return alerts;
}
getNotifications=getNotificationsV4;

/* ---- Customer Dashboard ---- */
function renderCustomerDashboard(){
  const name=localStorage.getItem('stitchcraftCustomer');
  document.getElementById('custWelcome').textContent=`Welcome back, ${esc(name||'there')} 👋`;
  const orders=data.orders.filter(o=>o.name===name);
  document.getElementById('custStatOrders').textContent=orders.length;
  const active=orders.filter(o=>o.status!=='Delivered');
  document.getElementById('custStatActive').textContent=active.length;
  const upcoming=active.slice().sort((a,b)=>a.delivery.localeCompare(b.delivery))[0];
  document.getElementById('custStatDelivery').textContent=upcoming?fmtDate(upcoming.delivery):'—';
  const balance=orders.reduce((a,o)=>a+(o.amount-o.paid),0);
  document.getElementById('custStatBalance').textContent=money(balance);
  const latest=orders.slice().sort((a,b)=>b.id-a.id)[0];
  const panel=document.getElementById('custCurrentOrderPanel');
  if(latest){
    const idx=steps.indexOf(latest.status);
    panel.innerHTML=`<div class="panel-head"><div><h3>Current Order · #${latest.id}</h3><p>${esc(latest.garment)}</p></div><span class="status ${statusClass(latest.status)}">${latest.status}</span></div><div class="workflow" style="margin:14px 0">${steps.map((s,i)=>`<div class="step ${i<=idx?'done':''}">${i<=idx?'✓':''}</div>${i<steps.length-1?'<div class="step-line"></div>':''}`).join('')}</div><div class="order-meta"><div><span>Delivery</span><strong>${fmtDate(latest.delivery)}</strong></div><div><span>Amount</span><strong>${money(latest.amount)}</strong></div><div><span>Balance</span><strong>${money(latest.amount-latest.paid)}</strong></div></div><div class="card-actions" style="margin-top:12px"><button class="small-btn" onclick="navigate('tracking')">📲 Track Order</button><button class="small-btn" onclick="whatsappOrder(${latest.id})">💬 Contact Tailor</button></div>`;
  } else {
    panel.innerHTML=`<div class="empty-track">🧵<h3>No orders yet</h3><p>Visit or contact the studio to place your first order.</p></div>`;
  }
  document.getElementById('custRecentOrders').innerHTML=orders.slice().sort((a,b)=>b.id-a.id).slice(0,6).map(o=>`<tr><td><strong>#${o.id}</strong></td><td>${esc(o.garment)}</td><td>${fmtDate(o.delivery)}</td><td><span class="status ${statusClass(o.status)}">${o.status}</span></td><td>${money(o.amount)}</td></tr>`).join('')||emptyRow(5);
}

/* ---- My Orders ---- */
function customerOrderCard(o){
  const idx=steps.indexOf(o.status);
  return `<div class="order-card"><div class="order-top"><div><h3>${esc(o.garment)}</h3><small>Order #${o.id}</small></div><span class="status ${statusClass(o.status)}">${o.status}</span></div><div class="order-meta"><div><span>Delivery</span><strong>${fmtDate(o.delivery)}</strong></div><div><span>Amount</span><strong>${money(o.amount)}</strong></div><div><span>Paid</span><strong>${money(o.paid)}</strong></div><div><span>Balance</span><strong>${money(o.amount-o.paid)}</strong></div></div><div class="workflow">${steps.map((s,i)=>`<div class="step ${i<=idx?'done':''}">${i<=idx?'✓':''}</div>${i<steps.length-1?'<div class="step-line"></div>':''}`).join('')}</div>${o.designImage?`<div class="upload-preview" style="margin-top:10px"><img src="${o.designImage}" alt="Design"><span>Design reference</span></div>`:''}<div class="card-actions"><button class="small-btn" onclick="document.getElementById('trackOrderId').value='${o.id}';document.getElementById('trackPhone').value='${(o.phone||'').replace(/\D/g,'')}';navigate('tracking');trackOrder()">📲 Track</button><button class="small-btn" onclick="whatsappOrder(${o.id})">💬 WhatsApp</button><button class="small-btn" onclick="printInvoice(${o.id})">🧾 Invoice</button></div></div>`;
}
function renderMyOrders(){
  const name=localStorage.getItem('stitchcraftCustomer');
  const orders=data.orders.filter(o=>o.name===name).sort((a,b)=>b.id-a.id);
  document.getElementById('myOrdersGrid').innerHTML=orders.map(o=>customerOrderCard(o)).join('')||'<div class="panel"><p>You have no orders yet.</p></div>';
}

/* ---- My Measurements ---- */
function renderMyMeasurements(){
  const name=localStorage.getItem('stitchcraftCustomer');
  const arr=data.measurements.filter(m=>m.customer===name).sort((a,b)=>b.updated.localeCompare(a.updated));
  document.getElementById('myMeasurementGrid').innerHTML=arr.length?arr.map((m,i)=>`<div class="measurement-card"><div class="customer-top"><div class="customer-avatar">${initials(m.customer)}</div><div><h3>${esc(m.type)}</h3><p>${i===0?'Latest':'Earlier version'} · ${fmtDate(m.updated)}</p></div></div><div class="measurements">${Object.entries(m.m||{}).map(([k,v])=>`<div><span>${k}</span><strong>${esc(v)}</strong></div>`).join('')}</div></div>`).join(''):'<div class="panel"><p>No measurements saved yet. Contact the studio to record your measurements.</p></div>';
}
function requestMeasurementUpdate(){
  const name=localStorage.getItem('stitchcraftCustomer');
  const msg=`Hello, this is ${name}. I would like to update my measurements. Please arrange a fitting session.`;
  window.open('https://wa.me/?text='+encodeURIComponent(msg),'_blank');
}

/* ---- My Designs ---- */
function renderMyDesigns(){
  const name=localStorage.getItem('stitchcraftCustomer');
  const own=data.orders.filter(o=>o.name===name&&o.designImage);
  document.getElementById('myOrderDesigns').innerHTML=own.length?own.map(o=>`<div class="design"><div class="design-art design-thumb"><img src="${o.designImage}" alt="${esc(o.garment)}"></div><div class="design-info"><strong>${esc(o.garment)}</strong><small>Order #${o.id}</small></div></div>`).join(''):'<p style="color:var(--muted)">No design references attached to your orders yet.</p>';
  document.getElementById('myInspoGallery').innerHTML=data.designs.map(d=>`<div class="design"><div class="design-art ${d[3]?'design-thumb':''}">${d[3]?`<img src="${d[3]}" alt="${esc(d[0])}">`:d[2]}</div><div class="design-info"><strong>${esc(d[0])}</strong><small>${esc(d[1])}</small></div></div>`).join('');
}

/* ---- Payments ---- */
function renderMyPayments(){
  const name=localStorage.getItem('stitchcraftCustomer');
  const orders=data.orders.filter(o=>o.name===name);
  const paid=orders.reduce((a,o)=>a+o.paid,0),billed=orders.reduce((a,o)=>a+o.amount,0);
  document.getElementById('custPaidTotal').textContent=money(paid);
  document.getElementById('custBalanceTotal').textContent=money(billed-paid);
  document.getElementById('custPaymentTable').innerHTML=orders.map(o=>`<tr><td>#INV-${o.id}</td><td>${esc(o.garment)}</td><td>${money(o.amount)}</td><td>${money(o.paid)}</td><td>${money(o.amount-o.paid)}</td><td><span class="status ${o.paid>=o.amount?'s-ready':'s-pending'}">${o.paid>=o.amount?'Paid':'Due'}</span></td><td>${o.paid<o.amount?`<button class="small-btn" onclick="requestPayment(${o.id})">Pay Balance</button>`:'—'}</td></tr>`).join('')||emptyRow(7);
}
function requestPayment(id){
  const o=data.orders.find(x=>x.id===id);
  const msg=`Hello, I would like to pay the balance of ${money(o.amount-o.paid)} for order #${o.id} (${o.garment}).`;
  window.open('https://wa.me/?text='+encodeURIComponent(msg),'_blank');
}

/* ---- My Invoices ---- */
function renderMyInvoices(){
  const name=localStorage.getItem('stitchcraftCustomer');
  const orders=data.orders.filter(o=>o.name===name).sort((a,b)=>b.id-a.id);
  document.getElementById('custInvoiceGrid').innerHTML=orders.map(o=>`<div class="invoice-card"><span class="invoice-id">INV-${o.id}</span><h3>${esc(o.garment)}</h3><small style="color:var(--muted)">${fmtDate(o.created)}</small><strong>${money(o.amount)}</strong><div class="invoice-actions"><button class="small-btn" onclick="printInvoice(${o.id})">🖨 Print</button></div></div>`).join('')||'<div class="panel"><p>No invoices yet.</p></div>';
}

/* ---- Feedback ---- */
let currentRating=0;
function setRating(n){
  currentRating=n;
  document.querySelectorAll('#starRate span').forEach(s=>{const v=+s.dataset.val;s.textContent=v<=n?'★':'☆';s.classList.toggle('active',v<=n);});
}
function submitFeedback(){
  if(!currentRating){toast('Please select a star rating');return}
  const text=document.getElementById('feedbackText').value.trim();
  const name=localStorage.getItem('stitchcraftCustomer');
  data.feedback.push({id:Date.now(),customer:name,rating:currentRating,comment:text,date:new Date().toISOString().slice(0,10)});
  save();
  currentRating=0;
  document.getElementById('feedbackText').value='';
  document.querySelectorAll('#starRate span').forEach(s=>{s.textContent='☆';s.classList.remove('active')});
  toast('Thank you for your feedback!');
  renderFeedback();
}
function renderFeedback(){
  const name=localStorage.getItem('stitchcraftCustomer');
  const list=data.feedback.filter(f=>f.customer===name).sort((a,b)=>b.id-a.id);
  document.getElementById('myFeedbackList').innerHTML=list.length?list.map(f=>`<div class="notification-item"><div class="ni-icon">${'★'.repeat(f.rating)}${'☆'.repeat(5-f.rating)}</div><div><h4>${fmtDate(f.date)}</h4><p>${esc(f.comment||'No comment')}</p></div></div>`).join(''):'<p style="color:var(--muted)">You haven\'t submitted feedback yet.</p>';
}

/* ---- My Profile ---- */
function renderMyProfile(){
  const name=localStorage.getItem('stitchcraftCustomer');
  const acc=data.customerAccounts.find(c=>c.name===name);
  document.getElementById('profName').value=acc?.name||name||'';
  document.getElementById('profPhone').value=acc?.phone||'';
  document.getElementById('profEmail').value=acc?.email||'';
  document.getElementById('profCurPw').value='';document.getElementById('profNewPw').value='';document.getElementById('profNewPw2').value='';
}
function saveProfile(){
  const name=localStorage.getItem('stitchcraftCustomer');
  const acc=data.customerAccounts.find(c=>c.name===name);
  if(!acc){toast('Account not found');return}
  const newName=document.getElementById('profName').value.trim();
  const newPhone=document.getElementById('profPhone').value.trim();
  const newEmail=document.getElementById('profEmail').value.trim();
  const oldName=acc.name;
  acc.name=newName;acc.phone=newPhone;acc.email=newEmail;
  data.orders.forEach(o=>{if(o.name===oldName){o.name=newName;o.phone=newPhone;}});
  data.measurements.forEach(m=>{if(m.customer===oldName)m.customer=newName;});
  const cust=data.customers.find(c=>c.name===oldName);if(cust){cust.name=newName;cust.phone=newPhone;}
  data.feedback.forEach(f=>{if(f.customer===oldName)f.customer=newName;});
  localStorage.setItem('stitchcraftCustomer',newName);
  localStorage.setItem('stitchcraftUser',newName);
  save();
  toast('Profile updated');
  applyRoleUI();
}
function changePassword(){
  const name=localStorage.getItem('stitchcraftCustomer');
  const acc=data.customerAccounts.find(c=>c.name===name);
  if(!acc){toast('Account not found');return}
  const cur=document.getElementById('profCurPw').value,n1=document.getElementById('profNewPw').value,n2=document.getElementById('profNewPw2').value;
  if(acc.password!==cur){toast('Current password is incorrect');return}
  if(n1.length<4){toast('New password too short');return}
  if(n1!==n2){toast('New passwords do not match');return}
  acc.password=n1;save();toast('Password updated');
  document.getElementById('profCurPw').value='';document.getElementById('profNewPw').value='';document.getElementById('profNewPw2').value='';
}

/* ---- updateAll: include customer-portal pages ---- */
function updateAllV4(){
  renderDashboard();renderOrdersPage();renderCustomers();renderMeasurements();renderCalendar();renderPayments();renderInvoices();renderGallery();renderMaterials();renderReports();renderNotifications();
  document.getElementById('navPending').textContent=data.orders.filter(o=>o.status==='Pending'||o.status==='In Progress').length;
  const role=localStorage.getItem('stitchcraftRole')||'admin';
  if(role==='customer'){renderCustomerDashboard();renderMyOrders();renderMyMeasurements();renderMyDesigns();renderMyPayments();renderMyInvoices();renderFeedback();}
}
updateAll=updateAllV4;

/* ===== v5: HOSTED MODE — real PostgreSQL backend via REST API + JWT auth ===== */
/* This layer replaces the v4 localStorage-only login/registration/staff/CRUD
   functions with real network calls. Rendering functions (render*) are left
   untouched — only where data comes from and how mutations are saved changes. */

/* ---- Token storage: "Remember me" -> localStorage, otherwise sessionStorage (cleared on tab close) ---- */
function getToken(){ return localStorage.getItem('stitchcraft_token') || sessionStorage.getItem('stitchcraft_token'); }
function setToken(token, persist){
  if(persist){ localStorage.setItem('stitchcraft_token', token); sessionStorage.removeItem('stitchcraft_token'); }
  else { sessionStorage.setItem('stitchcraft_token', token); localStorage.removeItem('stitchcraft_token'); }
}
function clearToken(){ localStorage.removeItem('stitchcraft_token'); sessionStorage.removeItem('stitchcraft_token'); }

async function apiFetch(url, opts={}){
  const token=getToken();
  const headers=Object.assign({'Content-Type':'application/json'}, opts.headers||{});
  if(token) headers['Authorization']='Bearer '+token;
  const res=await fetch(url, Object.assign({}, opts, {headers}));
  let body=null;
  try{ body=await res.json(); }catch(e){ /* empty body is fine */ }
  if(!res.ok){
    const msg=(body&&body.error)||('Request failed ('+res.status+')');
    const err=new Error(msg); err.status=res.status; throw err;
  }
  return body;
}

/* ---- save() no longer writes to localStorage — every mutation below persists
   itself via a specific API call. save() is kept only as a re-render trigger
   so any remaining legacy call sites keep working harmlessly. ---- */
function saveV5(){ updateAll(); }
save=saveV5;

/* ---- Login ---- */
async function loginV5(e){
  e.preventDefault();
  const identifier=document.getElementById('loginId').value.trim();
  const password=document.getElementById('loginPassword').value;
  const remember=document.getElementById('rememberMe')?.checked;
  const btn=e.target.querySelector('.auth-submit');
  if(btn){btn.disabled=true;btn.textContent='Signing in…';}
  try{
    const res=await apiFetch('/api/auth/login',{method:'POST', body:JSON.stringify({role:loginRole, identifier, password})});
    setToken(res.token, remember);
    localStorage.setItem('stitchcraftRole', res.user.role);
    localStorage.setItem('stitchcraftUser', res.user.name);
    if(res.user.role==='customer') localStorage.setItem('stitchcraftCustomer', res.user.name);
    else localStorage.removeItem('stitchcraftCustomer');
    await enterApp();
  }catch(err){ toast(err.message); }
  finally{ if(btn){btn.disabled=false;btn.textContent='Login';} }
}
login=loginV5;

/* ---- Customer self-registration (no path here ever creates an Admin) ---- */
async function submitRegisterV5(e){
  e.preventDefault();
  const f=new FormData(e.target);
  const name=f.get('name').trim(), phone=f.get('phone').trim(), email=f.get('email').trim(), pw=f.get('password'), cpw=f.get('confirm');
  if(pw!==cpw){ toast('Passwords do not match'); return; }
  try{
    await apiFetch('/api/auth/register',{method:'POST', body:JSON.stringify({name,phone,email,password:pw})});
    document.getElementById('modalRoot').innerHTML=`<div class="modal-backdrop" onclick="closeModal()"><div class="modal success-modal"><div class="success-icon">✓</div><h3>Account Created!</h3><p>Welcome to Home Tailoring, ${esc(name)}! You can now log in with your mobile number and password.</p><button class="primary" onclick="closeModal();setLoginRole('customer');document.getElementById('loginId').value='${esc(phone)}'">Continue to Login</button></div></div>`;
  }catch(err){ toast(err.message); }
}
submitRegister=submitRegisterV5;

/* ---- Forgot password — simulated OTP round-trip against the real backend ---- */
async function sendResetOTPV5(){
  const id=document.getElementById('resetId').value.trim();
  if(!id){ toast('Enter your email or mobile number'); return; }
  try{
    const res=await apiFetch('/api/auth/forgot/send-otp',{method:'POST', body:JSON.stringify({role:resetState.role, identifier:id})});
    resetState.id=id; resetState.step=2;
    renderForgotStep();
    setTimeout(()=>alert('Simulated OTP (no SMS/email provider connected): '+res.otp),200);
  }catch(err){ toast(err.message); }
}
sendResetOTP=sendResetOTPV5;

async function verifyResetOTPV5(){
  const val=document.getElementById('resetOtp').value.trim();
  try{
    const res=await apiFetch('/api/auth/forgot/verify-otp',{method:'POST', body:JSON.stringify({role:resetState.role, identifier:resetState.id, otp:val})});
    resetState.resetToken=res.resetToken; resetState.step=3; renderForgotStep();
  }catch(err){ toast(err.message); }
}
verifyResetOTP=verifyResetOTPV5;

async function submitResetPasswordV5(){
  const p1=document.getElementById('resetPw1').value, p2=document.getElementById('resetPw2').value;
  if(p1.length<4){ toast('Password too short'); return; }
  if(p1!==p2){ toast('Passwords do not match'); return; }
  try{
    await apiFetch('/api/auth/forgot/reset',{method:'POST', body:JSON.stringify({resetToken:resetState.resetToken, newPassword:p1})});
    closeModal(); toast('Password reset successful. Please log in.');
  }catch(err){ toast(err.message); }
}
submitResetPassword=submitResetPasswordV5;

/* ---- Admin-only staff/admin account management ---- */
async function renderStaffListV5(){
  const el=document.getElementById('staffList'); if(!el) return;
  try{
    const staff=await apiFetch('/api/staff');
    el.innerHTML=staff.map(s=>`<div class="staff-row"><div class="customer-avatar">${initials(s.name)}</div><div><strong>${esc(s.name)}</strong><small>${esc(s.email)} · ${esc(s.role||'Admin')}</small></div></div>`).join('')||'<p style="color:var(--muted)">No staff accounts yet.</p>';
  }catch(err){ el.innerHTML='<p style="color:var(--muted)">Could not load staff accounts.</p>'; }
}
renderStaffList=renderStaffListV5;

async function saveStaffV5(e){
  e.preventDefault();
  const f=new FormData(e.target);
  try{
    await apiFetch('/api/staff',{method:'POST', body:JSON.stringify({name:f.get('name').trim(), email:f.get('email').trim(), role:f.get('role'), password:f.get('password')})});
    closeModal(); renderStaffList(); toast('Staff/Admin account created');
  }catch(err){ toast(err.message); }
}
saveStaff=saveStaffV5;

/* ---- Settings ---- */
function loadSettingsV5(){
  document.getElementById('shopName').value=data.settings?.shopName||'StitchCraft Studio';
  document.getElementById('shopPhone').value=data.settings?.shopPhone||'';
  document.getElementById('shopAddress').value=data.settings?.shopAddress||'';
  renderStaffList();
}
loadSettings=loadSettingsV5;

async function saveSettingsV5(){
  const shopName=document.getElementById('shopName').value;
  const shopPhone=document.getElementById('shopPhone').value;
  const shopAddress=document.getElementById('shopAddress').value;
  try{
    await apiFetch('/api/settings',{method:'PUT', body:JSON.stringify({shopName,shopPhone,shopAddress})});
    data.settings=Object.assign({},data.settings,{shopName,shopPhone,shopAddress});
    toast('Shop settings saved');
  }catch(err){ toast(err.message); }
}
saveSettings=saveSettingsV5;

/* ---- My Profile (customer) ---- */
async function renderMyProfileV5(){
  try{
    const me=await apiFetch('/api/auth/me');
    document.getElementById('profName').value=me.name||'';
    document.getElementById('profPhone').value=me.phone||'';
    document.getElementById('profEmail').value=me.email||'';
  }catch(err){ toast(err.message); }
  document.getElementById('profCurPw').value='';document.getElementById('profNewPw').value='';document.getElementById('profNewPw2').value='';
}
renderMyProfile=renderMyProfileV5;

async function saveProfileV5(){
  const name=document.getElementById('profName').value.trim();
  const phone=document.getElementById('profPhone').value.trim();
  const email=document.getElementById('profEmail').value.trim();
  try{
    const updated=await apiFetch('/api/auth/me',{method:'PUT', body:JSON.stringify({name,phone,email})});
    localStorage.setItem('stitchcraftCustomer', updated.name);
    localStorage.setItem('stitchcraftUser', updated.name);
    const cleanPhone=(phone||'').replace(/\D/g,'');
    data.orders.forEach(o=>{ if(o.phone && cleanPhone && o.phone.replace(/\D/g,'')===cleanPhone){ o.name=name; o.phone=phone; } });
    applyRoleUI();
    toast('Profile updated');
  }catch(err){ toast(err.message); }
}
saveProfile=saveProfileV5;

async function changePasswordV5(){
  const cur=document.getElementById('profCurPw').value, n1=document.getElementById('profNewPw').value, n2=document.getElementById('profNewPw2').value;
  if(n1.length<4){ toast('New password too short'); return; }
  if(n1!==n2){ toast('New passwords do not match'); return; }
  try{
    await apiFetch('/api/auth/me/password',{method:'PUT', body:JSON.stringify({currentPassword:cur, newPassword:n1})});
    toast('Password updated');
    document.getElementById('profCurPw').value='';document.getElementById('profNewPw').value='';document.getElementById('profNewPw2').value='';
  }catch(err){ toast(err.message); }
}
changePassword=changePasswordV5;

/* ---- Feedback ---- */
async function submitFeedbackV5(){
  if(!currentRating){ toast('Please select a star rating'); return; }
  const text=document.getElementById('feedbackText').value.trim();
  try{
    await apiFetch('/api/feedback',{method:'POST', body:JSON.stringify({rating:currentRating, comment:text})});
    currentRating=0;
    document.getElementById('feedbackText').value='';
    document.querySelectorAll('#starRate span').forEach(s=>{s.textContent='☆';s.classList.remove('active');});
    toast('Thank you for your feedback!');
    renderFeedback();
  }catch(err){ toast(err.message); }
}
submitFeedback=submitFeedbackV5;

async function renderFeedbackV5(){
  try{ data.feedback=await apiFetch('/api/feedback'); }catch(err){ data.feedback=data.feedback||[]; }
  const list=data.feedback.slice().sort((a,b)=>b.id-a.id);
  document.getElementById('myFeedbackList').innerHTML=list.length?list.map(f=>`<div class="notification-item"><div class="ni-icon">${'★'.repeat(f.rating)}${'☆'.repeat(5-f.rating)}</div><div><h4>${fmtDate(f.date)}</h4><p>${esc(f.comment||'No comment')}</p></div></div>`).join(''):'<p style="color:var(--muted)">You haven\'t submitted feedback yet.</p>';
}
renderFeedback=renderFeedbackV5;

/* ---- Orders ---- */
async function saveOrderV5(e,id){
  e.preventDefault();
  const f=new FormData(e.target);
  const preview=document.getElementById('designPreview');
  const existing=id?data.orders.find(x=>x.id===id):null;
  const designImage=preview?.dataset.src || existing?.designImage || null;
  const payload={
    name:f.get('name').trim(), phone:f.get('phone').trim(), garment:f.get('garment').trim(), type:f.get('type'),
    delivery:f.get('delivery'), status:f.get('status'), amount:+f.get('amount')||0, paid:+f.get('paid')||0,
    chest:f.get('chest')||'N/A', waist:f.get('waist')||'N/A', length:f.get('length')||'N/A', notes:f.get('notes')||'', designImage
  };
  try{
    const saved = id
      ? await apiFetch('/api/orders/'+id, {method:'PUT', body:JSON.stringify(payload)})
      : await apiFetch('/api/orders', {method:'POST', body:JSON.stringify(payload)});
    if(id){ const i=data.orders.findIndex(x=>x.id===id); data.orders[i]=saved; }
    else{
      data.orders.push(saved);
      if(!data.customers.some(c=>c.name.toLowerCase()===saved.name.toLowerCase())){
        data.customers.push({id:saved.customerId, name:saved.name, phone:saved.phone, joined:new Date().toISOString().slice(0,10)});
      }
    }
    closeModal(); toast(id?'Order updated':'New order created'); navigate('orders');
  }catch(err){ toast(err.message); }
}
saveOrder=saveOrderV5;

async function deleteOrderV5(id){
  if(!confirm('Delete this order?')) return;
  try{
    await apiFetch('/api/orders/'+id, {method:'DELETE'});
    data.orders=data.orders.filter(x=>x.id!==id);
    updateAll(); toast('Order deleted');
  }catch(err){ toast(err.message); }
}
deleteOrder=deleteOrderV5;

async function savePaymentV5(e,id){
  e.preventDefault();
  const amt=+new FormData(e.target).get('amount');
  try{
    const saved=await apiFetch('/api/orders/'+id+'/payment', {method:'PATCH', body:JSON.stringify({amount:amt})});
    const i=data.orders.findIndex(x=>x.id===id); data.orders[i]=saved;
    closeModal(); toast('Payment recorded'); updateAll();
  }catch(err){ toast(err.message); }
}
savePayment=savePaymentV5;

/* ---- Customers (CRM list) ---- */
async function saveCustomerV5(e){
  e.preventDefault();
  const f=new FormData(e.target);
  try{
    const saved=await apiFetch('/api/customers', {method:'POST', body:JSON.stringify({name:f.get('name'), phone:f.get('phone')})});
    data.customers.push(saved);
    closeModal(); toast('Customer added'); updateAll();
  }catch(err){ toast(err.message); }
}
saveCustomer=saveCustomerV5;

/* ---- Measurements ---- */
async function saveMeasurementV5(e){
  e.preventDefault();
  const f=new FormData(e.target), m={};
  ['Bust','Waist','Shoulder','Sleeve','Length','Hip'].forEach(k=>m[k]=f.get(k.toLowerCase())||'—');
  try{
    const saved=await apiFetch('/api/measurements', {method:'POST', body:JSON.stringify({customer:f.get('customer'), type:f.get('type'), m})});
    data.measurements.push(saved);
    closeModal(); toast('Measurement saved'); updateAll();
  }catch(err){ toast(err.message); }
}
saveMeasurement=saveMeasurementV5;

/* ---- Materials ---- */
async function saveMaterialV5(e){
  e.preventDefault();
  const f=new FormData(e.target);
  try{
    const saved=await apiFetch('/api/materials', {method:'POST', body:JSON.stringify({name:f.get('name'), unit:f.get('unit')||'units', stock:+f.get('stock')||0, reorder:+f.get('reorder')||5, icon:'📦'})});
    data.materials.push(saved);
    closeModal(); toast('Material added'); updateAll();
  }catch(err){ toast(err.message); }
}
saveMaterial=saveMaterialV5;

/* ---- Design gallery (objects {id,name,category,icon,image}, not the old tuple format) ---- */
function addDesignV5(){
  const name=prompt('Design name'); if(!name) return;
  const category=prompt('Category / style','Custom · New')||'Custom · New';
  const input=document.createElement('input'); input.type='file'; input.accept='image/*';
  input.onchange=()=>readImage(input.files[0], async src=>{
    try{
      const saved=await apiFetch('/api/designs', {method:'POST', body:JSON.stringify({name,category,icon:'✨',image:src||null})});
      data.designs.push(saved);
      toast('Design uploaded to gallery'); updateAll();
    }catch(err){ toast(err.message); }
  });
  input.click();
}
addDesign=addDesignV5;

function renderGalleryV5(){
  const el=document.getElementById('galleryGrid'); if(!el) return;
  el.innerHTML=data.designs.map(d=>`<div class="design"><div class="design-art ${d.image?'design-thumb':''}">${d.image?`<img src="${d.image}" alt="${esc(d.name)}">`:(d.icon||'✨')}</div><div class="design-info"><strong>${esc(d.name)}</strong><small>${esc(d.category||'')}</small></div></div>`).join('');
}
renderGallery=renderGalleryV5;

function renderMyDesignsV5(){
  const name=localStorage.getItem('stitchcraftCustomer');
  const own=data.orders.filter(o=>o.name===name&&o.designImage);
  document.getElementById('myOrderDesigns').innerHTML=own.length?own.map(o=>`<div class="design"><div class="design-art design-thumb"><img src="${o.designImage}" alt="${esc(o.garment)}"></div><div class="design-info"><strong>${esc(o.garment)}</strong><small>Order #${o.id}</small></div></div>`).join(''):'<p style="color:var(--muted)">No design references attached to your orders yet.</p>';
  document.getElementById('myInspoGallery').innerHTML=data.designs.map(d=>`<div class="design"><div class="design-art ${d.image?'design-thumb':''}">${d.image?`<img src="${d.image}" alt="${esc(d.name)}">`:(d.icon||'✨')}</div><div class="design-info"><strong>${esc(d.name)}</strong><small>${esc(d.category||'')}</small></div></div>`).join('');
}
renderMyDesigns=renderMyDesignsV5;

/* ---- Demo reset (clears transactional data only; safe for a shared demo instance) ---- */
async function resetDemoV5(){
  if(!confirm('This clears all orders, measurements and feedback. Customers, materials, designs, settings and login accounts are kept. Continue?')) return;
  try{
    await apiFetch('/api/admin/reset-demo', {method:'POST'});
    const state=await apiFetch('/api/state');
    data.customers=state.customers; data.orders=state.orders; data.measurements=state.measurements;
    data.materials=state.materials; data.designs=state.designs; data.settings=state.settings;
    data.feedback=[];
    updateAll(); toast('Demo data reset');
  }catch(err){ toast(err.message); }
}
resetDemo=resetDemoV5;

/* ---- Bootstrap + logout ---- */
async function enterAppV5(){
  document.getElementById('authScreen').style.display='none';
  document.getElementById('appRoot').style.display='flex';
  try{
    const state=await apiFetch('/api/state');
    data.customers=state.customers||[]; data.orders=state.orders||[]; data.measurements=state.measurements||[];
    data.materials=state.materials||[]; data.designs=state.designs||[]; data.settings=state.settings||{};
    const role=localStorage.getItem('stitchcraftRole')||'admin';
    data.feedback = role==='customer' ? await apiFetch('/api/feedback') : [];
    applyRoleUI();
    updateAll();
    generateNotifications(false);
    navigate(role==='customer'?'cdashboard':'dashboard');
  }catch(err){
    toast('Session expired, please log in again');
    logout();
  }
}
enterApp=enterAppV5;

function logoutV5(){
  clearToken();
  localStorage.removeItem('stitchcraftRole');
  localStorage.removeItem('stitchcraftUser');
  localStorage.removeItem('stitchcraftCustomer');
  location.reload();
}
logout=logoutV5;
