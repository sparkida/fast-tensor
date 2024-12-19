export default function() {
  describe('stack', () => {
    it('should stack multiple matrices', () => {
      const a = new Tensor([1,2,3,4], [2,2]);
      const b = new Tensor([1,2,3,4], [2,2]);
      const stacked = Tensor.stack([a,b]);
      expect(stacked.array()).to.deep.equal(
        [ [ 1, 2 ], [ 3, 4 ], [ 1, 2 ], [ 3, 4 ] ]
      );
    });
  });

  describe('reverse', () => {
    it('should reverse data with no axis (flattened array)', () => {
      const mat1 = new Tensor([1,2,3]);
      const reversed = mat1.reverse();
      expect(reversed.array()).to.deep.equal([3,2,1]);
    });
    it('should reverse data with on row axis(0)', () => {
      const mat1 = new Tensor([[1,2],[3,4]]);
      const reversed = mat1.reverse(0);
      expect(reversed.array()).to.deep.equal([[3,4], [1,2]]);
    });
    it('should reverse data with on col axis(1)', () => {
      const mat1 = new Tensor([[1,2],[3,4]]);
      const reversed = mat1.reverse(1);
      expect(reversed.array()).to.deep.equal([[2,1], [4,3]]);
    });
    it('should throw an error if using axis on 1d array');
  });
}
