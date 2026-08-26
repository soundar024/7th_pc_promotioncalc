const form=document.getElementById("calculatorForm");
const currentLevel=document.getElementById("currentLevel");
const promotedLevel=document.getElementById("promotedLevel");
const currentBasic=document.getElementById("currentBasic");
const promotionDate=document.getElementById("promotionDate");
const resultCard=document.getElementById("resultCard");
const errorBox=document.getElementById("errorBox");

function formatRupees(value){return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(value);}
function populateLevels(){
 currentLevel.innerHTML='<option value="">Select Level</option>';
 promotedLevel.innerHTML='<option value="">Select Level</option>';
 PAY_MATRIX_LEVELS.forEach(level=>{
  currentLevel.add(new Option(`Level ${level}`,level));
  promotedLevel.add(new Option(`Level ${level}`,level));
 });
}
function getNextHigherCell(level,amount){
 const cells=PAY_MATRIX[String(level)]||[];
 return cells.find(cell=>cell>=amount)??null;
}
function calculateOneIncrement(basic){
 return Math.round((basic*1.03)/100)*100;
}
function addOneYear(dateString){
 const date=new Date(`${dateString}T00:00:00`);
 date.setFullYear(date.getFullYear()+1);
 return date.toLocaleDateString("en-GB");
}
function showError(message){
 errorBox.textContent=message;
 errorBox.classList.remove("hidden");
 resultCard.classList.add("hidden");
}
function clearError(){errorBox.classList.add("hidden");errorBox.textContent="";}

form.addEventListener("submit",event=>{
 event.preventDefault(); clearError();
 const level=Number(currentLevel.value), basic=Number(currentBasic.value), promoted=Number(promotedLevel.value), date=promotionDate.value;
 if(!level||!promoted||!basic||!date){showError("Please complete all required fields.");return;}
 if(promoted<=level){showError("The promoted Pay Level must be higher than the current Pay Level.");return;}
 if(!(PAY_MATRIX[String(promoted)]||[]).length){showError("The selected promoted Pay Level is not available.");return;}
 const incrementedBasic=calculateOneIncrement(basic);
 const fixedBasic=getNextHigherCell(promoted,incrementedBasic);
 if(fixedBasic===null){showError("No suitable cell was found in the selected promoted Pay Level.");return;}

 document.getElementById("resultCurrentLevel").textContent=`Level ${level}`;
 document.getElementById("resultCurrentBasic").textContent=formatRupees(basic);
 document.getElementById("resultIncrementedBasic").textContent=formatRupees(incrementedBasic);
 document.getElementById("resultPromotedLevel").textContent=`Level ${promoted}`;
 document.getElementById("resultFixedBasic").textContent=formatRupees(fixedBasic);
 document.getElementById("resultIncrease").textContent=formatRupees(fixedBasic-basic);
 document.getElementById("resultNextIncrement").textContent=addOneYear(date);
 document.getElementById("calculationText").textContent=`Existing basic ${formatRupees(basic)} + one increment → ${formatRupees(incrementedBasic)}. The equal or next higher cell in Level ${promoted} is ${formatRupees(fixedBasic)}.`;
 resultCard.classList.remove("hidden");
 resultCard.scrollIntoView({behavior:"smooth",block:"start"});
});
document.getElementById("printButton").addEventListener("click",()=>window.print());
populateLevels();
