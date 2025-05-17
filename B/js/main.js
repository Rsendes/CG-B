import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import * as Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

// Three fixed cameras with orthogonal projection
var cameraFrontal, cameraLateral, cameraTop;

// Two fixed cameras capturing all elements
var cameraFixedOrthogonal, cameraFixedPerspective;

// Mobil camera
var cameraMobilePerspective;

// Current Camera;
var currCamera;

// Base
var baseGeometry, baseMaterial, base;

// Tower
var towerGeometry, towerMaterial, tower;

// Turntable
var turntableGeometry, turntableMaterial, turntable;

// Cabin
var cabinGeometry, cabinMaterial, cabin;

// Jib (counter is included here)
var jibGeometry, jibMaterial, jib;

// Counterweight
var counter_weightGeometry, counter_weightMaterial, counter_weight;

// Apex
var apexGeometry, apexMaterial, apex;

// (Fore and Back) Pendant
var pendantF_Geometry,
  pendantB_Geometry,
  pendantF_Material,
  pendantB_Material,
  pendantF,
  pendantB;

// Trolley
var trolleyGeometry, trolleyMaterial, trolley;

// Cable
var cableGeometry, cableMaterial, cable;

// Block
var blockGeometry, blockMaterial, block;

// Fingers (1 to 4)
var finger1Geometry,
  finger2Geometry,
  finger3Geometry,
  finger4Geometry,
  fingerMaterial,
  finger1,
  finger2,
  finger3,
  finger4;

var fingerGroup1 = new THREE.Group();
var fingerGroup2 = new THREE.Group();
var fingerGroup3 = new THREE.Group();
var fingerGroup4 = new THREE.Group();

var containerGroup = new THREE.Group();

var upperGroup = new THREE.Group();
var trolleyGroup = new THREE.Group();
var hookGroup = new THREE.Group();

// Loads and container
var loads = [];
var boundingBoxes = [];
var container = new THREE.Object3D();

var scene, renderer;

function createScene() {
  "use strict";

  scene = new THREE.Scene();

  // Set the scene background color to a light color
  scene.background = new THREE.Color(0xebecf0);
  scene.add(new THREE.AxesHelper(10));

  createCrane();
  createContainer();
  createLoads();
}

function createCameras() {
  "use strict";

  // Create cameras
  cameraFrontal = new THREE.OrthographicCamera(-100, 100, 100, -100, 1, 1000);
  cameraLateral = new THREE.OrthographicCamera(-100, 100, 100, -100, 1, 1000);
  cameraTop = new THREE.OrthographicCamera(-100, 100, 100, -100, 1, 1000);
  cameraFixedOrthogonal = new THREE.OrthographicCamera(
    -100,
    100,
    100,
    -100,
    1,
    1000
  );
  cameraFixedPerspective = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );

  cameraMobilePerspective = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );

  // Set camera positions and orientations
  cameraFrontal.position.set(0, 50, 80);
  cameraFrontal.lookAt(new THREE.Vector3(0, 50, 0));

  cameraLateral.position.set(80, 50, 0);
  cameraLateral.lookAt(new THREE.Vector3(0, 50, 0));

  cameraTop.position.set(0, 170, 0);
  cameraTop.lookAt(scene.position);

  cameraFixedOrthogonal.position.set(170, 170, 170);
  cameraFixedOrthogonal.lookAt(new THREE.Vector3(0, 50, 0));

  cameraFixedPerspective.position.copy(cameraFixedOrthogonal.position);
  cameraFixedPerspective.lookAt(scene.position);

  // Mobile perspective camera positioning
  cameraMobilePerspective.position.set(
    block.position.x - 1 * 3,
    block.position.y - 0.5 * 3,
    block.position.z - 1 * 3
  );
  cameraMobilePerspective.rotateX(0);
  cameraMobilePerspective.lookAt(new THREE.Vector3(0, -1000, 0));

  // Set camera names for easy reference
  cameraFrontal.name = "FrontalCamera";
  cameraLateral.name = "LateralCamera";
  cameraTop.name = "TopCamera";
  cameraFixedOrthogonal.name = "FixedOrthogonalCamera";
  cameraFixedPerspective.name = "FixedPerspectiveCamera";
  cameraMobilePerspective.name = "MobilePerspectiveCamera";
  // Add cameras to the scene
  scene.add(cameraFrontal);
  scene.add(cameraLateral);
  scene.add(cameraTop);
  scene.add(cameraFixedOrthogonal);
  scene.add(cameraFixedPerspective);
  scene.add(cameraMobilePerspective);
}

function createCrane(x, y, z) {
  ("use strict");

  // Scaling factor to make the crane bigger
  const scaleFactor = 3;

  // Create materials
  baseMaterial = new THREE.MeshBasicMaterial({ color: "Black" });
  towerMaterial = new THREE.MeshBasicMaterial({ color: "Orange" });
  turntableMaterial = new THREE.MeshBasicMaterial({ color: "Red" });
  cabinMaterial = new THREE.MeshBasicMaterial({ color: "Yellow" });
  jibMaterial = new THREE.MeshBasicMaterial({ color: "Orange" });
  counter_weightMaterial = new THREE.MeshBasicMaterial({ color: "Gray" });
  apexMaterial = new THREE.MeshBasicMaterial({ color: "Blue" });
  pendantF_Material = new THREE.MeshBasicMaterial({ color: "Green" });
  pendantB_Material = new THREE.MeshBasicMaterial({ color: "Green" });
  trolleyMaterial = new THREE.MeshBasicMaterial({ color: "Pink" });
  cableMaterial = new THREE.MeshBasicMaterial({ color: "Gray" });
  blockMaterial = new THREE.MeshBasicMaterial({ color: "Blue" });
  fingerMaterial = new THREE.MeshBasicMaterial({ color: "Black" });

  // Create geometries and meshes
  baseGeometry = new THREE.BoxGeometry(
    8 * scaleFactor,
    2 * scaleFactor,
    8 * scaleFactor
  );
  base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.position.set(4 * scaleFactor, 1 * scaleFactor, 4 * scaleFactor);
  scene.add(base);

  towerGeometry = new THREE.BoxGeometry(
    2 * scaleFactor,
    16 * scaleFactor,
    2 * scaleFactor
  );
  tower = new THREE.Mesh(towerGeometry, towerMaterial);
  tower.position.set(4 * scaleFactor, 8 * scaleFactor, 4 * scaleFactor);
  scene.add(tower);

  jibGeometry = new THREE.BoxGeometry(
    22 * scaleFactor,
    1 * scaleFactor,
    2 * scaleFactor
  );
  jib = new THREE.Mesh(jibGeometry, jibMaterial);
  jib.position.set(8 * scaleFactor, 16.5 * scaleFactor, 4 * scaleFactor);
  scene.add(jib);

  turntableGeometry = new THREE.BoxGeometry(
    2 * scaleFactor,
    1 * scaleFactor,
    2 * scaleFactor
  );
  turntable = new THREE.Mesh(turntableGeometry, turntableMaterial);
  turntable.position.set(4 * scaleFactor, 16.5 * scaleFactor, 4 * scaleFactor);
  scene.add(turntable);

  cabinGeometry = new THREE.BoxGeometry(
    2 * scaleFactor,
    2 * scaleFactor,
    3 * scaleFactor
  );
  cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
  cabin.position.set(6 * scaleFactor, 15 * scaleFactor, 4 * scaleFactor);
  scene.add(cabin);

  counter_weightGeometry = new THREE.BoxGeometry(
    3 * scaleFactor,
    2 * scaleFactor,
    2 * scaleFactor
  );
  counter_weight = new THREE.Mesh(
    counter_weightGeometry,
    counter_weightMaterial
  );
  counter_weight.position.set(
    -1.5 * scaleFactor,
    15 * scaleFactor,
    4 * scaleFactor
  );
  scene.add(counter_weight);

  apexGeometry = new THREE.ConeGeometry(1 * scaleFactor, 6 * scaleFactor, 10);
  apex = new THREE.Mesh(apexGeometry, apexMaterial);
  apex.position.set(4 * scaleFactor, 17.5 * scaleFactor, 4 * scaleFactor);
  scene.add(apex);

  pendantB_Geometry = new THREE.CylinderGeometry(
    0.1 * scaleFactor,
    0.1 * scaleFactor,
    6.3 * scaleFactor,
    10
  );
  pendantB = new THREE.Mesh(pendantB_Geometry, pendantB_Material);
  pendantB.position.set(1.4 * scaleFactor, 18.7 * scaleFactor, 4 * scaleFactor);
  pendantB.rotation.set(0, 0, -1);
  scene.add(pendantB);

  pendantF_Geometry = new THREE.CylinderGeometry(
    0.1 * scaleFactor,
    0.1 * scaleFactor,
    12 * scaleFactor,
    10
  );
  pendantF = new THREE.Mesh(pendantF_Geometry, pendantF_Material);
  pendantF.position.set(9.6 * scaleFactor, 18.4 * scaleFactor, 4 * scaleFactor);
  pendantF.rotation.set(0, 0, 1.23);
  scene.add(pendantF);

  trolleyGeometry = new THREE.BoxGeometry(
    2 * scaleFactor,
    1 * scaleFactor,
    2 * scaleFactor
  );
  trolley = new THREE.Mesh(trolleyGeometry, trolleyMaterial);
  trolley.position.set(13 * scaleFactor, 15.5 * scaleFactor, 4 * scaleFactor);
  scene.add(trolley);

  cableGeometry = new THREE.CylinderGeometry(
    0.1 * scaleFactor,
    0.1 * scaleFactor,
    7.0 * scaleFactor,
    10
  );
  cable = new THREE.Mesh(cableGeometry, cableMaterial);
  cable.position.set(13 * scaleFactor, 12 * scaleFactor, 4 * scaleFactor);
  scene.add(cable);

  blockGeometry = new THREE.BoxGeometry(
    2 * scaleFactor,
    1 * scaleFactor,
    2 * scaleFactor
  );
  block = new THREE.Mesh(blockGeometry, blockMaterial);
  block.position.set(13 * scaleFactor, 8 * scaleFactor, 4 * scaleFactor);
  scene.add(block);

  finger1Geometry = new THREE.ConeGeometry(0.5, 8, 10);
  finger1 = new THREE.Mesh(finger1Geometry, fingerMaterial);
  finger1.position.set(12 * scaleFactor, 7 * scaleFactor, 4 * scaleFactor);
  finger1.rotation.set(0, 0, Math.PI);
  scene.add(finger1);

  finger2Geometry = new THREE.ConeGeometry(0.5, 8, 10);
  finger2 = new THREE.Mesh(finger2Geometry, fingerMaterial);
  finger2.position.set(14 * scaleFactor, 7 * scaleFactor, 4 * scaleFactor);
  finger2.rotation.set(0, 0, Math.PI);
  scene.add(finger2);

  finger3Geometry = new THREE.ConeGeometry(0.5, 8, 10);
  finger3 = new THREE.Mesh(finger3Geometry, fingerMaterial);
  finger3.position.set(13 * scaleFactor, 7 * scaleFactor, 5 * scaleFactor);
  finger3.rotation.set(0, 0, Math.PI);
  scene.add(finger3);

  finger4Geometry = new THREE.ConeGeometry(0.5, 8, 10);
  finger4 = new THREE.Mesh(finger4Geometry, fingerMaterial);
  finger4.position.set(13 * scaleFactor, 7 * scaleFactor, 3 * scaleFactor);
  finger4.rotation.set(0, 0, Math.PI);
  scene.add(finger4);

  fingerGroup1.add(finger1);

  fingerGroup2.add(finger2);
  fingerGroup3.add(finger3);
  fingerGroup4.add(finger4);

  scene.add(fingerGroup1);

  hookGroup.add(block);
  hookGroup.add(finger1);
  hookGroup.add(finger2);
  hookGroup.add(finger3);
  hookGroup.add(finger4);
  hookGroup.add(fingerGroup1);
  hookGroup.add(fingerGroup2);
  hookGroup.add(fingerGroup3);
  hookGroup.add(fingerGroup4);

  trolleyGroup.add(hookGroup);
  trolleyGroup.add(cable);
  trolleyGroup.add(trolley);

  upperGroup = new THREE.Group();
  upperGroup.add(trolleyGroup);
  upperGroup.add(cabin);
  upperGroup.add(jib);
  upperGroup.add(counter_weight);
  upperGroup.add(apex);
  upperGroup.add(pendantF);
  upperGroup.add(pendantB);

  upperGroup.position.set(
    -4 * scaleFactor,
    -15.5 * scaleFactor,
    -4 * scaleFactor
  ); // Adjust the offsets as needed

  turntable.add(upperGroup);
  // scene.add(turntable); // Add turntable to the scene
}

function createLoads() {
  const loadColors = [0x6699ff, 0xff9933, 0x99cc00, 0xff66cc, 0x9966ff]; // Colors for loads
  const numLoads = 5; // Number of loads

  const loadGeometryTypes = [
    "BoxGeometry",
    "DodecahedronGeometry",
    "IcosahedronGeometry",
    "TorusGeometry",
    "TorusKnotGeometry",
  ];

  const craneCenter = new THREE.Vector3(15, 3, 15); // Center of the crane base
  const craneRadius = 50; // Radius of crane's hook movement
  const minDistance = 20; // Minimum distance from base
  const maxDistance = craneRadius - minDistance; // Maximum distance from center
  const baseSize = new THREE.Vector3(8 * 3, 2 * 3, 8 * 3); // Size of the crane base

  for (let i = 0; i < numLoads; i++) {
    const loadColor = loadColors[i % loadColors.length];
    const loadGeometryType =
      loadGeometryTypes[Math.floor(Math.random() * loadGeometryTypes.length)];
    const loadSize = Math.random() + 2; // Limit load size to be between 2.5 and 7.5
    const loadGeometry = new THREE[loadGeometryType](loadSize);
    const loadMaterial = new THREE.MeshBasicMaterial({
      color: loadColor,
    });
    const loadMesh = new THREE.Mesh(loadGeometry, loadMaterial);

    // Randomly generate a position within the circular area around the crane's hook
    let validPosition = false;
    while (!validPosition) {
      const angle = Math.random() * Math.PI * 2; // Random angle in radians
      const distance =
        minDistance + Math.random() * (maxDistance - minDistance); // Random distance from center
      const position = new THREE.Vector3(
        Math.cos(angle) * distance,
        0,
        Math.sin(angle) * distance
      );

      // Check if load position is within crane radius and away from the base
      if (
        position.length() <= craneRadius &&
        position.distanceTo(craneCenter) > baseSize.x / 2
      ) {
        loadMesh.position.copy(position);
        validPosition = true;
      }
    }

    // Add load to scene
    scene.add(loadMesh);
  }
}

function createContainer() {
  var color = new THREE.MeshBasicMaterial({ color: "Red" });

  // Planes
  const planeGeometries = [
    {
      geometry: new THREE.PlaneGeometry(15, 30),
      rotation: { x: -Math.PI / 2, y: 0, z: 0 },
      position: { x: 20, y: -5, z: 0 },
    },
    {
      geometry: new THREE.PlaneGeometry(15, 10),
      rotation: { x: 0, y: 0, z: 0 },
      position: { x: 20, y: 0, z: 15 },
    },
    {
      geometry: new THREE.PlaneGeometry(30, 10),
      rotation: { x: 0, y: Math.PI / 2, z: 0 },
      position: { x: -7.5 + 20, y: 0, z: 0 },
    },
    {
      geometry: new THREE.PlaneGeometry(30, 10),
      rotation: { x: 0, y: Math.PI / 2, z: 0 },
      position: { x: 7.5 + 20, y: 0, z: 0 },
    },
    {
      geometry: new THREE.PlaneGeometry(15, 10),
      rotation: { x: 0, y: 0, z: 0 },
      position: { x: 20, y: 0, z: -15 },
    },
  ];

  planeGeometries.forEach((planeData) => {
    const plane = new THREE.Mesh(planeData.geometry, color);
    plane.rotation.set(
      planeData.rotation.x,
      planeData.rotation.y,
      planeData.rotation.z
    );
    plane.position.set(
      planeData.position.x,
      planeData.position.y + 5,
      planeData.position.z
    );
    containerGroup.add(plane);
  });

  containerGroup.position.set(30, 0, 30);
  scene.add(containerGroup);
}

// Function to check if an object intersects with any objects in an array
function intersects(object, array) {
  const objectBox = new THREE.Box3().setFromObject(object);
  for (let i = 0; i < array.length; i++) {
    const otherBox = new THREE.Box3().setFromObject(array[i]);
    if (objectBox.intersectsBox(otherBox)) {
      return true;
    }
  }
  return false;
}

function checkCollisions() {
  "use strict";
}

function handleCollisions() {
  "use strict";
}

function animate() {
  "use strict";

  renderer.render(scene, currCamera);
  requestAnimationFrame(animate);
}

function render() {
  "use strict";
  renderer.render(scene, currCamera);
}

function onResize() {
  "use strict";

  renderer.setSize(window.innerWidth, window.innerHeight);

  if (window.innerHeight > 0 && window.innerWidth > 0) {
    currCamera.aspect = window.innerWidth / window.innerHeight;
    currCamera.updateProjectionMatrix();
  }
}

function onKeyDown(e) {
  "use strict";
  switch (e.keyCode) {
    case 49: // '1'
      currCamera = cameraFrontal;
      break;
    case 50: // '2'
      currCamera = cameraLateral;
      break;
    case 51: // '3'
      currCamera = cameraTop;
      break;
    case 52: // '4'
      currCamera = cameraFixedOrthogonal;
      break;
    case 53: // '5'
      currCamera = cameraFixedPerspective;
      break;
    case 54: // '6'
      currCamera = cameraMobilePerspective;
    case 65: // 'a'
      turntable.rotation.y -= Math.PI * 0.05;
      cameraMobilePerspective.position.x *= Math.cos(-Math.PI * 0.05);
      cameraMobilePerspective.position.z *= Math.sin(-Math.PI * 0.05);
      break;
    case 81: // 'q'
      turntable.rotation.y += Math.PI * 0.05;
      cameraMobilePerspective.position.x *= Math.cos(Math.PI * 0.05);
      cameraMobilePerspective.position.z *= Math.sin(Math.PI * 0.05);
      break;
    case 83: // 's'
      if (trolleyGroup.position.x <= 12) {
        trolleyGroup.position.x += 2;
        cameraMobilePerspective.position.x += 2;
      }

      break;
    case 87: // 'w'
      if (trolleyGroup.position.x >= -2) {
        trolleyGroup.position.x -= 2;
        cameraMobilePerspective.position.x -= 2;
      }

      break;
    case 69: // 'E(e)'
      if (hookGroup.position.y <= 18) {
        cable.position.y += 0.25;
        cable.scale.y -= 0.025;
        hookGroup.position.y += 0.5;
        cameraMobilePerspective.position.y += 0.5;
      }
      break;
    case 68: // 'D(d)'
      if (hookGroup.position.y > -20) {
        cable.position.y -= 0.25;
        cable.scale.y += 0.025;
        hookGroup.position.y -= 0.5;
        cameraMobilePerspective.position.y -= 0.5;
      }
      break;
    case 82: // 'R(r)'
      rotateAboutPoint(
        finger1,
        block.position,
        new THREE.Vector3(0, 0, 1),
        Math.PI * 0.01
      );
      rotateAboutPoint(
        finger2,
        block.position,
        new THREE.Vector3(0, 0, -1),
        Math.PI * 0.01
      );
      rotateAboutPoint(
        finger3,
        block.position,
        new THREE.Vector3(0, 0, 1),
        Math.PI * 0.01
      );
      rotateAboutPoint(
        finger4,
        block.position,
        new THREE.Vector3(0, 0, -1),
        Math.PI * 0.01
      );
      break;
    case 70: // 'F(f)'
      rotateAboutPoint(
        finger1,
        block.position,
        new THREE.Vector3(0, 0, -1),
        Math.PI * 0.01
      );
      rotateAboutPoint(
        finger2,
        block.position,
        new THREE.Vector3(0, 0, 1),
        Math.PI * 0.01
      );
      rotateAboutPoint(
        finger3,
        block.position,
        new THREE.Vector3(0, 0, -1),
        Math.PI * 0.01
      );
      rotateAboutPoint(
        finger4,
        block.position,
        new THREE.Vector3(0, 0, 1),
        Math.PI * 0.01
      );

      break;

    case 55: // '7' it said to do with the 1 but it's already being used
      scene.traverse(function (node) {
        console.log(node);
        if (node instanceof THREE.Mesh) {
          node.material.wireframe = !node.material.wireframe;
        }
      });
      break;
  }
}

function rotateAboutPoint(obj, point, axis, theta) {
  obj.position.sub(point); // remove the offset
  obj.position.applyAxisAngle(axis, theta); // rotate the POSITION
  obj.position.add(point); // re-add the offset
  obj.rotateOnAxis(axis, theta); // rotate the OBJECT
}

function init() {
  "use strict";

  // Initialize renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Create scene and cameras
  createScene();
  createCameras();

  currCamera = cameraFrontal;

  render();

  // Event listeners for keyboard input and window resize
  const keys = document.querySelectorAll(".key");
  window.addEventListener("keydown", function (event) {
    onKeyDown(event);
    const key = event.key.toUpperCase();
    if (
      key === "1" ||
      key === "2" ||
      key === "3" ||
      key === "4" ||
      key === "5" ||
      key === "6" ||
      key === "7" ||
      key === "Q" ||
      key === "A" ||
      key === "W" ||
      key === "S" ||
      key === "E" ||
      key === "D" ||
      key === "R" ||
      key === "F"
    ) {
      keys.forEach((k) => k.classList.remove("pressed"));
      document.getElementById("key" + key).classList.add("pressed");
    }
  });
  window.addEventListener("keyup", function (event) {
    const key = event.key.toUpperCase();
    if (
      key === "1" ||
      key === "2" ||
      key === "3" ||
      key === "4" ||
      key === "5" ||
      key === "6" ||
      key === "7" ||
      key === "Q" ||
      key === "A" ||
      key === "W" ||
      key === "S" ||
      key === "E" ||
      key === "D" ||
      key === "R" ||
      key === "F"
    ) {
      document.getElementById("key" + key).classList.remove("pressed");
    }
  });
  window.addEventListener("resize", onResize);
}

init();
animate();
