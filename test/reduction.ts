export default function() {
  describe('all', () => {
    it('should perform all on flat data (axis -1) and keep dims', () => {
      const mat = ft.tensor([[1,2],[3,4]]);
      const all = mat.all(null, true);
      expect(all.array()).to.deep.equal(
        [ [ 1 ] ]
      );
    });
    it('should perform all on flat data (axis -1) and remove dims', () => {
      const mat = ft.tensor([[1,0],[3,4]]);
      const all = mat.all(null, false);
      expect(all.array()).to.eql(0);
    });
    it('should perform all on axis 0 and keep dims', () => {
      const mat = ft.tensor([[1,2],[3,4]]);
      const all = mat.all(0, true);
      expect(all.array()).to.deep.equal(
        [ [ 1, 1 ] ]
      );
    });
    it('should perform all on axis 0 and remove dims', () => {
      const mat = ft.tensor([[0,2],[3,4]]);
      const all = mat.all(0, false);
      expect(all.array()).to.deep.equal(
        [ 0, 1 ]
      );
    });
    it('should perform all on axis 1 and keep dims', () => {
      const mat = ft.tensor([[1,2],[3,0]]);
      const all = mat.all(1, true);
      expect(all.array()).to.deep.equal(
        [ [ 1 ], [ 0 ] ]
      );
    });
    it('should perform all on axis 1 and remove dims', () => {
      const mat = ft.tensor([[1,2],[3,0]]);
      const all = mat.all(1, false);
      expect(all.array()).to.deep.equal(
        [ 1, 0 ]
      );
    });
  });
  describe('any', () => {
    it('should perform any on flat data (axis -1) and keep dims', () => {
      const mat = ft.tensor([[1,2],[3,4]]);
      const any = mat.any(null, true);
      expect(any.array()).to.deep.equal(
        [ [ 1 ] ]
      );
    });
    it('should perform any on flat data (axis -1) and remove dims', () => {
      const mat = ft.tensor([[1,0],[3,4]]);
      const any = mat.any(null, false);
      expect(any.array()).to.eql(1);
      const mat2 = ft.tensor([[0,0],[0,0]]);
      const any2 = mat2.any(null, false);
      expect(any2.array()).to.eql(0);
    });
    it('should perform any on axis 0 and keep dims', () => {
      const mat = ft.tensor([[0,0],[3,4]]);
      const any = mat.any(0, true);
      expect(any.array()).to.deep.equal(
        [ [ 1, 1 ] ]
      );
      const mat2 = ft.tensor([[0,0],[0,4]]);
      const any2 = mat2.any(0, true);
      expect(any2.array()).to.deep.equal(
        [ [ 0, 1 ] ]
      );
    });
    it('should perform any on axis 0 and remove dims', () => {
      const mat = ft.tensor([[0,2],[0,4]]);
      const any = mat.any(0, false);
      expect(any.array()).to.deep.equal(
        [ 0, 1 ]
      );
    });
    it('should perform any on axis 1 and keep dims', () => {
      const mat = ft.tensor([[1,2],[0,0]]);
      const any = mat.any(1, true);
      expect(any.array()).to.deep.equal(
        [ [ 1 ], [ 0 ] ]
      );
    });
    it('should perform any on axis 1 and remove dims', () => {
      const mat = ft.tensor([[1,2],[0,0]]);
      const any = mat.any(1, false);
      expect(any.array()).to.deep.equal(
        [ 1, 0 ]
      );
    });
  });
  describe('argMin', () => {
    it('should return argmin on flat data', () => {
      const mat = ft.tensor([3,2,0,2,1]);
      const min = mat.argMin().array();
      expect(min).to.eql(2);
    });
    it('should return argmin on axis 0', () => {
      const mat = ft.tensor([[4, 1], [3, 2]]);
      const min = mat.argMin().array();
      expect(min).to.deep.equal(
        [ 1, 0 ]
      );
    });
    it('should return argmin on axis 1', () => {
      const mat = ft.tensor([[1, 2], [4, 3]]);
      const min = mat.argMin(1).array();
      expect(min).to.deep.equal(
        [ 0, 1 ]
      );
    });
  });
  describe('argMax', () => {
    it('should return argmax on flat data', () => {
      const mat = ft.tensor([1,2,0,3,1]);
      const max = mat.argMax().array();
      expect(max).to.eql(3);
    });
    it('should return argmax on axis 0', () => {
      const mat = ft.tensor([[4, 1], [3, 2]]);
      const max = mat.argMax().array();
      expect(max).to.deep.equal(
        [ 0, 1 ]
      );
    });
    it('should return argmax on axis 1', () => {
      const mat = ft.tensor([[1, 2], [4, 3]]);
      const max = mat.argMax(1).array();
      expect(max).to.deep.equal(
        [ 1, 0 ]
      );
    });
  });
  describe('max', () => {
    it('should perform max on flat data (axis -1) and keep dims', () => {
      const mat = ft.tensor([[1,2],[3,4]]);
      const max = mat.max(null, true);
      expect(max.array()).to.deep.equal(
        [ [ 4 ] ]
      );
    });
    it('should perform max on flat data (axis -1) and remove dims', () => {
      const mat = ft.tensor([[1,2],[3,4]]);
      const max = mat.max(null, false);
      expect(max.array()).to.eql(4);
    });
    it('should perform max on axis 0 and keep dims', () => {
      const mat = ft.tensor([[1,2],[3,4]]);
      const max = mat.max(0, true);
      expect(max.array()).to.deep.equal(
        [ [ 3, 4 ] ]
      );
    });
    it('should perform max on axis 0 and remove dims', () => {
      const mat = ft.tensor([[1,2],[3,4]]);
      const max = mat.max(0, false);
      expect(max.array()).to.deep.equal(
        [ 3, 4 ]
      );
    });
    it('should perform max on axis 1 and keep dims', () => {
      const mat = ft.tensor([[1,2],[3,4]]);
      const max = mat.max(1, true);
      expect(max.array()).to.deep.equal(
        [ [ 2 ], [ 4 ] ]
      );
    });
    it('should perform max on axis 1 and remove dims', () => {
      const mat = ft.tensor([[1,2],[3,4]]);
      const max = mat.max(1, false);
      expect(max.array()).to.deep.equal(
        [ 2, 4 ]
      );
    });
  });
  describe('mean', () => {
    it('should perform mean on flat data (axis -1) and keep dims', () => {
      const mat = ft.tensor([[1,2],[3,4]]);
      const mean = mat.mean(null, true);
      expect(mean.array()).to.deep.equal(
        [ [ 2.5 ] ]
      );
    });
    it('should perform mean on flat data (axis -1) and remove dims', () => {
      const mat = ft.tensor([[1,2],[3,4]]);
      const mean = mat.mean(null, false);
      expect(mean.array()).to.eql(2.5);
    });
    it('should perform mean on axis 0 and keep dims', () => {
      const mat = ft.tensor([[1,2],[3,4]]);
      const mean = mat.mean(0, true);
      expect(mean.array()).to.deep.equal(
        [ [ 2, 3 ] ]
      );
    });
    it('should perform mean on axis 0 and remove dims', () => {
      const mat = ft.tensor([[1,2],[3,4]]);
      const mean = mat.mean(0, false);
      expect(mean.array()).to.deep.equal(
        [ 2, 3 ]
      );
    });
    it('should perform mean on axis 1 and keep dims', () => {
      const mat = ft.tensor([[1,2],[3,4]]);
      const mean = mat.mean(1, true);
      expect(mean.array()).to.deep.equal(
        [ [ 1.5 ], [ 3.5 ] ]
      );
    });
    it('should perform mean on axis 1 and remove dims', () => {
      const mat = ft.tensor([[1,2],[3,4]]);
      const mean = mat.mean(1, false);
      expect(mean.array()).to.deep.equal(
        [ 1.5, 3.5 ]
      );
    });
  });
  describe('min', () => {
    it('should perform min on flat data (axis -1) and keep dims', () => {
      const mat = ft.tensor([[1,2],[3,4]]);
      const min = mat.min(null, true);
      expect(min.array()).to.deep.equal(
        [ [ 1 ] ]
      );
    });
    it('should perform min on flat data (axis -1) and remove dims', () => {
      const mat = ft.tensor([[1,2],[3,4]]);
      const min = mat.min(null, false);
      expect(min.array()).to.eql(1);
    });
    it('should perform min on axis 0 and keep dims', () => {
      const mat = ft.tensor([[1,2],[3,4]]);
      const min = mat.min(0, true);
      expect(min.array()).to.deep.equal(
        [ [ 1, 2 ] ]
      );
    });
    it('should perform min on axis 0 and remove dims', () => {
      const mat = ft.tensor([[1,2],[3,4]]);
      const min = mat.min(0, false);
      expect(min.array()).to.deep.equal(
        [ 1, 2 ]
      );
    });
    it('should perform min on axis 1 and keep dims', () => {
      const mat = ft.tensor([[1,2],[3,4]]);
      const min = mat.min(1, true);
      expect(min.array()).to.deep.equal(
        [ [ 1 ], [ 3 ] ]
      );
    });
    it('should perform min on axis 1 and remove dims', () => {
      const mat = ft.tensor([[1,2],[3,4]]);
      const min = mat.min(1, false);
      expect(min.array()).to.deep.equal(
        [ 1, 3 ]
      );
    });
  });
  describe('prod', () => {
    it('should perform prod on flat data (axis -1) and keep dims', () => {
      const mat = ft.tensor([[1,2],[3,4]]);
      const prod = mat.prod(null, true);
      expect(prod.array()).to.deep.equal(
        [ [ 24 ] ]
      );
    });
    it('should perform prod on flat data (axis -1) and remove dims', () => {
      const mat = ft.tensor([[1,0],[3,4]]);
      const prod = mat.prod(null, false);
      expect(prod.array()).to.eql(0);
      const mat2 = ft.tensor([[1,2],[3,4]]);
      const prod2 = mat2.prod(null, false);
      expect(prod2.array()).to.eql(24);
    });
    it('should perform prod on axis 0 and keep dims', () => {
      const mat = ft.tensor([[1,2],[3,4]]);
      const prod = mat.prod(0, true);
      expect(prod.array()).to.deep.equal(
        [ [ 3, 8 ] ]
      );
    });
    it('should perform prod on axis 0 and remove dims', () => {
      const mat = ft.tensor([[0,2],[3,4]]);
      const prod = mat.prod(0, false);
      expect(prod.array()).to.deep.equal(
        [ 0, 8 ]
      );
    });
    it('should perform prod on axis 1 and keep dims', () => {
      const mat = ft.tensor([[1,2],[3,2]]);
      const prod = mat.prod(1, true);
      expect(prod.array()).to.deep.equal(
        [ [ 2 ], [ 6 ] ]
      );
    });
    it('should perform prod on axis 1 and remove dims', () => {
      const mat = ft.tensor([[1,2],[3,1]]);
      const prod = mat.prod(1, false);
      expect(prod.array()).to.deep.equal(
        [ 2, 3 ]
      );
    });
  });
  describe('sum', () => {
    it('should perform sum on flat data (axis -1) and keep dims', () => {
      const mat = ft.tensor([[1,2],[3,4]]);
      const sum = mat.sum(null, true);
      expect(sum.array()).to.deep.equal(
        [ [ 10 ] ]
      );
    });
    it('should perform sum on flat data (axis -1) and remove dims', () => {
      const mat = ft.tensor([[1,0],[3,4]]);
      const sum = mat.sum(null, false);
      expect(sum.array()).to.eql(8);
    });
    it('should perform sum on axis 0 and keep dims', () => {
      const mat = ft.tensor([[1,2],[3,4]]);
      const sum = mat.sum(0, true);
      expect(sum.array()).to.deep.equal(
        [ [ 4, 6 ] ]
      );
    });
    it('should perform sum on axis 0 and remove dims', () => {
      const mat = ft.tensor([[0,2],[3,4]]);
      const sum = mat.sum(0, false);
      expect(sum.array()).to.deep.equal(
        [ 3, 6 ]
      );
    });
    it('should perform sum on axis 1 and keep dims', () => {
      const mat = ft.tensor([[1,2],[3,1]]);
      const sum = mat.sum(1, true);
      expect(sum.array()).to.deep.equal(
        [ [ 3 ], [ 4 ] ]
      );
    });
    it('should perform sum on axis 1 and remove dims', () => {
      const mat = ft.tensor([[1,2],[3,1]]);
      const sum = mat.sum(1, false);
      expect(sum.array()).to.deep.equal(
        [ 3, 4 ]
      );
    });
  });
}
