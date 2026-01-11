export function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function randRange(a, b) {
  return a + Math.random() * (b - a);
}

export class Vec3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  clone() {
    return new Vec3(this.x, this.y, this.z);
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }

  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }

  mul(s) {
    this.x *= s;
    this.y *= s;
    this.z *= s;
    return this;
  }

  len() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  norm() {
    const l = this.len();
    if (l > 1e-9) this.mul(1 / l);
    return this;
  }

  static add(a, b) {
    return new Vec3(a.x + b.x, a.y + b.y, a.z + b.z);
  }

  static sub(a, b) {
    return new Vec3(a.x - b.x, a.y - b.y, a.z - b.z);
  }

  static mul(a, s) {
    return new Vec3(a.x * s, a.y * s, a.z * s);
  }

  static dot(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }

  static cross(a, b) {
    return new Vec3(
      a.y * b.z - a.z * b.y,
      a.z * b.x - a.x * b.z,
      a.x * b.y - a.y * b.x
    );
  }
}

export class Quat {
  constructor(x = 0, y = 0, z = 0, w = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  clone() {
    return new Quat(this.x, this.y, this.z, this.w);
  }

  norm() {
    const l = Math.sqrt(
      this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w
    );
    if (l > 1e-12) {
      const s = 1 / l;
      this.x *= s;
      this.y *= s;
      this.z *= s;
      this.w *= s;
    }
    return this;
  }

  static mul(a, b) {
    return new Quat(
      a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
      a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
      a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
      a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z
    );
  }

  static fromAxisAngle(axis, angle) {
    const half = angle * 0.5;
    const s = Math.sin(half);
    const a = axis.clone().norm();
    return new Quat(a.x * s, a.y * s, a.z * s, Math.cos(half)).norm();
  }

  rotateVec(v) {
    const qx = this.x,
      qy = this.y,
      qz = this.z,
      qw = this.w;

    const tx = 2 * (qy * v.z - qz * v.y);
    const ty = 2 * (qz * v.x - qx * v.z);
    const tz = 2 * (qx * v.y - qy * v.x);

    return new Vec3(
      v.x + qw * tx + (qy * tz - qz * ty),
      v.y + qw * ty + (qz * tx - qx * tz),
      v.z + qw * tz + (qx * ty - qy * tx)
    );
  }
}
