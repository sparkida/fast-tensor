export default function() {
  describe('mean', () => {
    it('should perform mean on flat data (axis -1) and keep dims', () => {
      const mat1 = new Tensor([[1,2],[3,4]]);
      const mean = mat1.mean(null, true);
      expect(mean.array()).to.deep.equal(
        [ [ 2.5 ] ]
      );
    });
    it('should perform mean on flat data (axis -1) and remove dims', () => {
      const mat1 = new Tensor([[1,2],[3,4]]);
      const mean = mat1.mean(null, false);
      expect(mean.array()).to.eql(2.5);
    });

    it('should perform mean on axis 0 and keep dims', () => {
      const mat1 = new Tensor([[1,2],[3,4]]);
      const mean = mat1.mean(0, true);
      expect(mean.array()).to.deep.equal(
        [ [ 2, 3 ] ]
      );
    });
    it('should perform mean on axis 0 and remove dims', () => {
      const mat1 = new Tensor([[1,2],[3,4]]);
      const mean = mat1.mean(0, false);
      expect(mean.array()).to.deep.equal(
        [ 2, 3 ]
      );
    });

    it('should perform mean on axis 1 and keep dims', () => {
      const mat1 = new Tensor([[1,2],[3,4]]);
      const mean = mat1.mean(1, true);
      expect(mean.array()).to.deep.equal(
        [ [ 1.5 ], [ 3.5 ] ]
      );
    });
    it('should perform mean on axis 1 and remove dims', () => {
      const mat1 = new Tensor([[1,2],[3,4]]);
      const mean = mat1.mean(1, false);
      expect(mean.array()).to.deep.equal(
        [ 1.5, 3.5 ]
      );
    });
  });
}
