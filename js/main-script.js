import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import * as Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
let camera, scene, renderer;
let cameraFrontal, cameraLateral, cameraTop, cameraBottom;
let currCamera;
let trailer, hitch, robot, headGroup;
let aspect;

// Track keys being pressed
const keyState = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};
// Movement speed
const MOVEMENT_SPEED = 0.05;
const TRAILER_TRAVEL = -3; // Constant travel distance for the trailer

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    // Create a scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcccccc);
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCameras() {
    // Calculate aspect ratio
    aspect = window.innerWidth / window.innerHeight;
    
    const size = 3;
    const width = size * aspect;
    const height = size;

    // Helper function to create and configure an orthographic camera
    function createOrthographicCamera(x, y, z) {
        const camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0.1, 10);
        camera.position.set(x, y, z);
        camera.lookAt(0, 0, 0);
        scene.add(camera);
        return camera;
    }

    // Create orthographic cameras
    cameraFrontal = createOrthographicCamera(0, 0, 3);
    cameraLateral = createOrthographicCamera(3, 0, 0);
    cameraTop = createOrthographicCamera(0, 3, 0);
    cameraBottom = createOrthographicCamera(0, -3, 0);

    // Create perspective camera (original camera)
    camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    camera.position.set(3, 3, 3);
    camera.lookAt(0, 0, 0);
    scene.add(camera);

    // Set default camera
    currCamera = cameraFrontal;
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////
function createLights() {
    // No lights in the original code since we're using MeshBasicMaterial
}

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////
function createObjects() {

    createTrailer(); // Create the trailer first

    createRobot(); // Create the robot
    
    // Add a grid helper to the scene
    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);

    // Add axes helper to the scene
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
}

function createTrailer() {
    // Create a trailer group object
    trailer = new THREE.Group();
    
    // Add a trailer with different colors for each face
    const geometry = new THREE.BoxGeometry(1, 1.2, 3);
    
    // Create materials array - one for each face
    const materials = [
        new THREE.MeshBasicMaterial({ color: 0xff0000 }), // Right face (positive X)
        new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // Left face (negative X)
        new THREE.MeshBasicMaterial({ color: 0x0000ff }), // Top face (positive Y)
        new THREE.MeshBasicMaterial({ color: 0xffff00 }), // Bottom face (negative Y)
        new THREE.MeshBasicMaterial({ color: 0xff00ff }), // Front face (positive Z)
        new THREE.MeshBasicMaterial({ color: 0x00ffff })  // Back face (negative Z)
    ];
    
    const trailerBody = new THREE.Mesh(geometry, materials);
    trailerBody.position.set(0, 0, TRAILER_TRAVEL); // Position the trailer
    trailer.add(trailerBody); // Adicionar o corpo ao grupo em vez da cena

    // Helper function to create and position wheels

    // Add four wheels using the helper function
    addWheel(0.5, -0.75, -1.25+TRAILER_TRAVEL, trailer); // Left side rear wheel
    addWheel(0.5, -0.75, -0.90+TRAILER_TRAVEL, trailer); // Left side front wheel
    addWheel(-0.5, -0.75, -1.25+TRAILER_TRAVEL, trailer); // Right side rear wheel
    addWheel(-0.5, -0.75, -0.90+TRAILER_TRAVEL, trailer); // Right side front wheel

    // Add trailer hitch - a cylinder in the middle bottom of the trailer
    const hitchMaterial = new THREE.MeshBasicMaterial({ color: 0x555555 }); // Dark gray
    const hitchGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.1, 32);
    hitch = new THREE.Mesh(hitchGeometry, hitchMaterial);
    hitch.position.set(0, -0.65, 1 + TRAILER_TRAVEL); // Center, bottom, back
    hitch.rotation.y = Math.PI / 2; // Rotate to be horizontal
    trailer.add(hitch); // Adicionar o trailer ao grupo

    // Add the trailer to the scene
    scene.add(trailer);

}

function addWheel(x, y, z, group) {
    const wheelGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 32);
    const wheelMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 }); // Dark gray
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.position.set(x, y, z); // Position the wheel
    wheel.rotation.z = Math.PI / 2; // Rotate to point outward
    group.add(wheel);
}

function createRobot() {
    robot = new THREE.Group();

    var current_height = 0;

    // Create Waist
    const waistGeometry = new THREE.BoxGeometry(0.4, 0.2, 0.3);
    const waistMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const waist = new THREE.Mesh(waistGeometry, waistMaterial);
    robot.add(waist);

    // Create Upper Wheels
    addWheel(0.25, 0, 0, robot);
    addWheel(-0.25, 0, 0, robot);

    // Create Abdomen
    const abdomenGeometry = new THREE.BoxGeometry(0.3, 0.15, 0.3);
    const abdomenMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const abdomen = new THREE.Mesh(abdomenGeometry, abdomenMaterial);
    current_height += 0.175;
    abdomen.position.set(0, current_height, 0);
    robot.add(abdomen);

    // Create Torso
    const torsoGeometry = new THREE.BoxGeometry(0.6, 0.35, 0.45);
    const torsoMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
    current_height += 0.25;
    torso.position.set(0, current_height, 0);
    robot.add(torso);

    // Create Head Group
    const headRotationCentre = current_height + 0.35/2;
    headGroup = new THREE.Group();
    headGroup.position.set(0, headRotationCentre, 0);

    const headOffset = current_height - headRotationCentre + 0.28;
 

    // Create Head Sphere
    const headGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    const headMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, headOffset, 0);
    headGroup.add(head);

    // Create Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.015, 32, 32);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.05, headOffset, 0.1);
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.05, headOffset, 0.1);
    headGroup.add(leftEye);
    headGroup.add(rightEye);

    // Create Antennas
    const antennaGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.1, 32);
    const antennaMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const leftAntenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    const antennaY = headOffset + 0.1;
    leftAntenna.position.set(-0.05, antennaY, 0);
    const rightAntenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    rightAntenna.position.set(0.05, antennaY, 0);
    headGroup.add(leftAntenna);
    headGroup.add(rightAntenna);

    robot.add(headGroup);

    scene.add(robot);
}


//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions() {
    const trailerBoundingBox = new THREE.Box3().setFromObject(trailer);
    const robotBoundingBox = new THREE.Box3().setFromObject(robot);
    return trailerBoundingBox.intersectsBox(robotBoundingBox);
}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions(prevPosition) {
    // If there's a collision, revert to previous position
    if (checkCollisions()) {
        trailer.position.copy(prevPosition);
    }
}

////////////
/* UPDATE */
////////////
function update() {
    const prevPosition = trailer.position.clone();

    // Move trailer based on which arrow keys are pressed
    if (keyState.ArrowUp) {
        trailer.position.z -= MOVEMENT_SPEED;
    }
    if (keyState.ArrowDown) {
        trailer.position.z += MOVEMENT_SPEED;
    }
    if (keyState.ArrowLeft) {
        trailer.position.x -= MOVEMENT_SPEED;
    }
    if (keyState.ArrowRight) {
        trailer.position.x += MOVEMENT_SPEED;
    }
    handleCollisions(prevPosition);
}

/////////////
/* DISPLAY */
/////////////
function render() {
    // Render with the current camera
    renderer.render(scene, currCamera);
}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
    // Create scene
    createScene();
    
    // Create cameras
    createCameras();
    
    // Create objects
    createObjects();

    // Create a renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Add event listeners
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", onResize);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    requestAnimationFrame(animate);
    
    // Update scene
    update();
    
    // Render scene
    render();
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() {
    // Update aspect ratio
    aspect = window.innerWidth / window.innerHeight;
    
    // Update renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    if (window.innerHeight > 0 && window.innerWidth > 0) {
        // Update perspective camera
        camera.aspect = aspect;
        camera.updateProjectionMatrix();
        
        // Update orthographic cameras to maintain aspect ratio
        const size = 2;
        const width = size * aspect;
        const height = size;

        function updateOrthographicCamera(camera) {
            camera.left = -width / 2;
            camera.right = width / 2;
            camera.top = height / 2;
            camera.bottom = -height / 2;
            camera.updateProjectionMatrix();
        }

        updateOrthographicCamera(cameraFrontal);
        updateOrthographicCamera(cameraLateral);
        updateOrthographicCamera(cameraTop);
        updateOrthographicCamera(cameraBottom);
    }
}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    // Camera selection with number keys
    switch (e.code) {
        case "Digit1": // '1' - Frontal camera
            currCamera = cameraFrontal;
            break;
        case "Digit2": // '2' - Lateral camera
            currCamera = cameraLateral;
            break;
        case "Digit3": // '3' - Top camera
            currCamera = cameraTop;
            break;
        case "Digit4": // '4' - Original perspective camera
            currCamera = camera;
            break;
        case "Digit5": // '5' - Bottom camera
            currCamera = cameraBottom;
            break;
        // Track arrow keys for trailer movement
        case "ArrowUp":
        case "ArrowDown":
        case "ArrowLeft":
        case "ArrowRight":
            keyState[e.code] = true;
            break;
        case "KeyR": // Rotate head clockwise (0 to PI)
            if (headGroup.rotation.x > -Math.PI) {
                headGroup.rotation.x = Math.max(headGroup.rotation.x - 0.15, -Math.PI);
            }
            break;
        case "KeyF": // Rotate head anticlockwise (PI to 0)
            if (headGroup.rotation.x < 0) {
                headGroup.rotation.x = Math.min(headGroup.rotation.x + 0.15, 0);
            }
            break;
    }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {
    // Reset key state when key is released
    if (keyState.hasOwnProperty(e.code)) {
        keyState[e.code] = false;
    }
}

init();
animate();