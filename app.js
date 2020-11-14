var budgetController = (function(){

    var Expence = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expence.prototype.calcPercentage = function(totalIncome){
        if (totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else {
            this.percentage = -1;
        }
    };
    Expence.prototype.getPercentage = function(){
        return this.percentage;
    }
    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var calculateTotal = function(type){
        var sum = 0;
        data.allItem[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    }
    var data = {
        allItem: {
            exp : [],
            inc : []
        },
        totals:{
            exp : 0,
            inc : 0
            
        },
        budget: 0,
        percentage: -1
    };
    return {
        addItem : function(type,des,val){
            var newItem, ID;
            // ID value
            // console.log(type)
            // console.log(data.allItem[type].length)
            if(data.allItem[type].length > 0){
                ID = data.allItem[type][data.allItem[type].length - 1].id + 1;
            }else{
                ID = 0;
            }
            
            // Crate item based on "inc" or "exp"
            if(type == 'inc'){
                newItem = new Income(ID,des,val);
            }else if(type == 'exp'){
                newItem = new Expence(ID,des,val);
            }
            // Push into data
            data.allItem[type].push(newItem);
            // return the element
            return newItem;
            
        },
        deleteItem : function(type,id) {
            var ids, index;
            // array of all IDs
            ids = data.allItem[type].map(function(current){
                return current.id;
            });
            // index of id
            index = ids.indexOf(id);

            if (index !== -1){
                data.allItem[type].splice(index,1);
            }


        },
        calculateBudget: function(){
            // Calculate Total icome and expences
            calculateTotal('inc');
            calculateTotal('exp');
            // Calculare Budget: income - expence
            data.budget = data.totals.inc - data.totals.exp;
            // Calculate Percentage of income we spent
            if (data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else {
                data.percentage = -1;
            }
        },
        calculatePercentage: function(){
            data.allItem.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            })
        },
        getPercentage: function() {
            var allPerc = data.allItem.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },
        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage

            };
        },
        testing: function() {
        console.log(data);
        }
    }
     
})();


var UIController = (function(){

    var DOMstrings = {
        inputType:'.add__type',
        inputDescription:'.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer : '.income__list',
        expensesContainer : '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel : '.budget__title--month'
    };
    var formatNumber = function(num,type){
        var numSplit,int,dec;
        /*
        1. + or - before numbeer
        
        2. 2 decimail points
        
        3. comma separaating the thousands.
        e.g
        2310.456 -> +2310.46        
        */
       num = Math.abs(num);
       num = num.toFixed(2);
       numSplit = num.split('.');
       int = numSplit[0];
       if(int.length > 3){
           int = int.substr(0,int.length -3) + ',' + int.substr(int.length-3,3);
        }
        dec = numSplit[1];
        
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
        
        
    };
    var nodeListForEach = function(list, callback) {
        for(var i=0; i < list.length; i++){
            callback(list[i],i);
        }

    };
    return {
        getinput: function() {
            return {
                type : document.querySelector(DOMstrings.inputType).value, // Will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value) 
            };
        },
        addListItem : function(obj,type){
            var html, newHthml, element;
            // Create HTML string with placeholder text
            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn">Delete<i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if (type === 'exp'){
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn">Delete<i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            // Replace the placeholder text with some actual data
            newHthml = html.replace('%id%',obj.id);
            newHthml = newHthml.replace('%description%',obj.description);
            newHthml = newHthml.replace('%value%',formatNumber(obj.value,type) );
            
            // Insert the HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newHthml);
            
        },
        deleteListItem : function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },
        clearFields: function(){
            var fields,fieldArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            fieldArr = Array.prototype.slice.call(fields);
            fieldArr.forEach(function(current,index,array) {
                current.value = "";
            });
            fieldArr[0].focus();
            document.querySelector
        },
        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            // console.log(type);
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type) ;
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp,'exp');
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },
        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            // console.log(fields);

            nodeListForEach(fields,function(current,index){
                if (percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }else{
                    current.textContent = '---';
                }
            });
        },
        displayMonth : function() {
            var now, year, months, month;
            
            now = new Date();
            months = ['January','Fabruary','March','April','May','June','July','August','September','October','November','Decemberr'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        changedType: function() {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );
            nodeListForEach(fields,function(cur){
                cur.classList.toggle('red-focus');

            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');


        },
        getDOMstrings: function() {
            return DOMstrings;
        }
    };
    // Some Code
})();


var controller = (function(budgerCtrl,UICtrl){

    var setupEventListners = function () {
        var DOM = UICtrl.getDOMstrings();
        
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
        document.addEventListener("keypress",function(event){
            if(event.keyCode === 13){
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType)
    };
    var updateBudget = function(){
        // 1. Calculate Budget
        budgerCtrl.calculateBudget();
        // 2. Return Budget
        var budget = budgerCtrl.getBudget();

        // 3. Update UI
        UICtrl.displayBudget(budget);
        // console.log(budget)
        
    };
    var updatePercentage = function(){
        // 1. Calculte percentage
       budgerCtrl.calculatePercentage();
        // 2. Read Percentage from BudgetController
        var percentages = budgerCtrl.getPercentage();
        // 3. Update UI
        // console.log(percentages);
        UICtrl.displayPercentages(percentages);
    };
    var ctrlAddItem = function() {
        var input,newItem;
        // 1. Get Input in data fields
        input = UICtrl.getinput();
        
        // Cheak if description is empty and number is not a NaN and value is greater than zero
        
        if (input.description !=="" && !isNaN(input.value) && input.value > 0){
            
            // 2. Add Item to budget Controller
            newItem = budgerCtrl.addItem(input.type,input.description,input.value);
            // 3. Add Item to UI
            UICtrl.addListItem(newItem,input.type);
            // 4. Clear Fileds and focus on description
            UICtrl.clearFields();
            // 5. Uddate budget and display on UI
            updateBudget();
            // 6. Update and show new percentage
            updatePercentage();
        }
        
    };
    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;
        // Dom triversing
        itemID = event.target.parentNode.parentNode.parentNode.id;
    
        if(itemID){
            // inc-1
            // type-ID
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete the item from data structure
            budgerCtrl.deleteItem(type,ID);
            // 2. delete from UI
            UICtrl.deleteListItem(itemID);
            // 3. Update and show the new budger
            updateBudget();
            // 4. Update and show new percentage
            updatePercentage();
        }
    };
    
            // console.log("Working Fine");
    return {
        init: function() {

            console.log("Application has started");
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1

            });
            setupEventListners();
        }
    }
    
})(budgetController,UIController);

controller.init();