import * as THREE from "three";
import * as CANNON from 'cannon-es'
import CannonDebugger from 'cannon-es-debugger';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


let renderer, container, camera;

let scene,diceMesh,groundMesh;
let world,diceBody,groundBody;


window.addEventListener("load", function () {
  start();
});

async function start() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  
  container = document.querySelector("#threejsContainer");
  container.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(60,window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 5, 10);

  scene = new THREE.Scene();

  const light01 = new THREE.PointLight(0xffffff, 50);
  light01.position.set(4, 5, 5);
  light01.castShadow = true;
  light01.shadow.mapSize.width=2048;
  light01.shadow.mapSize.height=2048;
  scene.add(light01);

  const light02 = new THREE.PointLight(0xffffff, 50);
  light02.position.set(-4, 3, 5);
  light02.castShadow = true;
  light02.shadow.mapSize.width=2048;
  light02.shadow.mapSize.height=2048;
  scene.add(light02);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.update();  

  const planeGeometry = new THREE.PlaneGeometry(10, 10);
  const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  groundMesh = new THREE.Mesh(planeGeometry, planeMaterial);
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);

  const gltfLoader = new GLTFLoader();
  gltfLoader.load('./assets/models/dice.glb', (gltf) => {      
    diceMesh= new THREE.Group();
    console.log(gltf);

    gltf.scene.position.y = -0.5;
    gltf.scene.scale.set(0.5, 0.5, 0.5);

    gltf.scene.traverse( function( node ) {
      if ( node.isMesh ) { 
        node.castShadow = true; 
      }
    });
    diceMesh.add(gltf.scene);     
    scene.add(diceMesh);  
  });

   
  world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.81, 0),   // m/s²
  })
    
  groundBody = new CANNON.Body({
    //type: CANNON.Body.STATIC,
    mass: 0,
    shape: new CANNON.Box(new CANNON.Vec3(5,5,0.01)),
  })
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // make it face up
  world.addBody(groundBody);
  

  const diceShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5))
  diceBody = new CANNON.Body({ 
      mass: 1,
      shape: diceShape,
  });
   
  diceBody.position.set(0, 5, 0);
  diceBody.quaternion.setFromEuler(Math.PI*Math.random(),Math.PI*Math.random(),Math.PI*Math.random());
  world.addBody(diceBody);

  diceBody.angularVelocity.set(0,0,10);
  diceBody.angularDamping=0.1;

  const cannonDebugger = new CannonDebugger(scene, world);

  animate();

  function animate() {
    world.fixedStep();

    groundMesh.position.copy(groundBody.position);
    groundMesh.quaternion.copy(groundBody.quaternion);

    if (diceMesh)
    {
        diceMesh.position.copy(diceBody.position);
        diceMesh.quaternion.copy(diceBody.quaternion);
    }

    //cannonDebugger.update();


    renderer.render(scene, camera);
    requestAnimationFrame(animate); 

  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    animate();
  }

  window.addEventListener("resize", onWindowResize);
}
