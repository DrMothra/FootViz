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
    plane.position.y=-60;
    plane.position.z=0;

    scene.add(plane);

    //Second plane
    planeGeometry = new THREE.PlaneGeometry(width, height, 1, 1);
    planeMaterial = new THREE.MeshLambertMaterial({color: 0x16283c});
    plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x=-0.5*Math.PI;
    plane.position.x=0;
    plane.position.y=-61;
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
    for(var i=0; i<this.data.length; ++i) {
        var item = this.data[i];
        if(item["HomeTeam"] == "Nott'm Forest" || item["AwayTeam"] == "Nott'm Forest") {
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

FootyApp.prototype.generateData = function() {
    //Generate bars for each parameter
    var barGeometry = new THREE.BoxGeometry(2, 2, 2);
    var barScale = new THREE.Vector3(1, 1, 1);
    var barMaterial = new THREE.MeshPhongMaterial({color: 0xff0000});
    var pos = new THREE.Vector3(START_X, START_Y, START_Z);
    var incZ = 3;

    for(var i=0; i<this.data.length; ++i) {
        var item = this.data[i];
        switch(item["FTR"]) {
            case 'H':
                if(item['HomeTeam'] == "Nott'm Forest") {
                    barMaterial.color = 0x00ff00;
                    barScale.set(1, 3, 1);
                }
                break;

            case 'D':
                barMaterial.color = 0xFF985C;
                barScale.set(1, 2, 1);
                break;

            case 'A':
                if(item['AwayTeam'] == "Nott'm Forest") {
                    barMaterial.color = 0x00ff00;
                    barScale.set(1, 3, 1);
                }
                break;
        }

        //Create bar
        var bar = new THREE.Mesh(barGeometry, barMaterial);
        bar.scale.y = barScale.y;
        bar.position.x = pos.x;
        bar.position.y = pos.y;
        bar.position.z = pos.z;
        this.scene.add(bar);
        pos.z += incZ;
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
