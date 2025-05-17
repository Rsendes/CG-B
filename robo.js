import * as THREE from 'three';

let camera, scene, renderer;

function init() {
    // Create a scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Create a camera
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 3
    camera.position.x = 3
    camera.position.y = 3
    camera.lookAt(0, 0, 0);

    // Create a renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Add a simple cube to the scene
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Add wireframe to highlight edges and corners
    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 5 });
    const wireframe = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    cube.add(wireframe);

    // Start the animation loop
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

init();
