export default function() {
  it('should create a cloned matrix with shared data', () => {
    const mat1 = new Tensor([1,2], [1,2]);
    const mat2 = mat1.clone();
    expect(mat1.dataPtr).to.eql(mat2.dataPtr);
  });
  it('should perform immutable data changes on a cloned object', () => {
    const mat1 = new Tensor([1,2], [1,2]);
    const mat2 = mat1.clone();
    const m1Update = mat1.add(1);
    expect(mat1.dataPtr).to.eql(mat2.dataPtr);
    expect(mat1.dataPtr).to.eql(mat2.dataPtr);
    expect(mat1.dataPtr).to.not.eql(m1Update.dataPtr);
    expect(m1Update.array()).to.deep.eql([[2,3]]);
    expect(mat1.array()).to.deep.eql([[1,2]]);
  });

  it('should make a shallow copy when data is not mutated', () => {
    const mat1 = new Tensor([1,2,3,4], [2,2]);
    const mat2 = mat1.flatten();
    const mat3 = mat2.sub(1);
    expect(mat1.ptr).to.not.eql(mat2.ptr);
    expect(mat1.dataPtr).to.eql(mat2.dataPtr);
  });
}
