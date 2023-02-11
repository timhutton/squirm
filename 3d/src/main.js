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

    let X = 20;
    let Y = 20;
    let Z = 20;
    let N = 40;
    let mesh = new THREE.InstancedMesh( cube, cube_material, N );
    mesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage ); // will be updated every frame
    scene.add( mesh );

    camera.position.x = 15;
    camera.position.y = 26;
    camera.position.z = 25;

    // initialize empty grid
    let grid = [];
    for(let x = 0; x < X; x++) {
        grid[x] = [];
        for(let y = 0; y < Y; y++) {
            grid[x][y] = []
            for(let z = 0; z < Z; z++) {
                grid[x][y][z] = 0;
            }
        }
    }

    function p(x, y, z) { return {x: x, y: y, z: z}; }

    // add cubes at random unoccupied locations
    let pos = [];
    for(let i = 0; i < N; i++) {
        do {
            x = Math.floor(Math.random() * X);
            y = Math.floor(Math.random() * Y);
            z = Math.floor(Math.random() * Z);
        } while(grid[x][y][z] != 0);
        grid[x][y][z] = 1;
        pos[i] = p(x, y, z);
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
    const dummy = new THREE.Object3D();

    function render() {
        renderer.render( scene, camera );
    }

    function get_move_candidates(i) {
        // return a list of the unoccupied cells within one step
        const x0 = Math.max(0, pos[i].x - 1);
        const x1 = Math.min(X-1, pos[i].x + 1);
        const y0 = Math.max(0, pos[i].y - 1);
        const y1 = Math.min(Y-1, pos[i].y + 1);
        const z0 = Math.max(0, pos[i].z - 1);
        const z1 = Math.min(Y-1, pos[i].z + 1);
        let candidates = [];
        for(let x = x0; x <= x1; x++) {
            for(let y = y0; y <= y1; y++) {
                for(let z = z0; z <= z1; z++) {
                    if(grid[x][y][z] == 0)
                        candidates.push(p(x, y, z));
                }
            }
        }
        return candidates;
    }

    function move_cube(i) {
        // pick a random move
        const move_candidates = get_move_candidates(i);
        const iMove = Math.floor(Math.random() * move_candidates.length);
        const move = move_candidates[iMove];
        // move
        grid[move.x][move.y][move.z] = grid[pos[i].x][pos[i].y][pos[i].z];
        grid[pos[i].x][pos[i].y][pos[i].z] = 0;
        pos[i].x = move.x;
        pos[i].y = move.y;
        pos[i].z = move.z;
        return true;
    }

    function move_cubes() {
        for(let i = 0; i < N; i++) {
            let moved = move_cube(i);
            if(moved) {
                dummy.position.set(pos[i].x, pos[i].y, pos[i].z);
                dummy.updateMatrix();
                mesh.setMatrixAt( i, dummy.matrix );
            }
        }
    }

    function animate() {
        move_cubes();
        mesh.instanceMatrix.needsUpdate = true;
        render();

        const fps = 30;
        setTimeout(() => {
            requestAnimationFrame(animate);
        }, 1000 / fps);
    }

    animate();
}
