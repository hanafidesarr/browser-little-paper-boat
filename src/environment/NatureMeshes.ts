import * as pc from 'playcanvas';

export class NatureMeshes {
  // Shared materials for low draw calls & high performance
  private static trunkMat: pc.StandardMaterial | null = null;
  private static foliageMatGreen: pc.StandardMaterial | null = null;
  private static foliageMatAutumn: pc.StandardMaterial | null = null;
  private static foliageMatLight: pc.StandardMaterial | null = null;
  private static rockMat: pc.StandardMaterial | null = null;
  private static rockMossMat: pc.StandardMaterial | null = null;
  private static lilyPadMat: pc.StandardMaterial | null = null;
  private static flowerPetalPinkMat: pc.StandardMaterial | null = null;
  private static flowerPetalYellowMat: pc.StandardMaterial | null = null;
  private static flowerCenterMat: pc.StandardMaterial | null = null;
  private static grassMat: pc.StandardMaterial | null = null;
  private static woodBridgeMat: pc.StandardMaterial | null = null;

  public static initMaterials(): void {
    if (this.trunkMat) return;

    this.trunkMat = new pc.StandardMaterial();
    this.trunkMat.diffuse = new pc.Color(0.48, 0.35, 0.22);
    this.trunkMat.ambient = new pc.Color(0.35, 0.25, 0.15);
    this.trunkMat.update();

    this.foliageMatGreen = new pc.StandardMaterial();
    this.foliageMatGreen.diffuse = new pc.Color(0.26, 0.64, 0.30);
    this.foliageMatGreen.ambient = new pc.Color(0.18, 0.44, 0.22);
    this.foliageMatGreen.shininess = 16;
    this.foliageMatGreen.update();

    this.foliageMatLight = new pc.StandardMaterial();
    this.foliageMatLight.diffuse = new pc.Color(0.42, 0.76, 0.38);
    this.foliageMatLight.ambient = new pc.Color(0.28, 0.52, 0.26);
    this.foliageMatLight.update();

    this.foliageMatAutumn = new pc.StandardMaterial();
    this.foliageMatAutumn.diffuse = new pc.Color(0.92, 0.55, 0.18);
    this.foliageMatAutumn.ambient = new pc.Color(0.60, 0.35, 0.12);
    this.foliageMatAutumn.update();

    this.rockMat = new pc.StandardMaterial();
    this.rockMat.diffuse = new pc.Color(0.46, 0.50, 0.46);
    this.rockMat.ambient = new pc.Color(0.32, 0.36, 0.32);
    this.rockMat.shininess = 20;
    this.rockMat.update();

    this.rockMossMat = new pc.StandardMaterial();
    this.rockMossMat.diffuse = new pc.Color(0.36, 0.56, 0.30);
    this.rockMossMat.ambient = new pc.Color(0.24, 0.40, 0.20);
    this.rockMossMat.update();

    this.lilyPadMat = new pc.StandardMaterial();
    this.lilyPadMat.diffuse = new pc.Color(0.20, 0.70, 0.35);
    this.lilyPadMat.ambient = new pc.Color(0.15, 0.48, 0.24);
    this.lilyPadMat.update();

    this.flowerPetalPinkMat = new pc.StandardMaterial();
    this.flowerPetalPinkMat.diffuse = new pc.Color(0.98, 0.45, 0.68);
    this.flowerPetalPinkMat.update();

    this.flowerPetalYellowMat = new pc.StandardMaterial();
    this.flowerPetalYellowMat.diffuse = new pc.Color(0.98, 0.85, 0.25);
    this.flowerPetalYellowMat.update();

    this.flowerCenterMat = new pc.StandardMaterial();
    this.flowerCenterMat.diffuse = new pc.Color(0.96, 0.65, 0.15);
    this.flowerCenterMat.update();

    this.grassMat = new pc.StandardMaterial();
    this.grassMat.diffuse = new pc.Color(0.35, 0.68, 0.32);
    this.grassMat.ambient = new pc.Color(0.24, 0.46, 0.22);
    this.grassMat.update();

    this.woodBridgeMat = new pc.StandardMaterial();
    this.woodBridgeMat.diffuse = new pc.Color(0.55, 0.38, 0.24);
    this.woodBridgeMat.ambient = new pc.Color(0.38, 0.26, 0.16);
    this.woodBridgeMat.update();
  }

  /**
   * Creates a stylized round fluffy foliage tree (hand-painted anime silhouette).
   */
  public static createDeciduousTree(isAutumn: boolean = false): pc.Entity {
    this.initMaterials();
    const tree = new pc.Entity('DeciduousTree');

    // Trunk
    const trunk = new pc.Entity('Trunk');
    trunk.addComponent('render', { type: 'cylinder' });
    trunk.setLocalScale(0.42, 2.4, 0.42);
    trunk.setLocalPosition(0, 1.2, 0);
    if (trunk.render?.meshInstances[0]) trunk.render.meshInstances[0].material = this.trunkMat!;
    tree.addChild(trunk);

    // Foliage Clusters (3 overlapping soft crowns)
    const folMat = isAutumn ? this.foliageMatAutumn! : this.foliageMatGreen!;
    const highlightMat = isAutumn ? this.foliageMatAutumn! : this.foliageMatLight!;

    const fol1 = new pc.Entity('FoliageMain');
    fol1.addComponent('render', { type: 'sphere' });
    fol1.setLocalScale(2.6, 2.3, 2.6);
    fol1.setLocalPosition(0, 3.1, 0);
    if (fol1.render?.meshInstances[0]) fol1.render.meshInstances[0].material = folMat;
    tree.addChild(fol1);

    const fol2 = new pc.Entity('FoliageSide');
    fol2.addComponent('render', { type: 'sphere' });
    fol2.setLocalScale(1.8, 1.7, 1.8);
    fol2.setLocalPosition(0.8, 2.6, 0.5);
    if (fol2.render?.meshInstances[0]) fol2.render.meshInstances[0].material = highlightMat;
    tree.addChild(fol2);

    const fol3 = new pc.Entity('FoliageTop');
    fol3.addComponent('render', { type: 'sphere' });
    fol3.setLocalScale(1.6, 1.6, 1.6);
    fol3.setLocalPosition(-0.5, 3.8, -0.4);
    if (fol3.render?.meshInstances[0]) fol3.render.meshInstances[0].material = folMat;
    tree.addChild(fol3);

    return tree;
  }

  /**
   * Creates a stylized conifer / pine tree with stepped triangular cone crowns.
   */
  public static createPineTree(): pc.Entity {
    this.initMaterials();
    const tree = new pc.Entity('PineTree');

    // Trunk
    const trunk = new pc.Entity('Trunk');
    trunk.addComponent('render', { type: 'cylinder' });
    trunk.setLocalScale(0.38, 2.0, 0.38);
    trunk.setLocalPosition(0, 1.0, 0);
    if (trunk.render?.meshInstances[0]) trunk.render.meshInstances[0].material = this.trunkMat!;
    tree.addChild(trunk);

    // Cones: 3 tiers
    const tiers = [
      { y: 2.0, scale: 2.4, h: 2.0 },
      { y: 3.2, scale: 1.8, h: 1.8 },
      { y: 4.2, scale: 1.2, h: 1.5 }
    ];

    tiers.forEach((tier, i) => {
      const cone = new pc.Entity(`PineCone_${i}`);
      cone.addComponent('render', { type: 'cone' });
      cone.setLocalScale(tier.scale, tier.h, tier.scale);
      cone.setLocalPosition(0, tier.y, 0);
      if (cone.render?.meshInstances[0]) cone.render.meshInstances[0].material = this.foliageMatGreen!;
      tree.addChild(cone);
    });

    return tree;
  }

  /**
   * Creates a stylized moss-covered river boulder.
   */
  public static createRiverRock(scale: number = 1.0): pc.Entity {
    this.initMaterials();
    const rockRoot = new pc.Entity('RiverRock');

    // Main base rock
    const rock = new pc.Entity('StoneBase');
    rock.addComponent('render', { type: 'sphere' });
    rock.setLocalScale(1.4 * scale, 0.9 * scale, 1.2 * scale);
    rock.setLocalPosition(0, 0.4 * scale, 0);
    rock.setLocalEulerAngles(12, 28, -6);
    if (rock.render?.meshInstances[0]) rock.render.meshInstances[0].material = this.rockMat!;
    rockRoot.addChild(rock);

    // Mossy cap on top
    const moss = new pc.Entity('MossCap');
    moss.addComponent('render', { type: 'sphere' });
    moss.setLocalScale(1.2 * scale, 0.45 * scale, 1.05 * scale);
    moss.setLocalPosition(0, 0.7 * scale, 0);
    moss.setLocalEulerAngles(8, 20, -4);
    if (moss.render?.meshInstances[0]) moss.render.meshInstances[0].material = this.rockMossMat!;
    rockRoot.addChild(moss);

    return rockRoot;
  }

  /**
   * Creates a blooming wild flower cluster (chamomile daisies or buttercups).
   */
  public static createFlowerCluster(isYellow: boolean = false): pc.Entity {
    this.initMaterials();
    const cluster = new pc.Entity('FlowerCluster');
    const petalMat = isYellow ? this.flowerPetalYellowMat! : this.flowerPetalPinkMat!;

    // 3 small blossom stems
    const offsets = [
      { x: 0, z: 0, s: 0.28 },
      { x: 0.25, z: 0.18, s: 0.22 },
      { x: -0.22, z: -0.15, s: 0.24 }
    ];

    offsets.forEach((off, i) => {
      // Petals disc/sphere
      const blossom = new pc.Entity(`Blossom_${i}`);
      blossom.addComponent('render', { type: 'sphere' });
      blossom.setLocalScale(off.s * 1.4, off.s * 0.5, off.s * 1.4);
      blossom.setLocalPosition(off.x, 0.25, off.z);
      if (blossom.render?.meshInstances[0]) blossom.render.meshInstances[0].material = petalMat;
      cluster.addChild(blossom);

      // Yellow center
      const center = new pc.Entity(`Center_${i}`);
      center.addComponent('render', { type: 'sphere' });
      center.setLocalScale(off.s * 0.55, off.s * 0.4, off.s * 0.55);
      center.setLocalPosition(off.x, 0.28, off.z);
      if (center.render?.meshInstances[0]) center.render.meshInstances[0].material = this.flowerCenterMat!;
      cluster.addChild(center);
    });

    return cluster;
  }

  /**
   * Creates a stylized grass tuft.
   */
  public static createGrassTuft(): pc.Entity {
    this.initMaterials();
    const grass = new pc.Entity('GrassTuft');

    for (let i = 0; i < 3; i++) {
      const blade = new pc.Entity(`Blade_${i}`);
      blade.addComponent('render', { type: 'cone' });
      blade.setLocalScale(0.12, 0.7, 0.12);
      blade.setLocalEulerAngles(8, i * 60, (i - 1) * 12);
      blade.setLocalPosition((i - 1) * 0.1, 0.35, 0);
      if (blade.render?.meshInstances[0]) blade.render.meshInstances[0].material = this.grassMat!;
      grass.addChild(blade);
    }

    return grass;
  }

  /**
   * Creates a floating lily pad with lotus blossom.
   */
  public static createLilyPad(): pc.Entity {
    this.initMaterials();
    const padEntity = new pc.Entity('LilyPad');

    // Pad disc
    const disc = new pc.Entity('Disc');
    disc.addComponent('render', { type: 'cylinder' });
    disc.setLocalScale(1.0, 0.04, 1.0);
    disc.setLocalPosition(0, 0.02, 0);
    if (disc.render?.meshInstances[0]) disc.render.meshInstances[0].material = this.lilyPadMat!;
    padEntity.addChild(disc);

    // Pink Lotus Blossom flower
    const flower = new pc.Entity('Blossom');
    flower.addComponent('render', { type: 'sphere' });
    flower.setLocalScale(0.38, 0.32, 0.38);
    flower.setLocalPosition(0.12, 0.14, 0.06);
    if (flower.render?.meshInstances[0]) flower.render.meshInstances[0].material = this.flowerPetalPinkMat!;
    padEntity.addChild(flower);

    const center = new pc.Entity('LotusCenter');
    center.addComponent('render', { type: 'sphere' });
    center.setLocalScale(0.16, 0.16, 0.16);
    center.setLocalPosition(0.12, 0.22, 0.06);
    if (center.render?.meshInstances[0]) center.render.meshInstances[0].material = this.flowerCenterMat!;
    padEntity.addChild(center);

    return padEntity;
  }

  /**
   * Creates a rustic wooden arch bridge spanning across the river width.
   */
  public static createWoodenBridge(spanWidth: number): pc.Entity {
    this.initMaterials();
    const bridge = new pc.Entity('WoodenBridge');

    // Bridge Deck (wood plank arch)
    const deck = new pc.Entity('BridgeDeck');
    deck.addComponent('render', { type: 'box' });
    deck.setLocalScale(spanWidth + 3.0, 0.28, 2.4);
    deck.setLocalPosition(0, 2.4, 0);
    if (deck.render?.meshInstances[0]) deck.render.meshInstances[0].material = this.woodBridgeMat!;
    bridge.addChild(deck);

    // Left and Right timber railings
    const railZ = [1.05, -1.05];
    railZ.forEach(z => {
      const rail = new pc.Entity('Rail');
      rail.addComponent('render', { type: 'box' });
      rail.setLocalScale(spanWidth + 3.0, 0.18, 0.15);
      rail.setLocalPosition(0, 3.1, z);
      if (rail.render?.meshInstances[0]) rail.render.meshInstances[0].material = this.woodBridgeMat!;
      bridge.addChild(rail);
    });

    // Vertical bridge support pillars embedded in banks
    const pillarX = [-(spanWidth * 0.46), spanWidth * 0.46];
    pillarX.forEach(x => {
      railZ.forEach(z => {
        const pillar = new pc.Entity('Pillar');
        pillar.addComponent('render', { type: 'cylinder' });
        pillar.setLocalScale(0.32, 3.8, 0.32);
        pillar.setLocalPosition(x, 1.8, z);
        if (pillar.render?.meshInstances[0]) pillar.render.meshInstances[0].material = this.woodBridgeMat!;
        bridge.addChild(pillar);
      });
    });

    return bridge;
  }
}
