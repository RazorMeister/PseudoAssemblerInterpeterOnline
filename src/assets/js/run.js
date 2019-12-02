var cur_state = 1;
var states;
var program;

//update tables
function show(direction) {
    //animate
    if(!animating) {
        let logo_y = getPos(document.getElementById("logo-id")).y;
        let button_y = getPos(document.getElementById("prev-next")).y;
        if(direction == "next") [logo_y, button_y] = [button_y, logo_y];
        spawnCharacters("run1", {x: 0, y: logo_y, w: canvas.width*0.01}, '#00f4a4');
        spawnCharacters("run2", {x: canvas.width, y: button_y, w: 0}, '#00f4a4');
        animating = 1, requestAnimationFrame(draw);
    }

    cur_state = Math.min(states.length-1, Math.max(1, cur_state));
    let cur_program = JSON.parse(JSON.stringify(program));
    cur_program[states[cur_state - 1].line] = '<div id="cur-line" style="display: inline">&rarr; ' + cur_program[states[cur_state - 1].line] + "</div>";
    $('#program').html('<h2>' + lang.run.program + '</h2>' + cur_program.join('<br>'));
    $('#results').html(formatData(states[cur_state]));
    
    $('#cur-line').addClass('animated flash');
	checkVisibility();
}

$('#prev').on('click', function() {
    cur_state--;
    show();
});

$('#next').on('click', function() {
    cur_state++;
    show("next");
});

//initialise
$('#run').on('click', function() {
    //format just in case
    $('#input').html(formatInput($('#input').html()));

    //check for errors
    let pure_text = $('#input').html().replace(/<br>/g, '\n').replace(/<[^>]*>|⭾/g, '').replace(/^#.*$/gm, '').replace(/^ +/gm, '').replace(/^\n/gm, '').split('\n');
    try {
        states = emulate(pure_text);
    } catch(err) {
        if(typeof(err) === 'string') err = [{message: err, line: -1}];

        //add error messages
        err.forEach(function(err, ind) {
            let hidden_lines = 0;
            if(err.line != -1) {
                //handle comment spaghetti
                let sans_html = $('#input').html().replace(/<br>/g, '\n').replace(/<[^>]*>|⭾/g, '').replace(/^ +/gm, '').split('\n');
                for(let i = 0; i < sans_html.length; i++) {
                    if(sans_html[i][0] == '#') hidden_lines++;
                    else if(sans_html[i] == pure_text[err.line]) break;
                }
            }

            let temp = $('#input').html().split('<br>');
            if(err.line == -1) temp.splice(0, 0, ''), err.line = 0;
            
            temp[err.line + hidden_lines] = `<div id="error-${ind}" style="float: left">${temp[err.line + hidden_lines]}&nbsp; <span class="error">${err.message}</span></div>`;
            temp = temp.join('<br>');
            $('#input').html(temp);

            //animate
            spawnCharacters("error", getPos(document.getElementById(`error-${ind}`)), '#ff446c');
            if(!animating) animating = 1, requestAnimationFrame(draw);

            $(`#error-${ind}`).addClass('animated shake');
            let node = document.querySelector(`#error-${ind}`);
            node.addEventListener('animationend', function() {
                $(`#error-${ind}`).removeClass('animated shake');
                node.removeEventListener('animationend', this);
                if (typeof callback === 'function') callback()
            });
        });
        
        return;
    }

    program = $('#input').html().replace(/<span class="comment">[^<]*<\/span><br>/gm, '').split('<br>');

    //change visibility of elements
    $('#errors').css('display', 'none');
    $('#run').css('display', 'none');
    $('#input').css('display', 'none');
    $('#prev-next').css('display', 'block');
    $('#program').css('display', 'block');
    $('#prev').css('opacity', '0');
    $('#prev').css('visibility', 'hidden');

    //show results
    show();
    $('#results').addClass('animated fadeIn');
    $('#program').addClass('animated fadeIn');
});

//state generation
function emulate(text) {
    let temp_states = [];
    let res = main_parse(text);

    if(res[1].length === 0) {
        let output = main_execute(res[0], res[2]);
        console.log(output);
        //throw errors if found
        if(output[1]) throw [{ message: output[1], line: output[2] }];

        let states_parser = output[0];
        for(let i = 0; i < states_parser.length; i++) {
            temp_states.push(translate(states_parser[i]));
        }
    } else {
        res[1].forEach(function(el, ind) {
            res[1][ind] = {message: el[0], line: el[1]};
        });
        throw res[1];
    }
    return temp_states;
}

function translate(state) {
    let res = {};
    res.registry = state.registers;
    res.status = state.sign_flag;
    res.memory = state.memory;
    res.line = state.line;
    res.reg_init = state.value_defined_registers;
    res.mem_init = state.value_defined_memory;
    res.variables = Object.keys(state.memory_labels);
    return res;
}

function formatData(data) {
    var registry_html = `<h3>` + lang.run.registers.header + `</h3>
    <div class="table-wrapper">
        <table class="default">
            <thead>
                <tr>
                    <th>` + lang.run.registers.address + `</th>
                    <th>` + lang.run.registers.value + `</th>
                </tr>
            </thead>
            <tfoot>
            ${data.registry.reduce(function(accumulator, val, ind) {
                if(!data.reg_init[ind]) return accumulator;
                return accumulator +
                `<tr>
                    <td><span class="number">${ind}</span></td>
                    <td><b>${val}</b></td>
                </tr>`
            }, '') + 
            `<tr>
                <td>` + lang.run.registers.state + `</td>
                <td><span class="keyword">${data.status}</span></td>
            </tr>`}
            </tfoot>
        </table>
    </div>`;

    var memory_html = `<h3>` + lang.run.memory.header + `</h3>
    <div class="table-wrapper">
        <table class="default">
            <thead>
                <tr>
                    <th>` + lang.run.memory.address + `</th>
                    <th>` + lang.run.memory.var + `</th>
                    <th>` + lang.run.memory.value + `</th>
                </tr>
            </thead>
            <tfoot>
            ${data.memory.reduce(function(accumulator, val, ind) {
                if(!data.mem_init[ind]) return accumulator;
                return accumulator +
                `<tr>
                    <td><span class="number">${ind*4}</span></td>
                    <td><span class="keyword">${data.variables[ind]}</span></td>
                    <td><b>${val}</b></td>
                </tr>`
            }, '')}
            </tfoot>
        </table>
    </div>`;

    return `<div class="row">
    <div class="col-md-4" id="registers">${registry_html}</div>
    <div class="col-md-8" id="memory">${memory_html}</div>
    </div>`;
}

function checkVisibility() {
	if (cur_state == 1) {
		$('#prev').css('opacity', '0');
		$('#next').css('opacity', '1');
		$('#prev').css('visibility', 'hidden');
		$('#next').css('visibility', 'visible');
	} else if (cur_state == states.length-1) {
		$('#prev').css('opacity', '1');
		$('#next').css('opacity', '0');
		$('#prev').css('visibility', 'visible');
		$('#next').css('visibility', 'hidden');
	} else {
		$('#prev').css('opacity', '1');
		$('#next').css('opacity', '1');
		$('#prev').css('visibility', 'visible');
		$('#next').css('visibility', 'visible');
	}
}