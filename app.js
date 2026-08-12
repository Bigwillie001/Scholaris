const KEY="scholaris-data-v1";

const defaultData={
  profile:{name:"Alex Johnson",course:"Computer Science",year:"2027"},
  theme:"light",
  semester:{start:"",end:""},
  funding:[],
  expenses:[],
  goals:[],
  splits:[]
};

let data=loadData();
let selectedGoalId=null;

function loadData(){
  try{return {...structuredClone(defaultData),...JSON.parse(localStorage.getItem(KEY)||"{}")};}
  catch{return structuredClone(defaultData)}
}
function save(){localStorage.setItem(KEY,JSON.stringify(data));render();}
function money(n){return new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(Number(n)||0)}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function initials(name){return name.trim().split(/\s+/).slice(0,2).map(x=>x[0]?.toUpperCase()||"").join("")||"AA"}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove("show"),2200)}

function openModal(name){
  document.getElementById("modalBackdrop").classList.remove("hidden");
  document.querySelectorAll(".modal-panel").forEach(p=>p.classList.toggle("active",p.dataset.modal===name));
  if(name==="profile"){
    profileNameInput.value=data.profile.name;profileCourseInput.value=data.profile.course;profileYearInput.value=data.profile.year;
  }
}
function closeModal(){document.getElementById("modalBackdrop").classList.add("hidden")}
function resetInputs(ids){ids.forEach(id=>{const e=document.getElementById(id);if(e)e.value=""})}

function totals(){
  const funding=data.funding.reduce((a,b)=>a+Number(b.amount),0);
  const expenses=data.expenses.reduce((a,b)=>a+Number(b.amount),0);
  const saved=data.goals.reduce((a,b)=>a+Number(b.saved),0);
  return {funding,expenses,saved,balance:Math.max(0,funding-expenses-saved)};
}

function renderProfile(){
  const p=data.profile;
  document.getElementById("profileNameTop").textContent=p.name;
  document.getElementById("profileCourseTop").textContent=`${p.course} '${String(p.year).slice(-2)}`;
  document.getElementById("avatarInitials").textContent=initials(p.name);
  document.getElementById("aiGreeting").textContent=`Hello ${p.name}! I'm your Scholaris AI Co-Pilot.`;
}

function renderSummary(){
  const t=totals();
  totalFunding.textContent=money(t.funding); availableBalance.textContent=money(t.balance); totalExpenses.textContent=money(t.expenses); totalSaved.textContent=money(t.saved);
  fundingCount.textContent=`${data.funding.length} active source${data.funding.length===1?"":"s"}`;
  goalsCount.textContent=`${data.goals.length} active goal${data.goals.length===1?"":"s"}`;
  const needs=data.expenses.filter(e=>["Education","Accommodation","Transport","Food","Communication"].includes(e.category)).reduce((a,b)=>a+Number(b.amount),0);
  const wants=Math.max(0,t.expenses-needs);
  document.getElementById("needsWants").textContent=`Needs: ${t.expenses?Math.round(needs/t.expenses*100):0}% | Wants: ${t.expenses?Math.round(wants/t.expenses*100):0}%`;

  const end=data.semester.end?new Date(data.semester.end):null;
  const now=new Date(); if(end && end>now){
    const days=Math.max(1,Math.ceil((end-now)/86400000));
    dailyRunway.textContent=`${money(t.balance/days)} / day`; daysLeft.textContent=`${days} days left`;
    const pace=t.balance/days; semesterPace.textContent=`Semester Pace: ${pace>=2000?"Strong buffer":pace>=1000?"Balanced":"Tight runway"}`;
  }else{dailyRunway.textContent="₦0 / day";daysLeft.textContent="-- days left";semesterPace.textContent="Semester Pace: Optimal"}
  let score=82; if(t.funding===0) score=82; else {const ratio=t.expenses/t.funding; score=Math.max(20,Math.min(100,Math.round(92-ratio*70+(t.saved/t.funding)*10)));}
  healthScore.textContent=`${score} /100`;
  healthText.textContent=score>=75?"Healthy starting position. Your current spending and savings picture is in a strong range.":score>=55?"Watch your spending mix and keep important savings contributions visible.":"Your spending is consuming a large share of funding. Review needs, wants, and upcoming obligations.";
}

function renderFunding(){
  const by=(cats)=>data.funding.filter(x=>cats.includes(x.category)).reduce((a,b)=>a+Number(b.amount),0);
  inflowStat.textContent=money(data.funding.reduce((a,b)=>a+Number(b.amount),0));
  scholarshipStat.textContent=money(by(["Scholarship / Grant"]));
  otherFundingStat.textContent=money(by(["Loan","Work-Study","Allowance","Side Income","Other"]));
  const rows=document.getElementById("fundingRows");
  rows.innerHTML=data.funding.map(x=>`<tr><td>${esc(x.name)}</td><td>${esc(x.category)}</td><td>${money(x.amount)}</td><td>${esc(x.date||"—")}</td><td>${esc(x.frequency)}</td><td><button class="ghost small-delete" data-kind="funding" data-id="${x.id}">Delete</button></td></tr>`).join("");
  document.getElementById("fundingEmpty").classList.toggle("hidden",data.funding.length!==0);
  semesterStart.value=data.semester.start||"";semesterEnd.value=data.semester.end||"";
}

function renderExpenses(){
  const q=(expenseSearch.value||"").toLowerCase(), f=expenseFilter.value;
  const filtered=data.expenses.filter(x=>(f==="all"||x.category===f)&&(`${x.category} ${x.note}`.toLowerCase().includes(q)));
  expenseRows.innerHTML=filtered.map(x=>`<tr><td>${esc(x.note||x.category)}</td><td>${esc(x.category)}</td><td>${money(x.amount)}</td><td>${esc(x.date||"—")}</td><td>${esc(x.priority)}</td><td><button class="ghost small-delete" data-kind="expense" data-id="${x.id}">Delete</button></td></tr>`).join("");
  expenseEmpty.classList.toggle("hidden",data.expenses.length>0);
  renderChart();
}
function renderChart(){
  const sums={};data.expenses.forEach(x=>sums[x.category]=(sums[x.category]||0)+Number(x.amount));
  const max=Math.max(1,...Object.values(sums));
  breakdownChart.innerHTML=Object.entries(sums).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="bar-row"><div class="bar-head"><span>${esc(k)}</span><strong>${money(v)}</strong></div><div class="bar-track"><div class="bar-fill" style="width:${Math.max(4,Math.round(v/max*100))}%"></div></div></div>`).join("")||`<div class="empty">Add expenses to see your spending breakdown.</div>`;
}

function goalMarkup(g,full=false){
  const pct=Math.max(0,Math.min(100,Math.round(Number(g.saved)/Math.max(1,Number(g.target))*100)));
  return `<div class="goal-card"><div class="goal-meta"><span>${esc(g.name)}</span><span>${pct}%</span></div><strong>${money(g.saved)} / ${money(g.target)}</strong><div class="progress"><span style="width:${pct}%"></span></div><div class="goal-meta"><span>${g.date?`Target: ${esc(g.date)}`:"No target date set"}</span><span>${money(Math.max(0,Number(g.target)-Number(g.saved)))} left</span></div><div class="goal-actions">${full?`<button class="ghost deposit-btn" data-id="${g.id}">Deposit</button>`:""}<button class="ghost small-delete" data-kind="goal" data-id="${g.id}">Delete</button></div></div>`;
}
function renderGoals(){
  goalsList.innerHTML=data.goals.map(g=>goalMarkup(g,false)).join("");
  goalsFullList.innerHTML=data.goals.map(g=>goalMarkup(g,true)).join("");
  goalsEmpty.classList.toggle("hidden",data.goals.length>0);
}
function renderSplits(){
  splitsList.innerHTML=data.splits.map(s=>`<div class="split-card"><h3>${esc(s.desc)}</h3><div class="split-meta"><span>Total: ${money(s.total)}</span><span>Participants: ${s.people.length}</span></div><p>${esc(s.people.join(", "))}</p><strong>Equal share: ${money(s.share)} each</strong><div class="goal-actions"><button class="ghost small-delete" data-kind="split" data-id="${s.id}">Delete</button></div></div>`).join("");
  splitsEmpty.classList.toggle("hidden",data.splits.length>0);
}
function applyTheme(){document.body.classList.toggle("dark",data.theme==="dark");themeToggle.textContent=data.theme==="dark"?"☀️":"🌙"}

function render(){
  renderProfile();renderSummary();renderFunding();renderExpenses();renderGoals();renderSplits();applyTheme();
}

function csvDownload(filename,rows){
  const csv=rows.map(r=>r.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\n");
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download=filename;a.click();URL.revokeObjectURL(a.href);
}

function aiAnswer(q){
  const t=totals(), low=q.toLowerCase();
  if(t.funding===0 && t.expenses===0) return `You haven't entered funding or expenses yet. Start by adding your expected income and a few recent expenses so Scholaris can give you a personalized answer, ${data.profile.name}.`;
  if(low.includes("runway")||low.includes("daily")) return `Your current available balance is ${money(t.balance)}. ${dailyRunway.textContent==="₦0 / day"?"Add your semester end date to calculate a daily runway.":`Your estimated daily runway is ${dailyRunway.textContent}.`}`;
  if(low.includes("spend")||low.includes("most")) {
    const sums={};data.expenses.forEach(x=>sums[x.category]=(sums[x.category]||0)+Number(x.amount));
    const top=Object.entries(sums).sort((a,b)=>b[1]-a[1])[0];
    return top?`Your biggest spending category so far is ${top[0]} at ${money(top[1])}. Review that category against your needs and upcoming academic obligations.`:`You don't have enough expense data yet to identify a spending pattern.`;
  }
  if(low.includes("sav")) {
    const goals=data.goals.map(g=>`${g.name} (${money(g.saved)} of ${money(g.target)})`).join(", ");
    return data.goals.length?`You currently have ${data.goals.length} savings goal(s): ${goals}. Your combined reserved amount is ${money(t.saved)}. Keep contributions consistent and protect essential semester costs first.`:`Create a savings goal so I can help you track progress.`;
  }
  return `Here is your current snapshot: ${money(t.funding)} funded, ${money(t.expenses)} spent, ${money(t.saved)} reserved, and ${money(t.balance)} available. I can give more specific guidance when you ask about runway, spending, savings, or a particular category.`;
}

document.addEventListener("click",e=>{
  const open=e.target.closest("[data-open]"); if(open){openModal(open.dataset.open);return}
  if(e.target.closest("#openProfile")||e.target.closest("#heroEditProfile")){openModal("profile");return}
  if(e.target.closest("#modalClose")||e.target.closest("[data-close]")){closeModal();return}
  const del=e.target.closest(".small-delete"); if(del){
    const {kind,id}=del.dataset; data[kind]=data[kind].filter(x=>x.id!==id);save();toast("Item removed.");return
  }
  const dep=e.target.closest(".deposit-btn"); if(dep){selectedGoalId=dep.dataset.id;openModal("deposit");return}
  const qp=e.target.closest("[data-prompt]"); if(qp){aiInput.value=qp.dataset.prompt;sendAI();return}
});

quickAdd.addEventListener("click",()=>{
  const amount=Number(quickAmount.value);if(!amount)return toast("Enter an amount first.");
  data.expenses.push({id:uid(),category:quickCategory.value,amount,date:quickDate.value,note:quickNote.value,priority:quickPriority.value});
  resetInputs(["quickAmount","quickDate","quickNote"]);save();toast("Expense added.");
});
saveExpense.addEventListener("click",()=>{
  const amount=Number(expAmount.value);if(!amount)return toast("Enter an expense amount.");
  data.expenses.push({id:uid(),category:expCategory.value,amount,date:expDate.value,note:expNote.value,priority:expPriority.value});
  resetInputs(["expAmount","expDate","expNote"]);save();closeModal();toast("Expense saved.");
});
saveFunding.addEventListener("click",()=>{
  const amount=Number(fundAmount.value);if(!amount||!fundName.value.trim())return toast("Add a funding name and amount.");
  data.funding.push({id:uid(),name:fundName.value,category:fundCategory.value,amount,date:fundDate.value,frequency:fundFrequency.value});
  resetInputs(["fundName","fundAmount","fundDate"]);save();closeModal();toast("Funding source added.");
});
saveGoal.addEventListener("click",()=>{
  const target=Number(goalTarget.value),saved=Number(goalSaved.value)||0;if(!goalName.value.trim()||!target)return toast("Add a goal name and target.");
  data.goals.push({id:uid(),name:goalName.value,target,saved,date:goalDate.value});resetInputs(["goalName","goalTarget","goalSaved","goalDate"]);save();closeModal();toast("Savings goal created.");
});
saveSplit.addEventListener("click",()=>{
  const total=Number(splitTotal.value);const people=splitPeople.value.split(",").map(x=>x.trim()).filter(Boolean);if(!splitDesc.value.trim()||!total||!people.length)return toast("Add a description, amount, and participants.");
  data.splits.push({id:uid(),desc:splitDesc.value,total,payer:splitPayer.value||data.profile.name,people,share:total/people.length});resetInputs(["splitDesc","splitTotal","splitPayer","splitPeople"]);save();closeModal();toast("Bill split calculated.");
});
saveDeposit.addEventListener("click",()=>{
  const amount=Number(depositAmount.value),g=data.goals.find(x=>x.id===selectedGoalId);if(!g||!amount)return toast("Enter a deposit amount.");
  g.saved=Math.min(Number(g.target),Number(g.saved)+amount);depositAmount.value="";save();closeModal();toast("Savings goal updated.");
});
profileSave.addEventListener("click",()=>{
  if(!profileNameInput.value.trim())return toast("Enter a username.");
  data.profile={name:profileNameInput.value.trim(),course:profileCourseInput.value.trim()||"Student",year:profileYearInput.value.trim()||"2027"};save();closeModal();toast("Profile updated.");
});
profileCancel.addEventListener("click",closeModal);
themeToggle.addEventListener("click",()=>{data.theme=data.theme==="dark"?"light":"dark";save()});
saveSemester.addEventListener("click",()=>{data.semester={start:semesterStart.value,end:semesterEnd.value};save();toast("Semester dates updated.")});
expenseSearch.addEventListener("input",renderExpenses);expenseFilter.addEventListener("change",renderExpenses);

function sendAI(){const q=aiInput.value.trim();if(!q)return;aiResponse.textContent=aiAnswer(q);aiInput.value=""}
aiSend.addEventListener("click",sendAI);aiInput.addEventListener("keydown",e=>{if(e.key==="Enter")sendAI()});

exportExpenses.addEventListener("click",()=>csvDownload("scholaris-expenses.csv",[["Purpose","Category","Amount","Date","Priority"],...data.expenses.map(x=>[x.note,x.category,x.amount,x.date,x.priority])]));
exportFunding.addEventListener("click",()=>csvDownload("scholaris-funding.csv",[["Source","Category","Amount","Date","Frequency"],...data.funding.map(x=>[x.name,x.category,x.amount,x.date,x.frequency])]));
printReport.addEventListener("click",()=>window.print());
loadDemo.addEventListener("click",()=>{
  data.funding=[
    {id:uid(),name:"Semester Allowance",category:"Allowance",amount:150000,date:new Date().toISOString().slice(0,10),frequency:"Semester"},
    {id:uid(),name:"Merit Scholarship",category:"Scholarship / Grant",amount:80000,date:new Date().toISOString().slice(0,10),frequency:"Semester"}
  ];
  data.expenses=[
    {id:uid(),category:"Education",amount:18000,date:new Date().toISOString().slice(0,10),note:"Textbooks and printing",priority:"High"},
    {id:uid(),category:"Food",amount:22500,date:new Date().toISOString().slice(0,10),note:"Meals and groceries",priority:"Normal"},
    {id:uid(),category:"Transport",amount:12000,date:new Date().toISOString().slice(0,10),note:"Campus transport",priority:"Normal"}
  ];
  data.goals=[{id:uid(),name:"Laptop Reserve",target:300000,saved:45000,date:"2027-06-30"}];save();toast("Sample Scholaris data loaded.");
});
resetData.addEventListener("click",()=>{if(confirm("Reset all Scholaris data?")){data=structuredClone(defaultData);save();toast("Scholaris data reset.");}});
render();
