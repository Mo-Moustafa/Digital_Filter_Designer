from scipy import signal
from flask import Flask, request, render_template
import numpy as np
from flask import jsonify
import json
from scipy import signal
import os
import pandas as pd


app = Flask(__name__)


@app.route('/')
def home():
    return render_template('index.html')

combined_poles = []
combined_zeros = []

@app.route('/complex', methods=['GET', 'POST'])
def complex():
    data = request.get_json()
    combined_poles = []
    combined_zeros = []

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

    filterd_signal = signal.filtfilt(combined_zeros, combined_poles, y_axis)

    return json.dumps({"x_axis": x_axis.tolist(), "y_axis": y_axis.tolist(), "filterd_signal": filterd_signal.tolist()})


@app.route('/generated', methods=['GET', 'POST'])
def generated():
    generated = request.values.get("y_point")
    # filterd_point = signal.filtfilt(combined_zeros, combined_poles, generated)
    filterd_point = 1

    return json.dumps({"y_point": filterd_point})



if __name__ == '__main__':
    app.run(debug=True, threaded=True)
