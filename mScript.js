var dict = {};

function set(json) {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = dd + '/' + mm + '/' + yyyy;
    var q = mm + dd;


    json.forEach(function(x) {
        dict[x.den] = x.SK
    })
    var name = dict[q];


    document.getElementById("actual").innerText = today + "  " + name;



}

function load() {
    $.getJSON("Data/meniny.json", function(json) {
        set(json);
    })

}

function setName() {
    var d = document.getElementById("chDate").value;
    var date = new Date(d);
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    var q = mm + dd;
    console.log(q);
    document.getElementById("fName").innerHTML = dict[q];
}

function setDate() {
    var name = document.getElementById("chName").value;
    console.log(name);
}