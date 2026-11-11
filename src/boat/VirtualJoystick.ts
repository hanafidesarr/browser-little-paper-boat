export interface JoystickInput {
  x: number; // -1 (left) to +1 (right)
  active: boolean;
}

export class VirtualJoystick {
  private baseEl: HTMLElement;
  private knobEl: HTMLElement;
  private container: HTMLElement;
  private isPointerDown: boolean = false;
  private activePointerId: number = -1;
  private startX: number = 0;
  private startY: number = 0;
  private readonly maxRadius: number = 42;
  private currentAxis: number = 0;
  private isVisible: boolean = false;

  public onAxisChange: ((axis: number) => void) | null = null;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'virtual-joystick-container';
    this.container.className = 'virtual-joystick-wrap';
    this.container.style.display = 'none'; // Hidden: replaced by direct screen touchpad
    this.container.style.pointerEvents = 'none';

    this.baseEl = document.createElement('div');
    this.baseEl.className = 'joystick-base';

    this.knobEl = document.createElement('div');
    this.knobEl.className = 'joystick-knob';

    this.baseEl.appendChild(this.knobEl);
    this.container.appendChild(this.baseEl);
    document.body.appendChild(this.container);

    this.updatePosition();
    this.bindEvents();

    window.addEventListener('resize', () => this.updatePosition());
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.updatePosition(), 100);
    });
  }

  /**
   * Responsively positions joystick:
   * - Portrait: Centered horizontally at bottom (`left: 50%; transform: translateX(-50%);`)
   * - Landscape: Pinned to bottom-left with safe-area spacing
   */
  public updatePosition(): void {
    const isPortrait = window.innerHeight > window.innerWidth;
    if (isPortrait) {
      this.container.classList.add('portrait-mode');
      this.container.classList.remove('landscape-mode');
    } else {
      this.container.classList.add('landscape-mode');
      this.container.classList.remove('portrait-mode');
    }
  }

  private bindEvents(): void {
    const handleStart = (clientX: number, clientY: number, pointerId: number) => {
      this.isPointerDown = true;
      this.activePointerId = pointerId;
      const rect = this.baseEl.getBoundingClientRect();
      this.startX = rect.left + rect.width / 2;
      this.startY = rect.top + rect.height / 2;
      this.updateKnob(clientX, clientY);
    };

    const handleMove = (clientX: number, clientY: number) => {
      if (!this.isPointerDown) return;
      this.updateKnob(clientX, clientY);
    };

    const handleEnd = () => {
      if (!this.isPointerDown) return;
      this.isPointerDown = false;
      this.activePointerId = -1;
      this.currentAxis = 0;
      this.knobEl.style.transform = `translate(0px, 0px)`;
      if (this.onAxisChange) {
        this.onAxisChange(0);
      }
    };

    // Pointer events with pointer capture
    this.baseEl.addEventListener('pointerdown', (e: PointerEvent) => {
      e.stopPropagation();
      try {
        this.baseEl.setPointerCapture(e.pointerId);
      } catch (err) {
        // Safe fallback
      }
      handleStart(e.clientX, e.clientY, e.pointerId);
    });

    this.baseEl.addEventListener('pointermove', (e: PointerEvent) => {
      if (!this.isPointerDown || e.pointerId !== this.activePointerId) return;
      e.stopPropagation();
      handleMove(e.clientX, e.clientY);
    });

    this.baseEl.addEventListener('pointerup', (e: PointerEvent) => {
      if (e.pointerId === this.activePointerId) {
        try {
          this.baseEl.releasePointerCapture(e.pointerId);
        } catch (err) {
          // Safe fallback
        }
        handleEnd();
      }
    });

    this.baseEl.addEventListener('pointercancel', (e: PointerEvent) => {
      if (e.pointerId === this.activePointerId) {
        handleEnd();
      }
    });

    // Window safety fallback
    window.addEventListener('pointerup', (e: PointerEvent) => {
      if (e.pointerId === this.activePointerId) {
        handleEnd();
      }
    });
  }

  private updateKnob(clientX: number, clientY: number): void {
    let dx = clientX - this.startX;
    let dy = clientY - this.startY;

    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > this.maxRadius) {
      dx = (dx / dist) * this.maxRadius;
      dy = (dy / dist) * this.maxRadius;
    }

    // Clamp horizontal axis -1 to +1 with smooth deadzone
    let normX = dx / this.maxRadius;
    if (Math.abs(normX) < 0.05) {
      normX = 0;
    }

    this.currentAxis = Math.max(-1.0, Math.min(1.0, normX));
    this.knobEl.style.transform = `translate(${dx}px, ${dy * 0.35}px)`;

    if (this.onAxisChange) {
      this.onAxisChange(this.currentAxis);
    }
  }

  public getAxis(): number {
    return this.currentAxis;
  }

  public setVisible(visible: boolean): void {
    this.isVisible = visible;
    this.container.style.display = 'none'; // Replaced by direct screen touchpad
    if (!visible) {
      this.currentAxis = 0;
      this.isPointerDown = false;
      this.knobEl.style.transform = `translate(0px, 0px)`;
      if (this.onAxisChange) {
        this.onAxisChange(0);
      }
    } else {
      this.updatePosition();
    }
  }

  public isJoystickVisible(): boolean {
    return this.isVisible;
  }

  public destroy(): void {
    this.container.remove();
  }
}
