var width = window.innerWidth;
var height = window.innerHeight;

function loadImages(sources, callback) {
    var assetDir = '/assets/';
    var images = {};
    var loadedImages = 0;
    var numImages = 0;
    for (var src in sources) {
        numImages++;
    }
    for (var src in sources) {
        images[src] = new Image();
        images[src].onload = function() {
            if (++loadedImages >= numImages) {
                callback(images);
            }
        };
        images[src].src = assetDir + sources[src];
    }
}

function isNearOutline(animal, outline) {
    var a = animal;
    var o = outline;
    var ax = a.x();
    var ay = a.y();

    if (ax > o.x - 20 && ax < o.x + 20 && ay > o.y - 20 && ay < o.y + 20) {
        return true;
    } else {
        return false;
    }
}

function drawBackground(background, beachImg, text) {
    var context = background.getContext();
    context.drawImage(beachImg, 0, 0);
    context.setAttr('font', '20pt Calibri');
    context.setAttr('textAlign', 'center');
    context.setAttr('fillStyle', 'white');
    context.fillText(text, background.getStage().width() / 2, 40);
}

function initStage(images) {
    var stage = new Konva.Stage({
        container: 'container',
        width: 578,
        height: 530
    });
    var background = new Konva.Layer();
    var animalLayer = new Konva.Layer();
    var animalShapes = [];
    var score = 0;

    // image positions
    var animals = {
        snake: {
            x: 10,
            y: 70
        },
        giraffe: {
            x: 90,
            y: 70
        },
        monkey: {
            x: 275,
            y: 70
        },
        lion: {
            x: 400,
            y: 70
        }
    };

    var outlines = {
        snake_black: {
            x: 275,
            y: 350
        },
        giraffe_black: {
            x: 390,
            y: 250
        },
        monkey_black: {
            x: 300,
            y: 420
        },
        lion_black: {
            x: 100,
            y: 390
        }
    };

    // create draggable animals
    for (var key in animals) {
        // anonymous function to induce scope
        (function() {
            var privKey = key;
            var anim = animals[key];

            var animal = new Konva.Image({
                image: images[key],
                x: anim.x,
                y: anim.y,
                draggable: false
            });

            var animation = new Konva.Animation(function(frame) {
                animal.x(
                    100 * Math.sin((frame.time * 2 * Math.PI) / 2000) + 250
                );
            }, animalLayer);

            animal.on('click', function() {
                this.moveToTop();
                animation.start();
            });

            // make animal glow on mouseover
            animal.on('mouseover', function() {
                animal.image(images[privKey + '_glow']);
                animalLayer.draw();
                document.body.style.cursor = 'pointer';
            });

            // return animal on mouseout
            animal.on('mouseout', function() {
                animal.image(images[privKey]);
                animalLayer.draw();
                document.body.style.cursor = 'default';
            });

            animal.on('dragmove', function() {
                document.body.style.cursor = 'pointer';
            });

            animalLayer.add(animal);
            animalShapes.push(animal);
        })();
    }

    // create animal outlines
    for (var key in outlines) {
        // anonymous function to induce scope
        (function() {
            var imageObj = images[key];
            var out = outlines[key];

            var outline = new Konva.Image({
                image: imageObj,
                x: out.x,
                y: out.y
            });

            animalLayer.add(outline);
        })();
    }

    stage.add(background);
    stage.add(animalLayer);

    drawBackground(
        background,
        images.beach,
        'Ahoy! Put the animals on the beach!'
    );
}

$.getJSON("Data/crossroads.json", function(json) {
    prepareSources(json, 1);
})


function prepareSources(json, crossId) {

    var crossroad;

    //najdem spravnu krizovatku
    for (var i = 0; i < json.CrossRoads.length; i++) {
        if (json.CrossRoads[i].Id == crossId) {
            crossroad = json.CrossRoads[i];
            break;
        }
    }

    //nenasiel som
    if (crossroad == null) {
        alert("krizovatka sa nenasla");
        return;
    }

    //potrebujem nacitat auta
    //zistim ake auta su potrebne
    var carsId = [];
    for (var i = 0; i < crossroad.Cars.length; i++) {
        carsId.push(crossroad.Cars[i].ImageId);
    }

    //najdem spravne auta
    var cars = [];
    for (var i = 0; i < json.Cars.length; i++) {
        if (carsId.includes(json.Cars[i].Id)) {
            cars.push(json.Cars[i]);
        }
    }

    createCrossRoad(crossroad, cars);

}


function createCrossRoad(crossroad, cars) {
    var stage = new Konva.Stage({
        container: 'container',
        width: 578,
        height: 530
    });

    var background = new Konva.Layer();
    var carLayer = new Konva.Layer();

    var carConfigs = crossroad.Cars;

    for (var i = 0; i < carConfigs.length; i++) {
        (function() {

            var carImage = new Konva.Image({
                image: cars[i].Path,
                x: carConfigs[i].Path[0].x,
                y: carConfigs[i].Path[0].y,
                draggable: true
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

            carLayer.add(carImage);
        })();
    }

    stage.add(background);
    stage.add(carLayer);

    drawBackground(background, crossroad.Background, "sdad");

}