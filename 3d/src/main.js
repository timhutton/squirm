window.onload = function() {
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth * 0.8, window.innerHeight * 0.8 );
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    document.body.appendChild( renderer.domElement );

    {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.PointLight(color, intensity);
        light.position.set(0, 100, 40);
        scene.add(light);
    }
    {
        const color = 0x87CEEB;
        const intensity = 1;
        const light = new THREE.PointLight(color, intensity);
        light.position.set(40, -30, -30);
        scene.add(light);
    }
    {
        const color = 0xEB87CE;
        const intensity = 1;
        const light = new THREE.PointLight(color, intensity);
        light.position.set(-40, -30, -30);
        scene.add(light);
    }

    const cube_material = new THREE.MeshStandardMaterial( { color: 0xffffff, wireframe: false } );
    let cube = new THREE.BoxGeometry(1,1,1);

    let X = 10;
    let Y = 10;
    let Z = 10;
    let N = 400;
    let mesh = new THREE.InstancedMesh( cube, cube_material, N );
    mesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage ); // will be updated every frame
    scene.add( mesh );

    camera.position.x = 35;
    camera.position.y = 46;
    camera.position.z = 65;

    let pos = [];
    for(let i = 0; i < N; i++) {
        pos[i] = new THREE.Vector3(Math.floor(Math.random() * X), Math.floor(Math.random() * Y), Math.floor(Math.random() * Z));
    }

    orbit_controls = new THREE.OrbitControls( camera, renderer.domElement );
    camera.lookAt( X/2, Y/2, Z/2 );
    orbit_controls.target.set( X/2, Y/2, Z/2 );

    renderer.domElement.addEventListener( 'mousemove', render, false );
    renderer.domElement.addEventListener( 'touchmove', render, false );
    renderer.domElement.addEventListener( 'mousedown',  render, false );
    renderer.domElement.addEventListener( 'touchstart',  render, false );
    renderer.domElement.addEventListener( 'mouseup',  render, false );
    renderer.domElement.addEventListener( 'mouseout',  render, false );
    renderer.domElement.addEventListener( 'touchend',  render, false );
    renderer.domElement.addEventListener( 'touchcancel',  render, false );
    renderer.domElement.addEventListener( 'wheel',  render, false );

    function render() {
        renderer.render( scene, camera );
    }

    function animate() {
        const dummy = new THREE.Object3D();
        for(let i = 0; i < N; i++) {
            pos[i].x += Math.floor(Math.random() * 3) - 1;
            pos[i].y += Math.floor(Math.random() * 3) - 1;
            pos[i].z += Math.floor(Math.random() * 3) - 1;
            dummy.position.set(pos[i].x, pos[i].y, pos[i].z);
            dummy.updateMatrix();
            mesh.setMatrixAt( i, dummy.matrix );
        }
        mesh.instanceMatrix.needsUpdate = true;
        render();

        const fps = 60;
        setTimeout(() => {
            requestAnimationFrame(animate);
        }, 1000 / fps);
    }

    animate();
}
