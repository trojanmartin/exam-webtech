var stageWidth = 1000;
var stageHeight = 1000;

const VIRTUAL_WIDTH = 1200;

var lastCrossroad;
const crossListClass = "list-group-item list-group-item-action bg-light";
const badOrderText = "Nesprávne poradie. Skúste to ešte raz.";
const succesMessage = "Výborne, podarilo sa Vám vyriešiť križovatku správne";

function load(id) {
    $.getJSON("Data/crossroads.json", function(json) {
        lastCrossroad = id;
        prepareSources(json, id);
    })

}


function prepareOnLoad() {



    $.getJSON("Data/crossroads.json", function(json) {
        for (var i = 0; i < json.CrossRoads.length; i++) {
            var cross = document.createElement("a");
            cross.className = crossListClass;
            cross.setAttribute("onclick", `load(${json.CrossRoads[i].Id})`);
            cross.innerText = json.CrossRoads[i].Name;
            $("#cros-list").append(cross);
        }

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
        width: stageWidth,
        height: stageHeight
    });

    var background = new Konva.Layer();
    var carLayer = new Konva.Layer();
    var animations = {};

    for (var key in cars) {
        {
            (function() {

                var carImage = new Konva.Image({
                    image: cars[key].image,
                    width: 120,
                    height: 70,
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
                    HandleMove(this, rightOrderQueue, animations, stage);
                });

                carImage.on('tap', function() {
                    HandleMove(this, rightOrderQueue, animations, stage);
                });

                carLayer.add(carImage);
            })();
        }
    }

    var road = new Konva.Image({
        image: crossroad.image,
        draggable: false,
    });
    background.add(road);

    stage.add(background);
    stage.add(carLayer);

    fitStageIntoParentContainer(stage);


    window.addEventListener('resize', function() {
        fitStageIntoParentContainer(stage);

        // drawBackground(background, crossroad.image, "sdad");
    });

    //  drawBackground(background, crossroad.image, "sdad");
}


function GetCarFromId(json, id) {
    var car = {};

    for (var i = 0; i < json.Cars.length; i++) {
        if (json.Cars[i].Id == id) {
            return json.Cars[i];
        }
    }
}

function HandleMove(sender, rightOrderQueue, animations, stage) {
    if (CheckRightOrder(sender.attrs.id, rightOrderQueue)) {
        sender.moveToTop();
        animations[sender.attrs.id].start();

        if (rightOrderQueue.length == 0) {
            showModal(succesMessage, "Pokračovať na ďalšiu križovatku", `load(${lastCrossroad + 1 })`);
        }
    } else {
        stage.destroy();
        showModal(badOrderText, "Ok");
        load(lastCrossroad);
    }
}



function CheckRightOrder(id, orderQueue) {

    var validId = orderQueue.shift();

    if (validId == id)
        return true;

    return false;
}

function fitStageIntoParentContainer(stage) {
    const availableWidth = window.innerWidth;
    const availableHeight = window.innerHeight;

    const scale = availableWidth / VIRTUAL_WIDTH;

    stage.setAttrs({
        width: availableWidth,
        height: availableHeight,
        scaleX: scale,
        scaleY: scale
    });


    stage.draw();
}

function showModal(text, primaryButtonText, onPrimaryClick) {

    var content = document.createElement('p');
    content.innerText = text;

    $('#infoModalBody').empty();
    $('#infoModalBody').append(content);

    document.querySelector('#infoModalPrimaryBtn').innerText = primaryButtonText;

    document.querySelector('#infoModalPrimaryBtn').setAttribute("onclick", onPrimaryClick);

    $('#infoModal').modal('show');
}