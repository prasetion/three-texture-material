import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import gsap from "gsap";
import doorColorImage from "./textures/door/color.jpg";
import doorAlphaImage from "./textures/door/alpha.jpg";
import doorHeightImage from "./textures/door/height.jpg";
import doorNormalImage from "./textures/door/normal.jpg";
import doorAmbientOcclusionImage from "./textures/door/ambientOcclusion.jpg";
import doorMetalnessImage from "./textures/door/metalness.jpg";
import doorRoughnessImage from "./textures/door/roughness.jpg";
import minecraftImage from "./textures/minecraft.png";

// canvas
const canvas = document.querySelector("canvas.webgl");

// debug
const gui = new GUI({
  width: 300,
  title: "Nice debug info",
  closeFolders: false,
});
// gui.close();
gui.hide();
const debugObject = {};

// cursor
const cursor = {
  x: 0,
  y: 0,
};

window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = -(event.clientY / sizes.height - 0.5);
  console.log(cursor.x, cursor.y);
});

// scene
const scene = new THREE.Scene();

// object
const geometry = new THREE.BoxGeometry(1, 1, 1);

// textures
// const image = new Image();
const loadingManager = new THREE.LoadingManager();
loadingManager.onStart = () => {
  console.log("start load");
};
loadingManager.onLoad = () => {
  console.log("finish load");
};
loadingManager.onProgress = () => {
  console.log("progress");
};
loadingManager.onError = () => {
  console.log("error");
};

const textureLoader = new THREE.TextureLoader(loadingManager);
// const texture = textureLoader.load(
//   doorColorImage,
//   () => console.log("loading finish"),
//   () => console.log("loading progress"),
//   () => console.log("loading error")
// );
const colorTexture = textureLoader.load(minecraftImage);
colorTexture.colorSpace = THREE.SRGBColorSpace;
// colorTexture.repeat.x = 2;
// colorTexture.repeat.y = 3;
// colorTexture.wrapS = THREE.RepeatWrapping;
// colorTexture.wrapT = THREE.RepeatWrapping;
// colorTexture.wrapS = THREE.MirroredRepeatWrapping;
// colorTexture.wrapT = THREE.MirroredRepeatWrapping;
// colorTexture.offset.x = 0.5;
// colorTexture.offset.y = 0.5;
colorTexture.rotation = Math.PI * 0.25;
colorTexture.center.x = 0.5;
colorTexture.center.y = 0.5;
colorTexture.generateMipmaps = false;
colorTexture.minFilter = THREE.NearestFilter;
colorTexture.magFilter = THREE.NearestFilter;

const alphaTexture = textureLoader.load(doorAlphaImage);
const heightTexture = textureLoader.load(doorHeightImage);
const normalTexture = textureLoader.load(doorNormalImage);
const ambientTexture = textureLoader.load(doorAmbientOcclusionImage);
const metalnessTexture = textureLoader.load(doorMetalnessImage);
const roughTexture = textureLoader.load(doorRoughnessImage);

// image.addEventListener("load", () => {
//   texture.needsUpdate = true;
// });
// image.src = doorColorImage;

const material = new THREE.MeshBasicMaterial({
  // color: debugObject.color,
  // wirefarame: true,
  map: colorTexture,
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// debug variable
debugObject.color = "#3a6ea6";
debugObject.spin = () => {
  gsap.to(mesh.rotation, { duration: 1, y: mesh.rotation.y + Math.PI * 2 });
};
debugObject.subdivision = 2;

// debug
const cubeTweaks = gui.addFolder("Awesome cube");
cubeTweaks.close();
cubeTweaks.add(mesh.position, "y").min(-3).max(3).step(0.01).name("elevation");
cubeTweaks.add(mesh, "visible");
cubeTweaks.add(material, "wireframe");
cubeTweaks.addColor(debugObject, "color").onChange((value) => {
  material.color.set(debugObject.color);
});

cubeTweaks.add(debugObject, "spin");
cubeTweaks
  .add(debugObject, "subdivision")
  .min(1)
  .max(20)
  .step(1)
  .onFinishChange(() => {
    console.log("subdivision finished changing");
    mesh.geometry.dispose();
    mesh.geometry = new THREE.BoxGeometry(
      1,
      1,
      1,
      debugObject.subdivision,
      debugObject.subdivision,
      debugObject.subdivision
    );
  });

window.addEventListener("keydown", (event) => {
  if (event.key == "h") gui.show(gui._hidden);
});

// sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// event listener resize
window.addEventListener("resize", () => {
  console.log("window has been resized");

  // update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));
});

// event listener dblclick
window.addEventListener("dblclick", () => {
  console.log("double click");

  const fullscreenElement =
    document.fullscreenElement || document.webkitFullscreenElement;

  if (!fullscreenElement) {
    if (canvas.requestFullscreen) {
      canvas.requestFullscreen();
    } else if (canvas.webkitRequestFullscreen) {
      canvas.webkitRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
});

// camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.01,
  1000
);

camera.position.z = 3;
scene.add(camera);

// controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});

renderer.setSize(sizes.width, sizes.height);

const tick = () => {
  // update controls
  controls.update();

  // render per frame
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();
