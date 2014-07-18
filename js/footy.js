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
    this.objectsRendered = 0;
    //Groups to render
    this.attributes = ['points', 'position', 'conceeded', 'scored', 'results'];
    //Rendering groups
    this.attributeGroups = [];
    this.labelGroups = [];
};

FootyApp.prototype.update = function() {
    //Perform any updates
    var clicked = this.mouse.clicked;

    /*
    if(this.updateRequired) {
        this.reDraw();
    }
    */
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
    //Clear all data
    for(var i=0; i<this.attributeGroups.length; ++i) {
        this.scene.remove(this.attributeGroups[i]);
    }
};

FootyApp.prototype.reDraw = function() {
    //Remove generated data and redraw
    this.clearScene();

    this.generateData();
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
    this.guiControls = new function() {
        this.filename = '';
        this.ShowLabels = false;

        //Colours
        this.Points = "#00ff00";
        this.Position = "#0000ff";
        this.Conceeded = "#fff725";
        this.Scored = "#ff196e";
        this.Ground = '#16283c';
        this.Background = '#5c5f64';
        this.AttributeScale = 1;
        this.Attribute = 'points';

        //Categories
        this.ShowPoints = true;
        this.ShowPosition = true;
        this.ShowConceeded = true;
        this.ShowScored = true;
        this.ShowResults = true;

        //Values
        this.ShowValues = true;
    };

    //Create GUI
    var gui = new dat.GUI();
    var _this = this;
    //Create two folders - Appearance and Data
    gui.add(this.guiControls, 'filename', this.filename).listen();
    this.guiAppear = gui.addFolder("Appearance");

    this.guiAppear.addColor(this.guiControls, 'Ground').onChange(function(value) {
        _this.groundColourChanged(value);
    });
    this.guiAppear.addColor(this.guiControls, 'Background').onChange(function(value) {
        _this.renderer.setClearColor(value, 1.0);
    });
    this.guiData = gui.addFolder("Data");

};

FootyApp.prototype.generateGUIControls = function() {
    //Generate GUI elements from data
    this.guiControls.filename = this.filename;

    var _this = this;
    this.guiAppear.addColor(this.guiControls, 'Points').onChange(function(value) {
        _this.onPointsChanged(value);
    });
    this.guiAppear.addColor(this.guiControls, 'Position').onChange(function(value) {
        _this.onPositionChanged(value);
    });
    this.guiAppear.addColor(this.guiControls, 'Conceeded').onChange(function(value) {
        _this.onConceededChanged(value);
    });
    this.guiAppear.addColor(this.guiControls, 'Scored').onChange(function(value) {
        _this.onScoredChanged(value);
    });

    var attribScale = this.guiAppear.add(this.guiControls, 'AttributeScale', 0.25, 10).step(0.25);
    attribScale.listen();
    attribScale.onChange(function(value) {
        _this.onAttributeScaleChanged(value);
    });

    this.guiAppear.add(this.guiControls, 'Attribute', ['points', 'position', 'conceeded', 'scored', 'results']);
    this.guiAppear.add(this.guiControls, 'ShowValues').onChange(function(value) {
        _this.onShowValues(value);
    });

    this.guiData.add(this.guiControls, 'ShowPoints').onChange(function(value) {
        _this.onShowGroup('points', value);
    });
    this.guiData.add(this.guiControls, 'ShowPosition').onChange(function(value) {
        _this.onShowGroup('position', value);
    });
    this.guiData.add(this.guiControls, 'ShowConceeded').onChange(function(value) {
        _this.onShowGroup('conceeded', value);
    });
    this.guiData.add(this.guiControls, 'ShowScored').onChange(function(value) {
        _this.onShowGroup('scored', value);
    });
    this.guiData.add(this.guiControls, 'ShowResults').onChange(function(value) {
        _this.onShowGroup('results', value);
    });
};

FootyApp.prototype.groundColourChanged = function(value) {
    var ground = this.scene.getObjectByName('ground');
    if(ground) {
        ground.material.color.setStyle(value);
    }
};

FootyApp.prototype.onPointsChanged = function(value) {
    //Alter colour for points values
    if(this.guiControls.ShowPoints) {
        //Get points group
        var group = this.scene.getObjectByName('pointsGroup');
        if(group) {
            for(var child=0; child<group.children.length; ++child) {
                group.children[child].material.color.setStyle(value);
            }
        }
    }
};

FootyApp.prototype.onPositionChanged = function(value) {
    //Alter colour for position values
    if(this.guiControls.ShowPosition) {
        //Get position group
        var group = this.scene.getObjectByName('positionGroup');
        if(group) {
            for(var child=0; child<group.children.length; ++child) {
                group.children[child].material.color.setStyle(value);
            }
        }
    }
};

FootyApp.prototype.onConceededChanged = function(value) {
    //Alter colour for conceeded values
    if(this.guiControls.ShowConceeded) {
        //Get conceeded group
        var group = this.scene.getObjectByName('conceededGroup');
        if(group) {
            for(var child=0; child<group.children.length; ++child) {
                group.children[child].material.color.setStyle(value);
            }
        }
    }
};

FootyApp.prototype.onScoredChanged = function(value) {
    //Alter colour for scored values
    if(this.guiControls.ShowScored) {
        //Get scored group
        var group = this.scene.getObjectByName('scoredGroup');
        if(group) {
            for(var child=0; child<group.children.length; ++child) {
                group.children[child].material.color.setStyle(value);
            }
        }
    }
};

FootyApp.prototype.onAttributeScaleChanged = function(value) {
    //Get associated group to scale
    var group = this.scene.getObjectByName(this.guiControls.Attribute + 'Group');
    if(group) {
        //Scale group
        group.scale.set(1, value, 1);
        var height = -START_Y * (value-1);
        group.position.set(group.position.x, height, group.position.z);

        //Move labels accordingly
        var labelGroup = this.scene.getObjectByName(this.guiControls.Attribute + 'LabelGroup', true);
        if(!labelGroup) {
            console.log('Group ', this.guiControls.Attribute, ' not found');
            return;
        }
        for(var i=0; i<group.children.length; ++i) {
            //Get top of object
            var child = group.children[i];
            var top = (child.scale.y * group.scale.y * 2) + START_Y;
            labelGroup.children[i].position.y = top + 1;
        }
    }
};

FootyApp.prototype.onShowGroup = function(attribute, value) {
    //Show relevant dataset
    var group = this.scene.getObjectByName(attribute+'Group');
    if(group) {
        group.traverse(function(obj) {
            if(obj instanceof THREE.Mesh || obj instanceof THREE.Sprite) {
                obj.visible = value;
            }
        });
        //Hide labels
        var label = this.scene.getObjectByName(attribute + 'LabelFront');
        if(label) {
            label.visible = value;
        }
        label = this.scene.getObjectByName(attribute + 'LabelBack');
        if(label) {
            label.visible = value;
        }
        //Hide values
        for(var i=0; i<this.labelGroups.length; ++i) {
            if(this.labelGroups[i].name == attribute + 'LabelGroup') {
                this.labelGroups[i].traverse(function(obj) {
                    if(obj instanceof THREE.Sprite) {
                        obj.visible = value;
                    }
                });
                break;
            }
        }
    }
};

FootyApp.prototype.onShowValues = function(value) {
    //Show value labels above attributes
    var group;
    for(var i=0; i<this.labelGroups.length; ++i) {
        group = this.scene.getObjectByName(this.attributes[i]+'LabelGroup', true);
        if(group) {
            group.traverse(function(obj) {
                if(obj instanceof THREE.Sprite) {
                    obj.visible = value;
                }
            });
        }
    }
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
    //Labels
    var labelPos = new THREE.Vector3(pos.x, START_Y+0.5, pos.z -3);
    var labelScale = new THREE.Vector3(3, 1, 1);
    var labelColour = [255, 255, 255];
    var label;

    switch (attribute) {
        case 'results':
            //Create containing group
            var group = new THREE.Object3D();
            group.name = attribute + 'Group';

            var winMaterial = new THREE.MeshPhongMaterial({color: 0x00ff00});
            var drawMaterial = new THREE.MeshPhongMaterial({color: 0xFF4918});
            var loseMaterial = new THREE.MeshPhongMaterial({color: 0xff0000});

            //Add label
            label = createLabel('Results', labelPos, labelScale, labelColour, 12, 1);
            label.name = 'resultsLabelBack';
            this.scene.add(label);

            //Add values
            var labelGroup = new THREE.Object3D();
            labelGroup.name = 'resultsLabelGroup';

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
                pos.y = barScale.y + START_Y;
                var bar = this.renderItem('box', 'results' + i, barMaterial, pos, barScale);
                ++this.objectsRendered;
                pos.y += barScale.y + 1;
                var value = createLabel(barScale.y == 3 ? 'Win' : barScale.y == 2 ? 'Draw' : 'Lose', pos, labelScale, labelColour, 12, 1);
                value.name = 'resultsLabel' + i;
                labelGroup.add(value);
                group.add(bar);
                pos.z += incZ;
            }
            //Add label
            labelPos = new THREE.Vector3(pos.x, START_Y+0.5, pos.z);
            label = createLabel('Results', labelPos, labelScale, labelColour, 12, 1);
            label.name = 'resultsLabelFront';
            this.scene.add(label);
            //Add objects to scene
            this.scene.add(group);
            this.attributeGroups.push(group);
            this.scene.add(labelGroup);
            this.labelGroups.push(labelGroup);
            break;

        case 'points':
            //Create containing group
            var group = new THREE.Object3D();
            group.name = attribute + 'Group';

            var pointsMaterial = new THREE.MeshPhongMaterial({color: 0x00ff00});

            //Add label
            label = createLabel('Points', labelPos, labelScale, labelColour, 12, 1);
            label.name = 'pointsLabelBack';
            this.scene.add(label);

            //Add values
            var labelGroup = new THREE.Object3D();
            labelGroup.name = 'pointsLabelGroup';

            for(var i=0; i<this.data.length; ++i) {
                barMaterial = pointsMaterial;
                var item = this.data[i];
                var points = item['Points'];
                barScale.set(1, points/2, 1);

                //Create bar
                pos.y = barScale.y + START_Y;
                var bar = this.renderItem('box', 'points' + i, barMaterial, pos, barScale);
                ++this.objectsRendered;
                pos.y += barScale.y + 1;
                var value = createLabel(barScale.y*2, pos, labelScale, labelColour, 12, 1);
                value.name = 'pointsLabel' + i;
                labelGroup.add(value);
                group.add(bar);
                pos.z += incZ;
            }
            //Add label
            labelPos = new THREE.Vector3(pos.x, START_Y+0.5, pos.z);
            label = createLabel('Points', labelPos, labelScale, labelColour, 12, 1);
            label.name = 'pointsLabelFront';
            this.scene.add(label);
            //Add objects to scene
            this.scene.add(group);
            this.attributeGroups.push(group);
            this.scene.add(labelGroup);
            this.labelGroups.push(labelGroup);
            break;

        case 'position':
            //Create containing group
            var group = new THREE.Object3D();
            group.name = attribute + 'Group';

            var posMaterial = new THREE.MeshPhongMaterial({color: 0x0000ff});

            //Add label
            label = createLabel('Position', labelPos, labelScale, labelColour, 12, 1);
            label.name = 'positionLabelBack';
            this.scene.add(label);

            //Add values
            var labelGroup = new THREE.Object3D();
            labelGroup.name = 'positionLabelGroup';

            for(var i=0; i<this.data.length; ++i) {
                barMaterial = posMaterial;
                var item = this.data[i];
                var leaguePos = item['Position'];
                //Invert as lower is better
                leaguePos = Math.abs(leaguePos-24);
                barScale.set(1, leaguePos, 1);

                //Create bar
                pos.y = barScale.y + START_Y;
                var bar = this.renderItem('box', 'position' + i, barMaterial, pos, barScale);
                ++this.objectsRendered;
                pos.y += barScale.y + 1;
                var value = createLabel(24-leaguePos, pos, labelScale, labelColour, 12, 1);
                value.name = 'positionLabel' + i;
                labelGroup.add(value);
                group.add(bar);
                pos.z += incZ;
            }
            //Add label
            labelPos = new THREE.Vector3(pos.x, START_Y+0.5, pos.z);
            label = createLabel('Position', labelPos, labelScale, labelColour, 12, 1);
            label.name = 'positionLabelFront';
            this.scene.add(label);
            //Add objects to scene
            this.scene.add(group);
            this.attributeGroups.push(group);
            this.scene.add(labelGroup);
            this.labelGroups.push(labelGroup);
            break;

        case 'scored':
            //Create containing group
            var group = new THREE.Object3D();
            group.name = attribute + 'Group';

            var goalMaterial = new THREE.MeshPhongMaterial({color: 0xFF196E});

            //Add label
            label = createLabel('Scored', labelPos, labelScale, labelColour, 12, 1);
            label.name = 'scoredLabelBack';
            this.scene.add(label);

            //Add values
            var labelGroup = new THREE.Object3D();
            labelGroup.name = 'scoredLabelGroup';

            for(var i=0; i<this.data.length; ++i) {
                barMaterial = goalMaterial;
                var item = this.data[i];
                var goals;
                if(item['HomeTeam'] == "Nott'm Forest") {
                    goals = item['FTHG'];
                } else {
                    goals = item['FTAG'];
                }
                barScale.set(1, goals, 1);
                //Show something for zero goals scored
                if(goals == 0) {
                    barScale.y = 0.05;
                }

                //Create bar
                pos.y = barScale.y + START_Y;
                var bar = this.renderItem('box', 'scored' + i, barMaterial, pos, barScale);
                ++this.objectsRendered;
                pos.y += barScale.y + 1;
                var value = createLabel(goals != 0 ? barScale.y : 0, pos, labelScale, labelColour, 12, 1);
                value.name = 'scoredLabel' + i;
                labelGroup.add(value);
                if(bar) group.add(bar);
                pos.z += incZ;
            }
            //Add label
            labelPos = new THREE.Vector3(pos.x,START_Y+0.5, pos.z);
            label = createLabel('Scored', labelPos, labelScale, labelColour, 12, 1);
            label.name = 'scoredLabelFront';
            this.scene.add(label);
            //Add objects to scene
            this.scene.add(group);
            this.attributeGroups.push(group);
            this.scene.add(labelGroup);
            this.labelGroups.push(labelGroup);
            break;

        case 'conceeded':
            //Create containing group
            var group = new THREE.Object3D();
            group.name = attribute + 'Group';

            var goalMaterial = new THREE.MeshPhongMaterial({color: 0xFFF725});

            //Add label
            label = createLabel('Conceeded', labelPos, labelScale, labelColour, 12, 1);
            label.name = 'conceededLabelBack';
            this.scene.add(label);

            //Add values
            var labelGroup = new THREE.Object3D();
            labelGroup.name = 'conceededLabelGroup';

            for(var i=0; i<this.data.length; ++i) {
                barMaterial = goalMaterial;
                var item = this.data[i];
                var goals;
                if(item['HomeTeam'] == "Nott'm Forest") {
                    goals = item['FTAG'];
                } else {
                    goals = item['FTHG'];
                }
                barScale.set(1, goals, 1);
                //Show something for zero goals conceeded
                if(goals == 0) {
                    barScale.y = 0.05;
                }

                //Create bar
                pos.y = barScale.y + START_Y;
                var bar = this.renderItem('box', 'conceeded' + i, barMaterial, pos, barScale);
                ++this.objectsRendered;
                pos.y += barScale.y + 1;
                var value = createLabel(goals != 0 ? barScale.y : 0, pos, labelScale, labelColour, 12, 1);
                value.name = 'conceeededLabel' + i;
                labelGroup.add(value);
                group.add(bar);
                pos.z += incZ;
            }
            //Add label
            labelPos = new THREE.Vector3(pos.x, START_Y+0.5, pos.z);
            label = createLabel('Conceeded', labelPos, labelScale, labelColour, 12, 1);
            label.name = 'conceededLabelFront';
            this.scene.add(label);
            //Add objects to scene
            this.scene.add(group);
            this.attributeGroups.push(group);
            this.scene.add(labelGroup);
            this.labelGroups.push(labelGroup);
            break;

    }
};

function createLabel(name, position, scale, colour, fontSize, opacity) {

    var fontface = "Arial";
    var spacing = 10;

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var metrics = context.measureText( name );
    var textWidth = metrics.width;

    canvas.width = textWidth + (spacing * 2);
    canvas.width *= 2;
    canvas.height = fontSize;
    context.textAlign = "center";
    context.textBaseline = "middle";

    context.fillStyle = "rgba(255, 255, 255, 0.0)";
    context.fillRect(0, 0, canvas.width, canvas.height);

    var red = Math.round(colour[0]);
    var green = Math.round(colour[1]);
    var blue = Math.round(colour[2]);

    context.fillStyle = "rgba(" + red + "," + green + "," + blue + "," + "1.0)";
    context.font = fontSize + "px " + fontface;

    context.fillText(name, canvas.width/2, canvas.height/2);

    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    //texture.needsUpdate = true;
    var spriteMaterial = new THREE.SpriteMaterial({
            //color: color,
            transparent: false,
            opacity: opacity,
            useScreenCoordinates: false,
            blending: THREE.AdditiveBlending,
            map: texture}
    );

    var sprite = new THREE.Sprite(spriteMaterial);

    sprite.scale.set(scale.x, scale.y, 1);
    sprite.position.set(position.x, position.y, position.z);

    return sprite;
}

FootyApp.prototype.renderItem = function(shape, name, material, pos, scale) {
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
    item.name = name;
    item.scale.y = scale.y;
    item.position.x = pos.x;
    item.position.y = pos.y;
    item.position.z = pos.z;

    return item;
};

FootyApp.prototype.generateData = function() {
    //Render data for each enabled attribute
    //Create group for each attribute
    var row = 0;
    for(var i=0; i<this.attributes.length; ++i) {
        this.renderAttribute(this.attributes[i], row);
        row += 5;
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
        self.generateGUIControls();
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
