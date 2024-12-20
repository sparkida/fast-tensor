export default function() {
  describe('add', () => {
    it('should add a scalar to a Tensor', () => {
      const a = new Tensor([1,2,3,4], [2,2]);
      const b = 1;
      const result = a.add(b);
      expect(result.array()).to.deep.equal(
        [ [ 2, 3 ], [ 4, 5 ] ]
      );
    });
    it('should add a 1d Tensor to a 2d', () => {
      const a = new Tensor([1,2,3,4], [2,2]);
      const b = new Tensor([1,2]);
      const result = a.add(b);
      expect(result.array()).to.deep.equal(
        [ [ 2, 4 ], [ 4, 6 ] ]
      );
    });
    it('should add a 2d Tensor to a 2d', () => {
      const a = new Tensor([1,2,3,4], [2,2]);
      const b = new Tensor([1,2,3,4], [2,2]);
      const result = a.add(b);
      expect(result.array()).to.deep.equal(
        [ [ 2, 4 ], [ 6, 8 ] ]
      );
    });
  });

  describe('sub', () => {
    it('should subtract a scalar to a Tensor', () => {
      const a = new Tensor([1,2,3,4], [2,2]);
      const b = 1;
      const result = a.sub(b);
      expect(result.array()).to.deep.equal(
        [ [ 0, 1 ], [ 2, 3 ] ]
      );
    });
    it('should subtract a 1d Tensor to a 2d', () => {
      const a = new Tensor([1,2,3,4], [2,2]);
      const b = new Tensor([1,2]);
      const result = a.sub(b);
      expect(result.array()).to.deep.equal(
        [ [ 0, 0 ], [ 2, 2 ] ]
      );
    });
    it('should subtract a 2d Tensor to a 2d', () => {
      const a = new Tensor([1,2,3,4], [2,2]);
      const b = new Tensor([2,4,6,8], [2,2]);
      const result = a.sub(b);
      expect(result.array()).to.deep.equal(
        [ [ -1, -2 ], [ -3, -4 ] ]
      );
    });
  });

  describe('mul', () => {
    it('should multiply a scalar to a Tensor', () => {
      const a = new Tensor([1,2,3,4], [2,2]);
      const b = 2;
      const result = a.mul(b);
      expect(result.array()).to.deep.equal(
        [ [ 2, 4 ], [ 6, 8 ] ]
      );
    });
    it('should multiply a 1d Tensor to a 2d', () => {
      const a = new Tensor([1,2,3,4], [2,2]);
      const b = new Tensor([1,2]);
      const result = a.mul(b);
      expect(result.array()).to.deep.equal(
        [ [ 1, 4 ], [ 3, 8 ] ]
      );
    });
    it('should multiply a 2d Tensor to a 2d', () => {
      const a = new Tensor([1,2,3,4], [2,2]);
      const b = new Tensor([-2,-4,-6,-8], [2,2]);
      const result = a.mul(b);
      expect(result.array()).to.deep.equal(
        [ [ -2, -8 ], [ -18, -32 ] ]
      );
    });
  });

  describe('div', () => {
    it('should divide a scalar to a Tensor', () => {
      const a = new Tensor([1,2,3,4], [2,2]);
      const b = 2;
      const result = a.div(b);
      expect(result.array()).to.deep.equal(
        [ [ 0.5, 1 ], [ 1.5, 2 ] ]
      );
    });
    it('should divide a 1d Tensor to a 2d', () => {
      const a = new Tensor([1,2,3,4], [2,2]);
      const b = new Tensor([1,2]);
      const result = a.div(b);
      expect(result.array()).to.deep.equal(
        [ [ 1, 1 ], [ 3, 2 ] ]
      );
    });
    it('should divide a 2d Tensor to a 2d', () => {
      const a = new Tensor([1,4,3,4], [2,2]);
      const b = new Tensor([-2,-2,-6,-8], [2,2]);
      const result = a.div(b);
      expect(result.array()).to.deep.equal(
        [ [ -0.5, -2 ], [ -0.5, -0.5 ] ]
      );
    });
  });

  describe('divNoNan', () => {
    it('should handle division by 0 and result in 0', () => {
      const a = new Tensor([0,2,3,4], [2,2]);
      const b = new Tensor([0, 0,-6,-8], [2,2]);
      const result = a.divNoNan(b);
      expect(result.array()).to.deep.equal(
        [ [ 0, 0 ], [ -0.5, -0.5 ] ]
      );
    });
  });

  describe('maximum', () => {
    it('should return the maximum result of two tensors', () => {
      const a = ft.tensor([1,2,2,4], [2,2]);
      const b = ft.tensor([0,1,3,3], [2,2]);
      const result = a.maximum(b);
      expect(result.array()).to.deep.equal(
        [ [ 1, 2 ], [ 3, 4 ] ]
      );
    });
    it('should return the maximum result with scalar', () => {
      const a = ft.tensor([1,2,3,4], [2,2]);
      const result = a.maximum(3);
      expect(result.array()).to.deep.equal(
        [ [ 3, 3 ], [ 3, 4 ] ]
      );
    });
    it('should throw an error if invalid type');
  });

  describe('minimum', () => {
    it('should return the minimum result of two tensors', () => {
      const a = ft.tensor([1,2,2,4], [2,2]);
      const b = ft.tensor([0,1,3,3], [2,2]);
      const result = a.minimum(b);
      expect(result.array()).to.deep.equal(
        [ [ 0, 1 ], [ 2, 3 ] ]
      );
    });
    it('should return the minimum result with scalar', () => {
      const a = ft.tensor([1,2,3,4], [2,2]);
      const result = a.minimum(3);
      expect(result.array()).to.deep.equal(
        [ [ 1, 2 ], [ 3, 3 ] ]
      );
    });
    it('should throw an error if invalid type');
  });

  describe('mod', () => {
    it('should return the mod result of two tensors', () => {
      const a = ft.tensor([2,2,2,4], [2,2]);
      const b = ft.tensor([0,1,3,3], [2,2]);
      const result = a.mod(b);
      expect(result.array()).to.deep.equal(
        [ [ NaN, 0 ], [ 2, 1 ] ]
      );
    });
    it('should return the mod result with scalar', () => {
      const a = ft.tensor([1,2,3,4], [2,2]);
      const result = a.mod(3);
      expect(result.array()).to.deep.equal(
        [ [ 1, 2 ], [ 0, 1 ] ]
      );
    });
    it('should throw an error if invalid type');
  });

  describe('pow', () => {
    it('should return the pow result of two tensors', () => {
      const a = ft.tensor([1,2,3]);
      const b = ft.tensor([1,2,3]);
      const result = a.pow(b);
      expect(result.array()).to.deep.equal(
        [ 1, 4, 27 ]
      );
    });
    it('should return the pow result with scalar', () => {
      const a = ft.tensor([1,2,3,4], [2,2]);
      const result = a.pow(3);
      expect(result.array()).to.deep.equal(
        [ [ 1, 8 ], [ 27, 64 ] ]
      );
    });
    it('should throw an error if invalid type');
  });

  describe('squaredDifference', () => {
    it('should return the squaredDifference result of two tensors', () => {
      const a = ft.tensor([1, 4, 3, 16]);
      const b = ft.tensor([1, 2, 9, 4]);
      const result = a.squaredDifference(b);
      expect(result.array()).to.deep.equal(
        [0, 4, 36, 144]
      );
    });
    it('should return the squaredDifference result with scalar', () => {
      const a = ft.tensor([2, 4, 6, 8]);
      const result = a.squaredDifference(5);
      expect(result.array()).to.deep.equal(
        [ 9, 1, 1, 9 ]
      );
    });
    it('should throw an error if invalid type');
  });
}
