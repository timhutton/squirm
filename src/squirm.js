function p3(x, y, z) { return {x: x, y: y, z: z}; }

class SquirmGrid {

    constructor(X, Y, Z) {
        this.X = X;
        this.Y = Y;
        this.Z = Z;

        // initialize the occupancy grid, and two scratchpads
        this.grid = [];
        this.pad = [];
        this.pad2 = [];
        for(let x = 0; x < this.X; x++) {
            this.grid[x] = [];
            this.pad[x] = [];
            this.pad2[x] = [];
            for(let y = 0; y < this.Y; y++) {
                this.grid[x][y] = []
                this.pad[x][y] = []
                this.pad2[x][y] = []
                for(let z = 0; z < this.Z; z++) {
                    this.grid[x][y][z] = 0;
                    this.pad[x][y][z] = 0;
                    this.pad2[x][y][z] = 0;
                }
            }
        }
        // initialize the list of cube locations
        this.cubes = [];
    }

    size() { return p3(this.X, this.Y, this.Z); }
    cube_location(i) { return this.cubes[i]; }
    grid_at(p) { return this.grid[p.x][p.y][p.z]; }
    num_cubes() { return this.cubes.length; }

    add_blob(x0, y0, z0, sx, sy, sz, id) {
        // add a cuboid of cubes with id to the grid, with their positions in cubes
        for(let x = x0; x < x0 + sx; x++) {
            for(let y = y0; y < y0 + sy; y++) {
                for(let z = z0; z < z0 + sz; z++) {
                    if(this.grid[x][y][z] != 0) {
                        console.log('Grid not empty at',x,y,z);
                        throw -1;
                    }
                    this.grid[x][y][z] = id;
                    this.cubes.push( p3(x, y, z) );
                }
            }
        }
    }

    get_neighborhood(p) {
        // return a list of the locations within the neighborhood of this location, plus the bounds
        const bounds = {
            x0: Math.max(0, p.x - 1),
            x1: Math.min(this.X-1, p.x + 1),
            y0: Math.max(0, p.y - 1),
            y1: Math.min(this.Y-1, p.y + 1),
            z0: Math.max(0, p.z - 1),
            z1: Math.min(this.Z-1, p.z + 1) };
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

    in_bounds(p, bounds) {
        return p.x >= bounds.x0 && p.x <= bounds.x1 && p.y >= bounds.y0 && p.y <= bounds.y1 && p.z >= bounds.z0 && p.z <= bounds.z1;
    }

    get_face_neighbors(p) {
        return [p3(p.x-1, p.y, p.z), p3(p.x+1, p.y, p.z),
                p3(p.x, p.y-1, p.z), p3(p.x, p.y+1, p.z),
                p3(p.x, p.y, p.z-1), p3(p.x, p.y, p.z+1)];
    }

    get_face_neighbors_within_bounds(p, bounds) {
        let face_neighbors = this.get_face_neighbors(p);
        let face_neighbors_within_bounds = [];
        for(let iNeighbor = 0; iNeighbor < face_neighbors.length; iNeighbor++) {
            if(this.in_bounds(face_neighbors[iNeighbor], bounds))
                face_neighbors_within_bounds.push(face_neighbors[iNeighbor]);
        }
        return face_neighbors_within_bounds;
    }

    find_connectivity(scratchpad, c, others, neighborhood, bounds) {
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
            let face_neighbors_within_bounds = this.get_face_neighbors_within_bounds(p, bounds);
            for(let iNeighbor = 0; iNeighbor < face_neighbors_within_bounds.length; iNeighbor++) {
                let p = face_neighbors_within_bounds[iNeighbor];
                if(scratchpad[p.x][p.y][p.z] == 2) {
                    scratchpad[p.x][p.y][p.z] = 1; // is now connected
                    last_added.push(p);
                }
            }
        }
    }

    get_allowed_moves(i) {
        // collect the list of the places we can move to
        let neighborhood, bounds;
        [neighborhood, bounds] = this.get_neighborhood(this.cubes[i]);
        let move_candidates = [];
        let others = [];
        for(let iNeighborhood = 0; iNeighborhood < neighborhood.length; iNeighborhood++) {
            let p = neighborhood[iNeighborhood];
            if(this.grid[p.x][p.y][p.z] == 0)
                move_candidates.push(p);
            else if( (p.x != this.cubes[i].x || p.y != this.cubes[i].y || p.z != this.cubes[i].z) &&
                     this.grid[p.x][p.y][p.z] == this.grid[this.cubes[i].x][this.cubes[i].y][this.cubes[i].z] )
                // non-empty slot and has same id as central cube
                others.push(p);
        }
        // find which positions were connected to the central cube before any move
        this.find_connectivity(this.pad, this.cubes[i], others, neighborhood, bounds);
        // for each move candidate, see if it disconnects any cube
        let allowed_moves = [];
        for(let iMove = 0; iMove < move_candidates.length; iMove++) {
            let move = move_candidates[iMove];
            this.find_connectivity(this.pad2, move, others, neighborhood, bounds);
            let found_disconnection = false;
            for(let iOther = 0; iOther < others.length; iOther++) {
                let connectivity_before = this.pad[others[iOther].x][others[iOther].y][others[iOther].z];
                let connectivity_after = this.pad2[others[iOther].x][others[iOther].y][others[iOther].z];
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

    move_cube(i) {
        // pick a random move
        const allowed_moves = this.get_allowed_moves(i);
        if(allowed_moves.length == 0)
            return false;
        const iMove = Math.floor(Math.random() * allowed_moves.length);
        const move = allowed_moves[iMove];
        // move
        this.grid[move.x][move.y][move.z] = this.grid[this.cubes[i].x][this.cubes[i].y][this.cubes[i].z];
        this.grid[this.cubes[i].x][this.cubes[i].y][this.cubes[i].z] = 0;
        this.cubes[i].x = move.x;
        this.cubes[i].y = move.y;
        this.cubes[i].z = move.z;
        return true;
    }

}