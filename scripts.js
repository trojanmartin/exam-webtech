var width = window.innerWidth;
var height = window.innerHeight;

function drawBackground(background, beachImg, text) {
    var context = background.getContext();
    context.drawImage(beachImg, 0, 0);
    context.setAttr('font', '20pt Calibri');
    context.setAttr('textAlign', 'center');
    context.setAttr('fillStyle', 'white');
    context.fillText(text, background.getStage().width() / 2, 40);
}

function load() {
    $.getJSON("Data/crossroads.json", function(json) {
        prepareSources(json, 1);
    })

}

function prepareSources(json, crossId) {

    var crossroad;

    //najdem spravnu krizovatku
    for (var i = 0; i < json.CrossRoads.length; i++) {
        if (json.CrossRoads[i].Id == crossId) {
            crossroad = json.CrossRoads[i];
            break;
        }
    }
    //vytvorim novy objekt kde budu obrazky a configy
    var backgroundImage = {};
    var images = {};
    //nenasiel som
    if (crossroad == null) {
        alert("krizovatka sa nenasla");
        return;
    }
    //TODO dat to dokopy, pointa je ze to musi byt image aby to canvas vedel vykreslit
    // "back" je novy objekt pozadia, bude obsahovat obrazok a config krizovatky
    backgroundImage.image = new Image();
    backgroundImage.image.onload = function() {
        createCrossRoad(images, backgroundImage);
    }
    backgroundImage.image.src = crossroad.Background
    backgroundImage.crossroad = crossroad;

    //potrebujem nacitat auta
    //zistim ake auta su potrebne
    var carsId = [];
    for (var i = 0; i < crossroad.Cars.length; i++) {
        carsId.push(crossroad.Cars[i].ImageId);
    }

    //najdem spravne auta
    for (var i = 0; i < json.Cars.length; i++) {
        if (carsId.includes(json.Cars[i].Id)) {
            images[json.Cars[i].Id] = {};
            images[json.Cars[i].Id].image = new Image();
            images[json.Cars[i].Id].image.onload = function() {
                createCrossRoad(images, backgroundImage);
            }
            images[json.Cars[i].Id].image.src = json.Cars[i].Path;
        }
    }
}

function createCrossRoad(images, backgroundImage) {
    var stage = new Konva.Stage({
        container: 'road',
        width: 1500,
        height: 600
    });

    var background = new Konva.Layer();
    var carLayer = new Konva.Layer();


    for (var key in images) {
        {
            (function() {

                var carImage = new Konva.Image({
                    image: images[key].image,
                    x: 50,
                    y: 50,
                    draggable: false
                });



                var animation = new Konva.Animation(function(frame) {
                    carImage.x(
                        100 * Math.sin((frame.time * 2 * Math.PI) / 2000) + 250
                    );
                }, carLayer);

                carImage.on('click', function() {
                    this.moveToTop();
                    animation.start();
                });

                // carLayer.add(carImage);
            })();
        }
    }

    stage.add(background);
    stage.add(carLayer);

    drawBackground(background, backgroundImage.image, "sdad");

}