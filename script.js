let subjects=[], state={}, active=null, timers={}, userGrade="";
let currentVisibleSection = "login";

const curriculum={
 "اولى ثانوي":["اللغة العربية","اللغة الإنجليزية","الرياضيات","العلوم","التاريخ","الفلسفة"],
 "تانية علمي":["اللغة العربية","اللغة الإنجليزية","الرياضيات","الفيزياء","الكيمياء","تاريخ"],
 "تانية ادبي":["اللغة العربية","اللغة الإنجليزية","التاريخ","الجغرافيا","علم النفس","فلسفه"],
 "تالتة علوم":["اللغة العربية","اللغة الإنجليزية","الأحياء","الفيزياء","الكيمياء"],
 "تالتة رياضة":["اللغة العربية","اللغة الإنجليزية","الرياضيات","الفيزياء","الكيمياء"],
 "تالتة ادبي":["اللغة العربية","اللغة الإنجليزية","التاريخ","الجغرافيا","الإحصاء"]
};

function updateNavVisibility(sectionId) {
    currentVisibleSection = sectionId;
    if(sectionId === "grades" || sectionId === "results" || sectionId === "prayerPage") {
        document.getElementById("navArrows").classList.remove("hidden");
    } else {
        document.getElementById("navArrows").classList.add("hidden");
    }
}

function customPrev() {
    if(currentVisibleSection === "grades") {
        document.getElementById("grades").classList.add("hidden");
        document.getElementById("grade").classList.remove("hidden");
        updateNavVisibility("grade");
    } else if(currentVisibleSection === "results") {
        document.getElementById("results").classList.add("hidden");
        document.getElementById("grades").classList.remove("hidden");
        updateNavVisibility("grades");
    } else if(currentVisibleSection === "prayerPage") {
        document.getElementById("prayerPage").classList.add("hidden");
        document.getElementById("results").classList.remove("hidden");
        updateNavVisibility("results");
    }
    window.scrollTo({top: 0, behavior: 'smooth'});
}

function goGrade(){
 let name = document.getElementById("username").value.trim();
 if(name === "") {
     alert("من فضلك أدخل اسمك");
     return;
 }
 localStorage.setItem("studyUser", name);
 document.getElementById("login").classList.add("hidden");
 document.getElementById("grade").classList.remove("hidden");
 updateNavVisibility("grade");
 document.querySelector(".logout").classList.remove("hidden");
 document.getElementById("welcome").innerText = "أهلاً يا " + name ;
}

function choose(g){
 userGrade=g;
 subjects=curriculum[g];
 document.getElementById("grade").classList.add("hidden");
 document.getElementById("grades").classList.remove("hidden");
 updateNavVisibility("grades");

 let html="";
 subjects.forEach(sub=>{
   html+=`<div class="subject-input"><label>${sub}</label><input type="number" id="grade-${sub}" min="0" max="100" placeholder="0-100"></div>`;
 });
 document.getElementById("gradeInputs").innerHTML=html;
}

function runAI(){
 let plan=[], message="";
 subjects.forEach(sub=>{
   let val=document.getElementById("grade-"+sub).value;
   if(val==="") val=0;
   val=parseInt(val);
   let level="قوي", hours=1;
   if(val<50){level="ضعيف"; hours=3;}
   else if(val<70){level="متوسط"; hours=2;}
   plan.push({name:sub,score:val,level,hours});
   document.getElementById("surpriseBtnContainer").classList.remove("hidden");
 });

 let weakCount=plan.filter(p=>p.level==="ضعيف").length;
 if(weakCount>=3) message=" البداية الصعبة تصنع المتفوقين!";
 else if(weakCount>=1) message=" مستواك كويس، شوية التزام وهتوصل للقمة!";
 else message=" ممتاز! حافظ على مستواك!";

 let aiHTML=`<table><tr><th>المادة</th><th>الدرجة</th><th>المستوى</th><th>ساعات يومية</th></tr>`;
 plan.forEach(p=>{
   aiHTML+=`<tr><td>${p.name}</td><td>${p.score}</td><td>${p.level}</td><td>${p.hours}</td></tr>`;
 });
 aiHTML+="</table>";
 document.getElementById("aiTable").innerHTML=aiHTML;

 document.getElementById("grades").classList.add("hidden");
 document.getElementById("results").classList.remove("hidden");
 updateNavVisibility("results");
 
 document.getElementById("schedule").innerHTML="";
 plan.forEach(p=>{
   state[p.name]={remain:p.hours*60*60,running:false};
   let html=`<div class="schedule-card">
      <div class="subject">📘 ${p.name}</div>
      <button id="btn-${p.name}" onclick="toggle('${p.name}')"> ابدأ</button>
      <div class="stopwatch" id="time-${p.name}">${p.hours}:00:00</div>
      <div class="task-column">
        <label><input type="checkbox" onchange="updateProgress('${p.name}')"> فهم الدرس</label>
        <label><input type="checkbox" onchange="updateProgress('${p.name}')"> حل الأسئلة</label>
        <label><input type="checkbox" onchange="updateProgress('${p.name}')"> تلخيص</label>
        <label><input type="checkbox" onchange="updateProgress('${p.name}')"> مراجعة</label>
      </div>
      <div class="progress-box">
        <div class="progress-text">نسبة الإنجاز: <span id="percent-${p.name}">0%</span></div>
        <div class="progress-bar"><div class="progress-fill" id="bar-${p.name}"></div></div>
      </div>
    </div>`;
   document.getElementById("schedule").innerHTML+=html;
 });
document.getElementById("schedule").innerHTML+=`<div class="motivation">${message}</div>`;

generateWeeklyTable(plan);
confetti({particleCount:120,spread:120});
}

function generateWeeklyTable(plan){
 let days=["السبت","الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس"];
 let table=`<table><tr><th>اليوم</th>`;
 plan.forEach(p=>table+=`<th>${p.name}</th>`);
 table+=`</tr>`;
 days.forEach(day=>{
   table+=`<tr><td>${day}</td>`;
   plan.forEach(p=>table+=`<td>${p.hours} ساعة</td>`);
   table+=`</tr>`;
 });
 table+=`</table>`;
 document.getElementById("weeklyTable").innerHTML=table;
}

function updateProgress(sub){
 let card=[...document.querySelectorAll(".schedule-card")].find(c=>c.querySelector(".subject").innerText.includes(sub));
 let checks=card.querySelectorAll("input[type=checkbox]");
 let done=[...checks].filter(c=>c.checked).length;
 let percent=done*25;
 document.getElementById("percent-"+sub).innerText=percent+"%";
 document.getElementById("bar-"+sub).style.width=percent+"%";
 if(percent===100){document.getElementById("doneSound").play(); confetti({particleCount:180,spread:120});}
}

function toggle(sub){
 if(active && active!==sub) stop(active);
 let st=state[sub];
 let btn=document.getElementById("btn-"+sub);
 if(st.running){
   stop(sub);
   btn.innerText=" ابدأ";
 }else{
   active=sub;
   st.running=true;
   btn.innerText=" إيقاف";
   timers[sub]=setInterval(()=>{
     if(st.remain<=0){finish(sub); return;}
     st.remain--;
     let h=Math.floor(st.remain/3600);
     let m=Math.floor((st.remain%3600)/60);
     let s=st.remain%60;
     document.getElementById("time-"+sub).innerText=`${h}:${m<10?"0"+m:m}:${s<10?"0"+s:s}`;
   },1000);
 }
}

function stop(sub){
 clearInterval(timers[sub]);
 state[sub].running=false;
 active=null;
 let btn=document.getElementById("btn-"+sub);
 if(btn) btn.innerText=" ابدأ";
}

function finish(sub){
 clearInterval(timers[sub]);
 active=null;
 document.getElementById("time-"+sub).innerText=" خلصت";
 document.getElementById("doneSound").play();
 confetti({particleCount:220,spread:120});
}

function logout(){
 localStorage.clear();
 location.reload();
}

window.onload = () => {
 let storedUser = localStorage.getItem("studyUser");
 if(storedUser) {
     document.getElementById("username").value = storedUser;
     document.getElementById("welcome").innerText = "أهلاً يا " + storedUser;
     document.getElementById("login").classList.add("hidden");
     document.getElementById("grade").classList.remove("hidden");
     updateNavVisibility("grade");
     document.querySelector(".logout").classList.remove("hidden");
 }
}

function startProject(){
  document.getElementById("intro").style.display="none";
}

function showPrayerPage() {
    document.getElementById("results").classList.add("hidden");
    document.getElementById("surpriseBtnContainer").classList.add("hidden");
    document.getElementById("prayerPage").classList.remove("hidden");
    updateNavVisibility("prayerPage");
    window.scrollTo({top: 0, behavior: 'smooth'});
    confetti({particleCount: 150, spread: 70, origin: { y: 0.6 }});
}