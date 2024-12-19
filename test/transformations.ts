export default function() {
  describe('reshape', () => {
    it('should reshape a matrix');
  });

  describe('pad', () => {
    it('should pad rows and columns with zeros', () => {
      const a = new Tensor([1,2,3,4], [2,2]);
      const padded = a.pad([[1,1], [1,1]]);
      expect(padded.array()).to.deep.eql(
        [ [ 0, 0, 0, 0 ], [ 0, 1, 2, 0 ], [ 0, 3, 4, 0 ], [ 0, 0, 0, 0 ] ]
      );
    });
    it('should pad rows and columns with constant value', () => {
      const a = new Tensor([1,2,3,4], [2,2]);
      const padded = a.pad([[1,1], [1,1]], 9);
      expect(padded.array()).to.deep.eql(
        [ [ 9, 9, 9, 9 ], [ 9, 1, 2, 9 ], [ 9, 3, 4, 9 ], [ 9, 9, 9, 9 ] ]
      );
    });
  });

  describe('flatten', () => {
    it('should return 1d array', () => {
      const mat1 = new Tensor([[1,2],[3,4]]);
      const flat = mat1.flatten(0);
      expect(flat.array()).to.deep.equal([1,2,3,4]);
    });
  });
}
