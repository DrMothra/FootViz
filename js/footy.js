/**
 * Created by atg on 07/07/2014.
 */

var START_X = -10;
var START_Y = -60;
var START_Z = -70;

//Init this app from base
function FootyApp() {
    BaseApp.call(this);
}

FootyApp.prototype = new BaseApp();

FootyApp.prototype.init = function(container) {
    BaseApp.prototype.init.call(this, container);
    this.data = null;
    this.updateRequired = false;
    this.guiControls = null;
    this.dataFile = null;
    this.filename = '';
};

FootyApp.prototype.update = function() {
    //Perform any updates
    var clicked = this.mouse.clicked;

    BaseApp.prototype.update.call(this);
};

FootyApp.prototype.createScene = function() {
    //Init base createsScene
    BaseApp.prototype.createScene.call(this);

    //Create ground
    this.GROUND_DEPTH = 240;
    this.GROUND_WIDTH = 180;
    addGroundPlane(this.scene, this.GROUND_WIDTH, this.GROUND_DEPTH);
};

FootyApp.prototype.clearScene = function() {

};

function addGroundPlane(scene, width, height) {
    // create the ground plane
    var planeGeometry = new THREE.PlaneGeometry(width,height,1,1);
    var texture = THREE.ImageUtils.loadTexture("images/grid.png");
    var planeMaterial = new THREE.MeshLambertMaterial({map: texture, transparent: true, opacity: 0.5});
    var plane = new THREE.Mesh(planeGeometry,planeMaterial);

    //plane.receiveShadow  = true;

    // rotate and position the plane
    plane.rotation.x=-0.5*Math.PI;
    plane.position.x=0;
    plane.position.y=-59.9;
    plane.position.z=0;

    scene.add(plane);

    //Second plane
    planeGeometry = new THREE.PlaneGeometry(width, height, 1, 1);
    planeMaterial = new THREE.MeshLambertMaterial({color: 0x16283c});
    plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x=-0.5*Math.PI;
    plane.position.x=0;
    plane.position.y=-60;
    plane.position.z=0;
    //Give it a name
    plane.name = 'ground';

    // add the plane to the scene
    scene.add(plane);
}

FootyApp.prototype.createGUI = function() {
    //Create GUI - use dat.GUI for now
};

FootyApp.prototype.reset = function() {
    //Reset rendering and data
    this.clearScene();

    //Clear data
    this.data = null;
    this.dataFile = null;
    this.filename = "";

    //Clear gui controls
    this.guiControls.filename = null;
    this.guiControls = null;
    this.guiAppear = null;
    this.guiData = null;
    this.gui.destroy();
    this.createGUI();
};

/*
FootyApp.prototype.generateData = function() {
    //For now get required team and write out to file
    var teamData = [];
    var pos = [8, 3, 1, 1, 4, 3, 5, 6, 5, 4,
               4, 4, 6, 6, 5, 5, 6, 7, 5, 7,
               7, 5, 5, 5, 5, 5, 5, 5, 5, 5,
               5, 5, 5, 5, 5, 6, 7, 7, 7, 7,
               10, 11, 9, 7, 11, 11];

    var points = [3, 6, 9, 10, 10, 13, 14, 15, 18, 19,
                  22, 23, 23, 23, 26, 27, 27, 28, 31, 32,
                  33, 36, 39, 40, 41, 44, 47, 50, 51, 54,
                  55, 55, 55, 55, 56, 57, 57, 57, 58, 58,
                  59, 59, 62, 65, 65, 65];

    for(var i=0; i<this.data.length; ++i) {
        var item = this.data[i];
        if(item["HomeTeam"] == "Nott'm Forest" || item["AwayTeam"] == "Nott'm Forest") {
            item["Position"] = pos[i];
            item["Points"] = points[i];
            teamData.push(item);
        }
    }

    //DEBUG
    console.log('Forest =', teamData);

    var bb = window.Blob;
    var filename = 'forest.json';
    saveAs(new bb(
            [JSON.stringify(teamData)]
            , {type: "text/plain;charset=" + document.characterSet}
        )
        , filename);
};
*/

FootyApp.prototype.renderAttribute = function(attribute, row) {
    //Render given attribute for dataset
    var barScale = new THREE.Vector3(1, 1, 1);
    var barMaterial;
    var pos = new THREE.Vector3(START_X + row, START_Y, START_Z);
    var incZ = 3;

    switch (attribute) {
        case 'result':
            var winMaterial = new THREE.MeshPhongMaterial({color: 0x00ff00});
            var drawMaterial = new THREE.MeshPhongMaterial({color: 0xFF4918});
            var loseMaterial = new THREE.MeshPhongMaterial({color: 0xff0000});

            for(var i=0; i<this.data.length; ++i) {
                barMaterial = loseMaterial;
                barScale.set(1, 1, 1);
                var item = this.data[i];
                switch(item["FTR"]) {
                    case 'H':
                        if(item['HomeTeam'] == "Nott'm Forest") {
                            barMaterial = winMaterial;
                            barScale.set(1, 3, 1);
                        }
                        break;

                    case 'D':
                        barMaterial = drawMaterial;
                        barScale.set(1, 2, 1);
                        break;

                    case 'A':
                        if(item['AwayTeam'] == "Nott'm Forest") {
                            barMaterial = winMaterial;
                            barScale.set(1, 3, 1);
                        }
                        break;
                }

                //Create bar
                var bar = this.renderItem('box', barMaterial, pos, barScale);
                this.scene.add(bar);
                pos.z += incZ;
            }
            break;

        case 'points':
            var pointsMaterial = new THREE.MeshPhongMaterial({color: 0x00ff00});
            for(var i=0; i<this.data.length; ++i) {
                barMaterial = pointsMaterial;
                var item = this.data[i];
                var points = item['Points'];
                barScale.set(1, points, 1);

                //Create bar
                var bar = this.renderItem('box', barMaterial, pos, barScale);
                this.scene.add(bar);
                pos.z += incZ;
            }
            break;

        case 'position':
            var posMaterial = new THREE.MeshPhongMaterial({color: 0x0000ff});
            for(var i=0; i<this.data.length; ++i) {
                barMaterial = posMaterial;
                var item = this.data[i];
                var leaguePos = item['Position'];
                //Invert as lower is better
                leaguePos = Math.abs(leaguePos-24);
                barScale.set(1, leaguePos, 1);

                //Create bar
                var bar = this.renderItem('box', barMaterial, pos, barScale);
                this.scene.add(bar);
                pos.z += incZ;
            }
            break;

        case 'scored':
            var goalMaterial = new THREE.MeshPhongMaterial({color: 0xFF196E});
            for(var i=0; i<this.data.length; ++i) {
                barMaterial = goalMaterial;
                var item = this.data[i];
                var goals;
                if(item['HomeTeam'] == "Nott'm Forest") {
                    goals = item['FTHG'];
                } else {
                    goals = item['FTAG'];
                }
                if(goals == 0) {
                    pos.z += incZ;
                    continue;
                }
                barScale.set(1, goals, 1);

                //Create bar
                var bar = this.renderItem('box', barMaterial, pos, barScale);
                this.scene.add(bar);
                pos.z += incZ;
            }
            break;

        case 'conceeded':
            var goalMaterial = new THREE.MeshPhongMaterial({color: 0xFFF725});
            for(var i=0; i<this.data.length; ++i) {
                barMaterial = goalMaterial;
                var item = this.data[i];
                var goals;
                if(item['HomeTeam'] == "Nott'm Forest") {
                    goals = item['FTAG'];
                } else {
                    goals = item['FTHG'];
                }
                if(goals == 0) {
                    pos.z += incZ;
                    continue;
                }
                barScale.set(1, goals, 1);

                //Create bar
                var bar = this.renderItem('box', barMaterial, pos, barScale);
                this.scene.add(bar);
                pos.z += incZ;
            }
            break;

    }
};

FootyApp.prototype.renderItem = function(shape, material, pos, scale) {
    //Render given data item
    var itemGeometry;

    switch (shape) {
        case 'box':
            itemGeometry = new THREE.BoxGeometry(2, 2, 2);
            break;

        case 'cylinder':
            itemGeometry = new THREE.CylinderGeometry(1, 1, 2);
            break;
    }

    var item = new THREE.Mesh(itemGeometry, material);
    item.scale.y = scale.y;
    item.position.x = pos.x;
    item.position.y = pos.y;
    item.position.z = pos.z;

    return item;
};

FootyApp.prototype.generateData = function() {
    //Render data for each enabled attribute
    var attributes = {'points' : true, 'position' : true, 'conceeded' : true, 'scored' : true, 'result' : true};
    var row = 0;
    for(var attrib in attributes) {
        if(attributes[attrib]) {
            this.renderAttribute(attrib, row);
            row += 5;
        }
    }
};

FootyApp.prototype.parseFile = function() {
    //Attempt to load and parse given json file
    if(!this.filename) return;

    console.log("Reading file...");

    var reader = new FileReader();
    var self = this;
    reader.onload = function(evt) {
        //File loaded - parse it
        console.log('file read: '+evt.target.result);
        try {
            self.data = JSON.parse(evt.target.result);
        }
        catch (err) {
            console.log('error parsing JSON file', err);
            alert('Sorry, there was a problem reading that file');
            return;
        }
        //File parsed OK - generate GUI controls and data
        //self.generateGUIControls();
        self.generateData();
        self.updateRequired = true;
    };

    // Read in the file
    reader.readAsText(this.dataFile, 'ISO-8859-1');
};

FootyApp.prototype.onSelectFile = function(evt) {
    //User selected file
    //See if we support filereader API's
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        //File APIs are supported.
        var files = evt.target.files; // FileList object
        if (files.length==0) {
            console.log('no file specified');
            this.filename = "";
            return;
        }
        //Clear old data first
        if(this.dataFile) {
            this.reset();
        }
        this.dataFile = files[0];
        this.filename = this.dataFile.name;
        console.log("File chosen", this.filename);

        //Try and read this file
        this.parseFile();
    }
    else
        alert('sorry, file apis not supported');
};

$(document).ready(function() {
    //Initialise app
    var container = document.getElementById("WebGL-output");
    var app = new FootyApp();
    app.init(container);
    app.createScene();
    app.createGUI();

    //GUI callbacks
    $("#chooseFile").on("change", function(evt) {
        app.onSelectFile(evt);
    });

    app.run();
});
