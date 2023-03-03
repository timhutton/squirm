window.onload = init;

function init() {

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    squirm_grid = new SquirmGrid(20, 20, 1);

    // add some blobs
    squirm_grid.add_blob(0, 0, 0, 10, 10, 1, 1);
    squirm_grid.add_blob(15, 15, 0, 3, 3, 1, 2);

    colors = [ '#EEBB88', '#44EEBB'];

    running = true;
    iStep = 0;
    steps_per_render = 1;
    cubes_per_step = squirm_grid.num_cubes();
    sleep_per_step = 0;

    render();
    animate();
}

function update_stats() {
    steps_text.innerHTML = "Steps: " + iStep + "<br>Steps per render: " + steps_per_render
        + "<br>Cubes per step: " + cubes_per_step
        + "<br>Sleep per step: " + sleep_per_step + "ms";
}

function render() {
    draw();
    update_stats();
}

function draw() {
    ctx.fillStyle = 'rgb(255,255,255)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let size = squirm_grid.size();
    let scale = Math.min( Math.floor(canvas.width / size.x ), Math.floor(canvas.height / size.y ));
    for(let i = 0; i < squirm_grid.num_cubes(); i++) {
        let p = squirm_grid.cube_location(i);
        let id = squirm_grid.grid_at(p);
        if( id > 0 ) {
            ctx.fillStyle = colors[id - 1];
            ctx.fillRect(p.x * scale, (size.y - 1 - p.y) * scale, scale, scale);
        }
    }
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(0, 0, size.x * scale, size.y * scale);
}

function move_cubes() {
    for(let i = 0; i < cubes_per_step; i++) {
        let iCube = Math.floor(Math.random() * squirm_grid.num_cubes());
        squirm_grid.move_cube(iCube);
    }
}

function animate() {
    if(running) {
        for(let i = 0; i < steps_per_render; i++) {
            move_cubes();
            iStep++
        }
        render();

        setTimeout(() => { requestAnimationFrame(animate); }, sleep_per_step);
    }
}

function toggle_running() {
    running = !running;
    if(running)
        animate();
}

function run_faster() {
    if(sleep_per_step > 0) {
        sleep_per_step = Math.max(sleep_per_step - 100, 0);
    }
    else if(cubes_per_step < squirm_grid.num_cubes()) {
        cubes_per_step = Math.min(cubes_per_step + 10, squirm_grid.num_cubes());
    }
    else {
        steps_per_render *= 2;
    }
    update_stats();
}

function run_slower() {
    if(steps_per_render > 1) {
        steps_per_render /= 2;
    }
    else if(cubes_per_step > 1) {
        cubes_per_step = Math.max(cubes_per_step -10, 1);
    }
    else {
        sleep_per_step += 100;
    }
    update_stats();
}
