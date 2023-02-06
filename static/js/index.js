// ------------------- First Column 

// Custom Context Menu
const contextMenu = document.querySelector(".wrapper");
var delete_btn = document.getElementById("delete");
var close_btn = document.getElementById("close");

// Setting up the canvas
let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");
canvas.height = 360;
canvas.width = 360;
const rect = canvas.getBoundingClientRect();

// Drawing the unit circle and axis
function setUpCanvas(){
    context.beginPath();
    context.arc(180, 180, 160, 0, 2 * Math.PI, false);
    context.lineWidth = 1;
    context.strokeStyle = "black";
    context.stroke();

    context.beginPath();
    context.moveTo(0, 180);
    context.lineTo(360, 180);
    context.lineWidth = 0.5;
    context.stroke();

    context.beginPath();
    context.moveTo(180, 0);
    context.lineTo(180, 360);
    context.lineWidth = 0.5;
    context.stroke();
};

setUpCanvas();

// Getting graph buttons
var filter_btn = document.getElementsByName("filter_btn");
var clear_btn = document.getElementById("clear_btn");

var draw_shape = "zero";
filter_btn[0].onchange = function () {
    draw_shape = "zero"
};
filter_btn[1].onchange = function () {
    draw_shape = "pole";
};

// setting up variables for drawing
var startX = 0;
var startY = 0;
var endX = 360;
var endY = 360;

let shapes = []
let zeros = []
let poles = []

let selected_shape = null;
var draw_phase = false;
var move_phase = false;

// Drawing Shapes
function drawZero(x , y){
    context.beginPath();
    context.arc(x, y, 6, 0, 2 * Math.PI, false);
    context.lineWidth = 1;

    context.fillStyle = "#296d98";
    context.fill();
    context.strokeStyle = "black";
    context.stroke();
};

function drawPole(x , y){
        context.beginPath();
        context.lineWidth = 2.5;
        context.strokeStyle = "red";

        context.moveTo(x - 6, y - 6);
        context.lineTo(x + 6, y + 6);

        context.moveTo(x + 6, y - 6);
        context.lineTo(x - 6, y + 6);
        
        context.stroke();
};

// Moving Shapes
function is_mouse_in_shape(shape) {
    let left = shape.x - 6;
    let right = shape.x + 6;
    let top = shape.y - 6;
    let bottom = shape.y + 6;

    if (left < startX && right > startX && top < startY && bottom > startY) {
        return true;
    }
    return false;
};

function drawShapes(shapes){
    context.clearRect(0, 0, canvas.width, canvas.height);
    setUpCanvas();

    for (let shape of shapes) {
        if (shape.type == "zero"){
            drawZero(shape.x , shape.y);
        }
        else {
            drawPole(shape.x , shape.y);
        }
    }
};

// Mouse Events
canvas.onclick= (event) => {
    contextMenu.style.visibility = "hidden";
    draw_phase = true;
    startX = parseInt(event.clientX - rect.left);
    startY = parseInt(event.clientY - rect.top);

    for (let shape of shapes) {
        if (is_mouse_in_shape(shape)) {
        draw_phase = false;
        }
    }

    if (draw_phase) {
        draw_phase = false;
        if (draw_shape == "zero"){
            drawZero(startX, startY);
            shapes.push({ x: startX, y: startY, type: "zero" }); 
        }
        else{
            drawPole(startX, startY);
            shapes.push({ x: startX, y: startY, type: "pole" });
        }
        convertToPolar(shapes);
    }
}

canvas.onmousedown = (event) => {
    startX = parseInt(event.clientX - rect.left);
    startY = parseInt(event.clientY - rect.top);
    let index = 0;
    for (let shape of shapes) {
        if (is_mouse_in_shape(shape)) {
        selected_shape = index;
        move_phase = true;
        }
        index++;
    }

};

canvas.onmouseup = () => {
    if (move_phase){
        move_phase = false;
    }
    // convertToPolar(shapes);
};

canvas.onmousemove = (event) => {
    if (move_phase) {
        endX = parseInt(event.clientX - rect.left);
        endY = parseInt(event.clientY - rect.top);
        let dx = endX - startX;
        let dy = endY - startY;
        let current_shape = shapes[selected_shape];
        current_shape.x += dx;
        current_shape.y += dy;
        drawShapes(shapes);
        convertToPolar(shapes);
        startX = endX;
        startY = endY;
    }
};

// Delete Elements
canvas.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    startX = e.offsetX, startY = e.offsetY;
    let menu = false
    let index = 0;
    for (let shape of shapes) {
        if (is_mouse_in_shape(shape)) {
        selected_shape = index;
        menu = true;
        }
        index++;
    }
    if (menu){
        contextMenu.style.left = `${startX}px`;
        contextMenu.style.top = `${startY + 130}px`;
        contextMenu.style.visibility = "visible";
    }
});

// Menu Buttons
close_btn.onclick = () => {
    contextMenu.style.visibility = "hidden";
};

delete_btn.onclick = () => {
    contextMenu.style.visibility = "hidden";
    shapes.splice(selected_shape, 1);
    drawShapes(shapes);
    convertToPolar(shapes);
};

// Clear Button 
clear_btn.onclick = function () {
    shapes = [];
    drawShapes(shapes);
    convertToPolar(shapes);
};


// Converting to polar coordinates
function convertToPolar(shapes){
    zeros = []
    poles = []
    let x = 0;
    let y = 0;
    for (let shape of shapes) {
        x = (shape.x - 180) / 160
        y = - (shape.y - 180) / 160;

        if (shape.type == "zero"){
            zeros.push({real: x, img: y})
        }
        else{
            poles.push({real: x, img: y})
        }
    }
    getResponse();
};

// ----------------------------------------------------------

// ------------------- Second Column 

var allpass_btn = document.getElementById("allpass_btn");

// Getting Mag and Phase Response from Back-End
function getResponse () {
    $.ajax({
        contentType: "application/json;charset=utf-8",
        url: 'http://127.0.0.1:5000/complex',
        type: 'POST',
        data: JSON.stringify([poles, zeros]),
        dataType: 'json',
        success: function (data) {
            freq = data["freq"];
            mag_gain = data["mag"];
            phase_gain = data["phase"];

            var magnitude_update = {'x': [freq], 'y': [mag_gain]};
            var phase_update = {'x': [freq], 'y': [phase_gain]};

            Plotly.update("magnitude_response", magnitude_update);
            Plotly.update("phase_response", phase_update);

        }
    })
};

// Plotting Mag and Phase Response with plotly
function drawResponse(div, freq, gain, graph_title, ylabel){
    
    // Prepare The data
    var response = {
        x: freq,
        y: gain,
        type: "scatter",
        mode: "lines"
    };
    
    // Prepare the graph and plotting
    var layout = {
        width: 550,
        height: 250,
        margin: { t: 35, b:45, l:55, r:20 },

        xaxis: {title: 'Frequency [Hz]'},
        yaxis: {title: ylabel},
        title: graph_title
    };

    var data = [response];

    Plotly.newPlot(div, data, layout);
};

// Setup The Initial Plot
drawResponse("magnitude_response", [], [], "Frequency Response", "Amplitude [dB]");
drawResponse("phase_response", [], [], "Phase Response", "Angle [radians]");


allpass_btn.onclick = function () {
    console.log("waiting for code")
};

// ----------------------------------------------------------

// ------------------- Third Column 

// Buttons and setting up plot
var generate_btn = document.getElementById("generate_btn");
var import_signal_btn = document.getElementById("import_signal_btn");

function setUpPlot(div, time, amp, graph_title){
    // Prepare The data
    var plot = {
        x: time,
        y: amp,
        type: "scatter",
        mode: "lines"
    };
    
    // Prepare the graph and plotting
    var layout = {
        width: 400,
        height: 170,
        margin: { t: 25, b:35, l:40, r:5 },

        xaxis: {title: 'Time [s]', range: [0,3]},
        yaxis: {title: "Amplitude"},
        title: graph_title
    };

    var data = [plot];

    Plotly.newPlot(div, data, layout);
};

// Initialize Signal plot
setUpPlot("input_signal", [], [], "Input");
setUpPlot("output_signal", [], [], "Output");


// Generation Pad Initalization
let pad = document.getElementById("pad");
let ctx = pad.getContext("2d");
pad.height = 150;
pad.width = 400;
const pad_rect = pad.getBoundingClientRect();

// Setup the pad axis
ctx.beginPath();
ctx.moveTo(200, 0);
ctx.strokeStyle = "white";
ctx.lineTo(200, 200);
ctx.lineWidth = 0.5;
ctx.stroke();

// Generate Signal
var generate_phase = true;
var input_y = 0;
var t = 0;

// Generating input on mousemove
pad.onmousemove = (event) => {
    if (generate_phase) {
        input_y = parseInt(event.clientX - pad_rect.left - 200);
        let filter_point = updateOutput(input_y);

        Plotly.extendTraces("input_signal", { y: [[input_y]], x: [[t]] }, [0]);
        Plotly.extendTraces("output_signal", { y: [[filter_point]], x: [[t]] }, [0]);
        t+=0.02

        if ( t >= 3 ){
            var update_range = {'xaxis.range': [t-2.5, t+0.5]};
            Plotly.relayout("input_signal", update_range);
            Plotly.relayout("output_signal", update_range);
            }
        }
};

function updateOutput (y_point) {
    $.ajax({
        url: 'http://127.0.0.1:5000/generated',
        type: 'POST',
        data: {
            'y_point': y_point
        },
        dataType: 'json',
        success: function (response) {
            return response["y_point"];
        }
    });
};

// Generate Button 
generate_btn.onclick = () => {
    setUpPlot("input_signal", [], [], "Input");
    setUpPlot("output_signal", [], [], "Output");
    generate_phase = true;
    t = 0;
};




// Import Signal
import_signal_btn.onclick = function () {

    setUpPlot("input_signal", [], [], "Input");
    setUpPlot("output_signal", [], [], "Output");
    generate_phase = false;

    var form_data = new FormData($('#upload-csv')[0]);

    $.ajax({
        type: "POST",
        url: "http://127.0.0.1:5000/csv",
        data: form_data,
        contentType: false,
        cache: false,
        processData: false,
        async: true,
        success: function (data) {
            x_axis = data["x_axis"];
            y_axis = data["y_axis"];
            filterd_signal = data["filterd_signal"];

            // plot input and output dynamically 
            for (let i = 1 ; i < x_axis.length; i++){
                Plotly.extendTraces("input_signal", { y: [[y_axis[i]]], x :[[x_axis[i]]] } ,[0]);
                Plotly.extendTraces("output_signal", { y: [[filterd_signal[i]]], x :[[x_axis[i]]] } ,[0]);
            }
        }
    });
};