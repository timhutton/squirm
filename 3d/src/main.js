window.onload = function() {
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth * 0.8, window.innerHeight * 0.8 );
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    document.body.appendChild( renderer.domElement );

    let startstop_button = document.createElement("button");
    startstop_button.innerHTML = "Pause / Run";
    startstop_button.onclick = toggle_running;
    startstop_button.style.width = "300px";
    startstop_button.style.height = "100px";
    document.body.appendChild(startstop_button);

    {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.PointLight(color, intensity);
        light.position.set(0, 1000, 400);
        scene.add(light);
    }
    {
        const color = 0x87CEEB;
        const intensity = 1;
        const light = new THREE.PointLight(color, intensity);
        light.position.set(400, -300, -300);
        scene.add(light);
    }
    {
        const color = 0xEB87CE;
        const intensity = 1;
        const light = new THREE.PointLight(color, intensity);
        light.position.set(-400, -300, -300);
        scene.add(light);
    }

    X = 10;
    Y = 10;
    Z = 10;

    const cube_material = new THREE.MeshStandardMaterial( { color: 0xffffff, wireframe: false } );
    let cube = new THREE.BoxGeometry(1,1,1);

    let plane_material = new THREE.MeshStandardMaterial( { color: 0xCEEB87, wireframe: false, side: THREE.DoubleSide } );
    let plane_geometry = new THREE.PlaneGeometry(X, Y);
    let plane1 = new THREE.Mesh(plane_geometry, plane_material);
    let plane2 = new THREE.Mesh(plane_geometry, plane_material);
    plane1.position.set(X/2, Y/2, 0);
    plane2.position.set(X/2, Y/2, Z);
    scene.add( plane1 );
    scene.add( plane2 );

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

    function p3(x, y, z) { return {x: x, y: y, z: z}; }

    let pos = [];

    function add_blob(x0, y0, z0, sx, sy, sz, id) {
        let n_cubes_added = 0;
        for(let x = x0; x < x0 + sx; x++) {
            for(let y = y0; y < y0 + sy; y++) {
                for(let z = z0; z < z0 + sz; z++) {
                    if(grid[x][y][z] != 0) {
                        console.log('Grid not empty at',x,y,z);
                        throw -1;
                    }
                    grid[x][y][z] = id;
                    pos.push( p3(x, y, z) );
                    n_cubes_added++;
                }
            }
        }
        return n_cubes_added;
    }

    // add some blobs
    let N = 0;
    N += add_blob(0,0,0,2,2,2,1);
    N += add_blob(5,5,5,2,2,2,2);

    let mesh = new THREE.InstancedMesh( cube, cube_material, N );
    mesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage ); // will be updated every frame
    scene.add( mesh );

    camera.position.x = X / 2 + 3;
    camera.position.y = Y / 2 - 20;
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
    const dummy = new THREE.Object3D();

    running = true;
    iRender = 0;
    steps_per_render = 1;

    function render() {
        renderer.render( scene, camera );
    }

    function get_neighborhood(i) {
        // return a list of the locations within the neighborhood of this cube, plus the bounds
        const bounds = {
            x0: Math.max(0, pos[i].x - 1),
            x1: Math.min(X-1, pos[i].x + 1),
            y0: Math.max(0, pos[i].y - 1),
            y1: Math.min(Y-1, pos[i].y + 1),
            z0: Math.max(0, pos[i].z - 1),
            z1: Math.min(Z-1, pos[i].z + 1) };
        let neighborhood = [];
        for(let x = bounds.x0; x <= bounds.x1; x++) {
            for(let y = bounds.y0; y <= bounds.y1; y++) {
                for(let z = bounds.z0; z <= bounds.z1; z++) {
                    neighborhood.push( p3(x, y, z) );
                }
            }
        }
        return [neighborhood, bounds];
    }

    function in_bounds(p, bounds) {
        return p.x >= bounds.x0 && p.x <= bounds.x1 && p.y >= bounds.y0 && p.y <= bounds.y1 && p.z >= bounds.z0 && p.z <= bounds.z1;
    }

    function get_face_neighbors(p) {
        return [p3(p.x-1, p.y, p.z), p3(p.x+1, p.y, p.z),
                p3(p.x, p.y-1, p.z), p3(p.x, p.y+1, p.z),
                p3(p.x, p.y, p.z-1), p3(p.x, p.y, p.z+1)];
    }

    function get_face_neighbors_within_bounds(p, bounds) {
        let face_neighbors = get_face_neighbors(p);
        let face_neighbors_within_bounds = [];
        for(let iNeighbor = 0; iNeighbor < face_neighbors.length; iNeighbor++) {
            if(in_bounds(face_neighbors[iNeighbor], bounds))
                face_neighbors_within_bounds.push(face_neighbors[iNeighbor]);
        }
        return face_neighbors_within_bounds;
    }

    function find_connectivity(scratchpad, c, others, neighborhood, bounds) {
        // fills scratchpad with 0 = empty/irrelevant, 1 = connected, 2 = disconnected for cubes in (c, others)
        for(let iNeighborhood = 0; iNeighborhood < neighborhood.length; iNeighborhood++) {
            let p = neighborhood[iNeighborhood];
            scratchpad[p.x][p.y][p.z] = 0; // empty (or other id)
        }
        scratchpad[c.x][c.y][c.z] = 1; // connected
        for(let iOther = 0; iOther < others.length; iOther++) {
            let p = others[iOther];
            scratchpad[p.x][p.y][p.z] = 2; // disconnected (initially)
        }
        // spread connectivity until converged
        let last_added = [c];
        while(last_added.length > 0) {
            let p = last_added.shift();
            let face_neighbors_within_bounds = get_face_neighbors_within_bounds(p, bounds);
            for(let iNeighbor = 0; iNeighbor < face_neighbors_within_bounds.length; iNeighbor++) {
                let p = face_neighbors_within_bounds[iNeighbor];
                if(scratchpad[p.x][p.y][p.z] == 2) {
                    scratchpad[p.x][p.y][p.z] = 1; // is now connected
                    last_added.push(p);
                }
            }
        }
    }

    function get_allowed_moves(i) {
        // collect the list of the places we can move to
        let neighborhood, bounds;
        [neighborhood, bounds] = get_neighborhood(i);
        let move_candidates = [];
        let others = [];
        for(let iNeighborhood = 0; iNeighborhood < neighborhood.length; iNeighborhood++) {
            let p = neighborhood[iNeighborhood];
            if(grid[p.x][p.y][p.z] == 0)
                move_candidates.push(p);
            else if( (p.x != pos[i].x || p.y != pos[i].y || p.z != pos[i].z) &&
                     grid[p.x][p.y][p.z] == grid[pos[i].x][pos[i].y][pos[i].z] )
                // non-empty slot and has same id as central cube
                others.push(p);
        }
        // find which positions were connected to the central cube before any move
        find_connectivity(pad, pos[i], others, neighborhood, bounds);
        // for each move candidate, see if it disconnects any cube
        let allowed_moves = [];
        for(let iMove = 0; iMove < move_candidates.length; iMove++) {
            let move = move_candidates[iMove];
            find_connectivity(pad2, move, others, neighborhood, bounds);
            let found_disconnection = false;
            for(let iOther = 0; iOther < others.length; iOther++) {
                let connectivity_before = pad[others[iOther].x][others[iOther].y][others[iOther].z];
                let connectivity_after = pad2[others[iOther].x][others[iOther].y][others[iOther].z];
                if(connectivity_before == 1 && connectivity_after == 2) {
                    found_disconnection = true;
                    break;
                }
            }
            if(!found_disconnection)
                allowed_moves.push(move);
        }
        return allowed_moves;
    }

    function move_cube(i) {
        // pick a random move
        const allowed_moves = get_allowed_moves(i);
        if(allowed_moves.length == 0)
            return false;
        const iMove = Math.floor(Math.random() * allowed_moves.length);
        const move = allowed_moves[iMove];
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
        if(running) {
            for(let iStep = 0; iStep < steps_per_render; iStep++)
                move_cubes();
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

    document.addEventListener("keydown", onDocumentKeyDown, false);
    function onDocumentKeyDown(event) {
        switch(event.key) {
            case ' ':
                toggle_running();
                break;
            case '+':
                if(running)
                    steps_per_render *= 2;
                break;
            case '-':
                if(running && steps_per_render > 1)
                    steps_per_render /= 2;
                break;
        }
    }

    for(let i = 0; i < N; i++) {
        dummy.position.set(pos[i].x, pos[i].y, pos[i].z);
        dummy.updateMatrix();
        mesh.setMatrixAt( i, dummy.matrix );
    }
    mesh.instanceMatrix.needsUpdate = true;
    render();
    animate();
}
