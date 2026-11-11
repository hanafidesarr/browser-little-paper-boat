import * as pc from 'playcanvas';
import { RiverSystem } from '../river/RiverSystem';
import { RiverFrame } from '../spline/RiverFrame';
import { RiverFollowCamera } from '../camera/RiverFollowCamera';
import { BoatController } from '../boat/BoatController';

export class RiverDebugVisualizer {
  private app: pc.AppBase;
  private river: RiverSystem;
  private enabled: boolean = false;
  private rootEntity: pc.Entity;

  // Colors
  private colTangent: pc.Color = new pc.Color(0.2, 0.95, 0.2); // Green
  private colNormal: pc.Color = new pc.Color(0.95, 0.25, 0.25); // Red
  private colLeftBound: pc.Color = new pc.Color(0.1, 0.8, 1.0); // Cyan
  private colRightBound: pc.Color = new pc.Color(0.1, 0.8, 1.0); // Cyan
  private colCenterSpline: pc.Color = new pc.Color(1.0, 1.0, 1.0); // White
  private colWidthBar: pc.Color = new pc.Color(1.0, 0.85, 0.2, 0.7); // Yellow/gold
  private colLookRay: pc.Color = new pc.Color(1.0, 0.45, 0.1); // Bright Orange
  private colCamForward: pc.Color = new pc.Color(0.1, 1.0, 0.9); // Cyan
  private colCamUp: pc.Color = new pc.Color(0.95, 0.2, 0.9); // Magenta

  // Persistent marker entities
  private controlPointMarkers: pc.Entity[] = [];
  private cachedFrames: RiverFrame[] = [];
  private lookTargetMarker: pc.Entity;

  constructor(app: pc.AppBase, river: RiverSystem) {
    this.app = app;
    this.river = river;
    this.rootEntity = new pc.Entity('RiverDebugVisualizerRoot');
    this.app.root.addChild(this.rootEntity);

    // Look target visual sphere
    this.lookTargetMarker = new pc.Entity('CameraLookTargetMarker');
    this.lookTargetMarker.addComponent('render', { type: 'sphere' });
    this.lookTargetMarker.setLocalScale(0.4, 0.4, 0.4);
    const targetMat = new pc.StandardMaterial();
    targetMat.diffuse = new pc.Color(1.0, 0.4, 0.1);
    targetMat.emissive = new pc.Color(0.8, 0.3, 0.05);
    targetMat.update();
    if (this.lookTargetMarker.render?.meshInstances[0]) {
      this.lookTargetMarker.render.meshInstances[0].material = targetMat;
    }
    this.rootEntity.addChild(this.lookTargetMarker);

    this.rebuildControlPointMarkers();
    this.cacheSamples();
    this.rootEntity.enabled = this.enabled;
  }

  public rebuildControlPointMarkers(): void {
    for (const m of this.controlPointMarkers) {
      m.destroy();
    }
    this.controlPointMarkers = [];

    const mat = new pc.StandardMaterial();
    mat.diffuse = new pc.Color(1.0, 0.9, 0.1);
    mat.emissive = new pc.Color(0.5, 0.45, 0.05);
    mat.update();

    const controlPoints = this.river.getSpline().getControlPoints();
    controlPoints.forEach((pt, i) => {
      const marker = new pc.Entity(`ControlPointMarker_${i}`);
      marker.addComponent('render', { type: 'sphere' });
      marker.setLocalScale(1.2, 1.2, 1.2);
      marker.setPosition(pt.position.x, pt.position.y + 0.6, pt.position.z);
      if (marker.render?.meshInstances[0]) {
        marker.render.meshInstances[0].material = mat;
      }
      this.rootEntity.addChild(marker);
      this.controlPointMarkers.push(marker);
    });
  }

  public cacheSamples(): void {
    this.cachedFrames = [];
    const totalLength = this.river.getTotalLength();
    const step = 2.5;
    const count = Math.ceil(totalLength / step) + 1;

    for (let i = 0; i < count; i++) {
      const dist = Math.min(totalLength, i * step);
      this.cachedFrames.push(this.river.getFrameAtDistance(dist));
    }
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    this.rootEntity.enabled = this.enabled;
    return this.enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(val: boolean): void {
    this.enabled = val;
    this.rootEntity.enabled = this.enabled;
  }

  /**
   * Renders river spline debug lines.
   */
  public render(): void {
    if (!this.enabled || this.cachedFrames.length < 2) return;

    for (let i = 0; i < this.cachedFrames.length; i++) {
      const f = this.cachedFrames[i];
      const pos = f.position;
      const halfW = f.width * 0.5;

      const pLeft = new pc.Vec3(
        pos.x - f.normal.x * halfW,
        pos.y + 0.15,
        pos.z - f.normal.z * halfW
      );

      const pRight = new pc.Vec3(
        pos.x + f.normal.x * halfW,
        pos.y + 0.15,
        pos.z + f.normal.z * halfW
      );

      // Width indicator bar
      this.app.drawLine(pLeft, pRight, this.colWidthBar, false);

      // Spline Center Tangent (Green)
      const pTan = new pc.Vec3(
        pos.x + f.tangent.x * 1.8,
        pos.y + f.tangent.y * 1.8 + 0.1,
        pos.z + f.tangent.z * 1.8
      );
      this.app.drawLine(new pc.Vec3(pos.x, pos.y + 0.1, pos.z), pTan, this.colTangent, false);

      // Spline Normal Vector (Red)
      const pNorm = new pc.Vec3(
        pos.x + f.normal.x * 1.8,
        pos.y + f.normal.y * 1.8 + 0.1,
        pos.z + f.normal.z * 1.8
      );
      this.app.drawLine(new pc.Vec3(pos.x, pos.y + 0.1, pos.z), pNorm, this.colNormal, false);

      // Boundary line connection to next sample
      if (i < this.cachedFrames.length - 1) {
        const fNext = this.cachedFrames[i + 1];
        const nextHalfW = fNext.width * 0.5;

        const nextLeft = new pc.Vec3(
          fNext.position.x - fNext.normal.x * nextHalfW,
          fNext.position.y + 0.15,
          fNext.position.z - fNext.normal.z * nextHalfW
        );

        const nextRight = new pc.Vec3(
          fNext.position.x + fNext.normal.x * nextHalfW,
          fNext.position.y + 0.15,
          fNext.position.z + fNext.normal.z * nextHalfW
        );

        const nextCenter = new pc.Vec3(
          fNext.position.x,
          fNext.position.y + 0.1,
          fNext.position.z
        );

        // Center spine (White)
        this.app.drawLine(new pc.Vec3(pos.x, pos.y + 0.1, pos.z), nextCenter, this.colCenterSpline, false);

        // Left Boundary (Cyan)
        this.app.drawLine(pLeft, nextLeft, this.colLeftBound, false);

        // Right Boundary (Cyan)
        this.app.drawLine(pRight, nextRight, this.colRightBound, false);
      }
    }
  }

  /**
   * Renders camera raycast and target debug vectors.
   */
  public renderCameraDebug(camera: RiverFollowCamera, boat: BoatController): void {
    if (!this.enabled) return;

    const t = camera.getTelemetry();
    const camPos = t.worldPosition;
    const lookTarget = t.lookTarget;

    // Update Look Target Marker
    this.lookTargetMarker.setPosition(lookTarget);

    // 1. Ray from camera to look target (Bright Orange)
    this.app.drawLine(camPos, lookTarget, this.colLookRay, false);

    // 2. Camera Forward Vector (Cyan, 3.5m)
    const fwdEnd = new pc.Vec3(
      camPos.x + t.forwardVector.x * 3.5,
      camPos.y + t.forwardVector.y * 3.5,
      camPos.z + t.forwardVector.z * 3.5
    );
    this.app.drawLine(camPos, fwdEnd, this.colCamForward, false);

    // 3. Camera Up Vector (Magenta, 2.0m)
    const upEnd = new pc.Vec3(
      camPos.x + t.upVector.x * 2.0,
      camPos.y + t.upVector.y * 2.0,
      camPos.z + t.upVector.z * 2.0
    );
    this.app.drawLine(camPos, upEnd, this.colCamUp, false);

    // 4. Boat river tangent and normal at boat's current distance
    const boatDist = boat.getDistance();
    const frame = this.river.getFrameAtDistance(boatDist);
    const bPos = boat.getLogicalPosition();

    // Tangent at boat (Green, 3.0m)
    const bTan = new pc.Vec3(
      bPos.x + frame.tangent.x * 3.0,
      bPos.y + 0.2 + frame.tangent.y * 3.0,
      bPos.z + frame.tangent.z * 3.0
    );
    this.app.drawLine(new pc.Vec3(bPos.x, bPos.y + 0.2, bPos.z), bTan, this.colTangent, false);

    // Normal at boat (Red, 3.0m)
    const bNorm = new pc.Vec3(
      bPos.x + frame.normal.x * 3.0,
      bPos.y + 0.2 + frame.normal.y * 3.0,
      bPos.z + frame.normal.z * 3.0
    );
    this.app.drawLine(new pc.Vec3(bPos.x, bPos.y + 0.2, bPos.z), bNorm, this.colNormal, false);
  }

  public destroy(): void {
    this.rootEntity.destroy();
  }
}
