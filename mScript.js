var dict1 = {};
var dict2 = {};


$('[data-toggle="tooltip"]').tooltip();
var t = $('[data-toggle="tooltip"]');


function set(json) {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = dd + '/' + mm + '/' + yyyy;
    var q = mm + dd;


    json.forEach(function(x) {
        dict1[x.den] = x.SK;
    })

    json.forEach(function(x) {
        if ((x.SK).includes(', ')) {
            var names = (x.SK).split(', ');
            names.forEach(function(q) {
                dict2[q] = x.den;
            })
        } else {
            dict2[x.SK] = x.den;
        }



    })
    var name = dict1[q];


    document.getElementById("actual").innerText = today + "  " + name;



}

function load() {

    $.getJSON("Data/meniny.json", function(json) {
        set(json);
    })

}

function normalizeString(string) {
    var input = string.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    input = input.toLowerCase();
    return input;
}


function work() {
    var checker = false;
    document.getElementById("output").innerHTML = "";
    var input = document.getElementById("input").value;

    try {
        if (hasNumber(input)) {
            var date = input.split(".");
            if (date.length != 2) {
                throw 'Error1';
            }
            if (date[0].length == 1) {
                date[0] = "0" + date[0];
            }
            if (date[1].length == 1) {
                date[1] = "0" + date[1];
            }
            var q = date[1] + date[0];
            if (dict1[q] == undefined) {
                throw 'Error2';
            }
            document.getElementById("output").innerHTML = dict1[q];
        } else {
            input = normalizeString(input);
            Object.keys(dict2).forEach(function(key) {
                var name = normalizeString(key);
                if (name == input) {
                    document.getElementById("output").innerHTML = dict2[key].substring(2, 4) + "." + dict2[key].substring(0, 2);
                    checker = true;

                }


            });
            if (!checker) throw 'Error3';
        }
    } catch (e) {
        console.log(e);
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

function hasNumber(myString) {
    return /\d/.test(myString);
}

$(function() {
    $(document).on('shown.bs.tooltip', function(e) {
        setTimeout(function() {
            $(e.target).tooltip('dispose');
        }, 2500);
    });
});