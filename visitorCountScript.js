var numOfVisitors = counterVisitors();
document.getElementById('CounterVisitor').innerHTML += numOfVisitors;


function counterVisitors() {
    var n = localStorage.getItem('on_load_counter');

    if (n === null) {
        n = 0;
    }
    n++;
    localStorage.setItem("on_load_counter", n);
    return n;
}