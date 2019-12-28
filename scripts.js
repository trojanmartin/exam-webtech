var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;

var lastCrossroad;

function load(id) {
    $.getJSON("Data/crossroads.json", function(json) {
        lastCrossroad = id;
        prepareSources(json, id);
    })

}

function prepareSources(json, crossId) {

    var selectedCrossroad;
    var loadedImages = 0;
    var numImages = 0;


    //najdem spravnu krizovatku
    for (var i = 0; i < json.CrossRoads.length; i++) {
        if (json.CrossRoads[i].Id == crossId) {
            selectedCrossroad = json.CrossRoads[i];
            break;
        }
    }
    //vytvorim novy objekt kde budu obrazky a configy
    var crossroad = {};
    var cars = {};
    //nenasiel som
    if (selectedCrossroad == null) {
        alert("krizovatka sa nenasla");
        return;
    }
    //potrebujem nacitat auta
    //zistim ake auta su potrebne
    //pocet vsetkych aut + 1 krizovatka
    numImages = selectedCrossroad.Cars.length + 1;

    for (var i = 0; i < selectedCrossroad.Cars.length; i++) {
        var car = GetCarFromId(json, selectedCrossroad.Cars[i].ImageId);

        cars[car.Id] = {};
        //car Path
        cars[car.Id].Config = selectedCrossroad.Cars[i];

        //createImage
        cars[car.Id].image = new Image();
        cars[car.Id].image.onload = function() {
            if (++loadedImages >= numImages) {
                createCrossRoad(cars, crossroad);
            }
        }
        cars[car.Id].image.Id = car.Id;
        cars[car.Id].image.src = car.Path;
    }


    crossroad.RightOrder = selectedCrossroad.RightOrder;

    crossroad.image = new Image();
    crossroad.image.onload = function() {
        if (++loadedImages >= numImages) {
            createCrossRoad(cars, crossroad);
        }
    }
    crossroad.image.src = selectedCrossroad.Background;
}

function createCrossRoad(cars, crossroad) {
    var stage = new Konva.Stage({
        container: 'road',
        width: (windowWidth / 10) * 8,
        height: windowHeight
    });

    var background = new Konva.Layer();
    var carLayer = new Konva.Layer();
    var animations = {};

    for (var key in cars) {
        {
            (function() {

                var carImage = new Konva.Image({
                    image: cars[key].image,
                    width: 170,
                    height: 100,
                    x: cars[key].Config.Path[0].x,
                    y: cars[key].Config.Path[0].y,
                    rotation: cars[key].Config.StartRotate,
                    id: key,
                    draggable: false,
                });

                carImage.setOffset({
                    x: carImage.width() / 2,
                    y: carImage.height() / 2
                });

                var path = new Konva.Path({
                    x: 0,
                    y: 0,
                    stroke: 'cyan'
                });

                // Load the path points up using M = moveto, L = lineto.
                var p = "M" + cars[key].Config.Path[0].x + " " + cars[key].Config.Path[0].y;
                for (var i = 1; i < cars[key].Config.Path.length; i = i + 1) {
                    p = p + " L" + cars[key].Config.Path[i].x + " " + cars[key].Config.Path[i].y;
                }
                path.setData(p);

                carLayer.add(path);

                var steps = 50; // number of steps in animation
                var pathLen = path.getLength();
                var step = pathLen / steps;
                var pos = 0,
                    pt;

                var done;
                var angleSpeed = cars[key].Config.Rotation;
                current = 0;

                animations[key] = new Konva.Animation(function(frame) {

                    pos = pos + 1;
                    pt = path.getPointAtLength(pos * step);

                    var angleDiff = (frame.timeDiff * 90) / 1000;

                    carImage.position({ x: pt.x, y: pt.y });
                    if (!done) {
                        current = current + Math.sqrt(angleSpeed * angleSpeed);
                        carImage.rotate(angleSpeed);
                    }

                    if (current >= 90) {
                        current = 0;
                        done = true;
                    }


                }, carLayer);

                var rightOrderQueue = crossroad.RightOrder;

                //nastavim eventy kedy sa ma spustit animacia
                carImage.on('click', function() {
                    if (CheckRightOrder(this.attrs.id, rightOrderQueue)) {
                        this.moveToTop();
                        animations[this.attrs.id].start();
                    } else {
                        alert("zle poradie");
                        stage.clear();
                        load(lastCrossroad);
                    }
                });

                carImage.on('tap', function() {
                    CheckRightOrder(this.attrs.id, rightOrderQueue);
                });

                carLayer.add(carImage);
            })();
        }
    }

    stage.add(background);
    stage.add(carLayer);

    drawBackground(background, crossroad.image, "sdad");
}


function GetCarFromId(json, id) {
    var car = {};

    for (var i = 0; i < json.Cars.length; i++) {
        if (json.Cars[i].Id == id) {
            return json.Cars[i];
        }
    }
}


function CheckRightOrder(id, orderQueue) {

    var validId = orderQueue.shift();

    if (validId == id)
        return true;

    return false;
}

function drawBackground(background, beachImg, text) {
    var context = background.getContext();
    context.drawImage(beachImg, 0, 0);
    context.setAttr('font', '20pt Calibri');
    context.setAttr('textAlign', 'center');
    context.setAttr('fillStyle', 'white');
    context.fillText(text, background.getStage().width() / 2, 40);
}