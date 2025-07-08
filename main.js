import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

const canvas = document.querySelector("#c");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xfafafa);

// --- Start of background drawing logic ---

const cmToPx = 40; // 1cm = 40px

function drawBackground() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const lineCanvas = document.createElement("canvas");
  lineCanvas.width = width;
  lineCanvas.height = height;
  const lineCtx = lineCanvas.getContext("2d");

  // Paper color
  lineCtx.fillStyle = "#fdfdfd";
  lineCtx.fillRect(0, 0, width, height);

  // Horizontal lines (alternating 0.5cm and 1cm)
  lineCtx.strokeStyle = "#add8e6"; // Light blue lines
  lineCtx.lineWidth = 1;
  let currentY = 0;
  let lineToggle = true; // true for 0.5cm, false for 1cm
  while (currentY < height) {
    lineCtx.beginPath();
    lineCtx.moveTo(0, currentY);
    lineCtx.lineTo(width, currentY);
    lineCtx.stroke();
    if (lineToggle) {
      currentY += 0.5 * cmToPx;
    } else {
      currentY += 1 * cmToPx;
    }
    lineToggle = !lineToggle;
  }

  // Diagonal lines (60 degrees, 2.5cm spacing)
  const angle = Math.PI / 3; // 60 degrees from horizontal
  const tanAngle = Math.tan(angle);
  const sinAngle = Math.sin(angle);
  const diagonalSpacing = 2.5 * cmToPx;
  const xSpacing = diagonalSpacing / sinAngle;

  lineCtx.strokeStyle = "#add8e6";
  lineCtx.lineWidth = 1;

  const startX = width + height / tanAngle;
  for (let i = startX; i > 0; i -= xSpacing) {
    lineCtx.beginPath();
    lineCtx.moveTo(i, 0);
    lineCtx.lineTo(i - height / tanAngle, height);
    lineCtx.stroke();
  }

  // Red vertical line (2cm from right edge)
  lineCtx.strokeStyle = "#ff0000"; // Red color
  lineCtx.lineWidth = 1.5;
  const redLineX = width - 2 * cmToPx;
  lineCtx.beginPath();
  lineCtx.moveTo(redLineX, 0);
  lineCtx.lineTo(redLineX, height);
  lineCtx.stroke();

  // Dispose of the old texture and create a new one
  if (scene.background && scene.background.isTexture) {
    scene.background.dispose();
  }

  const lineTexture = new THREE.CanvasTexture(lineCanvas);
  scene.background = lineTexture;
}

// --- End of background drawing logic ---

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.z = 5;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

let hedgehog;
const loader = new STLLoader();
loader.load(
  "/hedgehog.stl",
  (geometry) => {
    console.log("Model loaded successfully!");

    const material = new THREE.MeshBasicMaterial({
      color: 0x0000ff,
      wireframe: true,
      // visible: false,
    });
    hedgehog = new THREE.Mesh(geometry, material);
    hedgehog.scale.set(2, 2, 2);
    hedgehog.position.set(0, 0, 0);
    hedgehog.rotation.x = -Math.PI / 2;
    scene.add(hedgehog);

    // Create outline (still blue pen style)
    const outlineMaterial = new THREE.MeshBasicMaterial({
      visible: false,
      // color: 0xffffff,
      // side: THREE.BackSide,
    });
    const outlineMesh = new THREE.Mesh(geometry, outlineMaterial);
    outlineMesh.scale.copy(hedgehog.scale).multiplyScalar(1.05); // Slightly larger
    outlineMesh.position.copy(hedgehog.position);
    outlineMesh.rotation.copy(hedgehog.rotation);
    scene.add(outlineMesh);

    // Make outline follow hedgehog
    hedgehog.userData.outline = outlineMesh;
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.error("An error happened while loading the model.", error);
  },
);

let mouseX = 0;
let mouseY = 0;

document.addEventListener("mousemove", (e) => {
  mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});

const repulsion = 0.008;
const friction = 0.97;
let velocityX = 0;
let velocityY = 0;
let rotationVelocityX = 0;
let rotationVelocityY = 0;

function animate() {
  requestAnimationFrame(animate);

  if (hedgehog) {
    const vector = new THREE.Vector3(mouseX, mouseY, 0.5);
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const pos = camera.position.clone().add(dir.multiplyScalar(distance));

    const dx = hedgehog.position.x - pos.x;
    const dy = hedgehog.position.y - pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 2) {
      const angle = Math.atan2(dy, dx);
      const force = (2 - dist) * repulsion;
      velocityX += Math.cos(angle) * force;
      velocityY += Math.sin(angle) * force;
      rotationVelocityX += (Math.random() - 0.5) * 0.01;
      rotationVelocityY += (Math.random() - 0.5) * 0.01;
    }

    velocityX *= friction;
    velocityY *= friction;
    rotationVelocityX *= friction;
    rotationVelocityY *= friction;

    hedgehog.position.x += velocityX;
    hedgehog.position.y += velocityY;
    hedgehog.rotation.x += rotationVelocityX;
    hedgehog.rotation.y += rotationVelocityY;

    // Update outline position and rotation
    hedgehog.userData.outline.position.copy(hedgehog.position);
    hedgehog.userData.outline.rotation.copy(hedgehog.rotation);

    // Wall bouncing
    const frustumHeight =
      2 *
      camera.position.z *
      Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));
    const frustumWidth = frustumHeight * camera.aspect;

    const halfHedgehogWidth = hedgehog.scale.x / 2; // Assuming scale.x is the width
    const halfHedgehogHeight = hedgehog.scale.y / 2; // Assuming scale.y is the height

    const minX = -frustumWidth / 2 + halfHedgehogWidth;
    const maxX = frustumWidth / 2 - halfHedgehogWidth;
    const minY = -frustumHeight / 2 + halfHedgehogHeight;
    const maxY = frustumHeight / 2 - halfHedgehogHeight;

    if (hedgehog.position.x < minX) {
      hedgehog.position.x = minX;
      velocityX *= -0.8;
    } else if (hedgehog.position.x > maxX) {
      hedgehog.position.x = maxX;
      velocityX *= -0.8;
    }

    if (hedgehog.position.y < minY) {
      hedgehog.position.y = minY;
      velocityY *= -0.8;
    } else if (hedgehog.position.y > maxY) {
      hedgehog.position.y = maxY;
      velocityY *= -0.8;
    }
  }

  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  drawBackground(); // Redraw background on resize
});

drawBackground(); // Initial draw
animate();
