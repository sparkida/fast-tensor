#pragma once

#include <iostream>
#include <vector>
#include <cmath>

#ifdef USE_DOUBLE
using Real = double;
#else
using Real = float;
#endif

class KalmanFilter {
  public:
    Real q;             // Process noise
    Real r;         // Measurement noise

    KalmanFilter(Real q, Real r);
    ~KalmanFilter();

    void reset();
    void update(Real* observation, size_t size, Real q_temp, Real r_temp);

  private:
    bool initialized = false;
    std::vector<Real> state;       // State for each coordinate
    std::vector<Real> covariance; // Covariance for each coordinate
};
