import * as THREE from 'three';

let camera, scene, renderer;
let cameraFrontal, cameraLateral, cameraTop;
let currCamera;
let cube, wireframe;
let aspect;

function init() {
    // Create a scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcccccc);

    // Calculate aspect ratio
    aspect = window.innerWidth / window.innerHeight;

    // Create cameras
    createCameras();

    // Create a renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Add a cube with different colors for each face
    const geometry = new THREE.BoxGeometry();
    
    // Create materials array - one for each face
    const materials = [
        new THREE.MeshBasicMaterial({ color: 0xff0000 }), // Right face (positive X)
        new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // Left face (negative X)
        new THREE.MeshBasicMaterial({ color: 0x0000ff }), // Top face (positive Y)
        new THREE.MeshBasicMaterial({ color: 0xffff00 }), // Bottom face (negative Y)
        new THREE.MeshBasicMaterial({ color: 0xff00ff }), // Front face (positive Z)
        new THREE.MeshBasicMaterial({ color: 0x00ffff })  // Back face (negative Z)
    ];
    
    cube = new THREE.Mesh(geometry, materials);
    scene.add(cube);

    // Add wireframe to highlight edges and corners
    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
    wireframe = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    cube.add(wireframe);

    // Set default camera
    currCamera = cameraFrontal;

    // Add event listeners
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);

    // Start the animation loop
    animate();
}

function createCameras() {
    const size = 2;
    const width = size * aspect;
    const height = size;
    
    // Create orthographic cameras with proper aspect ratio
    cameraFrontal = new THREE.OrthographicCamera(-width/2, width/2, height/2, -height/2, 0.1, 10);
    cameraLateral = new THREE.OrthographicCamera(-width/2, width/2, height/2, -height/2, 0.1, 10);
    cameraTop = new THREE.OrthographicCamera(-width/2, width/2, height/2, -height/2, 0.1, 10);
    
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

    // Add cameras to the scene for reference
    scene.add(cameraFrontal);
    scene.add(cameraLateral);
    scene.add(cameraTop);
    scene.add(camera);
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
        case 52: // '4' - Original perspective camera
            currCamera = camera;
            break;
    }
}

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
        
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    // Render with the current camera
    renderer.render(scene, currCamera);
}

init();