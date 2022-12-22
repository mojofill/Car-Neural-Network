export default abstract class RenderedObject {
    private deltaTime: number = 0;
    
    public color: string = "";

    public x: number = 0; // center x
    public y: number = 0; // center y
    public heading: number = 0;

    public width: number = 0;
    public height: number = 0;
    
    public v: number = 0;
    public headingV: number = 0;

    public a: number = 0;
    public headingA: number = 0;
    
    public maxV: number = 0;
    public maxHeadingV: number = 0;

    constructor(
        public ctx: CanvasRenderingContext2D
    ) {}

    public setHeadingV(v: number) {
        this.headingV = v;
    }

    public setDeltaTime(deltaTime: number) {
        this.deltaTime = deltaTime;
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

    public move() {
        this.x += this.v * Math.cos(this.heading - Math.PI / 2) * this.deltaTime;
        this.y += this.v * Math.sin(this.heading - Math.PI / 2) * this.deltaTime;
        this.heading += this.headingV;

        this.v += this.a * this.deltaTime;
        this.headingV += this.headingA * this.deltaTime;

        if (this.v >= this.maxV) {
            this.v = this.maxV;
        }

        if (this.v < 0) {
            this.v = 0;
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

        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate(this.heading);
        this.ctx.translate(-this.x, -this.y);
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        this.ctx.restore();
    }
}