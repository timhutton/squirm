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

