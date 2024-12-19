export default function() {
  describe('norm', () => {
    it('should perform norm on flat data (axis -1) and keep dims', () => {
      const mat1 = new Tensor([[1,2],[3,4]]);
      const norm = mat1.norm('L2', null, true);
      expect(norm.array()).to.deep.equal(
        [ [ 5.4772257804870605 ] ]
      );
    });
    it('should perform norm on flat data (axis -1) and remove dims', () => {
      const mat1 = new Tensor([[1,2],[3,4]]);
      const norm = mat1.norm('L2', null, false);
      expect(norm.array()).to.eql(5.4772257804870605);
    });
    it('should perform norm on axis 0 and keep dims', () => {
      const mat1 = new Tensor([[1,2],[3,4]]);
      const norm = mat1.norm('L2', 0, true);
      expect(norm.array()).to.deep.equal(
        [ [ 3.1622776985168457, 4.4721360206604 ] ]
      );
    });
    it('should perform norm on axis 0 and remove dims', () => {
      const mat1 = new Tensor([[1,2],[3,4]]);
      const norm = mat1.norm('L2', 0, false);
      expect(norm.array()).to.deep.equal(
        [ 3.1622776985168457, 4.4721360206604 ]
      );
    });
    it('should perform norm on axis 1 and keep dims', () => {
      const mat1 = new Tensor([[1,2],[3,4]]);
      const norm = mat1.norm('L2', 1, true);
      expect(norm.array()).to.deep.equal(
        [ [ 2.2360680103302 ], [ 5 ] ]
      );
    });
    it('should perform norm on axis 1 and remove dims', () => {
      const mat1 = new Tensor([[1,2],[3,4]]);
      const norm = mat1.norm('L2', 1, false);
      expect(norm.array()).to.deep.equal(
        [ 2.2360680103302, 5 ]
      );
    });
  });

  describe('matmul', () => {
    it('should multiply 2 matrices', () => {
      const mat1 = new Tensor([[1,2],[3,4]]);
      const mat2 = new Tensor([[1,2],[3,4]]);
      const mmul = mat1.matMul(mat2);
      expect(mmul.array()).to.deep.equal(
        [ [ 7, 10 ], [ 15, 22 ] ]
      );
    });
  });

  describe('transpose', () => {
    it('should return transpose row->cols', () => {
      const data = [[1,2,3],[4,5,6]];
      const mat1 = new Tensor(data);
      const transposed = mat1.transpose();
      expect(transposed.array()).to.deep.equal(
        [ [1,4], [2,5], [3,6] ]
      );
      expect(transposed.transpose().array()).to.deep.equal(data);
    });
  });

}
