window.onload = function() {
    let steps_text = document.createElement("p");
    steps_text.innerHTML = "Steps: 0<br>Steps per render: 1";
    document.body.appendChild(steps_text);

    let startstop_button = document.createElement("button");
    startstop_button.innerHTML = "Pause / Run";
    startstop_button.onclick = toggle_running;
    startstop_button.style.width = "100px";
    document.body.appendChild(startstop_button);

    let run_faster_button = document.createElement("button");
    run_faster_button.innerHTML = "Run faster";
    run_faster_button.onclick = run_faster;
    run_faster_button.style.width = "100px";
    document.body.appendChild(run_faster_button);

    let run_slower_button = document.createElement("button");
    run_slower_button.innerHTML = "Run slower";
    run_slower_button.onclick = run_slower;
    run_slower_button.style.width = "100px";
    document.body.appendChild(run_slower_button);

    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth * 0.8, window.innerHeight * 0.8 );
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    document.body.appendChild( renderer.domElement );

    {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.PointLight(color, intensity);
        light.position.set(0, 1000, 400);
        scene.add(light);
    }
    {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.PointLight(color, intensity);
        light.position.set(400, -300, -300);
        scene.add(light);
    }
    {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.PointLight(color, intensity);
        light.position.set(-400, -300, -300);
        scene.add(light);
    }

    X = 20;
    Y = 1;
    Z = 20;

    const cube_material = new THREE.MeshStandardMaterial( { color: 0xFFFFFF, wireframe: false } );
    let cube = new THREE.BoxGeometry(1,1,1);

    const vertices = new Float32Array( [
        -0.5, -0.5, -0.5,
        -0.5, Y-0.5, -0.5,

        -0.5, Y-0.5, -0.5,
        X-0.5, Y-0.5, -0.5,

        X-0.5, Y-0.5, -0.5,
        X-0.5, -0.5, -0.5,

        X-0.5, -0.5, -0.5,
        -0.5, -0.5, -0.5,

        -0.5, -0.5, Z-0.5,
        -0.5, Y-0.5, Z-0.5,

        -0.5, Y-0.5, Z-0.5,
        X-0.5, Y-0.5, Z-0.5,

        X-0.5, Y-0.5, Z-0.5,
        X-0.5, -0.5, Z-0.5,

        X-0.5, -0.5, Z-0.5,
        -0.5, -0.5, Z-0.5,
    ] );
    let lines_geometry = new THREE.BufferGeometry();
    lines_geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    let lines = new THREE.LineSegments( lines_geometry, new THREE.LineBasicMaterial() );
    scene.add( lines );

    // initialize the occupancy grid, and two scratchpads
    grid = [];
    pad = [];
    pad2 = [];
    for(let x = 0; x < X; x++) {
        grid[x] = [];
        pad[x] = [];
        pad2[x] = [];
        for(let y = 0; y < Y; y++) {
            grid[x][y] = []
            pad[x][y] = []
            pad2[x][y] = []
            for(let z = 0; z < Z; z++) {
                grid[x][y][z] = 0;
                pad[x][y][z] = 0;
                pad2[x][y][z] = 0;
            }
        }
    }

    let cubes = [];

    // add some blobs
    let N = 0;
    N += add_blob(grid, cubes, 0, 0, 0, 10, 1, 10, 1);
    N += add_blob(grid, cubes, 15, 0, 15, 3, 1, 3, 2);

    // add blobs to scene
    let mesh = new THREE.InstancedMesh( cube, cube_material, N );
    mesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage ); // will be updated every frame
    scene.add( mesh );
    const dummy = new THREE.Object3D();
    let colors = [new THREE.Color(0xEEBB88), new THREE.Color(0x544EEBB)];
    for(let i = 0; i < N; i++) {
        dummy.position.set(cubes[i].x, cubes[i].y, cubes[i].z);
        dummy.updateMatrix();
        mesh.setMatrixAt( i, dummy.matrix );
        let id = grid[cubes[i].x][cubes[i].y][cubes[i].z];
        mesh.setColorAt( i, colors[id - 1] );
    }
    mesh.instanceMatrix.needsUpdate = true;

    camera.position.x = X / 2 + 3;
    camera.position.y = Y / 2 - X;
    camera.position.z = Z/2 + 1;
    camera.up.set(0, 0, 1);
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

    running = true;
    iStep = 0;
    steps_per_render = 1;

    function update_stats() {
        steps_text.innerHTML = "Steps: " + iStep + "<br>Steps per render: " + steps_per_render;
    }

    function render() {
        renderer.render( scene, camera );
        update_stats();
    }

    function move_cubes() {
        for(let i = 0; i < N; i++) {
            let moved = move_cube(grid, cubes, i, pad, pad2);
            if(moved) {
                dummy.position.set(cubes[i].x, cubes[i].y, cubes[i].z);
                dummy.updateMatrix();
                mesh.setMatrixAt( i, dummy.matrix );
            }
        }
    }

    function animate() {
        if(running) {
            for(let i = 0; i < steps_per_render; i++) {
                move_cubes();
                iStep++
            }
            mesh.instanceMatrix.needsUpdate = true;
            render();

            requestAnimationFrame(animate);
        }
    }

    function toggle_running() {
        running = !running;
        if(running)
            animate();
    }

    function run_faster() {
        steps_per_render *= 2;
        update_stats();
    }

    function run_slower() {
        if(steps_per_render > 1) {
            steps_per_render /= 2;
            update_stats();
        }
    }

    render();
    animate();
}
