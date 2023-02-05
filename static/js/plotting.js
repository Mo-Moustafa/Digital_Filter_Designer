magnitude = document.getElementById("magnitude_response");
phase = document.getElementById("phase_response");

Plotly.plot(
    magnitude,
    [
    {
        x: [1, 2, 3, 4, 5],
        y: [1, 2, 4, 8, 16],
    },
    ],
    {
    margin: { t: 0 },
    },
    { showSendToCloud: true }
);


Plotly.plot(
    phase,
    [
    {
        x: [1, 2, 3, 4, 5],
        y: [1, 2, 4, 8, 16],
    },
    ],
    {
    margin: { t: 0 },
    },
    { showSendToCloud: true }
);