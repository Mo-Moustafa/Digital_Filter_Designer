w1 = [1, 2, 3, 4];
h1 = [10, 15, 30, 17];

w2 = [1, 2, 3, 4];
h2 = [10, 15, 12, 17];

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


drawResponse("magnitude_response", w1, h1, "Frequency Response", "Amplitude [dB]");

drawResponse("phase_response", w2, h2, "Phase Response", "Angle [radians]");
