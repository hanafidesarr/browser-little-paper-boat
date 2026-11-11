export interface JoystickInput {
  x: number; // -1 (left) to +1 (right)
  active: boolean;
}

export class VirtualJoystick {
  private baseEl: HTMLElement;
  private knobEl: HTMLElement;
  private container: HTMLElement;
  private isPointerDown: boolean = false;
  private startX: number = 0;
  private currentX: number = 0;
  private readonly maxRadius: number = 45;
  private currentAxis: number = 0;

  public onAxisChange: ((axis: number) => void) | null = null;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'virtual-joystick-container';
    this.container.style.cssText = `
      position: absolute;
      bottom: 30px;
      left: 35px;
      width: 100px;
      height: 100px;
      z-index: 25;
      pointer-events: auto;
      touch-action: none;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    this.baseEl = document.createElement('div');
    this.baseEl.style.cssText = `
      width: 90px;
      height: 90px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.35);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 2px solid rgba(255, 255, 255, 0.7);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    `;

    this.knobEl = document.createElement('div');
    this.knobEl.style.cssText = `
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #2d7a46;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
      position: absolute;
      transition: transform 0.05s ease-out;
      pointer-events: none;
    `;

    this.baseEl.appendChild(this.knobEl);
    this.container.appendChild(this.baseEl);
    document.body.appendChild(this.container);

    this.bindEvents();
  }

  private bindEvents(): void {
    const handleStart = (clientX: number) => {
      this.isPointerDown = true;
      const rect = this.baseEl.getBoundingClientRect();
      this.startX = rect.left + rect.width / 2;
      this.updateKnob(clientX);
    };

    const handleMove = (clientX: number) => {
      if (!this.isPointerDown) return;
      this.updateKnob(clientX);
    };

    const handleEnd = () => {
      if (!this.isPointerDown) return;
      this.isPointerDown = false;
      this.currentAxis = 0;
      this.knobEl.style.transform = `translate(0px, 0px)`;
      if (this.onAxisChange) {
        this.onAxisChange(0);
      }
    };

    // Pointer events
    this.container.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      handleStart(e.clientX);
    });

    window.addEventListener('pointermove', (e) => {
      if (this.isPointerDown) {
        handleMove(e.clientX);
      }
    });

    window.addEventListener('pointerup', () => handleEnd());
    window.addEventListener('pointercancel', () => handleEnd());
  }

  private updateKnob(clientX: number): void {
    const deltaX = clientX - this.startX;
    const clampedX = Math.max(-this.maxRadius, Math.min(this.maxRadius, deltaX));
    this.knobEl.style.transform = `translate(${clampedX}px, 0px)`;

    this.currentAxis = clampedX / this.maxRadius;
    if (this.onAxisChange) {
      this.onAxisChange(this.currentAxis);
    }
  }

  public getAxis(): number {
    return this.currentAxis;
  }

  public isTouching(): boolean {
    return this.isPointerDown;
  }

  public setVisible(visible: boolean): void {
    this.container.style.display = visible ? 'flex' : 'none';
  }

  public destroy(): void {
    this.container.remove();
  }
}
