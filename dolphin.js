import * as THREE from "three";
import { GUI } from "dat.gui";
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const canvas = document.getElementById('canvas')
const renderer = new THREE.WebGLRenderer({canvas: canvas})
renderer.setClearColor(new THREE.Color('black'))
const aspectRatio = canvas.offsetWidth / canvas.offsetHeight
const camera = new THREE.PerspectiveCamera(45, aspectRatio, 1, 1000)
const scene = new THREE.Scene()

//adds controls for scene
const controls = new OrbitControls(camera, renderer.domElement);

main()

/**main function of the program */
function main(){
    init()
    addObjects()
    render()
}

/**initialization function to set up the threejs stuff */
function init(){
    camera.position.setZ(100)
    camera.lookAt(scene.position)
    optionalInit()
}

/**optional helpers for axes */
function optionalInit(){

    //adds axes to scene
    const axesHelper = new THREE.AxesHelper(50)
    scene.add(axesHelper)
 
}

/**this function adds the objects to the scene */
function addObjects(){

    //loads the dolphin
    const loader = new OBJLoader()
    loader.load('dolphin_color.obj',
        function(obj){
            obj.traverse(function(child){
                if (child instanceof THREE.Mesh) {
                    child.material = new THREE.MeshStandardMaterial({color: 0x808080})
                }
            });
            obj.rotateZ(Math.PI)
            obj.rotateX(Math.PI/2)
            scene.add(obj);
        },
        function(xhr){
        },
        function(err){
            console.error("Error loading dolphin")
        }
    )

    //adds lighting to the scene
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);
    const ambientLight = new THREE.AmbientLight(0xC1C1C1); // Soft white light
    scene.add(ambientLight);

}



/**render function that contains the render loop*/
function render(){

    function renderLoop(){
        
        requestAnimationFrame(renderLoop)
        controls.update()
        renderer.render(scene, camera)
    }
    renderLoop()
    
}