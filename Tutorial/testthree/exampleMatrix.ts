import THREE = require("three");

export class ExampleMatrix {
    // Three data 
    private container: HTMLElement;
    private camera: THREE.PerspectiveCamera;
    private scene: THREE.Scene;
    private renderer: THREE.WebGLRenderer;
    private plane: THREE.Mesh;
    private mouse: THREE.Vector2;
    private raycaster: THREE.Raycaster;
    private isShiftDown: Boolean = false;
    private rollOverMesh: THREE.Mesh;
    private rollOverMaterial: THREE.MeshBasicMaterial;
    private cubeGeo: THREE.BoxGeometry;
    private cubeMaterial: THREE.MeshLambertMaterial;
    private objects = [];
    constructor(){

    }
    init() {
        this.container = document.getElementById('content-visualize');
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth * 0.7 / window.innerHeight, 1, 10000);
        this.camera.position.set(500, 800, 1300);
        this.camera.lookAt(new THREE.Vector3());
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);
        // roll-over helpers
        var rollOverGeo = new THREE.BoxGeometry(50, 50, 50);
        this.rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true });
        this.rollOverMesh = new THREE.Mesh(rollOverGeo, this.rollOverMaterial);
        this.scene.add(this.rollOverMesh);
        // cubes
        this.cubeGeo = new THREE.BoxGeometry(50, 50, 50);
        this.cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xfeb74c, map: new THREE.TextureLoader().load("assets/img/visulalize/square-outline-textured.png") });
        // grid
        var gridHelper = new THREE.GridHelper(1000, 20);
        this.scene.add(gridHelper);
        //
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        var geometry = new THREE.PlaneBufferGeometry(1000, 1000);
        geometry.rotateX(- Math.PI / 2);
        this.plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ visible: false }));
        this.scene.add(this.plane);
        this.objects.push(this.plane);
        // Lights
        var ambientLight = new THREE.AmbientLight(0x606060);
        this.scene.add(ambientLight);
        var directionalLight = new THREE.DirectionalLight(0xffffff);
        directionalLight.position.set(1, 0.75, 0.5).normalize();
        this.scene.add(directionalLight);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth * 0.7, window.innerHeight);
        this.container.appendChild(this.renderer.domElement)
        document.addEventListener('mousemove', this.onDocumentMouseMove, false);
        document.addEventListener('mousedown', this.onDocumentMouseDown, false);
        document.addEventListener('keydown', this.onDocumentKeyDown, false);
        document.addEventListener('keyup', this.onDocumentKeyUp, false);
        //
        window.addEventListener('resize', this.onWindowResize, false);
        THREE.OrbitControls
    }
    onWindowResize() {
        this.camera.aspect = window.innerWidth * 0.7 / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth * 0.7, window.innerHeight);
    }

    onDocumentMouseMove(event) {
        event.preventDefault();
        this.mouse.set((event.clientX / window.innerWidth * 0.7) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);
        this.raycaster.setFromCamera(this.mouse, this.camera);
        var intersects = this.raycaster.intersectObjects(this.objects);
        if (intersects.length > 0) {
            var intersect = intersects[0];
            this.rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
            this.rollOverMesh.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
        }
        this.render();
    }
    onDocumentMouseDown(event) {
        event.preventDefault();
        this.mouse.set((event.clientX / window.innerWidth * 0.7) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);
        this.raycaster.setFromCamera(this.mouse, this.camera);
        var intersects = this.raycaster.intersectObjects(this.objects);
        if (intersects.length > 0) {
            var intersect = intersects[0];
            // delete cube
            if (this.isShiftDown) {
                if (intersect.object != this.plane) {
                    this.scene.remove(intersect.object);
                    this.objects.splice(this.objects.indexOf(intersect.object), 1);
                }
                // create cube
            } else {
                var voxel = new THREE.Mesh(this.cubeGeo, this.cubeMaterial);
                voxel.position.copy(intersect.point).add(intersect.face.normal);
                voxel.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
                this.scene.add(voxel);
                this.objects.push(voxel);
            }
            this.render();
        }
    }
    onDocumentKeyDown(event) {
        switch (event.keyCode) {
            case 16: this.isShiftDown = true; break;
        }
    }
    onDocumentKeyUp(event) {
        switch (event.keyCode) {
            case 16: this.isShiftDown = false; break;
        }
    }
    render() {
        this.renderer.render(this.scene, this.camera);
    }
}

