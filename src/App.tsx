import './App.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { FirstPersonCamera } from './3d helpers/controls'
import UserVisualization from './3d helpers/userVisualization';

const userName = Math.random().toString();
const loadingVisualization = document.getElementById("loading");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg') as HTMLCanvasElement,
  antialias: true
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild( renderer.domElement );

const blocker = document.getElementById('blocker') as HTMLElement;
const instructions = document.getElementById('instructions') as HTMLElement;
instructions.style.display = 'none';
const controls = new FirstPersonCamera(camera, blocker, instructions, scene, []);
const clock = new THREE.Clock();

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( '/examples/jsm/libs/draco/' );
loader.setDRACOLoader( dracoLoader );
loader.load(
  '/gallery texturing.glb',
  function ( gltf ) {
    gltf.scene.position.y = -1.7;
    scene.add(gltf.scene);
    if (loadingVisualization)
      loadingVisualization.style.display = 'none';
    instructions.style.display = 'flex';
    getPositions(true);
  },
  function ( xhr ) {
    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
  },
  // called when loading has errors
  function ( error ) {
    console.log( 'An error happened' );
    console.log( error );
  }
);

new THREE.TextureLoader().load('/bridge.png', function (texture) {
  var material = new THREE.MeshBasicMaterial({map: texture, transparent: true});
  loader.load(
    '/bridge.glb',
    function ( gltf ) {
      gltf.scene.position.y = -1.7;
      gltf.scene.traverse((o) => {
        if (o instanceof THREE.Mesh) o.material = material;
      });

      scene.add(gltf.scene);
    },
    // called when loading has errors
    function ( error ) {
      console.log( 'An error happened' );
      console.log( error );
    }
  );
})


const colliderMaterial = new THREE.MeshBasicMaterial();
function addCollider(sizeX: number, sizeY: number, offsetX: number, offsetY: number) {
  var o = new THREE.Mesh(new THREE.BoxGeometry(sizeX, 2, sizeY), colliderMaterial);
  o.position.set(offsetX, 0, offsetY);
  controls.addCollisionObject(o);
  scene.add(o);
  o.visible = false;
}

addCollider(1, 12, 5, 7);
addCollider(1, 34, -6, -3);
addCollider(1, 12, 5, -6.5);
addCollider(34, 1, 11, 13);
addCollider(34, 1, 11, -20);
addCollider(24, 1, 17, -12);
addCollider(1, 34, 27, -3);
addCollider(8, 1, 1.5, -3.3);
addCollider(4, 1, -6, -3.3);

const usersMeshes = new UserVisualization(
  new THREE.CylinderGeometry(0.25, 0.25, 0.1),
  new THREE.MeshBasicMaterial( { color: 0x000000, transparent: true, opacity: 0.5 } ),
  scene,
  new THREE.Vector3(0, -1.7, 0));

var positions: {} = {}

const getPositions = async (createUser: boolean) => {
  try {
    const userPos = controls.position();
    const response = await fetch('/.netlify/functions/positions', {
      method: 'POST',
      body: JSON.stringify({ user: userName, x: userPos.x, y: userPos.z, create: createUser }),
    });
    const data = await response.json();
    console.log(data.message);
    positions = data;
    usersMeshes.resetPlacing();
    Object.values(positions).forEach(function(value) {
      if (value instanceof Object && 'x' in value && 'y' in value) {
        usersMeshes.placeUser(value.x as number, value.y as number);
        console.log(value.x + "," + value.y);
      }
    })
  }
  catch (error) {
    console.log(error);
  }
  getPositions(false);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update(clock.getDelta());
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function onUserLeave() {
  fetch('/.netlify/functions/positions', {
    method: 'DELETE',
    body: JSON.stringify({ user: userName, x: NaN, y: NaN }),
  });
}

window.addEventListener('resize', onWindowResize);
window.addEventListener('unload', onUserLeave);
window.addEventListener('beforeunload', onUserLeave);
animate();

function App() {
  return (
    <>
      <h1>
        Controls:
      </h1>
      <p className='controls'>
        Move: WASD<br/>
        Look: MOUSE<br/>
        Escape: ESC
      </p>
      <h2>
        Click to play
      </h2>
      <div className='space'></div>
      <h1>
        About:
      </h1>
      <p id='par'>
        Seeing art on screen isn't that touching as seeing it directly in front of you. Some paining are breathtaking by their size, some have textures that can't be replicated just by one photo from one angle.
      </p>
      <p>
        Virtual Gallery tries to fix some of these issues. It is 3D environment where you can explore art pieces, like in normal gallery. But compared to normal gallery Virtual Gallery is not limited by reality, so you can find bottomless pits or endless corridors or paint-like walls here. Of course possibilities are endless so Virtual Gallery could be expanded more with even more interesting rooms.
      </p>
      <p>
        Paintings are in a scale 4:1 (4 times bigger than in real life) so you can see them better.
      </p>
      <h1>
        Displayed paintings:
      </h1>
      <h2>
        First room:
      </h2>
      <ul>
        <li><a href='https://sbirky.ngprague.cz/en/dielo/CZE:NG.O_3208'>Vincent van Gogh, Green Wheat Field, 1889, National Gallery Prague, Trade Fair Palace</a></li>
        <li><a href='https://sbirky.ngprague.cz/en/dielo/CZE:NG.O_3727'>Arnošt Hofbauer, Pilgrim, 1905, National Gallery Prague, Trade Fair Palace</a></li>
        <li><a href='https://sbirky.ngprague.cz/en/dielo/CZE:NG.O_2659'>Mikoláš Aleš, Uhlans in the Snow, 1882, National Gallery Prague, Trade Fair Palace</a></li>
        <li><a href='https://sbirky.ngprague.cz/en/dielo/CZE:NG.O_10266'>Antonín Chittussi, The Chrudimka Valley, 1887, National Gallery Prague, Trade Fair Palace</a></li>
        <li><a href='https://sbirky.ngprague.cz/en/dielo/CZE:NG.O_5138'>Antonín Chittussi, The „Drowned“ Pond, 1887, National Gallery Prague, Trade Fair Palace</a></li>
      </ul>
      <h2>
        Second room:
      </h2>
      <ul>
        <li><a href='https://sbirky.ngprague.cz/en/dielo/CZE:NG.O_10441'>Josef Čapek, African King, 1920, National Gallery Prague, Trade Fair Palace</a></li>
        <li><a href='https://sbirky.ngprague.cz/en/dielo/CZE:NG.O_3349'>Edvard Munch, Dancing on a Shore, 1900, National Gallery Prague, Trade Fair Palace</a></li>
        <li><a href='https://sbirky.ngprague.cz/en/dielo/CZE:NG.O_9363'>Bohumil Kubišta, Smoker (Self-Portrait), 1910, National Gallery Prague, Trade Fair Palace</a></li>
        <li><a href='https://sbirky.ngprague.cz/en/dielo/CZE:NG.O_8599'>Václav Špála, Landscape in Dalmatia, 1913, National Gallery Prague, Trade Fair Palace</a></li>
      </ul>
      <h2>
        Third room:
      </h2>
      <ul>
        <li><a href='https://sbirky.ngprague.cz/en/dielo/CZE:NG.O_3530'>Bohumil Kubišta, St. Sebastian, 1912, National Gallery Prague, Trade Fair Palace</a></li>
        <li><a href='https://sbirky.ngprague.cz/en/dielo/CZE:NG.O_3327'>Bohumil Kubišta, Coastal Cannons Fighting the Navy, 1915, National Gallery Prague, Trade Fair Palace</a></li>
        <li><a href='https://sbirky.ngprague.cz/en/dielo/CZE:NG.O_10773'>Josef Čapek, Fire, 1915, National Gallery Prague, Trade Fair Palace</a></li>
        <li><a href='https://sbirky.ngprague.cz/en/dielo/CZE:NG.O_11246'>Josef Čapek, Head, 1915-1916, National Gallery Prague, Trade Fair Palace</a></li>
        <li><a href='https://sbirky.ngprague.cz/en/dielo/CZE:NG.O_10130'>Augustin Ságner, Woman at Her Toilette, late 1930s, National Gallery Prague, Trade Fair Palace</a></li>
        <li><a href='https://sbirky.ngprague.cz/en/dielo/CZE:NG.O_15301'>František Janoušek, Landscape in June, 1934, National Gallery Prague, Trade Fair Palace</a></li>
        <li><a href='https://sbirky.ngprague.cz/en/dielo/CZE:NG.O_9633'>Jindřich Štyrský, A Letter, 1934, National Gallery Prague, Trade Fair Palace</a></li>
        <li><a href='https://sbirky.ngprague.cz/en/dielo/CZE:NG.O_17428'>Vojtěch Preissig, Spiders, 1936, National Gallery Prague, Trade Fair Palace</a></li>
        <li><a href='https://sbirky.ngprague.cz/en/dielo/CZE:NG.O_9533'>Vojtěch Preissig, Circles, 1936, National Gallery Prague, Trade Fair Palace</a></li>
      </ul>
    </>
  )
}

export default App
