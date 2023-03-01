function p3(x, y, z) { return {x: x, y: y, z: z}; }

function add_blob(grid, cubes, x0, y0, z0, sx, sy, sz, id) {
    // add a cuboid of cubes with id to the grid, with their positions in cubes
    let n_cubes_added = 0;
    for(let x = x0; x < x0 + sx; x++) {
        for(let y = y0; y < y0 + sy; y++) {
            for(let z = z0; z < z0 + sz; z++) {
                if(grid[x][y][z] != 0) {
                    console.log('Grid not empty at',x,y,z);
                    throw -1;
                }
                grid[x][y][z] = id;
                cubes.push( p3(x, y, z) );
                n_cubes_added++;
            }
        }
    }
    return n_cubes_added;
}

function get_neighborhood(p) {
    // return a list of the locations within the neighborhood of this location, plus the bounds
    const bounds = {
        x0: Math.max(0, p.x - 1),
        x1: Math.min(X-1, p.x + 1),
        y0: Math.max(0, p.y - 1),
        y1: Math.min(Y-1, p.y + 1),
        z0: Math.max(0, p.z - 1),
        z1: Math.min(Z-1, p.z + 1) };
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

function get_allowed_moves(grid, cubes, i, pad, pad2) {
    // collect the list of the places we can move to
    let neighborhood, bounds;
    [neighborhood, bounds] = get_neighborhood(cubes[i]);
    let move_candidates = [];
    let others = [];
    for(let iNeighborhood = 0; iNeighborhood < neighborhood.length; iNeighborhood++) {
        let p = neighborhood[iNeighborhood];
        if(grid[p.x][p.y][p.z] == 0)
            move_candidates.push(p);
        else if( (p.x != cubes[i].x || p.y != cubes[i].y || p.z != cubes[i].z) &&
                 grid[p.x][p.y][p.z] == grid[cubes[i].x][cubes[i].y][cubes[i].z] )
            // non-empty slot and has same id as central cube
            others.push(p);
    }
    // find which positions were connected to the central cube before any move
    find_connectivity(pad, cubes[i], others, neighborhood, bounds);
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

function move_cube(grid, cubes, i, pad, pad2) {
    // pick a random move
    const allowed_moves = get_allowed_moves(grid, cubes, i, pad, pad2);
    if(allowed_moves.length == 0)
        return false;
    const iMove = Math.floor(Math.random() * allowed_moves.length);
    const move = allowed_moves[iMove];
    // move
    grid[move.x][move.y][move.z] = grid[cubes[i].x][cubes[i].y][cubes[i].z];
    grid[cubes[i].x][cubes[i].y][cubes[i].z] = 0;
    cubes[i].x = move.x;
    cubes[i].y = move.y;
    cubes[i].z = move.z;
    return true;
}
