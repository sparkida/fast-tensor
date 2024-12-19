#include "Tensor.h"
#include "Kalman.h"
//#include "ResourceManager.h"

// Used to update the shape on JS interface and avoid
// the additional interop to sync it
void update_shape_wire(Tensor* tensor, int* shape_wire) {/*{{{*/
  shape_wire[0] = tensor->rows;
  shape_wire[1] = tensor->cols;
  shape_wire[2] = tensor->is1d;
}/*}}}*/

extern "C" {

  KalmanFilter* kalman_create(Real q, Real r) {
    return new KalmanFilter(q, r);
  }
  
  void kalman_delete(KalmanFilter* kalman) {
    delete kalman;
  }

  void kalman_reset(KalmanFilter* kalman) {
    kalman->reset();
  }

  void kalman_update(KalmanFilter* kalman, Real* observation, size_t size, const Real q_temp, const Real r_temp) {
    kalman->update(observation, size, q_temp, r_temp);
  }

  // Create a new Tensor instance
  Tensor* tensor_create(size_t rows, size_t cols, bool is1d) {
    return new Tensor(rows, cols, is1d);
  }

  Tensor* tensor_clone(Tensor* tensor) {
    return new Tensor(tensor->rows, tensor->cols, tensor->is1d, tensor->data);
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

  // Helpers
  Tensor* tensor_identity(Tensor* tensor) {
    return new Tensor(tensor->identity());
  }

  Tensor* tensor_pad(Tensor* tensor, int* shape_wire, Real constant,
      size_t rpad_before, size_t rpad_after, size_t cpad_before, size_t cpad_after) {
    Tensor* new_tensor = new Tensor(tensor->pad(constant, rpad_before, rpad_after, cpad_before, cpad_after));
    update_shape_wire(new_tensor, shape_wire);
    return new_tensor;
  }

  Tensor* tensor_transpose(Tensor* tensor) {
    return new Tensor(tensor->transpose());
  }

  Tensor* tensor_flatten(Tensor* tensor) {
    return new Tensor(tensor->rows, tensor->cols, true, tensor->data);
  }

  Tensor* tensor_reshape(
      Tensor* tensor,
      int new_rows,
      int new_cols,
      int* shape_wire = nullptr
      ) {
    Tensor* new_tensor = new Tensor(tensor->reshape(new_rows, new_cols));
    update_shape_wire(new_tensor, shape_wire);
    return new_tensor;
  }

  Tensor* tensor_stack(const uint32_t* instances, size_t size) {
    bool init = true;
    size_t rows = 0;
    size_t cols = 0;
    std::vector<Real>::iterator iter;
    std::vector<Real> stack;
    for (size_t i = 0; i < size; ++i) {
      Tensor* tensor = reinterpret_cast<Tensor*>(instances[i]);
      if (init) {
        rows = tensor->rows * size;
        cols = tensor->cols;
        stack.resize(rows * cols);
        // Use iterators to copy - more efficient than insert
        iter = stack.begin();
        init = false;
      }
      // Dereference the shared_ptr to access the vector
      auto& vec = (*tensor->data);
      iter = std::copy(vec.begin(), vec.end(), iter);
    }
    return new Tensor(rows, cols, false, std::move(stack));
  }

  Tensor* tensor_diag(Tensor* tensor, int* shape_wire = nullptr) {
    Tensor* new_tensor = new Tensor(tensor->diag());
    update_shape_wire(new_tensor, shape_wire);
    return new_tensor;
  }

  Tensor* tensor_reverse(Tensor* tensor, int axis = -1) {
    return new Tensor(tensor->reverse(axis));
  }

  Tensor* tensor_add(Tensor* tensor, const Real* input, size_t size) {
    return new Tensor(tensor->add(input, size));
  }

  Tensor* tensor_sub(Tensor* tensor, const Real* input, size_t size) {
    return new Tensor(tensor->sub(input, size));
  }

  Tensor* tensor_mul(Tensor* tensor, const Real* input, size_t size) {
    return new Tensor(tensor->mul(input, size));
  }

  Tensor* tensor_div(Tensor* tensor, const Real* input, size_t size) {
    return new Tensor(tensor->div(input, size));
  }

  Tensor* tensor_square(Tensor* tensor) {
    return new Tensor(tensor->square());
  }

  Tensor* tensor_mean(
      Tensor* tensor,
      int axis = -1,
      bool keepdims = false,
      int* shape_wire = nullptr
      ) {

    Tensor* new_tensor = new Tensor(tensor->mean(axis, keepdims));
    update_shape_wire(new_tensor, shape_wire);
    return new_tensor;
  }

  Tensor* tensor_norm(
      Tensor* tensor,
      int ord = 0,
      int axis = -1,
      bool keepdims = false,
      int* shape_wire = nullptr
      ) {
    Tensor* new_tensor = new Tensor(tensor->norm(static_cast<NORM_ORD>(ord), axis, keepdims));
    update_shape_wire(new_tensor, shape_wire);
    return new_tensor;
  }

  Tensor* tensor_matmul(Tensor* tensor, const Tensor& other, int* shape_wire) {
    Tensor* new_tensor = new Tensor(tensor->matmul(other));
    update_shape_wire(new_tensor, shape_wire);
    return new_tensor;
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
