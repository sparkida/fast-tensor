export default function() {
  describe('ones', () => {
    it('should create a matrix of ones');
  });

  describe('zeros', () => {
    it('should create a matrix of zeros');
  });

  describe('diag', () => {
    it('should return the diagonal and everything else padded with zeros', () => {
      const mat1 = new Tensor([1,2,3]);
      const diag = mat1.diag();
      expect(diag.array()).to.deep.equal(
        [ [ 1, 0, 0 ], [ 0, 2, 0 ], [ 0, 0, 3 ] ]
      );
    });
    it('should throw error if matrix is not 1d');
  });

  describe('identity', () => {
    it('should create an identity for a square matrix', () => {
      const mat1 = new Tensor([1,2,3,4], [2,2]);
      const eye = mat1.identity();
      expect(eye.array()).to.deep.equal(
        [ [ 1, 0 ], [ 0, 1 ] ]
      );
    });
    it('should create an identity for a square matrix (static)', () => {
      const eye = Tensor.identity([2,2]);
      expect(eye.array()).to.deep.equal(
        [ [ 1, 0 ], [ 0, 1 ] ]
      );
    });
    it('should throw error if matrix is not square');
  });
}
