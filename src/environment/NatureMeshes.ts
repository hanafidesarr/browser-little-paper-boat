import * as pc from 'playcanvas';

export class NatureMeshes {
  // Shared materials for low draw calls & high mobile performance
  private static trunkMat: pc.StandardMaterial | null = null;
  private static birchTrunkMat: pc.StandardMaterial | null = null;
  private static foliageMatMeadow: pc.StandardMaterial | null = null;
  private static foliageMatGrass: pc.StandardMaterial | null = null;
  private static foliageMatDeep: pc.StandardMaterial | null = null;
  private static foliageMatAutumnOrange: pc.StandardMaterial | null = null;
  private static foliageMatAutumnGold: pc.StandardMaterial | null = null;
  private static rockMat: pc.StandardMaterial | null = null;
  private static rockMossMat: pc.StandardMaterial | null = null;
  private static lilyPadMat: pc.StandardMaterial | null = null;
  private static flowerWhiteMat: pc.StandardMaterial | null = null;
  private static flowerYellowMat: pc.StandardMaterial | null = null;
  private static flowerPinkMat: pc.StandardMaterial | null = null;
  private static flowerPurpleMat: pc.StandardMaterial | null = null;
  private static flowerCenterMat: pc.StandardMaterial | null = null;
  private static grassMat: pc.StandardMaterial | null = null;
  private static bushMat: pc.StandardMaterial | null = null;
  private static woodBridgeMat: pc.StandardMaterial | null = null;

  public static initMaterials(): void {
    if (this.trunkMat) return;

    // Stylized Meadow Color Palette
    // Meadow Green: #78B96B (0.471, 0.725, 0.420)
    // Grass Green: #9ACB72 (0.604, 0.796, 0.447)
    // Deep Forest Green: #477C52 (0.278, 0.486, 0.322)
    // Flower Yellow: #F7D66A | Flower Pink: #E99AB2 | Flower White: #F4F1E5 | Flower Purple: #B39DDB

    this.trunkMat = new pc.StandardMaterial();
    this.trunkMat.diffuse = new pc.Color(0.42, 0.31, 0.21); // Smooth warm wood
    this.trunkMat.ambient = new pc.Color(0.32, 0.24, 0.16);
    this.trunkMat.update();

    this.birchTrunkMat = new pc.StandardMaterial();
    this.birchTrunkMat.diffuse = new pc.Color(0.92, 0.89, 0.82); // Birch trunk cream
    this.birchTrunkMat.ambient = new pc.Color(0.65, 0.62, 0.58);
    this.birchTrunkMat.update();

    this.foliageMatMeadow = new pc.StandardMaterial();
    this.foliageMatMeadow.diffuse = new pc.Color(0.471, 0.725, 0.420); // #78B96B Meadow Green
    this.foliageMatMeadow.ambient = new pc.Color(0.32, 0.52, 0.28);
    this.foliageMatMeadow.shininess = 16;
    this.foliageMatMeadow.update();

    this.foliageMatGrass = new pc.StandardMaterial();
    this.foliageMatGrass.diffuse = new pc.Color(0.604, 0.796, 0.447); // #9ACB72 Grass Green
    this.foliageMatGrass.ambient = new pc.Color(0.42, 0.58, 0.32);
    this.foliageMatGrass.update();

    this.foliageMatDeep = new pc.StandardMaterial();
    this.foliageMatDeep.diffuse = new pc.Color(0.278, 0.486, 0.322); // #477C52 Deep Forest Green
    this.foliageMatDeep.ambient = new pc.Color(0.18, 0.35, 0.22);
    this.foliageMatDeep.update();

    this.foliageMatAutumnOrange = new pc.StandardMaterial();
    this.foliageMatAutumnOrange.diffuse = new pc.Color(0.88, 0.48, 0.16); // Warm Autumn Amber
    this.foliageMatAutumnOrange.ambient = new pc.Color(0.58, 0.32, 0.12);
    this.foliageMatAutumnOrange.update();

    this.foliageMatAutumnGold = new pc.StandardMaterial();
    this.foliageMatAutumnGold.diffuse = new pc.Color(0.94, 0.70, 0.22); // Golden Autumn
    this.foliageMatAutumnGold.ambient = new pc.Color(0.62, 0.45, 0.15);
    this.foliageMatAutumnGold.update();

    this.rockMat = new pc.StandardMaterial();
    this.rockMat.diffuse = new pc.Color(0.42, 0.47, 0.45); // Smooth river stone
    this.rockMat.ambient = new pc.Color(0.30, 0.34, 0.32);
    this.rockMat.shininess = 18;
    this.rockMat.update();

    this.rockMossMat = new pc.StandardMaterial();
    this.rockMossMat.diffuse = new pc.Color(0.44, 0.66, 0.36); // Velvety moss cap
    this.rockMossMat.ambient = new pc.Color(0.28, 0.46, 0.24);
    this.rockMossMat.update();

    this.lilyPadMat = new pc.StandardMaterial();
    this.lilyPadMat.diffuse = new pc.Color(0.22, 0.68, 0.36);
    this.lilyPadMat.ambient = new pc.Color(0.16, 0.48, 0.25);
    this.lilyPadMat.update();

    this.flowerWhiteMat = new pc.StandardMaterial();
    this.flowerWhiteMat.diffuse = new pc.Color(0.957, 0.945, 0.898); // #F4F1E5 White daisies
    this.flowerWhiteMat.ambient = new pc.Color(0.65, 0.64, 0.60);
    this.flowerWhiteMat.update();

    this.flowerYellowMat = new pc.StandardMaterial();
    this.flowerYellowMat.diffuse = new pc.Color(0.969, 0.839, 0.416); // #F7D66A Buttercups
    this.flowerYellowMat.ambient = new pc.Color(0.65, 0.56, 0.28);
    this.flowerYellowMat.update();

    this.flowerPinkMat = new pc.StandardMaterial();
    this.flowerPinkMat.diffuse = new pc.Color(0.914, 0.604, 0.698); // #E99AB2 Pink blossoms
    this.flowerPinkMat.ambient = new pc.Color(0.62, 0.40, 0.46);
    this.flowerPinkMat.update();

    this.flowerPurpleMat = new pc.StandardMaterial();
    this.flowerPurpleMat.diffuse = new pc.Color(0.702, 0.616, 0.859); // #B39DDB Purple bells
    this.flowerPurpleMat.ambient = new pc.Color(0.46, 0.40, 0.58);
    this.flowerPurpleMat.update();

    this.flowerCenterMat = new pc.StandardMaterial();
    this.flowerCenterMat.diffuse = new pc.Color(0.96, 0.68, 0.16); // Golden pistil
    this.flowerCenterMat.update();

    this.grassMat = new pc.StandardMaterial();
    this.grassMat.diffuse = new pc.Color(0.54, 0.75, 0.40); // Lush meadow grass
    this.grassMat.ambient = new pc.Color(0.35, 0.52, 0.26);
    this.grassMat.update();

    this.bushMat = new pc.StandardMaterial();
    this.bushMat.diffuse = new pc.Color(0.42, 0.66, 0.36);
    this.bushMat.ambient = new pc.Color(0.28, 0.46, 0.24);
    this.bushMat.update();

    this.woodBridgeMat = new pc.StandardMaterial();
    this.woodBridgeMat.diffuse = new pc.Color(0.52, 0.36, 0.22);
    this.woodBridgeMat.ambient = new pc.Color(0.35, 0.24, 0.15);
    this.woodBridgeMat.update();
  }

  /**
   * Creates a stylized fluffy cloud-canopy deciduous tree (organic multi-crown pillowy silhouette).
   */
  public static createDeciduousTree(isAutumn: boolean = false): pc.Entity {
    this.initMaterials();
    const tree = new pc.Entity('DeciduousTree');

    // Smooth stylized trunk
    const trunk = new pc.Entity('Trunk');
    trunk.addComponent('render', { type: 'cylinder' });
    trunk.setLocalScale(0.42, 2.4, 0.42);
    trunk.setLocalPosition(0, 1.2, 0);
    if (trunk.render?.meshInstances[0]) trunk.render.meshInstances[0].material = this.trunkMat!;
    tree.addChild(trunk);

    // Pillowy Foliage: 4 overlapping soft rounded spheres
    const folMat = isAutumn ? this.foliageMatAutumnOrange! : this.foliageMatMeadow!;
    const highlightMat = isAutumn ? this.foliageMatAutumnGold! : this.foliageMatGrass!;

    const fol1 = new pc.Entity('FoliageMain');
    fol1.addComponent('render', { type: 'sphere' });
    fol1.setLocalScale(2.5, 2.2, 2.5);
    fol1.setLocalPosition(0, 3.0, 0);
    if (fol1.render?.meshInstances[0]) fol1.render.meshInstances[0].material = folMat;
    tree.addChild(fol1);

    const fol2 = new pc.Entity('FoliageSideL');
    fol2.addComponent('render', { type: 'sphere' });
    fol2.setLocalScale(1.8, 1.6, 1.8);
    fol2.setLocalPosition(0.75, 2.7, 0.4);
    if (fol2.render?.meshInstances[0]) fol2.render.meshInstances[0].material = highlightMat;
    tree.addChild(fol2);

    const fol3 = new pc.Entity('FoliageSideR');
    fol3.addComponent('render', { type: 'sphere' });
    fol3.setLocalScale(1.6, 1.5, 1.6);
    fol3.setLocalPosition(-0.65, 2.9, -0.35);
    if (fol3.render?.meshInstances[0]) fol3.render.meshInstances[0].material = folMat;
    tree.addChild(fol3);

    const folTop = new pc.Entity('FoliageTop');
    folTop.addComponent('render', { type: 'sphere' });
    folTop.setLocalScale(1.5, 1.4, 1.5);
    folTop.setLocalPosition(0.1, 3.8, 0.1);
    if (folTop.render?.meshInstances[0]) folTop.render.meshInstances[0].material = highlightMat;
    tree.addChild(folTop);

    return tree;
  }

  /**
   * Creates an elegant stylized birch tree with slender pale cream trunk and airy foliage puffs.
   */
  public static createBirchTree(): pc.Entity {
    this.initMaterials();
    const tree = new pc.Entity('BirchTree');

    const trunk = new pc.Entity('Trunk');
    trunk.addComponent('render', { type: 'cylinder' });
    trunk.setLocalScale(0.28, 3.2, 0.28);
    trunk.setLocalPosition(0, 1.6, 0);
    if (trunk.render?.meshInstances[0]) trunk.render.meshInstances[0].material = this.birchTrunkMat!;
    tree.addChild(trunk);

    // 3 Airy rounded foliage puffs
    const puffs = [
      { y: 3.2, x: 0.2, z: 0.1, s: 1.5, mat: this.foliageMatGrass! },
      { y: 4.1, x: -0.3, z: -0.2, s: 1.3, mat: this.foliageMatMeadow! },
      { y: 4.9, x: 0.1, z: 0.1, s: 1.1, mat: this.foliageMatGrass! }
    ];

    puffs.forEach((p, i) => {
      const puff = new pc.Entity(`Puff_${i}`);
      puff.addComponent('render', { type: 'sphere' });
      puff.setLocalScale(p.s, p.s * 0.9, p.s);
      puff.setLocalPosition(p.x, p.y, p.z);
      if (puff.render?.meshInstances[0]) puff.render.meshInstances[0].material = p.mat;
      tree.addChild(puff);
    });

    return tree;
  }

  /**
   * Creates a stylized conifer / pine tree with stepped triangular cone crowns.
   */
  public static createPineTree(): pc.Entity {
    this.initMaterials();
    const tree = new pc.Entity('PineTree');

    const trunk = new pc.Entity('Trunk');
    trunk.addComponent('render', { type: 'cylinder' });
    trunk.setLocalScale(0.36, 2.0, 0.36);
    trunk.setLocalPosition(0, 1.0, 0);
    if (trunk.render?.meshInstances[0]) trunk.render.meshInstances[0].material = this.trunkMat!;
    tree.addChild(trunk);

    const tiers = [
      { y: 2.0, scale: 2.3, h: 2.0, mat: this.foliageMatDeep! },
      { y: 3.2, scale: 1.8, h: 1.8, mat: this.foliageMatMeadow! },
      { y: 4.2, scale: 1.2, h: 1.5, mat: this.foliageMatGrass! }
    ];

    tiers.forEach((tier, i) => {
      const cone = new pc.Entity(`PineCone_${i}`);
      cone.addComponent('render', { type: 'cone' });
      cone.setLocalScale(tier.scale, tier.h, tier.scale);
      cone.setLocalPosition(0, tier.y, 0);
      if (cone.render?.meshInstances[0]) cone.render.meshInstances[0].material = tier.mat;
      tree.addChild(cone);
    });

    return tree;
  }

  /**
   * Creates a stylized flowering meadow bush with rounded foliage and tiny blossom accents.
   */
  public static createFloweringBush(flowerColor: 'pink' | 'yellow' | 'white' = 'pink'): pc.Entity {
    this.initMaterials();
    const bush = new pc.Entity('FloweringBush');

    // Main rounded foliage base
    const mainDome = new pc.Entity('BushDome');
    mainDome.addComponent('render', { type: 'sphere' });
    mainDome.setLocalScale(1.6, 1.0, 1.5);
    mainDome.setLocalPosition(0, 0.5, 0);
    if (mainDome.render?.meshInstances[0]) mainDome.render.meshInstances[0].material = this.bushMat!;
    bush.addChild(mainDome);

    const sideDome = new pc.Entity('BushSide');
    sideDome.addComponent('render', { type: 'sphere' });
    sideDome.setLocalScale(1.1, 0.8, 1.1);
    sideDome.setLocalPosition(0.45, 0.4, 0.25);
    if (sideDome.render?.meshInstances[0]) sideDome.render.meshInstances[0].material = this.foliageMatGrass!;
    bush.addChild(sideDome);

    // Mini blossom specks on bush
    const flowerMat = flowerColor === 'yellow' 
      ? this.flowerYellowMat! 
      : (flowerColor === 'white' ? this.flowerWhiteMat! : this.flowerPinkMat!);

    const blossomOffsets = [
      { x: -0.3, y: 0.85, z: 0.2 },
      { x: 0.25, y: 0.90, z: -0.2 },
      { x: 0.50, y: 0.65, z: 0.3 },
      { x: -0.45, y: 0.60, z: -0.3 }
    ];

    blossomOffsets.forEach((bOff, i) => {
      const fl = new pc.Entity(`BushBlossom_${i}`);
      fl.addComponent('render', { type: 'sphere' });
      fl.setLocalScale(0.18, 0.18, 0.18);
      fl.setLocalPosition(bOff.x, bOff.y, bOff.z);
      if (fl.render?.meshInstances[0]) fl.render.meshInstances[0].material = flowerMat;
      bush.addChild(fl);
    });

    return bush;
  }

  /**
   * Creates a stylized moss-covered river boulder.
   */
  public static createRiverRock(scale: number = 1.0): pc.Entity {
    this.initMaterials();
    const rockRoot = new pc.Entity('RiverRock');

    const rock = new pc.Entity('StoneBase');
    rock.addComponent('render', { type: 'sphere' });
    rock.setLocalScale(1.4 * scale, 0.9 * scale, 1.2 * scale);
    rock.setLocalPosition(0, 0.4 * scale, 0);
    rock.setLocalEulerAngles(12, 28, -6);
    if (rock.render?.meshInstances[0]) rock.render.meshInstances[0].material = this.rockMat!;
    rockRoot.addChild(rock);

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
   * Creates a blooming wild flower cluster (chamomile daisies, buttercups, pink blossoms or purple bells).
   */
  public static createFlowerCluster(variant: 'white' | 'yellow' | 'pink' | 'purple' = 'white'): pc.Entity {
    this.initMaterials();
    const cluster = new pc.Entity('FlowerCluster');

    let petalMat = this.flowerWhiteMat!;
    if (variant === 'yellow') petalMat = this.flowerYellowMat!;
    else if (variant === 'pink') petalMat = this.flowerPinkMat!;
    else if (variant === 'purple') petalMat = this.flowerPurpleMat!;

    // 3 small blossom stems
    const offsets = [
      { x: 0, z: 0, s: 0.28 },
      { x: 0.25, z: 0.18, s: 0.22 },
      { x: -0.22, z: -0.15, s: 0.24 }
    ];

    offsets.forEach((off, i) => {
      const blossom = new pc.Entity(`Blossom_${i}`);
      blossom.addComponent('render', { type: 'sphere' });
      blossom.setLocalScale(off.s * 1.4, off.s * 0.5, off.s * 1.4);
      blossom.setLocalPosition(off.x, 0.25, off.z);
      if (blossom.render?.meshInstances[0]) blossom.render.meshInstances[0].material = petalMat;
      cluster.addChild(blossom);

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
   * Creates a stylized grass tuft with varied curved blades.
   */
  public static createGrassTuft(): pc.Entity {
    this.initMaterials();
    const grass = new pc.Entity('GrassTuft');

    const blades = [
      { x: -0.12, z: 0.05, h: 0.65, rotZ: -14, rotY: 20 },
      { x: 0.0,   z: -0.04, h: 0.78, rotZ: 4,   rotY: 85 },
      { x: 0.14,  z: 0.03, h: 0.62, rotZ: 16,  rotY: 150 },
      { x: -0.04, z: 0.10, h: 0.52, rotZ: -8,  rotY: 230 }
    ];

    blades.forEach((b, i) => {
      const blade = new pc.Entity(`Blade_${i}`);
      blade.addComponent('render', { type: 'cone' });
      blade.setLocalScale(0.11, b.h, 0.11);
      blade.setLocalEulerAngles(6, b.rotY, b.rotZ);
      blade.setLocalPosition(b.x, b.h * 0.5, b.z);
      if (blade.render?.meshInstances[0]) blade.render.meshInstances[0].material = this.grassMat!;
      grass.addChild(blade);
    });

    return grass;
  }

  /**
   * Creates a floating lily pad with lotus blossom.
   */
  public static createLilyPad(isWhite: boolean = false): pc.Entity {
    this.initMaterials();
    const padEntity = new pc.Entity('LilyPad');

    const disc = new pc.Entity('Disc');
    disc.addComponent('render', { type: 'cylinder' });
    disc.setLocalScale(1.0, 0.04, 1.0);
    disc.setLocalPosition(0, 0.02, 0);
    if (disc.render?.meshInstances[0]) disc.render.meshInstances[0].material = this.lilyPadMat!;
    padEntity.addChild(disc);

    const petalMat = isWhite ? this.flowerWhiteMat! : this.flowerPinkMat!;

    const flower = new pc.Entity('Blossom');
    flower.addComponent('render', { type: 'sphere' });
    flower.setLocalScale(0.38, 0.32, 0.38);
    flower.setLocalPosition(0.12, 0.14, 0.06);
    if (flower.render?.meshInstances[0]) flower.render.meshInstances[0].material = petalMat;
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

    const deck = new pc.Entity('BridgeDeck');
    deck.addComponent('render', { type: 'box' });
    deck.setLocalScale(spanWidth + 3.0, 0.28, 2.4);
    deck.setLocalPosition(0, 2.4, 0);
    if (deck.render?.meshInstances[0]) deck.render.meshInstances[0].material = this.woodBridgeMat!;
    bridge.addChild(deck);

    const railZ = [1.05, -1.05];
    railZ.forEach(z => {
      const rail = new pc.Entity('Rail');
      rail.addComponent('render', { type: 'box' });
      rail.setLocalScale(spanWidth + 3.0, 0.18, 0.15);
      rail.setLocalPosition(0, 3.1, z);
      if (rail.render?.meshInstances[0]) rail.render.meshInstances[0].material = this.woodBridgeMat!;
      bridge.addChild(rail);
    });

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
