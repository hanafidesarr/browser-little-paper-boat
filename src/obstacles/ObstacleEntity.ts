import * as pc from 'playcanvas';

export type ObstacleType = 'rock' | 'branch' | 'duck' | 'frog' | 'whirlpool';

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
  public entity: pc.Entity;
  private animTimer: number = Math.random() * 10;
  private hitCooldown: number = 0;

  constructor(device: pc.GraphicsDevice, data: ObstacleData) {
    this.distance = data.distance;
    this.lateralOffset = data.lateralOffset;
    this.type = data.type;
    this.radius = data.radius ?? (data.type === 'rock' ? 1.0 : (data.type === 'branch' ? 1.4 : 0.8));

    this.entity = new pc.Entity(`Obstacle_${this.type}_${Math.floor(this.distance)}`);
    this.buildMesh(device);
  }

  private buildMesh(device: pc.GraphicsDevice): void {
    if (this.type === 'rock') {
      const rockMat = new pc.StandardMaterial();
      rockMat.diffuse = new pc.Color(0.42, 0.44, 0.40);
      rockMat.ambient = new pc.Color(0.28, 0.32, 0.28);
      rockMat.shininess = 20;
      rockMat.update();

      const rock = new pc.Entity('RockVisual');
      rock.addComponent('render', { type: 'sphere' });
      rock.setLocalScale(this.radius * 1.8, this.radius * 1.2, this.radius * 1.6);
      rock.setLocalPosition(0, this.radius * 0.4, 0);
      if (rock.render?.meshInstances[0]) rock.render.meshInstances[0].material = rockMat;
      this.entity.addChild(rock);

    } else if (this.type === 'branch') {
      const logMat = new pc.StandardMaterial();
      logMat.diffuse = new pc.Color(0.45, 0.32, 0.22);
      logMat.update();

      const log = new pc.Entity('LogVisual');
      log.addComponent('render', { type: 'cylinder' });
      log.setLocalScale(0.35, this.radius * 2.2, 0.35);
      log.setLocalEulerAngles(0, 30, 90);
      log.setLocalPosition(0, 0.08, 0);
      if (log.render?.meshInstances[0]) log.render.meshInstances[0].material = logMat;
      this.entity.addChild(log);

    } else if (this.type === 'duck') {
      // Cozy Yellow River Duck
      const yellowMat = new pc.StandardMaterial();
      yellowMat.diffuse = new pc.Color(0.98, 0.82, 0.18);
      yellowMat.update();

      const orangeMat = new pc.StandardMaterial();
      orangeMat.diffuse = new pc.Color(0.96, 0.45, 0.12);
      orangeMat.update();

      // Body
      const body = new pc.Entity('DuckBody');
      body.addComponent('render', { type: 'sphere' });
      body.setLocalScale(0.65, 0.45, 0.85);
      body.setLocalPosition(0, 0.18, 0);
      if (body.render?.meshInstances[0]) body.render.meshInstances[0].material = yellowMat;
      this.entity.addChild(body);

      // Head
      const head = new pc.Entity('DuckHead');
      head.addComponent('render', { type: 'sphere' });
      head.setLocalScale(0.38, 0.38, 0.38);
      head.setLocalPosition(0, 0.45, 0.32);
      if (head.render?.meshInstances[0]) head.render.meshInstances[0].material = yellowMat;
      this.entity.addChild(head);

      // Beak
      const beak = new pc.Entity('DuckBeak');
      beak.addComponent('render', { type: 'cone' });
      beak.setLocalScale(0.18, 0.28, 0.18);
      beak.setLocalEulerAngles(85, 0, 0);
      beak.setLocalPosition(0, 0.42, 0.55);
      if (beak.render?.meshInstances[0]) beak.render.meshInstances[0].material = orangeMat;
      this.entity.addChild(beak);

    } else if (this.type === 'frog') {
      // Friendly Green Frog
      const frogMat = new pc.StandardMaterial();
      frogMat.diffuse = new pc.Color(0.32, 0.72, 0.28);
      frogMat.update();

      const padMat = new pc.StandardMaterial();
      padMat.diffuse = new pc.Color(0.2, 0.55, 0.25);
      padMat.update();

      // Lily pad base
      const pad = new pc.Entity('Pad');
      pad.addComponent('render', { type: 'cylinder' });
      pad.setLocalScale(0.9, 0.04, 0.9);
      pad.setLocalPosition(0, 0.02, 0);
      if (pad.render?.meshInstances[0]) pad.render.meshInstances[0].material = padMat;
      this.entity.addChild(pad);

      // Frog body
      const frog = new pc.Entity('FrogBody');
      frog.addComponent('render', { type: 'sphere' });
      frog.setLocalScale(0.42, 0.35, 0.48);
      frog.setLocalPosition(0, 0.22, 0);
      if (frog.render?.meshInstances[0]) frog.render.meshInstances[0].material = frogMat;
      this.entity.addChild(frog);

    } else if (this.type === 'whirlpool') {
      // Swirling eddy ring
      const swirlMat = new pc.StandardMaterial();
      swirlMat.diffuse = new pc.Color(0.3, 0.8, 0.9);
      swirlMat.opacity = 0.5;
      swirlMat.blendType = pc.BLEND_ADDITIVE;
      swirlMat.update();

      const swirl = new pc.Entity('SwirlRing');
      swirl.addComponent('render', { type: 'cylinder' });
      swirl.setLocalScale(1.8, 0.02, 1.8);
      swirl.setLocalPosition(0, 0.01, 0);
      if (swirl.render?.meshInstances[0]) swirl.render.meshInstances[0].material = swirlMat;
      this.entity.addChild(swirl);
    }
  }

  public update(dt: number, boatDist: number, boatLat: number): void {
    this.animTimer += dt;
    if (this.hitCooldown > 0) this.hitCooldown -= dt;

    if (this.type === 'duck') {
      // Natural bobbing and curious turning
      const pos = this.entity.getPosition();
      this.entity.setPosition(pos.x, 0.05 + Math.sin(this.animTimer * 2.2) * 0.03, pos.z);
      this.entity.rotate(0, Math.sin(this.animTimer * 1.5) * 15 * dt, 0);

      // Duck swims gently aside if boat comes within 5m
      const distDelta = this.distance - boatDist;
      if (distDelta > 0 && distDelta < 5.0) {
        const side = this.lateralOffset >= boatLat ? 1 : -1;
        this.lateralOffset += side * 1.2 * dt;
      }
    } else if (this.type === 'whirlpool') {
      this.entity.rotate(0, 180 * dt, 0);
    } else if (this.type === 'frog') {
      // Little hop animation every 3 seconds
      const cycle = this.animTimer % 3.0;
      const hop = cycle < 0.4 ? Math.sin((cycle / 0.4) * Math.PI) * 0.25 : 0;
      const pos = this.entity.getPosition();
      this.entity.setPosition(pos.x, 0.02 + hop, pos.z);
    }
  }

  public canHit(): boolean {
    return this.hitCooldown <= 0;
  }

  public registerHit(): void {
    this.hitCooldown = 1.0;
  }

  public destroy(): void {
    this.entity.destroy();
  }
}
