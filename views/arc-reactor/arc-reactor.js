/*
* Entry point script for renderer and scene management and initializations
*/

// Global variables and constants
var camera, scene, renderer, controls, stats;
var clock = new THREE.Clock();

//Raycast
var group = new THREE.Group();
var raycaster = new THREE.Raycaster();
var mouseVector = new THREE.Vector3();
var selectedObject = null;

//Inspector
var inspectorScene;
var inspectorHemiLight;
var inspectorDirectLight;
var switchScene = false;

// Lights
var hemiLight, dirLight;

// Materials
var materialVector = new Array();

// Skybox
var skyMesh;
var skyMaterial;

/*
* Init function
*/ 
function init() {
	applyTemplate("../arc-reactor-controls/arc-reactor-controls.html");
	initStat();
	initScene();
	initInspectorScene();
	initMaterials();

	loadArchitecture("../../assets/models/architecture.json");
	initCamera();
	group.rotation.z += Math.PI / 4
	group.rotation.y += Math.PI / 2
	camera.position.set(150,0,150)
	scene.add(group);
	
	bindEvent(window, "resize", onWindowResize );
	// desktop
	bindEvent(window, "mousemove", onDocumentMouseMove );
	bindEvent(document, "mousedown", onMouseDown );
	bindEvent(document, "mouseup", onMouseUp );
	// touch screen
	bindEvent(document, "touchmove", onDocumentMouseMove );
	bindEvent(document, "touchstart", onMouseDown );
	bindEvent(document, "touchend", onMouseUp );

	bindEvent(window, "click", onDocumentMouseClick );
	bindEvent(window, 'message', onMessage );
	bindEvent(document, "loading-complete", function(){
		console.log("Loading Complete");
		
		skyMesh = new THREE.Mesh(new THREE.SphereBufferGeometry(500, 64, 64), skyMaterial);
		skyMesh.rotation.y -= Math.PI/4;
		scene.add(skyMesh);
		animate();
	})


	initRenderer();
}


function loadArchitecture( file ) {
	read(file, function(content){
		var architecture = JSON.parse(content);   
		architecture.forEach(function(component){
			setupMesh(component);
		});
	})
}


function setupMesh( parameters ) {
	var loader = new THREE.GLTFLoader();
	loader.load( parameters.url, function( gltf ) {
		var gltfMesh = gltf.scene.children[ 0 ];
		if(parameters.repeat > 0){
			var component = new THREE.Group();
			component.add(new AnimatedMesh(gltfMesh, parameters));
			for(var i = 0; i < parameters.repeat; i++){
				var new_component = component.clone();
				group.add(new AnimatedGroup(new_component, ((2 * Math.PI * i) / 10)));
			}
		} else {
			group.add(new AnimatedMesh(gltfMesh, parameters));
		}
	});
}


/*
* Loop function
*/
function animate() {
	TWEEN.update();
	stats.update();
	controls.update();
	requestAnimationFrame( animate );
	Render();
}

/*
* Render function
*/
function Render()
{
	if(!switchScene)
		renderer.render( scene, camera );
	else
		renderer.render( inspectorScene, camera );
}


/*
* Renderer init
*/
function initRenderer(){
	renderer = new THREE.WebGLRenderer( { alpha: true, antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.gammaOutput = true;
	renderer.gammaInput = true;
	renderer.shadowMap.enabled = true;
	document.body.appendChild( renderer.domElement );
}


/*
* Scene init
*/
function initScene(){
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x000022 );
	scene.fog = new THREE.Fog( 0xffffff, 0, 750 );
	hemiLight = createHemiLight();
	dirLight = createDirLight();
    scene.add( hemiLight );  
	scene.add( dirLight );  
}

/*
* Inspector scene init
*/
function initInspectorScene()
{
	inspectorScene = new THREE.Scene();
	inspectorScene.background = new THREE.Color( 0x000022 );
	inspectorHemiLight = createHemiLight();
	inspectorDirectLight = createDirLight();
}

/*
* Skybox init
*/
function initSkyBox()
{
	skyMaterial = new THREE.ShaderMaterial(
		{
			vertexShader: 'sky-vertex',
			fragmentShader: 'sky-fragment',
			uniforms: {"skyMap": {type: "t", value: environmentMaps[0]}},
			side: THREE.BackSide
		}
	)
}


/*
* Stat init
*/
function initStat(){
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	//document.body.appendChild( stats.domElement );
}

init();