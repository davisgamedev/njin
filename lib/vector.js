export * from "./supp-vect.js";
/**
 * Vector class
 * @param {Number} x - x vectorinate
 * @param {Number} y - y vectorinate
 * @param {Number} z - z vectorinate
 */
export function Vector(x, y, z=null) {
    this.x = x;
    this.y = y;
    this.z = z;

    /**
     * Adds another vector
     * @param {Vector} vector
     * @return {Vector} sum
     */
    this.add = function(vector, self=false) {
        if (self === true) {
            this.x += vector.x;
            this.y += vector.y;
            this.z += vector.z;
            return this;
        }
        else {
            return new Vector(this.x + vector.x, this.y + vector.y, this.z + vector.z);
        }
    };

    /**
     * Multiplies a vector by a scalar
     * @param {number} scalar
     * @param {boolean} self - applies to this vector
     * @return {Vector} product
     */
    this.mult = function(scalar, self=false) {
        if (self) {
            this.x *= scalar;
            this.y *= scalar;
            this.z *= scalar;
            return this;
        }
        else return new Vector(this.x * scalar, this.y * scalar, this.z * scalar);
    };

    /**
     * 
     */
    this.scaleEach = (sVector, self=false) => {
        let result = new Vector(this.x*sVector.x, this.y*sVector.y, this.z*sVector.z);
        if (self) {
            Object.assign(this, result);
        }
        return result;
    };

    /**
     * Rotates a vector
     * @param {number} rad - angle in radians
     * @param {boolean} self - applies to this vector
     * @return {Vector} - result
     */
    this.rotate = function(rad, self=false) {
        let x = this.x * Math.cos(rad) - this.z * Math.sin(rad);
        let z = this.x * Math.sin(rad) + this.z * Math.cos(rad);
        if (self) {
            this.x = x;
            this.z = z;
            return this;
        }
        else {
            return new Vector(x, this.y, z);
        }
    };

    // scale 0-1 on amount, add to target scaled to opposite amount
    /**
     * interpolates a vector
     * @param {Vector} vector - target vector for max value
     * @param {number} amount - range(0-1), amount to interpolate
     * @param {boolean} self - applies to this vector
     * @return {Vector} result
     */
    this.lerp = (vector, amount, self=false) => this.mult(amount, self).add(vector.mult(1-amount, false), self);

    /**
     * subtracts another vector
     * @param {Vector} vector
     * @param {boolean} self
     * @return {Vector} difference
     */
    this.sub = (vector, self=false) => this.add(vector.mult(-1, false), self);

    /**
     * divides a vector by a scalar
     * @param {number} scalar
     * @param {boolean} self - applies to this vector
     * @return {Vector} quotient
     */
    this.div = (scalar, self=false) => this.mult(1/scalar, self);

    /**
     * normalizes a vector
     * @param {boolean} self - applies to this vector
     * @return {Vector} normalized vector
     */
    this.normalize = (self=false) => this.div(this.mag(), self);

    /**
     * sets the magnitude of a vector
     * @param {boolean} self - applies to this vector
     * @return {Vector} result
     */
    this.setMag = (self=false) => {
        return this.mult(this.normalize(self), self);
    };

    /**
     * gets the square magnitude of a vector
     * @return {number} the square magnitude
     */
    this.sqmag = () => {
        return Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2);
    };

    /**
     * gets the magnitude of a vector
     * @return {number} the magnitude
     */
    this.mag = () => {
        return Math.sqrt(this.sqmag);
    };

    /**
     * gets the direction a vector is pointing (x, y)
     * @return {number} the direction (radians)
     */
    this.dir = () => {
        return Math.atan2(this.z, this.x);
    };

    this.zero = () => {
        this.x = 0;
        this.y = 0;
        this.z = 0;
    };

    this.abs = (self=false) => {
        if (self) {
            this.x = Math.abs(this.x);
            this.y = Math.abs(this.y);
            this.z = Math.abs(this.z);
            return this;
        }
        else {
            return new Vector(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z));
        }
    };

    this.mod = (modifier, self=false) => {
        if (self) {
            Object.keys(modifier).forEach(
                (k) => {
                    if (!!this[k]) this[k] = modifier[k];
                }
            );
            return self;
        }
        else return new Vector(modifier.x||this.x, modifier.y||this.y, modifier.z||this.z);
    };
}
