var dict1 = {};
var dict2 = {};

function set(json) {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = dd + '/' + mm + '/' + yyyy;
    var q = mm + dd;


    json.forEach(function(x) {
        dict1[x.den] = x.SK
    })

    json.forEach(function(x) {
        dict2[x.SK] = x.den
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
    var input = document.getElementById("input").value;
    try {
        if (hasNumber(input)) {
            var date = input.split(".");
            if (date.length != 2) {
                throw RangeError;
            }
            if (date[0].length == 1) {
                date[0] = "0" + date[0];
            }
            if (date[1].length == 1) {
                date[1] = "0" + date[1];
            }
            var q = date[1] + date[0];
            if (dict1[q] == undefined) {
                throw RangeError;
            }
            document.getElementById("output").innerHTML = dict1[q];
        } else {
            input = normalizeString(input);
            Object.keys(dict2).forEach(function(key) {
                var name = normalizeString(key);
                if (name.includes(input)) {
                    document.getElementById("output").innerHTML = dict2[key].substring(2, 4) + "." + dict2[key].substring(0, 2);
                }

            });
        }
    } catch (error) {
        alert("chybne zadany vstup");
    }


}

function hasNumber(myString) {
    return /\d/.test(myString);
}