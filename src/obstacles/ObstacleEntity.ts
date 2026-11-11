import * as pc from 'playcanvas';
import { RiverSystem } from '../river/RiverSystem';
import { EffectManager } from '../particles/EffectManager';
import { AudioManager } from '../audio/AudioManager';

export type ObstacleType =
  | 'rock'
  | 'branch'
  | 'log'
  | 'duck'
  | 'frog'
  | 'fish'
  | 'lily_pads'
  | 'whirlpool'
  | 'waterfall_zone';

export interface ObstacleData {
  distance: number;
  lateralOffset: number;
  type: ObstacleType;
  radius?: number;
}

export class ObstacleEntity {
  public distance: number;
  public lateralOffset: number;
  public type: ObstacleType;
  public radius: number;
  public isFriendly: boolean;

  public entity: pc.Entity;
  private animTimer: number;
  private hitCooldown: number = 0;

  // Specific entity animation states
  private animalTriggered: boolean = false;
  private fishJumpPhase: number = 0;

  constructor(app: pc.AppBase, data: ObstacleData) {
    this.distance = data.distance;
    this.lateralOffset = data.lateralOffset;
    this.type = data.type;
    this.animTimer = Math.random() * 10;

    // Determine radius & friendliness
    switch (data.type) {
      case 'rock':
        this.radius = data.radius ?? 1.1;
        this.isFriendly = false;
        break;
      case 'branch':
      case 'log':
        this.radius = data.radius ?? 1.4;
        this.isFriendly = false;
        break;
      case 'duck':
        this.radius = 0.85;
        this.isFriendly = true;
        break;
      case 'frog':
        this.radius = 0.8;
        this.isFriendly = true;
        break;
      case 'fish':
        this.radius = 0.7;
        this.isFriendly = true;
        break;
      case 'lily_pads':
        this.radius = 1.3;
        this.isFriendly = true;
        break;
      case 'whirlpool':
        this.radius = 2.4;
        this.isFriendly = true;
        break;
      case 'waterfall_zone':
        this.radius = 3.0;
        this.isFriendly = true;
        break;
      default:
        this.radius = 1.0;
        this.isFriendly = false;
    }

    this.entity = new pc.Entity(`Obstacle_${this.type}_${Math.floor(this.distance)}`);
    this.buildVisuals(app.graphicsDevice);
  }

  private buildVisuals(device: pc.GraphicsDevice): void {
    if (this.type === 'rock') {
      // Moss-dusted River Boulder
      const rockMat = new pc.StandardMaterial();
      rockMat.diffuse = new pc.Color(0.40, 0.44, 0.38);
      rockMat.ambient = new pc.Color(0.24, 0.30, 0.24);
      rockMat.shininess = 16;
      rockMat.cull = pc.CULLFACE_NONE;
      rockMat.update();

      const mossMat = new pc.StandardMaterial();
      mossMat.diffuse = new pc.Color(0.28, 0.52, 0.26);
      mossMat.shininess = 10;
      mossMat.cull = pc.CULLFACE_NONE;
      mossMat.update();

      const mainRock = new pc.Entity('RockCore');
      mainRock.addComponent('render', { type: 'sphere' });
      mainRock.setLocalScale(this.radius * 1.8, this.radius * 1.2, this.radius * 1.7);
      mainRock.setLocalPosition(0, this.radius * 0.35, 0);
      if (mainRock.render?.meshInstances[0]) mainRock.render.meshInstances[0].material = rockMat;
      this.entity.addChild(mainRock);

      // Moss crest cap on top
      const mossCap = new pc.Entity('MossCap');
      mossCap.addComponent('render', { type: 'sphere' });
      mossCap.setLocalScale(this.radius * 1.4, this.radius * 0.7, this.radius * 1.3);
      mossCap.setLocalPosition(0, this.radius * 0.65, 0);
      if (mossCap.render?.meshInstances[0]) mossCap.render.meshInstances[0].material = mossMat;
      this.entity.addChild(mossCap);

    } else if (this.type === 'branch' || this.type === 'log') {
      // Floating Weathered Driftwood Log
      const barkMat = new pc.StandardMaterial();
      barkMat.diffuse = new pc.Color(0.44, 0.30, 0.18);
      barkMat.ambient = new pc.Color(0.22, 0.16, 0.10);
      barkMat.cull = pc.CULLFACE_NONE;
      barkMat.update();

      const log = new pc.Entity('LogCore');
      log.addComponent('render', { type: 'cylinder' });
      log.setLocalScale(0.4, this.radius * 2.2, 0.4);
      log.setLocalEulerAngles(0, 40, 90);
      log.setLocalPosition(0, 0.1, 0);
      if (log.render?.meshInstances[0]) log.render.meshInstances[0].material = barkMat;
      this.entity.addChild(log);

      // Little green sprout leaf on log
      const sproutMat = new pc.StandardMaterial();
      sproutMat.diffuse = new pc.Color(0.45, 0.8, 0.3);
      sproutMat.cull = pc.CULLFACE_NONE;
      sproutMat.update();

      const sprout = new pc.Entity('Sprout');
      sprout.addComponent('render', { type: 'cone' });
      sprout.setLocalScale(0.18, 0.35, 0.18);
      sprout.setLocalPosition(0.2, 0.4, 0);
      if (sprout.render?.meshInstances[0]) sprout.render.meshInstances[0].material = sproutMat;
      this.entity.addChild(sprout);

    } else if (this.type === 'duck') {
      // Cozy Yellow River Duck
      const yellowMat = new pc.StandardMaterial();
      yellowMat.diffuse = new pc.Color(0.98, 0.84, 0.22);
      yellowMat.cull = pc.CULLFACE_NONE;
      yellowMat.update();

      const orangeMat = new pc.StandardMaterial();
      orangeMat.diffuse = new pc.Color(0.96, 0.45, 0.12);
      orangeMat.cull = pc.CULLFACE_NONE;
      orangeMat.update();

      const eyeMat = new pc.StandardMaterial();
      eyeMat.diffuse = new pc.Color(0.1, 0.1, 0.1);
      eyeMat.update();

      // Duck Body
      const body = new pc.Entity('DuckBody');
      body.addComponent('render', { type: 'sphere' });
      body.setLocalScale(0.7, 0.48, 0.9);
      body.setLocalPosition(0, 0.18, 0);
      if (body.render?.meshInstances[0]) body.render.meshInstances[0].material = yellowMat;
      this.entity.addChild(body);

      // Duck Head
      const head = new pc.Entity('DuckHead');
      head.addComponent('render', { type: 'sphere' });
      head.setLocalScale(0.42, 0.42, 0.42);
      head.setLocalPosition(0, 0.46, 0.32);
      if (head.render?.meshInstances[0]) head.render.meshInstances[0].material = yellowMat;
      this.entity.addChild(head);

      // Beak
      const beak = new pc.Entity('DuckBeak');
      beak.addComponent('render', { type: 'cone' });
      beak.setLocalScale(0.18, 0.28, 0.18);
      beak.setLocalEulerAngles(85, 0, 0);
      beak.setLocalPosition(0, 0.42, 0.58);
      if (beak.render?.meshInstances[0]) beak.render.meshInstances[0].material = orangeMat;
      this.entity.addChild(beak);

      // Eyes
      [-0.14, 0.14].forEach(x => {
        const eye = new pc.Entity('Eye');
        eye.addComponent('render', { type: 'sphere' });
        eye.setLocalScale(0.08, 0.08, 0.08);
        eye.setLocalPosition(x, 0.52, 0.42);
        if (eye.render?.meshInstances[0]) eye.render.meshInstances[0].material = eyeMat;
        this.entity.addChild(eye);
      });

    } else if (this.type === 'frog') {
      // Frog on Water Lily Pad
      const frogMat = new pc.StandardMaterial();
      frogMat.diffuse = new pc.Color(0.35, 0.74, 0.30);
      frogMat.cull = pc.CULLFACE_NONE;
      frogMat.update();

      const padMat = new pc.StandardMaterial();
      padMat.diffuse = new pc.Color(0.22, 0.56, 0.28);
      padMat.cull = pc.CULLFACE_NONE;
      padMat.update();

      // Lily pad base
      const pad = new pc.Entity('LilyPad');
      pad.addComponent('render', { type: 'cylinder' });
      pad.setLocalScale(1.1, 0.04, 1.1);
      pad.setLocalPosition(0, 0.02, 0);
      if (pad.render?.meshInstances[0]) pad.render.meshInstances[0].material = padMat;
      this.entity.addChild(pad);

      // Frog body
      const frog = new pc.Entity('FrogBody');
      frog.addComponent('render', { type: 'sphere' });
      frog.setLocalScale(0.48, 0.38, 0.55);
      frog.setLocalPosition(0, 0.22, 0);
      if (frog.render?.meshInstances[0]) frog.render.meshInstances[0].material = frogMat;
      this.entity.addChild(frog);

      // Frog eyes
      [-0.15, 0.15].forEach(x => {
        const eye = new pc.Entity('FrogEye');
        eye.addComponent('render', { type: 'sphere' });
        eye.setLocalScale(0.14, 0.14, 0.14);
        eye.setLocalPosition(x, 0.40, 0.15);
        if (eye.render?.meshInstances[0]) eye.render.meshInstances[0].material = frogMat;
        this.entity.addChild(eye);
      });

    } else if (this.type === 'fish') {
      // Playful leaping river trout / koi
      const fishMat = new pc.StandardMaterial();
      fishMat.diffuse = new pc.Color(0.96, 0.45, 0.25);
      fishMat.emissive = new pc.Color(0.5, 0.2, 0.1);
      fishMat.cull = pc.CULLFACE_NONE;
      fishMat.update();

      const fishBody = new pc.Entity('FishBody');
      fishBody.addComponent('render', { type: 'sphere' });
      fishBody.setLocalScale(0.32, 0.22, 0.7);
      fishBody.setLocalPosition(0, -0.2, 0);
      if (fishBody.render?.meshInstances[0]) fishBody.render.meshInstances[0].material = fishMat;
      this.entity.addChild(fishBody);

      // Tail fin
      const fin = new pc.Entity('FishTail');
      fin.addComponent('render', { type: 'cone' });
      fin.setLocalScale(0.18, 0.4, 0.08);
      fin.setLocalEulerAngles(90, 0, 0);
      fin.setLocalPosition(0, -0.2, -0.45);
      if (fin.render?.meshInstances[0]) fin.render.meshInstances[0].material = fishMat;
      this.entity.addChild(fin);

    } else if (this.type === 'lily_pads') {
      // Cluster of 3 floating lily pads
      const padMat = new pc.StandardMaterial();
      padMat.diffuse = new pc.Color(0.24, 0.60, 0.32);
      padMat.cull = pc.CULLFACE_NONE;
      padMat.update();

      [
        { x: -0.4, z: 0.2, s: 0.9 },
        { x: 0.5, z: -0.2, s: 1.0 },
        { x: 0.0, z: -0.5, s: 0.75 }
      ].forEach((p, idx) => {
        const pad = new pc.Entity(`Pad_${idx}`);
        pad.addComponent('render', { type: 'cylinder' });
        pad.setLocalScale(p.s, 0.03, p.s);
        pad.setLocalPosition(p.x, 0.02, p.z);
        if (pad.render?.meshInstances[0]) pad.render.meshInstances[0].material = padMat;
        this.entity.addChild(pad);
      });

    } else if (this.type === 'whirlpool') {
      // Swirling Cyan Eddy Vortex Rings
      const swirlMat = new pc.StandardMaterial();
      swirlMat.diffuse = new pc.Color(0.35, 0.85, 0.95);
      swirlMat.opacity = 0.6;
      swirlMat.blendType = pc.BLEND_ADDITIVE;
      swirlMat.cull = pc.CULLFACE_NONE;
      swirlMat.update();

      const swirl1 = new pc.Entity('SwirlOuter');
      swirl1.addComponent('render', { type: 'cylinder' });
      swirl1.setLocalScale(this.radius * 1.8, 0.02, this.radius * 1.8);
      swirl1.setLocalPosition(0, 0.02, 0);
      if (swirl1.render?.meshInstances[0]) swirl1.render.meshInstances[0].material = swirlMat;
      this.entity.addChild(swirl1);

      const swirl2 = new pc.Entity('SwirlInner');
      swirl2.addComponent('render', { type: 'cylinder' });
      swirl2.setLocalScale(this.radius * 1.0, 0.03, this.radius * 1.0);
      swirl2.setLocalPosition(0, 0.03, 0);
      if (swirl2.render?.meshInstances[0]) swirl2.render.meshInstances[0].material = swirlMat;
      this.entity.addChild(swirl2);

    } else if (this.type === 'waterfall_zone') {
      // Rapids Foaming Zone
      const rapidsMat = new pc.StandardMaterial();
      rapidsMat.diffuse = new pc.Color(0.9, 0.96, 1.0);
      rapidsMat.opacity = 0.55;
      rapidsMat.blendType = pc.BLEND_ADDITIVE;
      rapidsMat.cull = pc.CULLFACE_NONE;
      rapidsMat.update();

      const rapidsPlane = new pc.Entity('RapidsFoam');
      rapidsPlane.addComponent('render', { type: 'plane' });
      rapidsPlane.setLocalScale(this.radius * 1.8, 1.0, 3.5);
      rapidsPlane.setLocalPosition(0, 0.03, 0);
      if (rapidsPlane.render?.meshInstances[0]) rapidsPlane.render.meshInstances[0].material = rapidsMat;
      this.entity.addChild(rapidsPlane);
    }
  }

  public update(
    dt: number,
    boatDist: number,
    boatLat: number,
    river: RiverSystem,
    effects: EffectManager,
    audio: AudioManager
  ): void {
    this.animTimer += dt;
    if (this.hitCooldown > 0) this.hitCooldown -= dt;

    if (this.type === 'duck') {
      // Natural bobbing and curious paddling
      const distDelta = this.distance - boatDist;
      if (distDelta > 0 && distDelta < 6.0) {
        if (!this.animalTriggered) {
          this.animalTriggered = true;
          audio.playAnimalQuack();
        }
        // Gently paddle aside towards nearest bank
        const frame = river.getFrameAtDistance(this.distance);
        const maxLat = (frame.width * 0.5) - 0.8;
        const dir = this.lateralOffset >= 0 ? 1 : -1;
        this.lateralOffset = Math.max(-maxLat, Math.min(maxLat, this.lateralOffset + dir * 1.5 * dt));
      }

      // Re-anchor to river coordinates
      const targetPos = river.riverToWorld(this.distance, this.lateralOffset, 0.04 + Math.sin(this.animTimer * 2.5) * 0.03);
      this.entity.setPosition(targetPos);
      this.entity.rotate(0, Math.sin(this.animTimer * 1.6) * 12 * dt, 0);

    } else if (this.type === 'frog') {
      const distDelta = this.distance - boatDist;
      if (distDelta > 0 && distDelta < 4.8 && !this.animalTriggered) {
        this.animalTriggered = true;
        audio.playAnimalRibbit();
      }

      const cycle = this.animTimer % 2.8;
      let hop = 0;
      if (cycle < 0.4) {
        hop = Math.sin((cycle / 0.4) * Math.PI) * 0.35;
      }
      const targetPos = river.riverToWorld(this.distance, this.lateralOffset, 0.02 + hop);
      this.entity.setPosition(targetPos);

    } else if (this.type === 'fish') {
      // Fish periodic leap cycle (every 3 seconds)
      const leapPeriod = 3.2;
      const phase = (this.animTimer % leapPeriod) / 0.8; // 0.8s leap duration

      if (phase < 1.0) {
        // In the air!
        const arcY = Math.sin(phase * Math.PI) * 1.35;
        const lateralDrift = Math.cos(phase * Math.PI) * 0.8;
        const targetPos = river.riverToWorld(this.distance, this.lateralOffset + lateralDrift, arcY - 0.2);
        this.entity.setPosition(targetPos);

        // Arch rotation along flight path
        const pitchAngle = (1.0 - phase * 2.0) * 45;
        this.entity.setEulerAngles(pitchAngle, 45, 0);

        if (phase < 0.05 && this.fishJumpPhase !== 1) {
          this.fishJumpPhase = 1;
          effects.spawnSplash(targetPos, 1.4);
        } else if (phase > 0.95 && this.fishJumpPhase === 1) {
          this.fishJumpPhase = 2;
          effects.spawnSplash(targetPos, 1.6);
        }
      } else {
        this.fishJumpPhase = 0;
        // Submerged resting position under water
        const targetPos = river.riverToWorld(this.distance, this.lateralOffset, -0.6);
        this.entity.setPosition(targetPos);
      }

    } else if (this.type === 'whirlpool') {
      this.entity.rotate(0, 160 * dt, 0);

    } else if (this.type === 'branch' || this.type === 'log') {
      // Gentle floating rocking
      const bob = Math.sin(this.animTimer * 1.8) * 0.04;
      const targetPos = river.riverToWorld(this.distance, this.lateralOffset, 0.06 + bob);
      this.entity.setPosition(targetPos);
      this.entity.setEulerAngles(Math.sin(this.animTimer * 1.2) * 4, 30, Math.cos(this.animTimer * 1.4) * 6);
    }
  }

  public canHit(): boolean {
    return this.hitCooldown <= 0;
  }

  public registerHit(): void {
    this.hitCooldown = 1.2;
  }

  public destroy(): void {
    this.entity.destroy();
  }
}
