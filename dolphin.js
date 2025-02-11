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
    // const axesHelper = new THREE.AxesHelper(50)
    // scene.add(axesHelper)
 
}

/**this function adds the objects to the scene */
function addObjects(){

    //loads the dolphin
    const loader = new OBJLoader()
    loader.load('dolphin_color.obj',
        function(obj){

            const dolphinGeometry = obj.children[0].geometry
            const dolphinSkeleton = createBones()
            const material = new THREE.MeshBasicMaterial({color: 0x808080, wireframe: false})

            const dolphinSkinnedMesh = new THREE.SkinnedMesh(dolphinGeometry, material)
            const rootBone = dolphinSkeleton.bones[0]

            dolphinSkinnedMesh.add(rootBone)
            dolphinSkinnedMesh.bind(dolphinSkeleton)

            const dolphinSkeletonHelper = new THREE.SkeletonHelper(dolphinSkinnedMesh)
            scene.add(dolphinSkeletonHelper)

            dolphinSkinnedMesh.rotateZ(Math.PI)
            dolphinSkinnedMesh.rotateX(Math.PI/2)

            const dolphinAxes = new THREE.AxesHelper(20)
            dolphinSkinnedMesh.add(dolphinAxes)

            obj.rotateZ(Math.PI)
            obj.rotateX(Math.PI/2)
            // scene.add(obj)
            scene.add(dolphinSkinnedMesh)
        },
        function(xhr){
        },
        function(err){
            console.error("Error loading dolphin", err)
        }
    )

    //adds lighting to the scene
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);
    const ambientLight = new THREE.AmbientLight(0xC1C1C1); // Soft white light
    scene.add(ambientLight);

}

/**creates the dolphin skeleton and returns a THREE.Skeleton object */
function createBones(){

    const headBone = new THREE.Bone()
    headBone.position.set(-27, 0, -10)

    const spineBones = []
    spineBones.push(new THREE.Bone())
    spineBones.push(new THREE.Bone())
    spineBones.push(new THREE.Bone())

    headBone.add(spineBones[0])
    spineBones[0].position.set(12, 0, 5)
    spineBones[0].add(spineBones[1])
    spineBones[1].position.set(13, 0, 9)
    spineBones[1].add(spineBones[2])
    spineBones[2].position.set(23, 0, -8)

    const tailFinBone = new THREE.Bone()
    spineBones[2].add(tailFinBone)
    tailFinBone.position.set(7, 0, -3)

    const dorsalFinBone = new THREE.Bone()
    spineBones[1].add(dorsalFinBone)
    dorsalFinBone.position.set(8, 0, 6)

    const flipperLeftBone = new THREE.Bone()
    spineBones[0].add(flipperLeftBone)
    flipperLeftBone.position.set(7, -8, -3)

    const flipperRightBone = new THREE.Bone()
    spineBones[0].add(flipperRightBone)
    flipperRightBone.position.set(7, 8, -3)

    const dolphinBones = [
        headBone, ...spineBones, tailFinBone, dorsalFinBone, flipperLeftBone, flipperRightBone
    ]

    const dolphinSkeleton = new THREE.Skeleton(dolphinBones)

    return dolphinSkeleton
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