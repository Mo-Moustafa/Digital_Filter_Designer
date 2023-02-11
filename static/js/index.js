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
function setUpCanvas() {
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
function drawZero(x, y) {
    context.beginPath();
    context.arc(x, y, 6, 0, 2 * Math.PI, false);
    context.lineWidth = 1;

    context.fillStyle = "#296d98";
    context.fill();
    context.strokeStyle = "black";
    context.stroke();
};

function drawPole(x, y) {
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

function drawShapes(shapes) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    setUpCanvas();

    for (let shape of shapes) {
        if (shape.type == "zero") {
            drawZero(shape.x, shape.y);
        }
        else {
            drawPole(shape.x, shape.y);
        }
    }
};

// Mouse Events
canvas.onclick = (event) => {
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
        if (draw_shape == "zero") {
            drawZero(startX, startY);
            shapes.push({ x: startX, y: startY, type: "zero" });
        }
        else {
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
    if (move_phase) {
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
canvas.addEventListener('contextmenu', function (e) {
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
    if (menu) {
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
function convertToPolar(shapes) {
    zeros = []
    poles = []
    let x = 0;
    let y = 0;
    for (let shape of shapes) {
        x = (shape.x - 180) / 160
        y = - (shape.y - 180) / 160;

        if (shape.type == "zero") {
            zeros.push({ real: x, img: y })
        }
        else {
            poles.push({ real: x, img: y })
        }
    }
    getResponse();
};

function convertToPixels(zeros, poles) {
    let shapes = []
    let x = 0;
    let y = 0;
    for (let zero of zeros) {
        x = (zero["real"] * 160) + 180
        y = (zero["img"] * 160) + 180
        shapes.push({ x: x, y: y, type: "zero" });
    }
    for (let pole of poles) {
        x = (pole["real"] * 160) + 180
        y = (pole["img"] * 160) + 180
        shapes.push({ x: x, y: y, type: "pole" });
    }
    // console.log(zeros)
    // console.log(poles)
    // console.log(shapes)

    drawShapes(shapes);


    getResponse();

};


// ----------------------------------------------------------

// ------------------- Second Column 

// Getting Mag and Phase Response from Back-End


function getResponse() {
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

            var magnitude_update = { 'x': [freq], 'y': [mag_gain] };
            var phase_update = { 'x': [freq], 'y': [phase_gain] };

            Plotly.update("magnitude_response", magnitude_update);
            Plotly.update("phase_response", phase_update);
            Plotly.update("current_apf_graph", phase_update);


        }
    })
};

// Plotting Mag and Phase Response with plotly
function drawResponse(div, freq, gain, graph_title, ylabel) {

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
        margin: { t: 35, b: 45, l: 55, r: 20 },

        xaxis: { title: 'Frequency [Hz]' },
        yaxis: { title: ylabel },
        title: graph_title
    };

    var data = [response];

    Plotly.newPlot(div, data, layout);
};

// Setup The Initial Plot
drawResponse("magnitude_response", [], [], "Frequency Response", "Amplitude [dB]");
drawResponse("phase_response", [], [], "Phase Response", "Angle [radians]");

// ----------------------------------------------------------

// ------------------- Third Column 

// Buttons and setting up plot
var generate_btn = document.getElementById("generate_btn");
var import_signal_btn = document.getElementById("import_signal_btn");

function setUpPlot(div, time, amp, graph_title) {
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
        margin: { t: 25, b: 35, l: 40, r: 5 },

        xaxis: { title: 'Time [s]', range: [0, 3] },
        yaxis: { title: "Amplitude" },
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
        let filtered_point = updateOutput(input_y);

        Plotly.extendTraces("input_signal", { y: [[input_y]], x: [[t]] }, [0]);
        Plotly.extendTraces("output_signal", { y: [[filtered_point]], x: [[t]] }, [0]);
        t += 0.02

        if (t >= 3) {
            var update_range = { 'xaxis.range': [t - 2.5, t + 0.5] };
            Plotly.relayout("input_signal", update_range);
            Plotly.relayout("output_signal", update_range);
        }
    }
};

function updateOutput(y_point) {
    $.ajax({
        url: 'http://127.0.0.1:5000/generated',
        type: 'POST',
        data: JSON.stringify({ y_point }),
        cache: false,
        dataType: 'json',
        async: false,
        contentType: 'application/json',
        processData: false,

        success: function (response) {
            signal_output = response["y_point"];
        },
    });
    return signal_output;
};

// Generate Button 
generate_btn.onclick = () => {
    setUpPlot("input_signal", [], [], "Input");
    setUpPlot("output_signal", [], [], "Output");
    generate_phase = true;
    t = 0;
};


// Import Signal
import_signal_btn.onchange = function () {

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
            function getData() {
                return Math.random();
            }

            Plotly.plot('input_signal', [{
                y: [getData()],
                type: 'line'
            }]);

            setInterval( function plot() {

                Plotly.extendTraces('input_signal', { y: [[getData()]] }, [0]);
                alert(suii)
            }(), 500);
        
        }
    });
};


// ----------------------------------------------------------

// ------------------- All-Pass Filters

// Open and close the page
var allpass_btn = document.getElementById("allpass_btn");
var all_pass_wrapper = document.getElementById("all_pass_wrapper");
var all_pass_close = document.getElementById("all_pass_close");

allpass_btn.onclick = function () {
    all_pass_wrapper.style.scale = "1";
};
all_pass_close.onclick = function () {
    all_pass_wrapper.style.scale = "0";
};

// Initailize the response
function drawAPFResponse(div, freq, gain) {
    // Prepare The data
    var response = {
        x: freq,
        y: gain,
        type: "scatter",
        mode: "lines"
    };

    // Prepare the graph and plotting
    var layout = {
        width: 500,
        height: 255,
        margin: { t: 25, b: 35, l: 40, r: 10 },

        xaxis: { title: 'Frequency [Hz]' },
        yaxis: { title: "Angle [radians]" },
    };

    var data = [response];

    Plotly.newPlot(div, data, layout);
};

drawAPFResponse("current_apf_graph", [], []);
drawAPFResponse("cumulative_apf_graph", [], []);



// Get A value from input data
let a_real = document.getElementById("a_real");
let a_img = document.getElementById("a_img");
var add_filter_btn = document.getElementById("add_filter_btn");
var apf_filters_container = document.getElementById("added_content");
var apply_filter_btn = document.getElementById("apply_filter_btn");

// List that contains all filters to be sent to the back-end
let apf_list = []
let apf_polar_list = []

// To check if filter was already used
function checkList(a) {
    for (let i = 0; i < apf_polar_list.length; i++) {
        if (a == apf_polar_list[i]) {
            return true;
        }
    }
    return false;
};

// Add filter to the content menu
function addFilterInMenu(a) {

    // Filter div
    let filter_div = document.createElement("div");
    filter_div.className = "filter";

    // The input data
    let filter_text = document.createElement("p");
    let text = document.createTextNode("a = " + a);
    filter_text.appendChild(text);

    // Delete Button
    let del_btn = document.createElement("span");
    let del_text = document.createTextNode("delete");
    del_btn.appendChild(del_text);
    del_btn.className = "material-symbols-outlined";
    del_btn.classList.add("del-filter");
    // Important to be able to delete filter from the list
    del_btn.id = a;

    // Finish the div then append it
    filter_div.appendChild(filter_text);
    filter_div.appendChild(del_btn);
    apf_filters_container.appendChild(filter_div);
};

// Add Filter Button
add_filter_btn.onclick = function () {
    // var input_a = input_text.value.replace(/\s/g, "");

    let filter_polar = "";
    if (a_img.value < 0) {
        filter_polar = a_real.value + a_img.value + "j";
    }
    else if (a_img.value > 0) {
        filter_polar = a_real.value + "+" + a_img.value + "j";
    }
    else {
        filter_polar = a_real.value
    }

    // if input is empty or already used
    if (filter_polar === '' || checkList(filter_polar)) {
        a_real.value = "";
        a_img.value = "";
        a_real.focus();
        return;
    }

    // Push filter to the list
    apf_list.push({ real: a_real.value, img: a_img.value });
    apf_polar_list.push(filter_polar);

    // Add filter to the menu
    addFilterInMenu(filter_polar);

    a_real.value = "";
    a_img.value = "";
    a_real.focus();

    // plot filter response 
    allPassFiltersResponse(apf_list);
};


// Delete Filter
document.addEventListener('click', function (e) {
    if (e.target.classList.contains("del-filter")) {

        // Remove it from filters list
        let index = 0;
        for (let i = 0; i < apf_polar_list.length; i++) {
            if (e.target.id == apf_polar_list[i]) {
                index = i;
                break;
            }
        }

        apf_list.splice(index, 1);
        apf_polar_list.splice(index, 1);

        // remove it from history
        e.target.parentNode.remove();

        // plot filter response 
        allPassFiltersResponse(apf_list);
    }
});


// Catalogue
var swiper = new Swiper(".swiper", {
    nextButton: '.swiper-button-next',
    prevButton: '.swiper-button-prev',
    // grabCursor: true,
    centeredSlides: true,
    slidesPerView: "auto",

    coverflowEffect: {
        rotate: 0,
        stretch: 0,
        depth: 100,
        modifier: 2,
        slideShadows: true
    },
    spaceBetween: 40,
    loop: true,
    pagination: {
        el: ".swiper-pagination",
        clickable: true
    },
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev"
    },

    // Catalogue on click
    onClick: function (e) {
        real = document.querySelector('.swiper-slide-active .info .real').textContent;
        img = document.querySelector('.swiper-slide-active .info .img').textContent;
        let polar = "";

        if (img == '') {
            polar = real;
        }
        else {
            polar = real + "+" + img + "j";
        }

        if (checkList(polar)) {
            return
        }
        // Push filter to the list
        apf_list.push({ real: real, img: img });
        apf_polar_list.push(polar);

        // Add filter to the menu
        addFilterInMenu(polar);
        // plot filter response 
        allPassFiltersResponse(apf_list);

    }
});

function allPassFiltersResponse(apf_list) {
    $.ajax({
        contentType: "application/json;charset=utf-8",
        url: 'http://127.0.0.1:5000/allPassPhase',
        type: 'POST',
        data: JSON.stringify(apf_list),
        cache: false,
        dataType: 'json',
        async: false,
        contentType: 'application/json',
        processData: false,

        success: function (response) {
            freq = response["freq"];
            Ap_phase = response["Ap_phase"];
            var phase_update = { x: [freq], y: [Ap_phase] };

            Plotly.update("cumulative_apf_graph", phase_update);
        },
    });
};


// apply filter on original phase
apply_filter_btn.onclick = function () {
    finalResponse();
}

function finalResponse() {
    $.ajax({
        url: 'http://127.0.0.1:5000/finalPhaseResponse',
        type: 'POST',
        data: false,
        cache: false,
        dataType: 'json',
        async: false,
        contentType: 'application/json',
        processData: false,

        success: function (response) {
            freq = response["freq"];
            final_phase = response["result_phase"];
            var phase_update = { x: [freq], y: [final_phase] };

            Plotly.update("phase_response", phase_update);
            Plotly.update("current_apf_graph", phase_update);
        },
    });
};



// Import and export filter

var import_filter_btn = document.getElementById("import_filter_btn");
var export_btn = document.getElementById("export_btn");
var headers = ['zeros', 'poles'];
var columns = [zeros, poles];
let exportFilter = () => {

    let filter = {
        zeros: zeros,
        poles: poles
    };

    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filter));
    var dlAnchorElem = document.getElementById('downloadAnchorElem');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "Digital Filter.json");
    dlAnchorElem.click();
}
export_btn.addEventListener("click", exportFilter);
let importBtn = document.getElementById('import')


let importFilter = (event) => {
    let filter
    var reader = new FileReader();
    reader.onload = (event) => {
        filter = JSON.parse(event.target.result);
        zeros = filter.zeros
        poles = filter.poles
        convertToPixels(zeros, poles)
    };
    reader.readAsText(event.target.files[0]);
}

import_filter_btn.onchange = (event) => {
    importFilter(event)
}
importBtn.onclick = () => {
    import_filter_btn.click()

}



