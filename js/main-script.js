import * as THREE from 'three';

let scene, renderer;
let camera, cameraFrontal, cameraLateral, cameraTop;
let currCamera;
let isRobotMode = true;

// Robot parts
let robotGroup, headGroup, torsoGroup, armsGroup, legsGroup;
let head, eyes, antennas, torso, abdomen, waist;
let leftArm, rightArm, leftForearm, rightForearm, exhaust1, exhaust2;
let leftThigh, rightThigh, leftLeg, rightLeg, leftFoot, rightFoot;
let wheels = [];

function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);
    
    // Create cameras
    createCameras();
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    // Create robot
    createRobot();
    
    // Set default camera
    currCamera = camera;
    
    // Add event listeners
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    
    // Start animation loop
    animate();
}

function createCameras() {
    const aspect = window.innerWidth / window.innerHeight;
    
    // Perspective camera
    camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    camera.position.set(0, 5, 15);
    camera.lookAt(0, 0, 0);
    
    // Orthographic cameras
    const size = 10;
    const width = size * aspect;
    const height = size;
    
    cameraFrontal = new THREE.OrthographicCamera(-width/2, width/2, height/2, -height/2, 0.1, 100);
    cameraFrontal.position.set(0, 0, 15);
    cameraFrontal.lookAt(0, 0, 0);
    
    cameraLateral = new THREE.OrthographicCamera(-width/2, width/2, height/2, -height/2, 0.1, 100);
    cameraLateral.position.set(15, 0, 0);
    cameraLateral.lookAt(0, 0, 0);
    
    cameraTop = new THREE.OrthographicCamera(-width/2, width/2, height/2, -height/2, 0.1, 100);
    cameraTop.position.set(0, 15, 0);
    cameraTop.lookAt(0, 0, 0);
}

function createRobot() {
    // Create main group
    robotGroup = new THREE.Group();
    scene.add(robotGroup);
    
    // Create materials with different colors
    const headMaterial = new THREE.MeshBasicMaterial({ color: 0x3366CC });
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
    const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0x2244AA });
    const limbMaterial = new THREE.MeshBasicMaterial({ color: 0x1133AA });
    const wheelMaterial = new THREE.MeshBasicMaterial({ color: 0x222222 });
    const detailMaterial = new THREE.MeshBasicMaterial({ color: 0xDDDDDD });
    
    // Head Group
    headGroup = new THREE.Group();
    headGroup.position.y = 6;
    
    // Head (cube)
    head = new THREE.Mesh(
        new THREE.BoxGeometry(2, 1.5, 1.5),
        headMaterial
    );
    headGroup.add(head);
    
    // Eyes (small cubes)
    const leftEye = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.3, 0.1),
        eyeMaterial
    );
    leftEye.position.set(-0.5, 0.2, 0.8);
    headGroup.add(leftEye);
    
    const rightEye = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.3, 0.1),
        eyeMaterial
    );
    rightEye.position.set(0.5, 0.2, 0.8);
    headGroup.add(rightEye);
    
    // Antennas (cones)
    const leftAntenna = new THREE.Mesh(
        new THREE.ConeGeometry(0.2, 0.8, 8),
        detailMaterial
    );
    leftAntenna.position.set(-0.7, 0.8, 0);
    headGroup.add(leftAntenna);
    
    const rightAntenna = new THREE.Mesh(
        new THREE.ConeGeometry(0.2, 0.8, 8),
        detailMaterial
    );
    rightAntenna.position.set(0.7, 0.8, 0);
    headGroup.add(rightAntenna);
    
    // Torso Group
    torsoGroup = new THREE.Group();
    torsoGroup.position.y = 3.5;
    
    // Torso (cube)
    torso = new THREE.Mesh(
        new THREE.BoxGeometry(3, 2, 1.5),
        bodyMaterial
    );
    torsoGroup.add(torso);
    
    // Abdomen (cube)
    abdomen = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 1, 1.3),
        bodyMaterial
    );
    abdomen.position.y = -1.5;
    torsoGroup.add(abdomen);
    
    // Waist (cube)
    waist = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.5, 1),
        bodyMaterial
    );
    waist.position.y = -2.25;
    torsoGroup.add(waist);
    
    // Arms Group
    armsGroup = new THREE.Group();
    armsGroup.position.y = 4.5;
    
    // Left Arm (cylinder)
    leftArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 1.5, 8),
        limbMaterial
    );
    leftArm.position.set(-2, 0, 0);
    leftArm.rotation.z = Math.PI / 2;
    armsGroup.add(leftArm);
    
    // Left Forearm (cylinder)
    leftForearm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 1.8, 8),
        limbMaterial
    );
    leftForearm.position.set(-3.15, 0, 0);
    leftForearm.rotation.z = Math.PI / 2;
    armsGroup.add(leftForearm);
    
    // Right Arm (cylinder)
    rightArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 1.5, 8),
        limbMaterial
    );
    rightArm.position.set(2, 0, 0);
    rightArm.rotation.z = Math.PI / 2;
    armsGroup.add(rightArm);
    
    // Right Forearm (cylinder)
    rightForearm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 1.8, 8),
        limbMaterial
    );
    rightForearm.position.set(3.15, 0, 0);
    rightForearm.rotation.z = Math.PI / 2;
    armsGroup.add(rightForearm);
    
    // Exhaust pipes (small cylinders)
    exhaust1 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.5, 8),
        detailMaterial
    );
    exhaust1.position.set(-3.15, 0, 0.4);
    armsGroup.add(exhaust1);
    
    exhaust2 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.5, 8),
        detailMaterial
    );
    exhaust2.position.set(3.15, 0, 0.4);
    armsGroup.add(exhaust2);
    
    // Legs Group
    legsGroup = new THREE.Group();
    legsGroup.position.y = 0.7;
    
    // Left Thigh (cylinder)
    leftThigh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 1.5, 8),
        limbMaterial
    );
    leftThigh.position.set(-1, 0, 0);
    legsGroup.add(leftThigh);
    
    // Left Leg (cylinder)
    leftLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.45, 1.5, 8),
        limbMaterial
    );
    leftLeg.position.set(-1, -1.5, 0);
    legsGroup.add(leftLeg);
    
    // Left Foot (box)
    leftFoot = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.4, 1.3),
        limbMaterial
    );
    leftFoot.position.set(-1, -2.5, 0.2);
    legsGroup.add(leftFoot);
    
    // Right Thigh (cylinder)
    rightThigh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 1.5, 8),
        limbMaterial
    );
    rightThigh.position.set(1, 0, 0);
    legsGroup.add(rightThigh);
    
    // Right Leg (cylinder)
    rightLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.45, 1.5, 8),
        limbMaterial
    );
    rightLeg.position.set(1, -1.5, 0);
    legsGroup.add(rightLeg);
    
    // Right Foot (box)
    rightFoot = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.4, 1.3),
        limbMaterial
    );
    rightFoot.position.set(1, -2.5, 0.2);
    legsGroup.add(rightFoot);
    
    // Wheels (6 cylinders)
    for (let i = 0; i < 6; i++) {
        const wheel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.6, 0.6, 0.3, 16),
            wheelMaterial
        );
        
        // Position wheels in a truck configuration (hidden in robot mode)
        if (i < 3) { // Left side
            wheel.position.set(-1.5, -3, -1 + i);
        } else { // Right side
            wheel.position.set(1.5, -3, -4 + i);
        }
        
        wheel.rotation.z = Math.PI / 2;
        wheels.push(wheel);
        robotGroup.add(wheel);
    }
    
    // Add all groups to robot
    robotGroup.add(headGroup);
    robotGroup.add(torsoGroup);
    robotGroup.add(armsGroup);
    robotGroup.add(legsGroup);
    
    // Initially hide wheels in robot mode
    wheels.forEach(wheel => {
        wheel.visible = false;
    });
}

// Transform between robot and truck
function transformRobot() {
    if (isRobotMode) {
        // Transform to truck mode
        
        // Lower the robot
        robotGroup.position.y = -1;
        
        // Rotate head to become truck cab
        headGroup.rotation.x = Math.PI / 2;
        headGroup.position.set(0, 2, 3);
        
        // Flatten torso and position for truck body
        torsoGroup.rotation.x = Math.PI / 2;
        torsoGroup.position.set(0, 2, 0);
        
        // Position arms along sides
        armsGroup.position.set(0, 2, 0);
        leftArm.rotation.x = Math.PI / 2;
        rightArm.rotation.x = Math.PI / 2;
        leftForearm.rotation.x = Math.PI / 2;
        rightForearm.rotation.x = Math.PI / 2;
        
        // Position legs to back of truck
        legsGroup.rotation.x = Math.PI / 2;
        legsGroup.position.set(0, 2, -3);
        
        // Show wheels
        wheels.forEach(wheel => {
            wheel.visible = true;
        });
        
    } else {
        // Transform to robot mode
        
        // Raise the robot
        robotGroup.position.y = 0;
        
        // Reset head position
        headGroup.rotation.x = 0;
        headGroup.position.set(0, 6, 0);
        
        // Reset torso position
        torsoGroup.rotation.x = 0;
        torsoGroup.position.set(0, 3.5, 0);
        
        // Reset arms position
        armsGroup.position.set(0, 4.5, 0);
        leftArm.rotation.x = 0;
        rightArm.rotation.x = 0;
        leftForearm.rotation.x = 0;
        rightForearm.rotation.x = 0;
        
        // Reset legs position
        legsGroup.rotation.x = 0;
        legsGroup.position.set(0, 0.7, 0);
        
        // Hide wheels
        wheels.forEach(wheel => {
            wheel.visible = false;
        });
    }
    
    isRobotMode = !isRobotMode;
}

function onKeyDown(e) {
    switch (e.keyCode) {
        case 49: // '1' - Frontal camera
            currCamera = cameraFrontal;
            break;
        case 50: // '2' - Lateral camera
            currCamera = cameraLateral;
            break;
        case 51: // '3' - Top camera
            currCamera = cameraTop;
            break;
        case 52: // '4' - Perspective camera
            currCamera = camera;
            break;
        case 84: // 'T' - Transform
            transformRobot();
            break;
    }
    
    // Update the active class for the keys in the HUD
    document.querySelectorAll('.key').forEach(key => key.classList.remove('active'));
    
    if (e.keyCode >= 49 && e.keyCode <= 52) {
        document.getElementById(`key${e.keyCode - 48}`).classList.add('active');
    }
}

function onResize() {
    const aspect = window.innerWidth / window.innerHeight;
    
    // Update renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Update perspective camera
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    
    // Update orthographic cameras
    const size = 10;
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
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, currCamera);
}

init();