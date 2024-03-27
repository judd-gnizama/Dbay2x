// Todo 
/*
- lists are always flipping
- data validation
- select all (done)
- grey outs
- auto calculate (done)
- When editing transactions, changes must be committed by group. 
- Decimal values in photo editing pictures. 
- Double payer dropdown list (done)
- double saved transactions
- when editing transactions, even though select all is checked, not all are checked. 
- when all are checked, toggle select all
*/



// CONSTANTS AND VARIABLES

var members = [];
var transactions = [];
var tempTransaction = {};

const transactionContent = document.querySelectorAll('#transaction_content > div');
const summaryContent = document.querySelectorAll('#summary_content > div');

const memberInput = document.getElementById('memberInput');
const memberTableList = document.getElementById('members_table_list');
const addMemberBtn = document.getElementById('addMemberBtn');
const clrMemberBtn = document.getElementById('clrMemberBtn');

const transactionTableList = document.getElementById('transaction_table_list');
const addTransactionBtn = document.getElementById('addTransactionBtn');
const clrAllTransactionBtn = document.getElementById('clrAllTransactionBtn');

const calculateBtn = document.getElementById('calculateBtn');
const summaryTableList = document.getElementById('summary_table_list');
const reimbursementTableList = document.getElementById('reimbursement_table_list');

const addTransactionPopupmenu = document.getElementById('addTransactionPopupmenu');
const addTransactionPopupmenuWrapper = document.querySelector('#addTransactionPopupmenu > div');
const blackBg = document.getElementById('blackBg');

const transactionIdPopup = document.getElementById('transactionIdPopup');
const descriptionPopup = document.getElementById('descriptionPopup');
const amountPopup = document.getElementById('amountPopup');
const payerPopup = document.getElementById('payerPopup');
const splitRadioBtns = document.querySelectorAll('input[name="split"]');
const detailsTable = document.getElementById('details_table');
const saveTransactionBtn = document.getElementById('saveTransactionBtn_popup');
const saveChangesBtn = document.getElementById('saveChangesBtn_popup');
const cancelBtn = document.getElementById('cancelBtn_popup');

// LISTENERS
function addListeners() {
    // Listen to keystrokes
    memberInput.addEventListener('keyup', (event)=>{
        if (event.key === "Enter") {
            addMember();
        }
    });
    
    // Listen to Button Clicks
    document.addEventListener('click', (event)=>{
        if(event.target === addMemberBtn) {addMember()}
        if(event.target === clrMemberBtn) {clrMember()}
        if(event.target === addTransactionBtn) {addTransaction()}
        if(event.target === clrAllTransactionBtn) {clrAllTransaction()}
        if(event.target === blackBg) {cancelTransaction()}
        if(event.target === cancelBtn) {cancelTransaction()}
        if(event.target === saveTransactionBtn) {saveTransaction()}
        if(event.target === saveChangesBtn) {saveChanges()}
        // if(event.target === calculateBtn) {calculate()}
        if(event.target.matches('[name="membersEdit"]')) {
            let editableMember = event.target.parentNode.previousElementSibling;
            // Make editable 
            editableMember.contentEditable = true;
            // Add focused class
            editableMember.classList.add('editableFocused');
            let oldName = editableMember.textContent;
            
            // function
            editableMember.addEventListener('blur', () => {
               render(); 
            });
            
            editableMember.addEventListener('keydown', (event)=>{
                if(event.key === "Enter") {
                    let newName =  editableMember.textContent.trim();
                    replaceMember(oldName, newName);      
                    editableMember.contentEditable = false;
                    editableMember.classList.remove('editableFocused');
                    editableMember.blur();
                } else if(event.key === "Escape"){
                    editableMember.blur();
                }
            });
            
        } if(event.target.matches('[name="membersDelete"]')) {
            let editableMember = event.target.parentNode.previousElementSibling.innerHTML;
            members = members.filter(item => item !== editableMember);
            render();
        } if(event.target.matches('[name="transactionsEdit"]')) {
            let transactionId = event.target.parentNode.parentNode.id;
            addTransaction(transactionId);
            
        } if(event.target.matches('[name="transactionsDelete"]')) {
            console.log("transaction delete");
            let transactionId = event.target.parentNode.parentNode.id;
            transactions = transactions.filter(item=>item.id!==transactionId);
            render();
        }
    });
}
// ADDING/EDITING MEMBERS
function addMember() {
    let memberName = memberInput.value.trim();
    if (memberName) {
        // check if member is already in table
        if (!members.includes(memberName)) {
            // Add member to list
            members.push(memberName);
            // auto-clear input
            memberInput.value = "";
            render();        
            memberInput.focus();
        } else {
            // Raise Error 
            memberInput.select();
            console.log("Member already Exists!")
        }
    }
}
function replaceMember(oldName, newName) {
    let nameIndex = members.indexOf(oldName);
    // Replace name in members
    members[nameIndex] = newName;
    // Replace name in transactions
    transactions.forEach(transaction => {
        if(transaction.payer === oldName) {
            transaction.payer = newName;
        }

        transaction.details.forEach(detail => {
            if(detail.member === oldName) {
                detail.member = newName;
            }
        });
    });
    members = [...new Set(members)];  
    
    // Render members, transactions, recalculate
}
function clrMember() {
    members = [];
    transactions = [];
    tempTransaction = {};
    render();
}
// ADDING/EDITING TRANSACTIONS
function addTransaction(transactionId="") {
    var isEdit = false;
    // check if temptransaction.id is in the transactions
    let index = transactions.findIndex(obj=>obj.id == transactionId); // use only == not ===
    if(index !== -1) {
        // Id exists, load data
        isEdit = true;
        tempTransaction = transactions[index];
        console.log("Id found");
    } else {
        // Id does not exist, create new
        tempTransaction = {};
        tempTransaction.id = getUniqueId();
        tempTransaction.description = "";
        tempTransaction.amount = 0;
        tempTransaction.payer = members[0];
        tempTransaction.splitType = 'evenly';
        
        tempTransaction.details = [];
        members.forEach(item=>{
            let temp = {}
            temp.member = item;
            temp.ticked = false;
            temp.weight = 0;
            temp.percent = 0;
            temp.percentage = 0;
            // [temp.percent, temp.percentage] = computePercents(temp.weight, members.length, tempTransaction.amount);
            tempTransaction.details.push(temp);
        });
        console.log(transactionId);
        console.log("Id NOT found");
    }
    // show menu 
    showPopupMenu(isEdit);  
}
function saveTransaction() {
    // when clicking SAVE button
    getValues();
    // Check if all are given
    // if yes
    // store to list
    // else
    // raise error
    // render
    transactions.push(tempTransaction);
    render();
    closePopupMenu();
}
function cancelTransaction() {
    closePopupMenu();

}
function getValues() {
    // Description
    tempTransaction.description = descriptionPopup.value;
    // Amount
    tempTransaction.amount = parseFloat(amountPopup.value);
    // Payer
    tempTransaction.payer = payerPopup.value;
    // Split
    splitRadioBtns.forEach(radio => {
        if(radio.checked) {
            _split = radio.value;
        }
    });
    tempTransaction.splitType = _split;
}
function updateDetailsValue() {
    if (tempTransaction.splitType == 'evenly') {
        // Compute total weight
        let totalWeight = tempTransaction.details.filter(detail=>detail.ticked).length;
        // for every share member that is checked
        tempTransaction.details.forEach(detail => {
            if(detail.ticked) {
                // set weight to 1
                detail.weight = 1;
                // compute percent and percentage
                [detail.percent, detail.percentage] = computePercents(detail.weight, totalWeight, parseFloat(amountPopup.value));
                document.getElementById(`checkbox-${detail.member}`).checked = true;
            } else {
                detail.weight = 0;
                detail.percent = 0;
                detail.percentage = 0;
                document.getElementById(`checkbox-${detail.member}`).checked = false;
            }
            document.getElementById(`weight-${detail.member}`).value = detail.weight;
            document.getElementById(`percent-${detail.member}`).innerHTML = `${detail.percent.toFixed(2)}%`;
            document.getElementById(`percentage-${detail.member}`).innerHTML = `P${detail.percentage.toFixed(2)}`;
            
        });
    } else {
        let totalWeight = 0;
        tempTransaction.details.forEach(detail => {
            if (detail.ticked) {
                totalWeight += detail.weight;
            }
        });
        tempTransaction.details.forEach(detail => {
            if (detail.ticked) {
                // Compute value for percents and percentages
                console.log(totalWeight);
                [detail.percent, detail.percentage] = computePercents(detail.weight, totalWeight, parseFloat(amountPopup.value));
                // update HTML
            } else {
                detail.weight = 0;
                detail.percent = 0;
                detail.percentage = 0;
            }
            document.getElementById(`weight-${detail.member}`).value = detail.weight;
            document.getElementById(`percent-${detail.member}`).innerHTML = `${detail.percent.toFixed(2)}%`;
            document.getElementById(`percentage-${detail.member}`).innerHTML = `P${detail.percentage.toFixed(2)}`;
            
        });
    }
    
}
function clrAllTransaction() {
    transactions = [];
    render();
}
function saveChanges() {
    getValues();
    transactions.push(tempTransaction);
    var index = transactions.findIndex(transaction=>transaction.id==tempTransaction.id);
    if(index!=-1) {
        deleteFromArray(transactions, index);
    }
    closePopupMenu();
    render(); 
}
// COMPUTATION/PROCESSING
function calculate() {
    var summaryList = calculateSummary();
    var reimbursements = calculateReimbursement(summaryList);
    return summaryList, reimbursements;
}
function calculateSummary() {
    var summaryList = [];
    transactions.forEach(transaction => {
        // check if payer is in summary list
        let payingMember = summaryList.find(obj=>obj.member===transaction.payer);
        if (payingMember) {
            // if yes, add payment to amount spent
            if(payingMember.spent) {
                payingMember.spent += transaction.amount;
            } else {
                payingMember.spent = transaction.amount;
            }
            // update net
            payingMember.net = payingMember.spent - payingMember.share;
        } else {
            // if not, add to list and add payment to amount spent
            let newObj = {};
            newObj.member = transaction.payer;
            newObj.spent = transaction.amount;
            newObj.share = 0;
            newObj.net = 0;
            newObj.net = newObj.spent - newObj.share;
            summaryList.push(newObj);
        }
        transaction.details.forEach(detail=>{
            let shareMember = summaryList.find(obj=>obj.member===detail.member);
            if (shareMember) {
                // if yes, add payment to percentage to share
                if(shareMember.share) {
                    shareMember.share += detail.percentage;
                } else {
                    shareMember.share = detail.percentage;
                }
                shareMember.net = shareMember.spent - shareMember.share;
            } else {
                // if not, add to list and add payment to percentage to share
                let newObj = {};
                newObj.member = detail.member;
                newObj.share = detail.percentage;
                newObj.spent = 0;
                newObj.net = newObj.spent - newObj.share;
                summaryList.push(newObj);
            }
        });
        
    });
    return summaryList;
}
function calculateReimbursement(summaryList) {
    // Simplifies Transactions between members
    
    // Make a Deep Copy of SummaryList so it doesn't get modified
    summaryList = JSON.parse(JSON.stringify(summaryList));

    // Split summary list into two: with debt and receivables
    let debts = summaryList.filter(obj => obj.net < 0);
    let receivables = summaryList.filter(obj => obj.net > 0);
    let reimbursements = [];
    let a = 0;

    while(debts.length != 0 || receivables.length != 0){
        let newerObj = {};

        // Determine member (1) with highest debt
        var debtValues = [];
        debts.forEach((obj) => {
            debtValues.push(Math.abs(obj.net));
        });
        var highestDebt = Math.max(...debtValues);
        var highest = debtValues.indexOf(highestDebt);
        // Add to name to reimbursement list
        // console.log("debts",debts);
        // console.log("receivables",receivables);
        // console.log("newerObj",newerObj);
        newerObj.from = debts[highest].member;
        
        // Determine member (2) with lowest receivable
        var receivableValues = [];
        receivables.forEach((obj) => {
            receivableValues.push(Math.abs(obj.net));
        });
        var lowestReceivable = Math.min(...receivableValues);
        var lowest = receivableValues.indexOf(lowestReceivable);
        // Add to name to reimbursement list
        newerObj.to = receivables[lowest].member;
        var payment = 0;        

        if (highestDebt >= lowestReceivable) {
            payment = lowestReceivable;
        } else {
            payment = highestDebt;
        }
        // Add to reimbursement list
        newerObj.payment = payment;
        // Modify debts and receivables
        debts[highest].net = nearestHundredths(highestDebt - payment);
        receivables[lowest].net = nearestHundredths(lowestReceivable - payment);

        if (highestDebt <= 0.01 && lowestReceivable <= 0.01) {
            break;
        }

        a++; 
        if (a > 10) {
            console.log('limit');
            break;
        }
        // remove zeroes in debt list and receivable list
        // debts = debts.filter(obj => obj.net !== 0);
        // receivables = receivables.filter(obj => obj.net !== 0);
        // Addend reimbursement
        reimbursements.push(newerObj);
    }
    return reimbursements;
}
function computePercents(weight, totalWeight, amount) {
    if (totalWeight > 0) {
        var _percent = (weight/totalWeight * 100);
    } else {
        _percent = 0;
    }
    var _percentage = (_percent / 100 * amount);
    return [_percent,_percentage];
}
function nearestHundredths(amount) {
    if(amount < 0.01) {
        return 0
    } else {
        return amount
    }
}
function getUniqueId() {
    return Math.ceil(Date.now()*Math.random())
}
function deleteFromArray(array, indexToDelete) {
    array.splice(indexToDelete, 1);
    return array;
}
// DISPLAY SUMMARIES
function render() {
    var summaryList = calculateSummary();
    var reimbursements = calculateReimbursement(summaryList);
    console.log(summaryList)
    console.log(reimbursements)
    // MEMBERS
    // Clear member Html
    memberTableList.innerHTML = ``;
    
    // Add members to html
    members.forEach(member => {
        memberTableList.insertAdjacentHTML("beforeend",`
        <li>
            <ul>
                <li>${member}</li>
                <li>
                <i name='membersEdit' class='bx bxs-edit-alt'></i>
                <i name='membersDelete' class='bx bx-trash'></i>
                </li>
            </ul>
        </li>`
        );
    });

    // TRANSACTIONS
    // Clear transaction html
    transactionTableList.innerHTML = ``;

    // if no transactions, display "No transactions"
    if (transactions.length < 1) {
        transactionTableList.insertAdjacentHTML("beforeend", 
        `<p>No Transactions to display</p>`
        );
    }
    // Add transactions to html
    transactions.forEach(transaction => {
        transactionTableList.insertAdjacentHTML("beforeend",`
        <li>
            <ul id="${transaction.id}">
                <li>${transaction.description}</li>
                <li>P ${transaction.amount}</li>
                <li>${transaction.payer}</li>
                <li>${transaction.splitType}</li>
                <li><i name="transactionsEdit" class='bx bxs-edit-alt'></i><i name="transactionsDelete" class='bx bx-trash'></i></li>
            </ul>
        </li>
        `);
    });


    // SUMMARY
    if(summaryList) {
        // Clear summary html
        summaryTableList.innerHTML = ``;

        // if no transactions, display "No transactions"
        if (summaryList.length < 1) {
            summaryTableList.insertAdjacentHTML("beforeend", 
            `<p>No Summary to display</p>`
            );
        }

        // Add transactions to html
        summaryList.forEach(item => {
            summaryTableList.insertAdjacentHTML("beforeend",`
            <li>
                <ul>
                    <li>${item.member}</li>
                    <li>P ${item.spent}</li>
                    <li>P ${item.share}</li>
                    <li>P ${item.net}</li>
                </ul>
            </li>
            `);
        });
    }

    // REIMBURSEMENT
    if(reimbursements) {
        // Clear reimbursements html
        reimbursementTableList.innerHTML = ``;

        // if no transactions, display "No transactions"
        if (reimbursements.length < 1) {
            reimbursementTableList.insertAdjacentHTML("beforeend", 
            `<p>Nothing to display</p>`
            );
        }

        // Add transactions to html
        reimbursements.forEach(item => {
            reimbursementTableList.insertAdjacentHTML("beforeend",`
            <li>
                <ul>
                    <li>${item.from}</li>
                    <li><i class='bx bx-right-arrow-alt' ></i></li>
                    <li>${item.to}</li>
                    <li>P ${item.payment}</li>
                </ul>
            </li>
            `);
        });
    }
    controlForm();

}
function controlForm() {
    if (members.length < 1) {
    disableElement([addTransactionBtn, 
                    clrAllTransactionBtn]);
    disableElement(transactionContent);
    } else {
        enableElement([addTransactionBtn,
            clrAllTransactionBtn]);
        enableElement(transactionContent);
        
        if (transactions.length < 1) {
            // disableElement([calculateBtn]);
            disableElement(summaryContent);
        } else {
            // enableElement([calculateBtn]);
            enableElement(summaryContent);
        }
    }          
}
function showPopupMenu(isEdit=false) {
    transactionIdPopup.textContent = tempTransaction.id;
    descriptionPopup.value = tempTransaction.description;
    amountPopup.value = tempTransaction.amount;
    payerPopup.value = tempTransaction.payer;
    document.querySelector(`input[value=${tempTransaction.splitType}]`).checked = true;

    detailsTable.innerHTML = ``; // clear the details first
    payerPopup.innerHTML = ``; // clear payer first 

    members.forEach(item=> {
        let tempIndex = tempTransaction.details.findIndex(obj=>obj.member===item);
        if(tempIndex!=-1) {
            let temp = tempTransaction.details[tempIndex];
            payerPopup.insertAdjacentHTML('beforeend',`
            <option value="${item}">${item}</option>
            `);
            // Details HTML
            detailsTable.insertAdjacentHTML('beforeend',
            `
            <li>
                <input type="checkbox" name="shareMemberCheck" id="checkbox-${item}">
                <label for="checkbox-${item}">${item}</label> 
            </li>
            <li>
                <ul>
                    <li>
                        <label>Weight: </label> 
                        <input type="number" id="weight-${item}" name="weight-inputs">
                    </li>
                    <li id="percent-${item}">${temp.percent}%</li>
                    <li id="percentage-${item}">P${temp.percentage}</li>
                </ul>
            </li>
            `);
            document.getElementById(`checkbox-${item}`).checked = temp.ticked;    
            document.getElementById(`weight-${item}`).value = temp.weight;  
        }
    });


    splitRadioBtns.forEach(radioBtn => {
        radioBtn.addEventListener('change', (event) => {
            tempTransaction.splitType = event.target.value;
            updateDetailsValue();
        });
    }); 
    const selectAll = document.getElementById('checkbox-0');
    const shareMemberChecks = document.querySelectorAll('input[name="shareMemberCheck"]');
    selectAll.addEventListener('change', ()=>{
        tempTransaction.details.forEach(obj=>{
            if (selectAll.checked) {
                obj.ticked = true;
            } else {
                obj.ticked = false;
            }
        });
        updateDetailsValue();
    });
    shareMemberChecks.forEach(checkbox=> {
        checkbox.addEventListener('change', (event) => {
            let shareMember = tempTransaction.details.find(obj=>obj.member==event.target.nextElementSibling.textContent);
            if (event.target.checked) {
                shareMember.ticked = true;
            } else {
                shareMember.ticked = false;
            }
            updateDetailsValue();
        });
    });

    const shareWeightsInput = document.querySelectorAll('input[name="weight-inputs"]');
    shareWeightsInput.forEach(weightInput => {
        weightInput.addEventListener('input', (event) => {
            let shareMember = tempTransaction.details.find(obj=>obj.member==event.target.parentNode.parentNode.parentNode.previousElementSibling.querySelector('label').textContent);
            if (tempTransaction.splitType === "unevenly") {
                shareMember.weight = parseFloat(event.target.value);
            }
            updateDetailsValue();
        });
    });
    if(isEdit) {
        showElements([saveChangesBtn]);
        hideElements([saveTransactionBtn]);
    } else {
        hideElements([saveChangesBtn]);
        showElements([saveTransactionBtn]);
    }
    showElements([addTransactionPopupmenu, blackBg]);
}
function closePopupMenu() {
    // ask for confirmation
    // hide html
    hideElements([addTransactionPopupmenu, blackBg]);
    // reset inputs in popupmenu
    tempTransaction = {};
    render();
}
function showElements(elements) {
    elements.forEach(element => {
        element.classList.remove('hidden');
    });
}
function hideElements(elements) {
    elements.forEach(element => {
        element.classList.add('hidden');
    });
}
function enableElement(inputElements) {
    inputElements.forEach(inputElement=>{
        inputElement.disabled = false;
        inputElement.classList.remove('greyed-out');
    });
}
function disableElement(inputElements) {
    inputElements.forEach(inputElement => {
        inputElement.disabled = true;
        inputElement.classList.add('greyed-out');
    });
}


// INITIALIZATION
function main() {
    addListeners();
    render();
}

// MAIN LOOP
main();




// Controller functions - connects model and view


// Get Queries
// const transactionContent = document.getElementById('transaction_content');
// const summaryContent = document.getElementById('summary_content');








// View functions - manages visuals


