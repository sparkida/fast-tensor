export default function() {
  it('square', () => {
    const mat = ft.tensor([-1, 2, -3, 4]);
    const res = mat.square();
    expect(res.array()).to.deep.equal(
      [ 1, 4, 9, 16 ]
    );
  });

  it('abs', () => {
    const mat = ft.tensor([-1, 2, -3, 4]);
    const res = mat.abs();
    expect(res.array()).to.deep.equal(
      [ 1, 2, 3, 4 ]
    );
  });

  it('acos', () => {
    const mat = ft.tensor([1, 0.2, -0.4, -1]);
    const res = mat.acos();
    expect(res.array()).to.deep.equal(
      [ 0, 1.3694384098052979, 1.9823131561279297, 3.141592502593994 ]
    );
  });

  it('acosh', () => {
    const mat = ft.tensor([1, 2, 3, 4.5]);
    const res = mat.acosh();
    expect(res.array()).to.deep.equal(
      [ 0, 1.316957950592041, 1.7627471685409546, 2.1846437454223633 ]
    );
  });

  it('asin', () => {
    const mat = ft.tensor([0, 1, -1, 0.7]);
    const res = mat.asin();
    expect(res.array()).to.deep.equal(
      [ 0, 1.5707963705062866, -1.5707963705062866, 0.7753974795341492 ]
    );
  });

  it('asinh', () => {
    const mat = ft.tensor([1, 2, 3, 4.5]);
    const res = mat.asinh();
    expect(res.array()).to.deep.equal(
      [ 0.8813735842704773, 1.4436354637145996, 1.8184465169906616, 2.209347724914551 ]
    );
  });

  it('atan', () => {
    const mat = ft.tensor([0, 1, -1, 0.7]);
    const res = mat.atan();
    expect(res.array()).to.deep.equal(
      [ 0, 0.7853981852531433, -0.7853981852531433, 0.6107259392738342 ]
    );
  });

  it('atan2', () => {
    const mat = ft.tensor([0, 1, -1, 0.7]);
    const mat2 = mat.clone();
    const res = mat.atan2(mat2);
    expect(res.array()).to.deep.equal(
      [ 0, 0.7853981852531433, -2.356194496154785, 0.7853981852531433 ]
    );
  });

  it('atanh', () => {
    const mat = ft.tensor([0, 0.1, -0.1, 0.7]);
    const res = mat.atanh();
    expect(res.array()).to.deep.equal(
      [ 0, 0.10033534467220306, -0.10033534467220306, 0.8673005104064941 ]
    );
  });

  it('ceil', () => {
    const mat = ft.tensor([1, 2.2, 3.8, 4.9]);
    const res = mat.ceil();
    expect(res.array()).to.deep.equal(
      [ 1, 3, 4, 5 ]
    );
  });

  it('cos', () => {
    const mat = ft.tensor([0, Math.PI / 2, Math.PI * 3 / 4]);
    const res = mat.cos();
    expect(res.array()).to.deep.equal(
      [ 1, -4.371138828673793e-8, -0.7071067690849304 ]
    );
  });

  it('cosh', () => {
    const mat = ft.tensor([-1, 0, 1, 4]);
    const res = mat.cosh();
    expect(res.array()).to.deep.equal(
      [ 1.5430805683135986, 1, 1.5430805683135986, 27.308231353759766 ]
    );
  });

  it('clipByValue', () => {
    const mat = ft.tensor([1, 2.3, 3.8, 4.9]);
    const res = mat.clipByValue(1.5, 3);
    expect(res.array()).to.deep.equal(
      [ 1.5, 2.299999952316284, 3, 3 ]
    );
  });

  it('floor', () => {
    const mat = ft.tensor([1, 2.2, 3.8, 4.9]);
    const res = mat.floor();
    expect(res.array()).to.deep.equal(
      [ 1, 2, 3, 4 ]
    );
  });
}
