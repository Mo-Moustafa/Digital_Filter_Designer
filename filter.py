from scipy import signal
from flask import Flask, request, render_template
import numpy as np
from flask import jsonify
import json

app = Flask(__name__)


@app.route('/')
def home():
    return render_template('index.html')


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
    freq, complex_gain = signal.freqz_zpk(combined_zeros, combined_poles,1)
    mag_gain = 20 * np.log10(abs(complex_gain))
    phase_gain = np.unwrap(np.angle(complex_gain))

#   sending response to front-end to plot
    return json.dumps({"freq": freq.tolist() ,"mag": mag_gain.tolist(), "phase": phase_gain.tolist()})


if __name__ == '__main__':
    app.run(debug=True, threaded=True)
