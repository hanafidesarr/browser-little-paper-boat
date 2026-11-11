import * as pc from 'playcanvas';

export class NatureMeshes {
  // Shared materials for efficient batching / low draw calls
  private static trunkMat: pc.StandardMaterial | null = null;
  private static foliageMatGreen: pc.StandardMaterial | null = null;
  private static foliageMatAutumn: pc.StandardMaterial | null = null;
  private static rockMat: pc.StandardMaterial | null = null;
  private static lilyPadMat: pc.StandardMaterial | null = null;
  private static flowerMat: pc.StandardMaterial | null = null;
  private static woodBridgeMat: pc.StandardMaterial | null = null;

  public static initMaterials(): void {
    if (this.trunkMat) return;

    this.trunkMat = new pc.StandardMaterial();
    this.trunkMat.diffuse = new pc.Color(0.48, 0.35, 0.22);
    this.trunkMat.update();

    this.foliageMatGreen = new pc.StandardMaterial();
    this.foliageMatGreen.diffuse = new pc.Color(0.28, 0.62, 0.32);
    this.foliageMatGreen.ambient = new pc.Color(0.18, 0.42, 0.22);
    this.foliageMatGreen.update();

    this.foliageMatAutumn = new pc.StandardMaterial();
    this.foliageMatAutumn.diffuse = new pc.Color(0.92, 0.55, 0.18);
    this.foliageMatAutumn.ambient = new pc.Color(0.60, 0.35, 0.12);
    this.foliageMatAutumn.update();

    this.rockMat = new pc.StandardMaterial();
    this.rockMat.diffuse = new pc.Color(0.46, 0.50, 0.45);
    this.rockMat.ambient = new pc.Color(0.32, 0.35, 0.32);
    this.rockMat.shininess = 20;
    this.rockMat.update();

    this.lilyPadMat = new pc.StandardMaterial();
    this.lilyPadMat.diffuse = new pc.Color(0.22, 0.68, 0.35);
    this.lilyPadMat.update();

    this.flowerMat = new pc.StandardMaterial();
    this.flowerMat.diffuse = new pc.Color(0.98, 0.42, 0.65);
    this.flowerMat.update();

    this.woodBridgeMat = new pc.StandardMaterial();
    this.woodBridgeMat.diffuse = new pc.Color(0.55, 0.38, 0.24);
    this.woodBridgeMat.update();
  }

  /**
   * Creates a stylized round foliage tree (fluffy anime aesthetic).
   */
  public static createDeciduousTree(isAutumn: boolean = false): pc.Entity {
    this.initMaterials();
    const tree = new pc.Entity('DeciduousTree');

    // Trunk
    const trunk = new pc.Entity('Trunk');
    trunk.addComponent('render', { type: 'cylinder' });
    trunk.setLocalScale(0.4, 2.2, 0.4);
    trunk.setLocalPosition(0, 1.1, 0);
    if (trunk.render?.meshInstances[0]) trunk.render.meshInstances[0].material = this.trunkMat!;
    tree.addChild(trunk);

    // Foliage Clusters (3 overlapping soft spheres for hand-painted silhouette)
    const folMat = isAutumn ? this.foliageMatAutumn! : this.foliageMatGreen!;

    const fol1 = new pc.Entity('FoliageMain');
    fol1.addComponent('render', { type: 'sphere' });
    fol1.setLocalScale(2.4, 2.1, 2.4);
    fol1.setLocalPosition(0, 2.8, 0);
    if (fol1.render?.meshInstances[0]) fol1.render.meshInstances[0].material = folMat;
    tree.addChild(fol1);

    const fol2 = new pc.Entity('FoliageSide');
    fol2.addComponent('render', { type: 'sphere' });
    fol2.setLocalScale(1.7, 1.6, 1.7);
    fol2.setLocalPosition(0.7, 2.3, 0.4);
    if (fol2.render?.meshInstances[0]) fol2.render.meshInstances[0].material = folMat;
    tree.addChild(fol2);

    const fol3 = new pc.Entity('FoliageTop');
    fol3.addComponent('render', { type: 'sphere' });
    fol3.setLocalScale(1.5, 1.5, 1.5);
    fol3.setLocalPosition(-0.4, 3.5, -0.3);
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
    trunk.setLocalScale(0.35, 1.8, 0.35);
    trunk.setLocalPosition(0, 0.9, 0);
    if (trunk.render?.meshInstances[0]) trunk.render.meshInstances[0].material = this.trunkMat!;
    tree.addChild(trunk);

    // Cones: 3 tiers
    const tiers = [
      { y: 1.8, scale: 2.2, h: 1.8 },
      { y: 2.8, scale: 1.7, h: 1.6 },
      { y: 3.7, scale: 1.1, h: 1.4 }
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
   * Creates a stylized mossy river stone.
   */
  public static createRiverRock(scale: number = 1.0): pc.Entity {
    this.initMaterials();
    const rock = new pc.Entity('RiverRock');
    rock.addComponent('render', { type: 'box' }); // Scaled box with smoothed orientation or sphere
    rock.setLocalScale(1.4 * scale, 0.8 * scale, 1.1 * scale);
    rock.setLocalPosition(0, 0.35 * scale, 0);
    rock.setLocalEulerAngles(12, 25, -8);
    if (rock.render?.meshInstances[0]) rock.render.meshInstances[0].material = this.rockMat!;
    return rock;
  }

  /**
   * Creates a floating lily pad with blossom.
   */
  public static createLilyPad(): pc.Entity {
    this.initMaterials();
    const padEntity = new pc.Entity('LilyPad');

    // Pad disc
    const disc = new pc.Entity('Disc');
    disc.addComponent('render', { type: 'cylinder' });
    disc.setLocalScale(0.9, 0.04, 0.9);
    disc.setLocalPosition(0, 0.02, 0);
    if (disc.render?.meshInstances[0]) disc.render.meshInstances[0].material = this.lilyPadMat!;
    padEntity.addChild(disc);

    // Blossom flower
    const flower = new pc.Entity('Blossom');
    flower.addComponent('render', { type: 'sphere' });
    flower.setLocalScale(0.32, 0.28, 0.32);
    flower.setLocalPosition(0.1, 0.12, 0.05);
    if (flower.render?.meshInstances[0]) flower.render.meshInstances[0].material = this.flowerMat!;
    padEntity.addChild(flower);

    return padEntity;
  }

  /**
   * Creates a rustic wooden bridge spanning across the river width.
   */
  public static createWoodenBridge(spanWidth: number): pc.Entity {
    this.initMaterials();
    const bridge = new pc.Entity('WoodenBridge');

    // Bridge Deck (wood plank arch)
    const deck = new pc.Entity('BridgeDeck');
    deck.addComponent('render', { type: 'box' });
    deck.setLocalScale(spanWidth + 2.5, 0.25, 2.2);
    deck.setLocalPosition(0, 2.2, 0);
    if (deck.render?.meshInstances[0]) deck.render.meshInstances[0].material = this.woodBridgeMat!;
    bridge.addChild(deck);

    // Left and Right timber railings
    const railZ = [0.95, -0.95];
    railZ.forEach(z => {
      const rail = new pc.Entity('Rail');
      rail.addComponent('render', { type: 'box' });
      rail.setLocalScale(spanWidth + 2.5, 0.18, 0.15);
      rail.setLocalPosition(0, 2.85, z);
      if (rail.render?.meshInstances[0]) rail.render.meshInstances[0].material = this.woodBridgeMat!;
      bridge.addChild(rail);
    });

    // Vertical bridge support pillars embedded in banks
    const pillarX = [-(spanWidth * 0.45), spanWidth * 0.45];
    pillarX.forEach(x => {
      railZ.forEach(z => {
        const pillar = new pc.Entity('Pillar');
        pillar.addComponent('render', { type: 'cylinder' });
        pillar.setLocalScale(0.28, 3.2, 0.28);
        pillar.setLocalPosition(x, 1.5, z);
        if (pillar.render?.meshInstances[0]) pillar.render.meshInstances[0].material = this.woodBridgeMat!;
        bridge.addChild(pillar);
      });
    });

    return bridge;
  }
}
