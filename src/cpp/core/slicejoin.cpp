#include "../Tensor.h"

Tensor Tensor::reverse(const int axis) const {/*{{{*/
  Tensor result = deepcopy();
  auto& vec = (*result.data);
  std::vector<float>::iterator begin = vec.begin();

  if (axis == -1) {
    std::reverse(begin, vec.end());
  } else if (axis == 0) {
    for (size_t r = 0; r < rows / 2; ++r) {
      // Swap the row at index `r` with the row at index `rows - 1 - r`
      int start_row1 = r * cols;
      int start_row2 = (rows - 1 - r) * cols;
      std::swap_ranges(begin + start_row1, begin + start_row1 + cols,
          begin + start_row2);
    }
  } else if (axis == 1) {
    for (size_t i = 0; i < rows; ++i) {
      std::reverse(begin + i * cols, begin + i * cols + cols);
    }
  }
  return result;
}/*}}}*/

extern "C" {
  Tensor* tensor_reverse(Tensor* tensor, int axis = -1) {
    return new Tensor(tensor->reverse(axis));
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
}
