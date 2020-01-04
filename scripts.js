var stageWidth = 1000;
var stageHeight = 1000;

const VIRTUAL_WIDTH = 1050;

var lastCrossroad;

const mainCanvas = 'road';
const demoCanvas = 'demoRoad'

const crossListClass = "list-group-item  list-group-item-action clearfix d-flex justify-content-between align-items-center ";
const crossListBtn = "far fa-play-circle fa-lg hover";
const badOrderText = "Nesprávne poradie. Skúste to ešte raz.";
const succesMessage = "Výborne, podarilo sa Vám vyriešiť križovatku správne.";

var demoHandler = function() {}


function prepareOnLoad() {
    $.getJSON("Data/crossroads.json", function(json) {
        prepareList(json);
    });
}

function loadCrossroad(id, containerId) {

    $.getJSON("Data/crossroads.json", function(json) {
        lastCrossroad = id;
        prepareSources(json, id, containerId);
        setActive(id);

        if (containerId == demoCanvas) {

        }
    })

}

function setActive(id) {
    $("#cros-list").children('li').removeClass('active');
    $(`#${id}cross`).addClass('active');
}

function prepareSources(json, crossId, containerId) {

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
                createCrossRoad(cars, crossroad, containerId);
            }
        }
        cars[car.Id].image.Id = car.Id;
        cars[car.Id].image.src = car.Path;
    }


    crossroad.RightOrder = selectedCrossroad.RightOrder;

    crossroad.image = new Image();
    crossroad.image.onload = function() {
        if (++loadedImages >= numImages) {
            createCrossRoad(cars, crossroad, containerId);
        }
    }
    crossroad.image.src = selectedCrossroad.Background;
}

function createCrossRoad(cars, crossroad, containerId) {
    var stage = new Konva.Stage({
        container: containerId,
        width: stageWidth,
        height: stageHeight
    });

    var background = new Konva.Layer();
    var carLayer = new Konva.Layer();
    var animations = {};

    for (var key in cars) {
        {
            (function() {

                var carGroup = new Konva.Group({
                    x: cars[key].Config.Path[0].x,
                    y: cars[key].Config.Path[0].y,
                    rotation: cars[key].Config.StartRotate,
                    id: key,
                    draggable: false,
                })

                var path = new Konva.Path({
                    x: 0,
                    y: 0,
                    // visible: false
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

                    carGroup.position({ x: pt.x, y: pt.y });
                    if (!done) {
                        current = current + Math.sqrt(angleSpeed * angleSpeed);
                        carGroup.rotate(angleSpeed);
                    }

                    if (current >= 90) {
                        current = 0;
                        done = true;
                    }

                    if (pos == steps) {
                        animations[key].stop();
                        carGroup.destroy();
                    }


                }, carLayer);


                var carImage = new Konva.Image({
                    image: cars[key].image,
                    width: 120,
                    height: 70,
                    id: key,
                    draggable: false,
                });

                carImage.setOffset({
                    x: carImage.width() / 2,
                    y: carImage.height() / 2
                });

                carGroup.add(carImage);


                if (cars[key].Config.Blinker != 0) {
                    var blinker = new Konva.Circle({
                        radius: 5,
                        fill: 'orange',
                        stroke: 'orange',
                        x: (carImage.width() / 2) - 10,
                        y: (carImage.height() / 2) * cars[key].Config.Blinker + cars[key].Config.BlinkerPosition,
                        strokeWidth: 5
                    });

                    var next = true;
                    var time = 0;
                    var blinkerAnimation = new Konva.Animation(function(frame) {
                        time = time + frame.timeDiff;
                        if (time > 500) {
                            blinker.opacity(next ? 1 : 0);
                            next = !next;
                            time = 0;
                        } else {
                            return false;
                        }
                    }, carLayer);

                    blinkerAnimation.start();

                    carGroup.add(blinker);
                }


                var rightOrderQueue = crossroad.RightOrder;

                //nastavim eventy kedy sa ma spustit animacia
                carGroup.on('click', function() {
                    HandleMove(this, rightOrderQueue, animations, stage);
                });

                carGroup.on('tap', function() {
                    HandleMove(this, rightOrderQueue, animations, stage);
                });

                demoHandler = function() {
                    runDemo(rightOrderQueue, animations);
                }

                carLayer.add(carGroup);
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

    fitStageIntoParentContainer(stage, containerId);

    window.addEventListener('resize', function() {
        fitStageIntoParentContainer(stage, containerId);
    });
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
            showInfoModal(succesMessage, "Pokračovať na ďalšiu križovatku", `loadCrossroad(${lastCrossroad + 1 }, "${mainCanvas}")`);
        }

    } else {
        stage.destroy();
        showInfoModal(badOrderText, "Ok");
        loadCrossroad(lastCrossroad, mainCanvas);
    }
}

function runDemo(rightOrderQueue, animations) {

    animations[rightOrderQueue[0]].start();

    for (let i = 1; i < rightOrderQueue.length; i++) {
        //code before the pause
        setTimeout(function() {
            animations[rightOrderQueue[i]].start();
        }, i * 1000);

    }

}

function CheckRightOrder(id, orderQueue) {

    var validId = orderQueue.shift();

    if (validId == id)
        return true;

    return false;
}

function fitStageIntoParentContainer(stage, containerId) {

    const availableWidth = $(`#${containerId}`).width();
    const availableHeight = availableWidth / 16 * 9;
    const scale = availableWidth / VIRTUAL_WIDTH;

    stage.setAttrs({
        width: availableWidth,
        height: availableHeight,
        scaleX: scale,
        scaleY: scale
    });
    stage.draw();
}

function showInfoModal(text, primaryButtonText, onPrimaryClick) {

    var content = document.createElement('p');
    content.innerText = text;

    $('#infoModalBody').empty();
    $('#infoModalBody').append(content);

    document.querySelector('#infoModalPrimaryBtn').innerText = primaryButtonText;

    document.querySelector('#infoModalPrimaryBtn').setAttribute("onclick", onPrimaryClick);

    $('#infoModal').modal('show');
}

function prepareList(json) {
    for (var i = 0; i < json.CrossRoads.length; i++) {


        var li = document.createElement("li");

        li.className = crossListClass;

        var cross = document.createElement("a");
        cross.className = "p-0 m-0 flex-grow-1";
        cross.setAttribute("onclick", `loadCrossroad(${json.CrossRoads[i].Id}, "${mainCanvas}")`);
        cross.innerText = json.CrossRoads[i].Name;

        li.append(cross);


        var btn = document.createElement("span");


        btn.setAttribute("data-toggle", "modal");
        btn.setAttribute("data-target", "#demoModal");
        btn.id = `${json.CrossRoads[i].Id}`;

        var span = document.createElement("span");
        span.className = crossListBtn
        span.setAttribute("data-toggle", "tooltip");
        span.setAttribute("data-placement", "top");
        span.setAttribute("title", "Prehrať ukážku");
        btn.append(span);

        li.append(btn);

        $("#cros-list").append(li);
    }

}

$(document).on('shown.bs.modal', '#demoModal', function(e) {
    loadCrossroad(e.relatedTarget.id, demoCanvas)
});