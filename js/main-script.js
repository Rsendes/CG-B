import * as THREE from "three";


//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
let camera, scene, renderer;
let cameraFrontal, cameraLateral, cameraTop, currCamera;
let trailer, robot, headGroup, leftArmGroup, rightArmGroup
let leftFootGroup, rightFootGroup, leftLegGroup, rightLegGroup;;
let aspect;
let clock; // Clock to measure time between frames
const BASE_SPEED = 2; // Base speed in units per second
let isWireframe = false; // Flag to toggle wireframe mode
let isAnimatingTrailer = false;
let trailerAnimationEndPos = new THREE.Vector3();

// Flag to track if the robot is transforming
let isRobotTransforming = false;
let transformationProgress = 0;


// Animation variables
let startArmPosX, endArmPosX;
let startHeadRotX, endHeadRotX;
let startLegRotX, endLegRotX;
let startFootRotX, endFootRotX;

// Track keys being pressed
const keyState = {
    // Trailer movement
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    // Robot controls
    KeyR: false, // Rotate head clockwise
    KeyF: false, // Rotate head anticlockwise
    KeyE: false, // Arms outward
    KeyD: false, // Arms inward
    KeyW: false, // Legs forward
    KeyS: false, // Legs backward
    KeyA: false, // Feet outward
    KeyQ: false, // Feet inward
    KeyC: false, // Close robot
    KeyV: false  // Open robot
};

// Movement speed  
const TRAILER_TRAVEL = -3; // Constant travel distance for the trailer

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    // Create a scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffd1);
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

    // Create perspective camera (original camera)
    camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    camera.position.set(3, 3, 3);
    camera.lookAt(0, 0, 0);
    scene.add(camera);

    // Set default camera
    currCamera = cameraFrontal;
}

function toggleWireframe() {
    isWireframe = !isWireframe; 
    
    
    // Go through all objects in the scene that have materials
    scene.traverse(function(object) {
        if (object.isMesh) {
            // Handle both single materials and material arrays
            if (Array.isArray(object.material)) {
                object.material.forEach(material => {
                    material.wireframe = isWireframe;
                });
            } else if (object.material) {
                object.material.wireframe = isWireframe;
            }
        }
    });
}

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////
function createObjects() {

    createTrailer(); // Create the trailer first

    createRobot(); // Create the robot
    
}

function createTrailer() {
    // Create a trailer group object
    trailer = new THREE.Group();
    trailer.position.set(0, 0.6, TRAILER_TRAVEL); // Set initial position
    
    // Add a trailer with different colors for each face
    const geometry = new THREE.BoxGeometry(0.7, 1, 2.5);
    
    // Create materials array - one for each face
    const materials = [
        new THREE.MeshBasicMaterial({ color: 0x666666 }), // Right face (positive X)
        new THREE.MeshBasicMaterial({ color: 0xAAAAAA }), // Left face (negative X)
        new THREE.MeshBasicMaterial({ color: 0x999999 }), // Top face (positive Y)
        new THREE.MeshBasicMaterial({ color: 0x999999 }), // Bottom face (negative Y)
        new THREE.MeshBasicMaterial({ color: 0xAAAAAA }), // Front face (positive Z)
        new THREE.MeshBasicMaterial({ color: 0xAAAAAA })  // Back face (negative Z)
    ];
    
    const trailerBody = new THREE.Mesh(geometry, materials);
    trailerBody.position.set(0, 0, 0); // Position the trailer
    trailer.add(trailerBody); // Add the trailer body to the group


    // Add four wheels using the helper function
    addWheel(0.25, -0.65, -1, trailer); // Left side rear wheel
    addWheel(0.25, -0.65, -0.65, trailer); // Left side front wheel
    addWheel(-0.25, -0.65, -1, trailer); // Right side rear wheel
    addWheel(-0.25, -0.65, -0.65, trailer); // Right side front wheel

    // Add trailer hitch - a cylinder in the middle bottom of the trailer
    const hitchMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 }); // Dark gray
    const hitchGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.1, 32);
    const hitch = new THREE.Mesh(hitchGeometry, hitchMaterial);
    hitch.position.set(0, -0.55, 0.75); // Center, bottom, back
    hitch.rotation.y = Math.PI / 2; // Rotate to be horizontal
    trailer.add(hitch); // Add the hitch to the trailer

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

    let current_height = 0;

    // Create Waist
    const waistGeometry = new THREE.BoxGeometry(0.4, 0.2, 0.3);
    const waistMaterial = new THREE.MeshBasicMaterial({ color: 0x9f1d1d });
    const waist = new THREE.Mesh(waistGeometry, waistMaterial);
    robot.add(waist);

    // Create Upper Wheels
    addWheel(0.25, -0.05, 0, robot);
    addWheel(-0.25, -0.05, 0, robot);

    // Create Abdomen
    const abdomenGeometry = new THREE.BoxGeometry(0.3, 0.15, 0.3);
    const abdomenMaterial = new THREE.MeshBasicMaterial({ color: 0x273e9b });
    const abdomen = new THREE.Mesh(abdomenGeometry, abdomenMaterial);
    current_height += 0.175;
    abdomen.position.set(0, current_height, 0);
    robot.add(abdomen);
    
    // Create vertical grill on the front of abdomen
    const abdomenGrillGroup = new THREE.Group();
    const grillBarGeometry = new THREE.BoxGeometry(0.02, 0.1, 0.01);
    const grillMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
    
    // Create 4 vertical bars for the grill
    for (let i = 0; i < 4; i++) {
        const grillBar = new THREE.Mesh(grillBarGeometry, grillMaterial);
        grillBar.position.set(-0.075 + i * 0.05, 0, 0);
        abdomenGrillGroup.add(grillBar);
    }
    
    // Position the grill on the front of the abdomen
    abdomenGrillGroup.position.set(0, current_height, 0.16);
    robot.add(abdomenGrillGroup);
    
    // Create Torso
    const torsoGeometry = new THREE.BoxGeometry(0.6, 0.35, 0.45);
    const torsoMaterial = new THREE.MeshBasicMaterial({ color: 0xb40808 });
    const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
    current_height += 0.25;
    torso.position.set(0, current_height, 0);
    robot.add(torso);
    
    // Create windshield on the front of torso - make it two side by side
    const windshieldGeometry = new THREE.PlaneGeometry(0.18, 0.2);
    const windshieldMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x87CEEB, 
        transparent: true, 
        opacity: 0.7 
    });
    
    // Create two windshields side by side
    const leftWindshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial);
    leftWindshield.position.set(-0.12, current_height , 0.23);
    robot.add(leftWindshield);
    
    const rightWindshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial);
    rightWindshield.position.set(0.12, current_height , 0.23);
    robot.add(rightWindshield);
    

    // Create Head Group
    const headRotationCentre = current_height + 0.35/2;
    headGroup = new THREE.Group();
    headGroup.position.set(0, headRotationCentre, 0);

    const headOffset = current_height - headRotationCentre + 0.28;
 
    // Create Head Sphere
    const headGeometry = new THREE.SphereGeometry(0.1, 12, 12);
    const headMaterial = new THREE.MeshBasicMaterial({ color: 0x273e9b });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, headOffset, 0);
    headGroup.add(head);

    // Create Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.015, 12, 12);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.05, headOffset, 0.1);
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.05, headOffset, 0.1);
    headGroup.add(leftEye);
    headGroup.add(rightEye);

    // Create Antennas
    const antennaGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.05, 32);
    const antennaMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const leftAntenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    leftAntenna.position.set(-0.05, headOffset + 0.105, 0);
    const rightAntenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    rightAntenna.position.set(0.05, headOffset + 0.105, 0);
    headGroup.add(leftAntenna);
    headGroup.add(rightAntenna);

    robot.add(headGroup);

    // Create Arms
    leftArmGroup = new THREE.Group();
    rightArmGroup = new THREE.Group();

    const armOffset = current_height - 0.075;

    leftArmGroup.position.set(-0.375, armOffset, -0.3);
    rightArmGroup.position.set(0.375, armOffset, -0.3);

    const armGeometry = new THREE.BoxGeometry(0.15, 0.5, 0.15);
    const armMaterial = new THREE.MeshBasicMaterial({ color: 0x9f1d1d });
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);

    // Create Exhaust Pipes
    const exhaustGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.7, 32);
    const exhaustMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const leftExhaust = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
    const rightExhaust = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
    leftExhaust.position.set(0, 0.1, -0.095);
    rightExhaust.position.set(0, 0.1, -0.095);
    leftArm.add(leftExhaust);
    rightArm.add(rightExhaust);

    rightArmGroup.add(rightArm);
    leftArmGroup.add(leftArm);

    // Create Forearms
    const forearmGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.452);
    const forearmMaterials = [
    new THREE.MeshBasicMaterial({ color: 0x273e9b }), // Right face
    new THREE.MeshBasicMaterial({ color: 0x273e9b }), // Left face
    new THREE.MeshBasicMaterial({ color: 0x273e9b }), // Top face
    new THREE.MeshBasicMaterial({ color: 0x273e9b }), // Bottom face
    new THREE.MeshBasicMaterial({ color: 0xffff00 }), // Front face (yellow)
    new THREE.MeshBasicMaterial({ color: 0x273e9b })  // Back face
    ];
    
    // Create forearms
    const leftForearm = new THREE.Mesh(forearmGeometry, forearmMaterials);
    const rightForearm = new THREE.Mesh(forearmGeometry, forearmMaterials);
    leftForearm.position.set(0, -0.175, 0.30);
    rightForearm.position.set(0, -0.175, 0.30);
    
    // Create black border around yellow face - using edges
    const borderMaterial = new THREE.MeshBasicMaterial({ color: 0x273e9b });
    
    // Helper function to add borders to a forearm
    function addForearmBorders(forearm) {
        // The borderWidth should be small but visible
        const borderWidth = 0.009;
        const faceSize = 0.15;
        const offset = 0.225 + 0.001; // Half depth of forearm + small offset
        
        // Top border
        const topBorder = new THREE.Mesh(
            new THREE.BoxGeometry(faceSize, borderWidth, borderWidth),
            borderMaterial
        );
        topBorder.position.set(0, faceSize/2 - borderWidth/2, offset);
        forearm.add(topBorder);
        
        // Bottom border
        const bottomBorder = new THREE.Mesh(
            new THREE.BoxGeometry(faceSize, borderWidth, borderWidth),
            borderMaterial
        );
        bottomBorder.position.set(0, -faceSize/2 + borderWidth/2, offset);
        forearm.add(bottomBorder);
        
        // Left border
        const leftBorder = new THREE.Mesh(
            new THREE.BoxGeometry(borderWidth, faceSize, borderWidth),
            borderMaterial
        );
        leftBorder.position.set(-faceSize/2 + borderWidth/2, 0, offset);
        forearm.add(leftBorder);
        
        // Right border
        const rightBorder = new THREE.Mesh(
            new THREE.BoxGeometry(borderWidth, faceSize, borderWidth),
            borderMaterial
        );
        rightBorder.position.set(faceSize/2 - borderWidth/2, 0, offset);
        forearm.add(rightBorder);
    }
    
    // Add borders to both forearms
    addForearmBorders(leftForearm);
    addForearmBorders(rightForearm);
    
    leftArmGroup.add(leftForearm);
    rightArmGroup.add(rightForearm);
    
    robot.add(leftArmGroup);
    robot.add(rightArmGroup);

    // Create Thighs
    leftLegGroup = new THREE.Group();
    rightLegGroup = new THREE.Group();


    leftLegGroup.position.set(0, -0.05, 0);
    rightLegGroup.position.set(0, -0.05, 0);

    const thighGeometry = new THREE.BoxGeometry(0.1, 0.3, 0.15);
    const thighMaterial = new THREE.MeshBasicMaterial({ color: 0x273e9b });
    const leftThigh = new THREE.Mesh(thighGeometry, thighMaterial);
    const rightThigh = new THREE.Mesh(thighGeometry, thighMaterial);
    leftThigh.position.set(-0.125, - 0.2, 0);
    rightThigh.position.set(0.125, - 0.2, 0);

    leftLegGroup.add(leftThigh);
    rightLegGroup.add(rightThigh);

    // Create Legs
    const legGeometry = new THREE.BoxGeometry(0.15, 0.9, 0.25);
    const legMaterial = new THREE.MeshBasicMaterial({ color: 0x999999 });
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    const legHeight = -0.55 - 0.15 - 0.1;
    leftLeg.position.set(-0.125, legHeight, 0);
    rightLeg.position.set(0.125, legHeight, 0);
    leftLegGroup.add(leftLeg);
    rightLegGroup.add(rightLeg);

    // Create Leg Wheels
    addWheel(-0.125, 0.05, 0, leftLeg);
    addWheel(-0.125, -0.3, 0, leftLeg);
    addWheel(0.125, 0.05, 0, rightLeg);
    addWheel(0.125, -0.3, 0, rightLeg);
    
    // Create Feet
    rightFootGroup = new THREE.Group();
    leftFootGroup = new THREE.Group();


    leftFootGroup.position.set(0, -0.325, 0);
    rightFootGroup.position.set(0, -0.325, 0);

    const footGeometry = new THREE.BoxGeometry(0.15, 0.25, 0.2);
    const footMaterial = new THREE.MeshBasicMaterial({ color: 0x273e9b });
    const leftFoot = new THREE.Mesh(footGeometry, footMaterial);
    const rightFoot = new THREE.Mesh(footGeometry, footMaterial);
    
    leftFoot.position.set(0, 0, 0.225);
    rightFoot.position.set(0, 0, 0.225);
    leftFootGroup.add(leftFoot);
    rightFootGroup.add(rightFoot);

    leftLeg.add(leftFootGroup);
    rightLeg.add(rightFootGroup);

    robot.add(leftLegGroup);
    robot.add(rightLegGroup);
    
    scene.add(robot);
}

//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions() {
    // Create bounding boxes for collision detection
    const minRobot = new THREE.Vector3(-0.3, -0.2, -1.45);
    const maxRobot = new THREE.Vector3(0.3, 0.8, 0.225);

    // Fix the trailer bounding box to properly surround the entire trailer group
    const minTrailer = new THREE.Vector3(-0.35, -0.8, -1.25);
    const maxTrailer = new THREE.Vector3(0.35, 0.5, 1.25);

    // Get current positions for both objects
    const currentRobotCenter = new THREE.Vector3(robot.position.x, robot.position.y, robot.position.z);
    const currentTrailerCenter = new THREE.Vector3(trailer.position.x, trailer.position.y, trailer.position.z);

    // Calculate absolute positions
    const currentMinRobot = currentRobotCenter.clone().add(minRobot);
    const currentMaxRobot = currentRobotCenter.clone().add(maxRobot);
    const currentMinTrailer = currentTrailerCenter.clone().add(minTrailer);
    const currentMaxTrailer = currentTrailerCenter.clone().add(maxTrailer);

   
    // Manual AABB collision detection
    return (
        currentMinRobot.x <= currentMaxTrailer.x &&
        currentMaxRobot.x >= currentMinTrailer.x &&
        currentMinRobot.y <= currentMaxTrailer.y &&
        currentMaxRobot.y >= currentMinTrailer.y &&
        currentMinRobot.z <= currentMaxTrailer.z &&
        currentMaxRobot.z >= currentMinTrailer.z
    );
}


// Function to check if the the robot is in truck form
function checkClosed () {
    return (leftArmGroup.position.x > -0.226 && headGroup.rotation.x == -Math.PI &&
            leftLegGroup.rotation.x == Math.PI/2 && leftFootGroup.rotation.x == Math.PI/2);
    
}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions() {
    // If there's a collision, handle it with proper contact
    if (checkCollisions()) {
        if (checkClosed() && !isAnimatingTrailer) {
            // Start animating to hitch position
            isAnimatingTrailer = true;
            
            // Set target position (hitch position)
            trailerAnimationEndPos.set(0, 0.6, -1.70);
        }
    }
}

////////////
/* UPDATE */
////////////
// Update the update() function to handle the animation
function update() {
    // Get the time delta
    const deltaTime = clock.getDelta();
    
    // Calculate frame speed based on delta time
    const frameSpeed = BASE_SPEED * deltaTime;
    const rotationSpeed = 0.15;

    // Handle robot transformation if active
    if (isRobotTransforming) {
        // Increment progress based on delta time and speed
        transformationProgress += deltaTime * BASE_SPEED;
    
        // Clamp progress to [0, 1]
        if (transformationProgress >= 1.0) {
            transformationProgress = 1.0;
            isRobotTransforming = false;
        }
    
        // Interpolate between start and end values
        const t = transformationProgress;
    
        // Animate arms
        leftArmGroup.position.x = startArmPosX + t * (endArmPosX - startArmPosX);
        rightArmGroup.position.x = -leftArmGroup.position.x;
    
        // Animate head
        headGroup.rotation.x = startHeadRotX + t * (endHeadRotX - startHeadRotX);
    
        // Animate legs
        leftLegGroup.rotation.x = startLegRotX + t * (endLegRotX - startLegRotX);
        rightLegGroup.rotation.x = leftLegGroup.rotation.x;
    
        // Animate feet
        leftFootGroup.rotation.x = startFootRotX + t * (endFootRotX - startFootRotX);
        rightFootGroup.rotation.x = leftFootGroup.rotation.x;
    } else {
        // Process robot controls when not in transformation
        // Head rotation
        if (keyState.KeyR && headGroup.rotation.x > -Math.PI) {
            headGroup.rotation.x = Math.max(headGroup.rotation.x - (rotationSpeed * deltaTime * 10), -Math.PI);
        }
        if (keyState.KeyF && headGroup.rotation.x < 0) {
            headGroup.rotation.x = Math.min(headGroup.rotation.x + (rotationSpeed * deltaTime * 10), 0);
        }
        
        // Arms movement 
        const armIncrement = frameSpeed / 5;
        if (keyState.KeyE) { // Arms outward (move towards -0.375 for left arm)
            if (leftArmGroup.position.x > -0.375) {
                leftArmGroup.position.x = Math.max(-0.375, leftArmGroup.position.x - armIncrement); // using max to ensure it doesn't go beyond -0.375
                rightArmGroup.position.x = -leftArmGroup.position.x; 
            }
        }
        if (keyState.KeyD) { // Arms inward (move towards -0.225 for left arm)
            if (leftArmGroup.position.x < -0.225) {
                leftArmGroup.position.x = Math.min(-0.225, leftArmGroup.position.x + armIncrement); // using min to ensure it doesn't go beyond -0.225
                rightArmGroup.position.x = -leftArmGroup.position.x;
            }
        }

        // Legs rotation
        if (keyState.KeyW && leftLegGroup.rotation.x < Math.PI/2) {
            leftLegGroup.rotation.x = Math.min(leftLegGroup.rotation.x + (rotationSpeed * deltaTime * 10), Math.PI/2);
            rightLegGroup.rotation.x = leftLegGroup.rotation.x;
        }
        if (keyState.KeyS && leftLegGroup.rotation.x > 0) {
            leftLegGroup.rotation.x = Math.max(leftLegGroup.rotation.x - (rotationSpeed * deltaTime * 10), 0);
            rightLegGroup.rotation.x = leftLegGroup.rotation.x;
        }
        
        // Feet rotation
        if (keyState.KeyA && leftFootGroup.rotation.x < Math.PI/2) {
            leftFootGroup.rotation.x = Math.min(leftFootGroup.rotation.x + (rotationSpeed * deltaTime * 10), Math.PI/2);
            rightFootGroup.rotation.x = leftFootGroup.rotation.x;
        }
        if (keyState.KeyQ && leftFootGroup.rotation.x > 0) {
            leftFootGroup.rotation.x = Math.max(leftFootGroup.rotation.x - (rotationSpeed * deltaTime * 10), 0);
            rightFootGroup.rotation.x = leftFootGroup.rotation.x;
        }
        
        // Full transformations
        if (keyState.KeyC && !isRobotTransforming) {
            // Close robot transformation
            isRobotTransforming = true;
            startArmPosX = leftArmGroup.position.x;
            startHeadRotX = headGroup.rotation.x;
            startLegRotX = leftLegGroup.rotation.x;
            startFootRotX = leftFootGroup.rotation.x;
            endArmPosX = -0.225;
            endHeadRotX = -Math.PI;
            endLegRotX = Math.PI/2;
            endFootRotX = Math.PI/2;
            transformationProgress = 0;
            keyState.KeyC = false; // Reset to prevent repeats
        }
        if (keyState.KeyV && !isRobotTransforming) {
            // Open robot transformation
            isRobotTransforming = true;
            startArmPosX = leftArmGroup.position.x;
            startHeadRotX = headGroup.rotation.x;
            startLegRotX = leftLegGroup.rotation.x;
            startFootRotX = leftFootGroup.rotation.x;
            endArmPosX = -0.375;
            endHeadRotX = 0;
            endLegRotX = 0;
            endFootRotX = 0;
            transformationProgress = 0;
            keyState.KeyV = false; // Reset to prevent repeats
        }
    }
    
    // Handle trailer animation if active
    if (isAnimatingTrailer) {
        // Calculate the distance to move based on frame speed
        const dx = trailerAnimationEndPos.x - trailer.position.x;
        const dy = trailerAnimationEndPos.y - trailer.position.y;
        const dz = trailerAnimationEndPos.z - trailer.position.z;
        
        // Calculate the distance remaining to the target position
        const distanceRemaining = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        // If the distance remaining is less than the frame speed, snap to the target position
        if (distanceRemaining < frameSpeed) {
            // Animation complete, snap to target position
            trailer.position.x = trailerAnimationEndPos.x;
            trailer.position.y = trailerAnimationEndPos.y;
            trailer.position.z = trailerAnimationEndPos.z;
            isAnimatingTrailer = false;
        } else {
            // Normalize the direction vector
            const length = Math.sqrt(dx*dx + dy*dy + dz*dz);
            const ndx = dx / length;
            const ndy = dy / length;
            const ndz = dz / length;
            
            // Move the trailer in the direction of the target position
            trailer.position.x += ndx * frameSpeed;
            trailer.position.y += ndy * frameSpeed;
            trailer.position.z += ndz * frameSpeed;
        }
    } else {
        // Only allow movement if not animating
        // Move trailer based on which arrow keys are pressed, with speed based on frame speed
        if (keyState.ArrowUp) {
            trailer.position.z -= frameSpeed;
        }
        if (keyState.ArrowDown) {
            trailer.position.z += frameSpeed;
        }
        if (keyState.ArrowLeft) {
            trailer.position.x -= frameSpeed;
        }
        if (keyState.ArrowRight) {
            trailer.position.x += frameSpeed;
        }
    }
    
    handleCollisions(); // Check for collisions after movement
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

    // Initialize clock
    clock = new THREE.Clock();
    clock.start();

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
        case "Digit4": // '4' - Perspective camera
            currCamera = camera;
            break;
        case "Digit7": // '7' - Toggle wireframe mode
            toggleWireframe();
            break;
        default:
            // Set key state for any key that's in our keyState object
            if (keyState.hasOwnProperty(e.code)) {
                keyState[e.code] = true;
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