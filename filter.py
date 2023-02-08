from scipy import signal
from flask import Flask, request, render_template
import numpy as np
from flask import jsonify
import json
from scipy import signal
import os
import pandas as pd
from flask import redirect, url_for

app = Flask(__name__)


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/allPass')
def allPass():
    return render_template('allPass.html')


combined_poles = []
combined_zeros = []
input_signal = []


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
#   getting  filter response
    print("combied zeros", combined_zeros)
    print("combied poles", combined_poles)
    freq, complex_gain = signal.freqz_zpk(combined_zeros, combined_poles, 1)
    mag_gain = 20 * np.log10(abs(complex_gain))
    phase_gain = np.unwrap(np.angle(complex_gain))
#   sending response to front-end to plot
    return json.dumps({"freq": freq.tolist(), "mag": mag_gain.tolist(), "phase": phase_gain.tolist()})


@app.route('/csv', methods=['GET', 'POST'])
def csv():
    file = request.files['file']
    file.save(os.path.join('UploadedCsv/csv.csv'))
    df = pd.read_csv('UploadedCsv/csv.csv')
    x_axis = df.iloc[:, 0]
    y_axis = df.iloc[:, 1]
    x_axis = x_axis.to_numpy()
    y_axis = y_axis.to_numpy()

    filter_order = max(len(combined_poles), len(combined_zeros))
    print(filter_order)
    #   To save calculations
    if (filter_order < 1):
        return jsonify({"x_axis": x_axis.tolist(), "y_axis": y_axis.tolist(), "filterd_signal": y_axis.tolist()})

    num, dem = signal.zpk2tf(combined_zeros, combined_poles, 1)
    filterd_signal = signal.lfilter(num, dem, y_axis).real
    print(type(x_axis.tolist()))
    return jsonify({"x_axis": x_axis.tolist(), "y_axis": y_axis.tolist(), "filterd_signal": filterd_signal.tolist()})


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

    num, dem = signal.zpk2tf(combined_zeros, combined_poles, 1)
    output_signal = signal.lfilter(num, dem, input_signal).real
    output_point = output_signal[-1]
    return json.dumps({"y_point": output_point})


if __name__ == '__main__':
    app.run(debug=True, threaded=True)
