export default function() {
  describe('reshape', () => {
    it('should infer size of rows', () => {
      const a = new Tensor([1,2,3,4], [2,2]);
      const b = a.reshape([-1, 1]);
      expect(b.array()).to.deep.eql(
        [[1],[2],[3],[4]]
      );
      const c = a.reshape([-1]);
      expect(c.array()).to.deep.eql(
        [1,2,3,4]
      );
    });
    it('should infer size of cols', () => {
      const a = new Tensor([1,2,3,4], [2,2]);
      const b = a.reshape([1, -1]);
      expect(b.array()).to.deep.eql(
        [[1,2,3,4]]
      );
    });
    it('should throw an error reshaping if dimensions are invalid', () => {
      const a = new Tensor([1,2,3,4], [2,2]);
      expect(() => a.reshape([-1, -3])).to.throw(
        "Shapes can not be < 0. Found -3 at dim 1"
      );
    });
    it('should throw an error reshaping if dimensions are invalid', () => {
      const a = new Tensor([1,2,3,4], [2,2]);
      expect(() => a.reshape([-1, 3])).to.throw(
        "The implicit shape can't be a fractional number. Got 4 / 3"
      );
    });
    it('should throw an error reshaping if dimensions are invalid', () => {
      const a = new Tensor([1,2,3,4], [2,2]);
      expect(() => a.reshape([4, 2])).to.throw(
        'Size(4) must match the product of shape 4,2'
      );
    });
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
