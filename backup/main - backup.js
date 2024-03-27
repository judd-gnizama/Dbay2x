// Model functions - saves and manages data
var members = [];
var transactions = [
    // {
    //     amount: 2000,
    //     payer: "Jyll",
    //     splitType: "Evenly",
    //     description: "Food",
    //     details: [
    //         {member: "Judd", weight: 1, percent: 0.5, percentage: 1000},
    //         {member: "Jon", weight: 1, percent: 0.5, percentage: 1000}
    //     ]
    // },
    // {
    //     amount: 1500,
    //     payer: "Judd",
    //     splitType: "Unevenly",
    //     description: "Transpo",
    //     details: [
    //         {member: "Jyll", weight: 1, percent: 0.25, percentage: 375},
    //         {member: "Jon", weight: 2, percent: 0.5, percentage: 750},
    //         {member: "Judd", weight: 1, percent: 0.25, percentage: 375}
    //     ]
    // },
    // {
    //     amount: 2500,
    //     payer: "Jon",
    //     splitType: "Unevenly",
    //     description: "Loremjlawkefj awefj awefa wef awf",
    //     details: [
    //         {member: "Jyll", weight: 2, percent: 0.40, percentage: 1000},
    //         {member: "Jon", weight: 2, percent: 0.40, percentage: 1000},
    //         {member: "Judd", weight: 0.5, percent: 0.10, percentage: 250},
    //         {member: "Mommy", weight: 0.5, percent: 0.10, percentage: 250}
    //     ]
    // },
    // {
    //     amount: 1026,
    //     payer: "Jon",
    //     splitType: "Unevenly",
    //     description: "Transpo",
    //     details: [
    //         {member: "Jyll", weight: 1, percent: 0.125, percentage: 128.25},
    //         {member: "Jon", weight: 2, percent: 0.25, percentage: 256.5},
    //         {member: "Judd", weight: 5, percent: 0.625, percentage: 641.25}
    //     ]
    // }
];

var tempTransaction = {};



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
        console.log("debts",debts);
        console.log("receivables",receivables);
        console.log("newerObj",newerObj);
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
        if (a > 200) {
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
    let _percent = (weight/totalWeight * 100);
    let _percentage = (_percent / 100 * amount);
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



// Controller functions - connects model and view


// Get Queries
// const transactionContent = document.getElementById('transaction_content');
// const summaryContent = document.getElementById('summary_content');

const transactionContent = document.querySelectorAll('#transaction_content > div');
const summaryContent = document.querySelectorAll('#summary_content > div');


const memberInput = document.getElementById('memberInput');
const memberTableList = document.getElementById('members_table_list');
const addMemberBtn = document.getElementById('addMemberBtn');
const clrMemberBtn = document.getElementById('clrMemberBtn');

const transactionTableList = document.getElementById('transaction_table_list');
const addTransactionBtn = document.getElementById('addTransactionBtn');
const clrTransactionBtn = document.getElementById('clrTransactionBtn');

const calculateBtn = document.getElementById('calculateBtn');
const summaryTableList = document.getElementById('summary_table_list');
const reimbursementTableList = document.getElementById('reimbursement_table_list');

const addTransactionPopupmenu = document.getElementById('addTransactionPopupmenu');
const addTransactionPopupmenuWrapper = document.querySelector('#addTransactionPopupmenu > div');
const blackBg = document.getElementById('blackBg');

const descriptionPopup = document.getElementById('descriptionPopup');
const amountPopup = document.getElementById('amountPopup');
const payerPopup = document.getElementById('payerPopup');
const splitRadioBtns = document.querySelectorAll('input[name="split"]');
const detailsTable = document.getElementById('details_table');
const saveTransactionBtn = document.getElementById('saveTransactionBtn_popup');
const saveChangesBtn = document.getElementById('saveChangesBtn_popup');
const cancelBtn = document.getElementById('cancelBtn_popup');

function main() {
    
    // add listeners
    addListeners();
    // if latest memory is empty
    // revert to default
    // clear table lists and fill them up
    // else
    // load from latest memory
    
    // render
    render();
}

function addListeners() {
    memberInput.addEventListener('keyup', (event)=>{
        if (event.key === "Enter") {
            addMember();
        }
    });
    // addMemberBtn.addEventListener('click', addMember);
    // clrMemberBtn.addEventListener('click', clrMember);
    // addTransactionBtn.addEventListener('click', openPopupMenu);
    // clrTransactionBtn.addEventListener('click', clrTransaction);
    // calculateBtn.addEventListener('click', calculate);
    
    document.addEventListener('click', (event)=>{
        if(event.target === addMemberBtn) {addMember()}
        if(event.target === clrMemberBtn) {clrMember()}
        if(event.target === addTransactionBtn) {openPopupMenu()}
        if(event.target === clrTransactionBtn) {clrTransaction()}
        if(event.target === calculateBtn) {calculate()}
        if(event.target === blackBg) {closePopupMenu()}
        if(event.target === saveTransactionBtn) {addTransaction()}
        if(event.target === saveChangesBtn) {saveChanges()}
        if(event.target === cancelBtn) {closePopupMenu()}
        // blackBg.addEventListener('click', closePopupMenu);
        // saveTransactionBtn.addEventListener('click',addTransaction);
        // cancelBtn.addEventListener('click',closePopupMenu);
        if(event.target.matches('[name="membersEdit"]')) {
            let editableMember = event.target.parentNode.previousElementSibling;
            // Make editable 
            editableMember.contentEditable = true;
            // Add focused class
            editableMember.classList.add('editableFocused');
            let oldName = editableMember.textContent;
            
            // function
            editableMember.addEventListener('blur', () => {
                let newName =  editableMember.textContent.trim();
                replaceMember(oldName, newName);      
                editableMember.contentEditable = false;
                editableMember.classList.remove('editableFocused');
                render();
                console.log('members',members);
            });
            
            editableMember.addEventListener('keydown', (event)=>{
                if(event.key === "Enter") {
                    editableMember.blur();
                }
            });
            
            
        } if(event.target.matches('[name="membersDelete"]')) {
            let editableMember = event.target.parentNode.previousElementSibling.innerHTML;
            members = members.filter(item => item !== editableMember);
            render();
        } if(event.target.matches('[name="transactionsEdit"]')) {
            let transactionId = event.target.parentNode.parentNode.id;
            let transaction = transactions.find(obj=>obj.id==transactionId);
            openPopupMenu(transactionId=transactionId);
            
        } if(event.target.matches('[name="transactionsDelete"]')) {
            console.log("transaction delete");
        }
    });
}


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
        } else {
            // Raise Error 
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
    render();
}


function calculate() {
    let summaryList = calculateSummary();
    let reimbursements = calculateReimbursement(summaryList);
    render(summaryList, reimbursements);
}

function addTransaction() {
    // when clicking SAVE button
    // Get values
    tempTransaction.id = getUniqueId();
    getSetTempTransaction();
    transactions.push(tempTransaction);
    // Check if all are given
    // if yes
    // store to list
    // else
    // raise error
    // render
    render();
    closePopupMenu();
    calculate();
    }

function getSetTempTransaction() {
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

function clrTransaction() {
    transactions = [];
    render();
}

function saveChanges() {
    getSetTempTransaction();
    var index = transactions.findIndex(transaction=>transaction.id==tempTransaction.id);
    if(index!=-1) {
        transactions.pop(index);
    }
    transactions.push(tempTransaction);
}



function controlForm() {
    if (members.length < 1) {
    disableElement([addTransactionBtn, 
                    clrTransactionBtn]);
    disableElement(transactionContent);
    } else {
        enableElement([addTransactionBtn,
            clrTransactionBtn]);
        enableElement(transactionContent);
    } 
        
    if (transactions.length < 1) {
        // disableElement([calculateBtn]);
        disableElement(summaryContent);
    } else {
        // enableElement([calculateBtn]);
        enableElement(summaryContent);
    }
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
    } else {
        console.log(tempTransaction);
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
    console.log(tempTransaction);
    
}


// View functions - manages visuals

function openPopupMenu(transactionId="") {
    // show menu
    showPopupMenu();
    if(transactionId === "") {
        // set defaults
        showElements([saveTransactionBtn]);
        hideElements([saveChangesBtn]);
        descriptionPopup.value = "";
        amountPopup.value = "";
        tempTransaction.details = [];
        detailsTable.innerHTML = ``;
        payerPopup.innerHTML = ``;
        tempTransaction.splitType = 'evenly';
        document.querySelector('input[value="evenly"]').checked = true;
    } else {
        // get data first
        hideElements([saveTransactionBtn]);
        showElements([saveChangesBtn]);
        tempTransaction = transactions.find(obj=>obj.id==transactionId);
        descriptionPopup.value = tempTransaction.description;
        amountPopup.value = tempTransaction.amount;
        console.log(tempTransaction);
        // detailsTable.innerHTML = ``;
        payerPopup.value = tempTransaction.payer;
        document.querySelector(`input[value="${tempTransaction.splitType}"]`).checked = true;
    }
    
    members.forEach(item => {
        if(transactionId=="") {
            // load default setup
            let temp = {}
            temp.member = item;
            temp.ticked = false;
            temp.weight = 0;
            [temp.percent, temp.percentage] = computePercents(temp.weight, members.length, parseFloat(amountPopup.value));
            tempTransaction.details.push(temp);   
        } else {
            // load exisiting details
            let tempIndex = tempTransaction.details.findIndex(obj => obj.member===item);
            if(tempIndex!= -1) {
                // If found
                let temp = tempTransaction.details[tempIndex];
                console.log("temp" + " " + temp);
            }
        }
        // load defaults to html
        // Payer Dropdown
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
        document.getElementById(`weight-${item}`).value = temp.weight;
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
    splitRadioBtns.forEach(radioBtn => {
        radioBtn.addEventListener('change', (event) => {
            tempTransaction.splitType = event.target.value;
            updateDetailsValue();
        });
    }); 

    const shareMemberChecks = document.querySelectorAll('input[name="shareMemberCheck"]');
    shareMemberChecks.forEach(checkbox=> {
        checkbox.addEventListener('change', (event) => {
            let shareMember = tempTransaction.details.find(obj=>obj.member==event.target.nextElementSibling.textContent);
            if (event.target.checked) {
                shareMember.ticked = true;
            } else {
                shareMember.ticked = false;
                shareMember.weight = 0;
                shareMember.percent = 0;
                shareMember.percentage = 0;
            }
            updateDetailsValue();
        });
    });
}

function closePopupMenu() {
    // ask for confirmation
    // hide html
    hidePopupMenu();
    // reset inputs in popupmenu
    clearPopupMenu();
}

function clearPopupMenu() {
    tempTransaction = {};
}


function render(summaryList=[], reimbursements=[]) {
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
                    <li>P ${item.spent.toFixed(2)}</li>
                    <li>P ${item.share.toFixed(2)}</li>
                    <li>P ${item.net.toFixed(2)}</li>
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
                    <li>P ${item.payment.toFixed(2)}</li>
                </ul>
            </li>
            `);
        });
    }
    controlForm();

}

function showPopupMenu() {
    addTransactionPopupmenu.classList.remove('hidden');
    blackBg.classList.remove('hidden');
}

function hidePopupMenu() {
    addTransactionPopupmenu.classList.add('hidden');
    blackBg.classList.add('hidden');
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






// Main Loop
main();