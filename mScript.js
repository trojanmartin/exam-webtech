//dictionary formated key[day] - value[names]
var dict1 = {};

//dictionary formated key[name] - value[day], each key consist from one name, so if one day have multiple ones, they appear as independent keys
var dict2 = {};

//basic tooltip setup
$('[data-toggle="tooltip"]').tooltip();

function counterVisitors() {
    var n = localStorage.getItem('on_load_counter');

    if (n === null) {
        n = 0;
    }
    n++;
    localStorage.setItem("on_load_counter", n);
    return n;
}


//onload function just to get data from json
function load() {

    $.getJSON("Data/meniny.json", function(json) {
        set(json);
    })
    var numOfVisitors = counterVisitors();
    document.getElementById('CounterVisitor').innerHTML += numOfVisitors;

}

//function to show current date with name + fill dictionaries 
function set(json) {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = dd + '/' + mm + '/' + yyyy;
    var q = mm + dd;

    //first dict
    json.forEach(function(x) {
        dict1[x.den] = x.SK;
    });

    //sec dict where we check if one day includes more than one name, if so we split it and make dict entries for every single one 
    json.forEach(function(x) {
        if ((x.SK).includes(', ')) {
            var names = (x.SK).split(', ');
            names.forEach(function(q) {
                dict2[q] = x.den;
            })
        } else {
            dict2[x.SK] = x.den;
        }
    });

    //find name for current date 'q'
    var name = dict1[q];


    document.getElementById("actual").innerText = today + "  " + name;



}


//fn to get rid of Upper-cases and no standard characters such as á,š etc...
function normalizeString(string) {
    var input = string.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    input = input.toLowerCase();
    return input;
}

//main fn to get name or date
function work() {
    var checker = false;
    document.getElementById("output").innerHTML = "";
    var input = document.getElementById("input").value;

    try {
        //if input contains number, we presume that we are going to translate date to name
        if (hasNumber(input)) {
            var date = input.split(".");
            //checker for correct date input DD.MM, if input is correct, date.length have to be 2, othervise it means that they used wrong separator or no one 
            if (date.length != 2) {
                throw 'Error1';
            }
            //filling day and month numbers if it consist from one digit with zerro (form 3.12 --> 03.12)
            if (date[0].length == 1) {
                date[0] = "0" + date[0];
            }
            if (date[1].length == 1) {
                date[1] = "0" + date[1];
            }
            //q is our final date DDMM
            var q = date[1] + date[0];
            //date ist not included in dict --> it is not real one 
            if (dict1[q] == undefined) {
                throw 'Error2';
            }
            //if we got here it means we have correct answer so just put it into output
            document.getElementById("output").innerHTML = dict1[q];
        }
        //input doenst contain number so we presume that we are going to translate name to date 
        else {
            input = normalizeString(input);
            //simple for each loop to compare input with our dict2
            Object.keys(dict2).forEach(function(key) {
                var name = normalizeString(key);
                //found it
                if (name == input) {
                    document.getElementById("output").innerHTML = dict2[key].substring(2, 4) + "." + dict2[key].substring(0, 2);
                    //change checker to true so we know we found it
                    checker = true;

                }


            });
            //checker is false so we didnt find that input in our dict2 so we presume input name was not correct
            if (!checker) throw 'Error3';
        }
    } catch (e) {
        if (e == 'Error1') {
            $('[data-toggle="tooltip"]').tooltip({ title: "Chybne zadaný formát dátumu DD.MM" });
            $('[data-toggle="tooltip"]').tooltip('show');
        } else if (e == 'Error2') {
            $('[data-toggle="tooltip"]').tooltip({ title: "Zadany dátum je chybný, máte správne poradie DD.MM?" });
            $('[data-toggle="tooltip"]').tooltip('show');
        } else if (e == 'Error3') {
            $('[data-toggle="tooltip"]').tooltip({ title: "Chybne zadané meno" });
            $('[data-toggle="tooltip"]').tooltip('show');
        }

    }

}

//no need to comment 
function hasNumber(myString) {
    return /\d/.test(myString);
}

//auto hide tooltip after 2500ms
$(function() {
    $(document).on('shown.bs.tooltip', function(e) {
        setTimeout(function() {
            $(e.target).tooltip('dispose');
        }, 2500);
    });
});