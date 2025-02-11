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

let dolphinSkinnedMesh

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

/**assigns skinIndices and skinWeights to each vertex of the mesh */
function skinMesh(geometry){

    const skinIndices = []
    const skinWeights = []

    let dict = new Map()

    const vertexColor = new THREE.Vector3()
    for (let i = 0; i < geometry.attributes.color.count; i++){
        vertexColor.fromBufferAttribute(geometry.attributes.color, i)

        // console.log(vertexColor)

        //assign dark green vertices to head bone
        if (vertexColor.x == 0.009134110994637012 && vertexColor.y == 0.06480329483747482 && vertexColor.z == 0){
            skinIndices.push(0, 0, 0, 0)
            skinWeights.push(1, 0, 0, 0)
        }
        //assign light green vertices to tail fin bone
        else if (vertexColor.x == 0 && vertexColor.y == 1 && vertexColor.z == 0){
            skinIndices.push(4, 0, 0, 0)
            skinWeights.push(1, 0, 0, 0)
        }
        //assign yellow vertices to dorsal fin bone
        else if (vertexColor.x == 1 && vertexColor.y == 1 && vertexColor.z == 0){
            skinIndices.push(5, 0, 0, 0)
            skinWeights.push(1, 0, 0, 0)
        }    
        //assign turquoise vertices to left flipper bone
        else if (vertexColor.x == 0 && vertexColor.y == 0.5209961533546448 && vertexColor.z == 0.5209961533546448){
            skinIndices.push(6, 0, 0, 0)
            skinWeights.push(1, 0, 0, 0)
        }
        //assign pink vertices to right flipper bone
        else if (vertexColor.x == 0.5209961533546448 && vertexColor.y == 0 && vertexColor.z == 0.5209961533546448){
            skinIndices.push(7, 0, 0, 0)
            skinWeights.push(1, 0, 0, 0)
        }
        else{
            skinIndices.push(0, 0, 0, 0)
            skinWeights.push(1, 0, 0, 0)
        }
    }

    geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4))
    geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4))

}

/**this function adds the objects to the scene */
function addObjects(){

    //loads the dolphin
    const loader = new OBJLoader()
    loader.load('dolphin_color.obj',
        function(obj){

            const dolphinGeometry = obj.children[0].geometry
            skinMesh(dolphinGeometry)
            const dolphinSkeleton = createBones()
            // console.log(dolphinSkeleton)
            
            const material = obj.children[0].material
            // const material = new THREE.MeshStandardMaterial({color: 'white', wireframe: true})

            dolphinSkinnedMesh = new THREE.SkinnedMesh(dolphinGeometry, material)
            const rootBone = dolphinSkeleton.bones[0]

            dolphinSkinnedMesh.add(rootBone)
            dolphinSkinnedMesh.bind(dolphinSkeleton)

            // console.log(dolphinSkinnedMesh.skeleton.bones[8]) 

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
    dorsalFinBone.position.set(0, 0, 1)

    const flipperLeftBone = new THREE.Bone()
    spineBones[0].add(flipperLeftBone)
    flipperLeftBone.position.set(2, 3, 0)

    const flipperRightBone = new THREE.Bone()
    spineBones[0].add(flipperRightBone)
    flipperRightBone.position.set(2, -3, 0)

    const dolphinBones = [
        headBone, ...spineBones, tailFinBone, dorsalFinBone, flipperLeftBone, flipperRightBone
    ]

    const dolphinSkeleton = new THREE.Skeleton(dolphinBones)

    return dolphinSkeleton
}

/**this function is called every render frame and contains the logic that rotates and bones to give
 * the required animation
 */
function animateDolphin(){

    if (dolphinSkinnedMesh){

        //animate tail
        dolphinSkinnedMesh.skeleton.bones[3].rotateY(Math.sin(Date.now() * 0.01) * 0.01)

        //animate dorsal fin
        dolphinSkinnedMesh.skeleton.bones[5].rotateX((Math.sin(Date.now() * 0.01) * 0.01))

        //animate flippers
        dolphinSkinnedMesh.skeleton.bones[6].rotateX(-Math.sin(Date.now() * 0.01) * 0.01)
        dolphinSkinnedMesh.skeleton.bones[7].rotateX(Math.sin(Date.now() * 0.01) * 0.01)
    }
    

}

/**render function that contains the render loop*/
function render(){

    function renderLoop(){

        animateDolphin()
        
        
        requestAnimationFrame(renderLoop)
        controls.update()
        renderer.render(scene, camera)
    }
    renderLoop()
    
}