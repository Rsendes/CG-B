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
let trailer, hitch;
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
    
    const size = 2;
    const width = size * aspect;
    const height = size;
    
    // Create orthographic cameras with proper aspect ratio
    cameraFrontal = new THREE.OrthographicCamera(-width/2, width/2, height/2, -height/2, 0.1, 10);
    cameraLateral = new THREE.OrthographicCamera(-width/2, width/2, height/2, -height/2, 0.1, 10);
    cameraTop = new THREE.OrthographicCamera(-width/2, width/2, height/2, -height/2, 0.1, 10);
    cameraBottom = new THREE.OrthographicCamera(-width/2, width/2, height/2, -height/2, 0.1, 10);
    
    // Create perspective camera (original camera)
    camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    camera.position.z = 3;
    camera.position.x = 3;
    camera.position.y = 3;
    camera.lookAt(0, 0, 0);

    // Set camera positions and orientations
    cameraFrontal.position.set(0, 0, 3);
    cameraFrontal.lookAt(0, 0, 0);

    cameraLateral.position.set(3, 0, 0);
    cameraLateral.lookAt(0, 0, 0);

    cameraTop.position.set(0, 3, 0);
    cameraTop.lookAt(0, 0, 0);
    
    cameraBottom.position.set(0, -3, 0);
    cameraBottom.lookAt(0, 0, 0);

    // Add cameras to the scene for reference
    scene.add(cameraFrontal);
    scene.add(cameraLateral);
    scene.add(cameraTop);
    scene.add(cameraBottom);
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
    
    // Criar um grupo para o veículo (cubo + rodas)
    trailer = new THREE.Group();
    
    // Add a trailer with different colors for each face
    const geometry = new THREE.BoxGeometry(3, 1, 1.2);
    
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
    trailer.add(trailerBody); // Adicionar o corpo ao grupo em vez da cena

    // Add four wheels (cylinders) to the parallelepiped
    const wheelGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 32);
    const wheelMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 }); // Dark gray
    
    // Left side front wheel
    const leftFrontWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    leftFrontWheel.position.set(-1.25, -0.65, 0.5); // Left side, front
    leftFrontWheel.rotation.y = Math.PI/2; // Rotate to point outward
    leftFrontWheel.rotation.z = Math.PI/2; // Rotate to point outward
    trailer.add(leftFrontWheel); // Adicionar ao grupo em vez da cena
    
    // Left side rear wheel
    const leftRearWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    leftRearWheel.position.set(-1.25, -0.65, -0.5); // Left side, rear
    leftRearWheel.rotation.z = Math.PI/2; // Rotate to point outward
    leftRearWheel.rotation.y = Math.PI/2; // Rotate to point outward
    trailer.add(leftRearWheel); // Adicionar ao grupo em vez da cena
    
    // Right side front wheel
    const rightFrontWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    rightFrontWheel.position.set(-0.85, -0.65, -0.5); // Right side, front
    rightFrontWheel.rotation.z = Math.PI/2; // Rotate to point outward
    rightFrontWheel.rotation.y = Math.PI/2; // Rotate to point outward
    trailer.add(rightFrontWheel); // Adicionar ao grupo em vez da cena
    
    // Right side rear wheel
    const rightRearWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    rightRearWheel.position.set(-0.85, -0.65, 0.5); // Right side, rear
    rightRearWheel.rotation.z = Math.PI/2; // Rotate to point outward
    rightRearWheel.rotation.y = Math.PI/2; // Rotate to point outward
    trailer.add(rightRearWheel); // Adicionar ao grupo em vez da cena

    // Add trailer hitch - a cylinder in the middle bottom of the trailer
    const hitchMaterial = new THREE.MeshBasicMaterial({ color: 0x555555 }); // Dark gray
    const hitchGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.15, 32);
    
    // Usar trailer em vez de hitch
    hitch = new THREE.Mesh(hitchGeometry, hitchMaterial);
    
    // Position it at the middle bottom of the back side
    hitch.position.set(1.2, -0.5, 0); // Center, bottom, back
    hitch.rotation.y = Math.PI/2; // Rotate to be horizontal


    // Adicionar o grupo à cena
    trailer.add(hitch); // Adicionar o trailer ao grupo
    scene.add(trailer);

}

//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions() {}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions() {}

////////////
/* UPDATE */
////////////
function update() {
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
        
        cameraFrontal.left = -width/2;
        cameraFrontal.right = width/2;
        cameraFrontal.top = height/2;
        cameraFrontal.bottom = -height/2;
        cameraFrontal.updateProjectionMatrix();
        
        cameraLateral.left = -width/2;
        cameraLateral.right = width/2;
        cameraLateral.top = height/2;
        cameraLateral.bottom = -height/2;
        cameraLateral.updateProjectionMatrix();
        
        cameraTop.left = -width/2;
        cameraTop.right = width/2;
        cameraTop.top = height/2;
        cameraTop.bottom = -height/2;
        cameraTop.updateProjectionMatrix();
        
        cameraBottom.left = -width/2;
        cameraBottom.right = width/2;
        cameraBottom.top = height/2;
        cameraBottom.bottom = -height/2;
        cameraBottom.updateProjectionMatrix();
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