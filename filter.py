from scipy import signal
from flask import Flask, request, render_template
import numpy as np
from flask import jsonify
import json
import os
import pandas as pd
from flask import redirect, url_for

app = Flask(__name__)

input_signal = []

combined_poles = []
combined_zeros = []

allPassZeros = []
allPassPoles = []

appliedAPFZeros = []
appliedAPFPoles = []


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/complex', methods=['GET', 'POST'])
def complex():
    data = request.get_json()
    combined_poles.clear()
    combined_zeros.clear()

#   appending zeros and poles
    for item in data[0]:
        real_poles = item["real"]
        img_poles = item["img"]
        combined_poles.append(real_poles+img_poles*1j)
    for item in data[1]:
        real_zeros = item["real"]
        img_zeros = item["img"]
        combined_zeros.append((real_zeros+img_zeros*1j))

    finalFilterZeros = combined_zeros + appliedAPFZeros
    finalFilterPoles = combined_poles + appliedAPFPoles

    freq, complex_gain = signal.freqz_zpk(combined_zeros, combined_poles, 1)
    mag_gain = 20 * np.log10(abs(complex_gain))

    _, complex_gain = signal.freqz_zpk(finalFilterZeros, finalFilterPoles, 1)
    phase_gain = np.unwrap(np.angle(complex_gain))

#   sending response to front-end to plot
    return json.dumps({"freq": freq.tolist(), "mag": mag_gain.tolist(), "phase": phase_gain.tolist()})


signall = [1 for i in range(15)]


@app.route('/applyFilter', methods=['GET', 'POST'])
def applyFilter():
    jsonData = request.get_json()
    input_point = float(jsonData['signalPoint'])
    signall.append(input_point)
    filter_order = max(len(combined_poles), len(combined_zeros))

    if len(signall) > 2 * filter_order and len(signall) > 50:
        del signall[0:filter_order]

    finalFilterZeros = combined_zeros + appliedAPFZeros
    finalFilterPoles = combined_poles + appliedAPFPoles
    num, dem = signal.zpk2tf(finalFilterZeros, finalFilterPoles, 1)
    output_signal = signal.lfilter(num, dem, signall).real
    output_point = output_signal[-1]
    print(output_point)
    return [output_point]


@app.route('/generated', methods=['GET', 'POST'])
def generated():
    jsonData = request.get_json()
    input_point = float(jsonData['y_point'])
    input_signal.append(input_point)

    filter_order = max(len(combined_poles), len(combined_zeros))
#   To save calculations
    if (filter_order < 1):
        return json.dumps({"y_point": input_point})
#   Cut the signal to save memory
    if len(input_signal) > 2 * filter_order and len(input_signal) > 50:
        del input_signal[0:filter_order]

    finalFilterZeros = combined_zeros + appliedAPFZeros
    finalFilterPoles = combined_poles + appliedAPFPoles

    num, dem = signal.zpk2tf(finalFilterZeros, finalFilterPoles, 1)
    output_signal = signal.lfilter(num, dem, input_signal).real

    output_point = output_signal[-1]
    return json.dumps({"y_point": output_point})


@app.route('/finalPhaseResponse', methods=['GET', 'POST'])
def finalPhaseResponse():

    appliedAPFZeros.clear()
    appliedAPFPoles.clear()

    for zero in allPassZeros:
        appliedAPFZeros.append(zero)
    for pole in allPassPoles:
        appliedAPFPoles.append(pole)

    finalFilterZeros = combined_zeros + appliedAPFZeros
    finalFilterPoles = combined_poles + appliedAPFPoles

    freq, complex_gain = signal.freqz_zpk(
        finalFilterZeros, finalFilterPoles, 1)
    result_phase = np.unwrap(np.angle(complex_gain))

    return jsonify({"result_phase": result_phase.tolist(), "freq": freq.tolist()})


@app.route('/allPassPhase', methods=['GET', 'POST'])
def allpassPhase():
    allPassZeros.clear()
    allPassPoles.clear()

    data = request.get_json()
    for item in data:
        if item["real"] == '':
            item["real"] = 0
        if item["img"] == '':
            item["img"] = 0
        real_poles = float(item["real"])
        img_poles = float(item["img"])
        pole = real_poles+img_poles*1j
        allPassZeros.append(1/np.conj(pole))
        allPassPoles.append(pole)

    freq, complex_gain = signal.freqz_zpk(allPassZeros, allPassPoles, 1)
    Ap_phase = np.unwrap(np.angle(complex_gain))
    return jsonify({"Ap_phase": Ap_phase.tolist(), "freq": freq.tolist()})


if __name__ == '__main__':
    app.run(debug=True, threaded=True)
