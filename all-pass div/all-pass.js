



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





let input_text = document.querySelector(".input_a_value input");
var add_filter_btn = document.getElementById("add_filter_btn");
var apf_filters_container = document.getElementById("added_content");

let apf_list = []


add_filter_btn.onclick = function () {

    // to remove white spaces
    var input_a = input_text.value.replace(/\s/g, "");

    // if input is empty or already used
    if (input_a === '' || checkList(input_a)){
        input_text.value = "";
        input_text.focus();
        return;
    }

    apf_list.push(input_a);

    addFilterInMenu(input_a);
    input_text.value = "";
    input_text.focus();
};


// To check if filter was already used
function checkList (a) {
    for (let i = 0; i < apf_list.length; i++){
        if (a == apf_list[i]){
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
    // //////////////////////////// Important for back-end
    del_btn.id = a;

    // Finish the div then append it
    filter_div.appendChild(filter_text);
    filter_div.appendChild(del_btn);
    apf_filters_container.appendChild(filter_div);    
};


// Delete Filter
document.addEventListener('click', function(e) {
    if (e.target.classList.contains("del-filter")) {
        
        // Remove it from filters list
        let index = 0;
        for (let i = 0; i < apf_list.length; i++){
            if (e.target.id == apf_list[i]){
                index = i;
            }
        }
        apf_list.splice(index, 1);
        // remove it from history
        e.target.parentNode.remove();

        console.log(apf_list);
    }
});