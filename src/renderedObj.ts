export default abstract class RenderedObject {
    private deltaTime: number = 0;
    
    public color: string = "";

    public x: number = 0; // center x
    public y: number = 0; // center y
    public heading: number = 0;

    public width: number = 0;
    public height: number = 0;
    
    private v: number = 0;
    private headingV: number = 0;

    private a: number = 0;
    private headingA: number = 0;
    
    private maxV: number = 0;
    private maxHeadingV: number = 0;

    private frictionA: number = 50;
    private frictionHeadingA: number = 5;
    
    private brakeFrictionA: number = 90; // this should be a control, but for rn lets put it as constant

    private braking: boolean = false;

    constructor(
        public ctx: CanvasRenderingContext2D
    ) {}

    public getFrictionHeadingA() {
        return this.frictionHeadingA;
    }

    public setHeadingV(v: number) {
        this.headingV = v;
    }

    public getHeading() {
        return this.heading;
    }

    public getHeadingV() {
        return this.headingV;
    }

    public getBrakeFrictionA() {
        return this.brakeFrictionA;
    }

    public setDeltaTime(deltaTime: number) {
        this.deltaTime = deltaTime;
    }

    public setBrake(state: boolean) {
        this.braking = state;
    }

    public setPose(x: number, y: number, heading: number) {
        this.x = x;
        this.y = y;
        this.heading = heading;
    }

    public setDimensions(w: number, h: number) {
        this.width = w;
        this.height = h;
    }

    public setColor(c: string) {
        this.color = c;
    }

    public setMaxVelocity(v: number) {
        this.maxV = v;
    }

    public setMaxHeadingVelocity(v: number) {
        this.maxHeadingV = v;
    }

    public setA(a: number) {
        this.a = a;
    }

    public setHeadingA(a: number) {
        this.headingA = a;
    }

    public getV() {
        return this.v;
    }

    public move() {
        this.x += this.v * Math.cos(this.heading - Math.PI / 2) * this.deltaTime;
        this.y += this.v * Math.sin(this.heading - Math.PI / 2) * this.deltaTime;

        this.heading += this.headingV * this.deltaTime;

        if (this.braking) {
            const sign = Math.sign(this.v);
            this.v -= sign * this.brakeFrictionA;
            if (this.v * sign < 0) {
                this.v = 0;
            }
        }
        
        else if (this.a === 0 && this.v !== 0) { // object slowing down from rolling friction
            const oldSign = Math.sign(this.v);
            this.v -= this.frictionA;
            if (Math.sign(this.v) * oldSign < 0) {
                this.v = 0;
            }
        }

        if (this.headingA === 0 && this.headingV !== 0) { // obj heading stoping from kinetic friction
            const sign = Math.sign(this.headingV);
            this.headingV -= sign * this.frictionHeadingA;
            if (this.headingV * sign < 0) {
                this.headingV = 0;
            }
        }

        this.v += this.a * this.deltaTime;
        this.headingV += this.headingA * this.deltaTime;

        if (this.v >= this.maxV) {
            this.v = this.maxV;
        }

        if (Math.abs(this.headingV) >= this.maxHeadingV) {
            this.headingV = Math.sign(this.headingV) * this.maxHeadingV;
        }
    }

    // do i need a prerender method? if i do put it in here
    // update: i do need a prerender method for collision stuff

    public abstract collisionDetect(): void;

    public render() {
        if (this.color === "") throw new Error("no color given");

        this.collisionDetect();

        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate(this.heading);
        this.ctx.translate(-this.x, -this.y);
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        this.ctx.restore();
    }
}