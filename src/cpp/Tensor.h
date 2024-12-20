#ifndef TENSOR_H
#define TENSOR_H

#include <iostream>
#include <memory>
#include <limits>
#include <stdexcept>
#include <vector>
#include <algorithm>
#include <cmath>

#ifdef USE_DOUBLE
using Real = double;
#else
using Real = float;
#endif

enum NORM_ORD {
  L2,
  L1,
  MAX
};

struct Bounds {
  Real xmin;
  Real ymin;
  Real xmax;
  Real ymax;
};

struct Shape {
  size_t rows;
  size_t cols;
  bool is1d;
};

class Tensor {
  public:
    size_t rows;
    size_t cols;
    bool is1d;

    std::shared_ptr<std::vector<Real>> data;

    Tensor(size_t rows, size_t cols, bool is1d);
    Tensor(size_t rows, size_t cols, bool is1d, std::shared_ptr<std::vector<Real>> shared_data_ptr);
    //Tensor(size_t rows, size_t cols, bool is1d, std::shared_ptr<std::vector<Real>>& data_copy);
    Tensor(size_t rows, size_t cols, bool is1d, std::vector<Real> data_copy);
    //Tensor(size_t rows, size_t cols, bool is1d, const std::vector<Real>& data_copy);
    Tensor(const Tensor& other);
    ~Tensor();

    // TODO tf.Variable - mutable objects

    Tensor deepcopy() const;
    const std::vector<float>& data_ref() const;
    std::vector<float>& data_ref();
    //void ensure_unique();
    //Real get(size_t row, size_t col) const;
    //void set(size_t row, size_t col, Real value);

    Bounds get_bounds() const;
    Shape get_shape() const;

    // Helpers
    Tensor eye() const;
    Tensor pad(Real constant, size_t rpad_before, size_t rpad_after, size_t cpad_before, size_t cpad_after) const;
    Tensor diag() const;
    Tensor transpose() const;
    Tensor flatten() const;
    Tensor reshape(const int new_rows, const int new_cols) const;
    Tensor reverse(const int axis) const;
    Tensor stack(const Real* instances, size_t input_size) const;

    Tensor add(const Real* input, size_t input_size) const;
    Tensor sub(const Real* input, size_t input_size) const;
    Tensor mul(const Real* input, size_t input_size) const;
    Tensor div(bool no_nan, const Real* input, size_t input_size) const;
    Tensor maximum(const Real scalar) const;
    Tensor maximum(const Tensor& other) const;
    Tensor minimum(const Real scalar) const;
    Tensor minimum(const Tensor& other) const;
    Tensor mod(const Real scalar) const;
    Tensor mod(const Tensor& other) const;
    Tensor pow(const Real scalar) const;
    Tensor pow(const Tensor& other) const;
    Tensor squared_diff(const Real scalar) const;
    Tensor squared_diff(const Tensor& other) const;

    Tensor square() const;
    Tensor mean(int axis, bool keepdims = false) const;
    Tensor norm(NORM_ORD ord, int axis, bool keepdims = false) const;
    Tensor matmul(const Tensor& other) const;
  private:
    Real INF = std::numeric_limits<Real>::infinity();
};

// Used to update the shape on JS interface and avoid
// the additional interop to sync it
void update_shape_wire(Tensor* tensor, int* shape_wire);


#endif
