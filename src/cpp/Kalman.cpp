#include "Kalman.h"

/*
 * q - process noise - A smaller value will average movement more
 * r - measurement noise - Gives weight to the current observation, higher means smoother
 */
KalmanFilter::KalmanFilter(Real q, Real r) : q(q), r(r) {} 
KalmanFilter::~KalmanFilter(){}

void KalmanFilter::reset() {
  initialized = false;
}

// Apply Kalman filter to flattened Float32Array of 68 landmarks (136 values)
void KalmanFilter::update(Real* observation, size_t size, Real q_temp, Real r_temp) {
  Real cur_q = q_temp < 0 ? q : q_temp;
  Real cur_r = r_temp < 0 ? r : r_temp;
  

  // Initialize states if this is the first frame
  if (!initialized) {
    state.resize(size, 0.0f);
    covariance.resize(size, 1.0f);
    for (size_t i = 0; i < size; ++i) {
      state[i] = observation[i];
    }
    initialized = true;
  }

  // Apply Kalman filter to each coordinate
  for (size_t i = 0; i < size; ++i) {
    // Prediction step
    Real cur_cov = covariance[i] + cur_q;
    Real cur_state = state[i];

    // Update step
    Real kalmanGain = cur_cov / (cur_cov + cur_r);
    Real filteredValue = cur_state + kalmanGain * (observation[i] - cur_state);
    covariance[i] = (1 - kalmanGain) * cur_cov;

    state[i] = filteredValue;
    observation[i] = state[i];
  }
}

