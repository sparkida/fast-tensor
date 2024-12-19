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

    // TODO this should stay, but should add divNoNan like tf
    it.skip('should handle division by 0', () => {
      const a = new Tensor([1,2,3,4], [2,2]);
      const b = new Tensor([0, 0,-6,-8], [2,2]);
      const result = a.div(b);
      expect(result.array()).to.deep.equal(
        [ [ 0, 0 ], [ -0.5, -0.5 ] ]
      );
    });
  });
}
