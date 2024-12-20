#include "../Tensor.h"

// Used to update the shape on JS interface and avoid
// the additional interop to sync it
void update_shape_wire(Tensor* tensor, int* shape_wire) {/*{{{*/
  shape_wire[0] = tensor->rows;
  shape_wire[1] = tensor->cols;
  shape_wire[2] = tensor->is1d;
}/*}}}*/

Tensor::Tensor(size_t rows, size_t cols, bool is1d) 
  : rows(rows), cols(cols), is1d(is1d),
  data(std::make_shared<std::vector<float>>(rows * cols, 0.0f)) { }

// Allow data pointer to be shared without copying
// this is benneficial for when we just need a reference and know
// that operations will be changing the underlying data structure
Tensor::Tensor(size_t rows, size_t cols, bool is1d, std::shared_ptr<std::vector<Real>> shared_data_ptr)
  : rows(rows), cols(cols), is1d(is1d),
  data(std::move(shared_data_ptr)) {}

// Transfer a temporary data vec to the new tensor class, avoiding a copy
Tensor::Tensor(size_t rows, size_t cols, bool is1d, std::vector<Real> tmp_data)
  : rows(rows), cols(cols), is1d(is1d),
  data(std::make_shared<std::vector<Real>>(std::move(tmp_data))) {}

// create a deep copy of the tensor, dereferncing the shared data pointer
Tensor::Tensor(const Tensor& other)
  : rows(other.rows), cols(other.cols), is1d(other.is1d),
  data(std::make_shared<std::vector<float>>(*other.data)) {}

  /*
// Allow data to be copied directly on initialization, useful
// for when we know the data will be manipulated directly (on the same shape structure)
// otherwise we'd always have to check uniqueness to gaurantee immutability
Tensor::Tensor(size_t rows, size_t cols, bool is1d, std::shared_ptr<std::vector<Real>>& data_copy)
  : rows(rows), cols(cols), is1d(is1d),
  data(std::make_shared<std::vector<Real>>(*data_copy)) {}

  */

Tensor::~Tensor() {}

// helper function to create a copy
Tensor Tensor::deepcopy() const {
  return *this;
}

// Provide read-only access
const std::vector<Real>& Tensor::data_ref() const {
  return *data;
}

// Provide read-write access
std::vector<Real>& Tensor::data_ref() {
  return *data;
}

/*
// Get the value at (row, col)
Real Tensor::get(size_t row, size_t col) const {
  return (*data)[row * cols + col];
}

// Set the value at (row, col)
void Tensor::set(size_t row, size_t col, Real value) {
  //ensure_unique();
  (*data)[row * cols + col] = value;
}
*/

Bounds Tensor::get_bounds() const {/*{{{*/
  const auto& vec = data_ref();
  Bounds bounds = { vec[0], vec[0], vec[0], vec[0] };
  for (size_t i = 0; i < rows; ++i) {
    for (size_t j = 0; j < cols; ++j) {
      Real current = vec[i * cols + j];
      if (j == 0) { // X dimension
        bounds.xmin = std::min(bounds.xmin, current);
        bounds.xmax = std::max(bounds.xmax, current);
      } else if (j == 1) { // Y dimension
        bounds.ymin = std::min(bounds.ymin, current);
        bounds.ymax = std::max(bounds.ymax, current);
      }
    }
  }
  return bounds;
}/*}}}*/

Shape Tensor::get_shape() const {/*{{{*/
  Shape shape = { rows, cols, is1d };
  return shape;
}/*}}}*/

extern "C" {
  // Create a new Tensor instance
  Tensor* tensor_create(size_t rows, size_t cols, bool is1d) {
    return new Tensor(rows, cols, is1d);
  }

  // Delete a Tensor instance
  void tensor_delete(Tensor* tensor) {
    delete tensor;
  }

  // Delete a Tensor instance
  void tensor_batch_delete(const uint32_t* instances, size_t size) {
    for (size_t i = 0; i < size; ++i) {
      Tensor* tensor = reinterpret_cast<Tensor*>(instances[i]);
      if (tensor) {
        delete tensor;
      }
    }
  }

  void tensor_get_shape(Tensor* tensor, int* shape) {
    Shape s = tensor->get_shape();
    shape[0] = s.rows;
    shape[1] = s.cols;
    shape[2] = s.is1d;
  }

  // Get the location of the data
  const Real* tensor_get_data_ptr(const Tensor* tensor) {
    return tensor->data->data();
  }

  // Get the number of rows in the tensor (for convenience)
  size_t tensor_get_rows(Tensor* tensor) {
    return tensor->rows;
  }

  // Get the number of columns in the tensor (for convenience)
  size_t tensor_get_cols(Tensor* tensor) {
    return tensor->cols;
  }

  // Add bounds computation function
  void tensor_get_bounds(const Tensor* tensor, Real* bounds) {
    Bounds b = tensor->get_bounds();
    bounds[0] = b.xmin;
    bounds[1] = b.ymin;
    bounds[2] = b.xmax;
    bounds[3] = b.ymax;
  }
}
