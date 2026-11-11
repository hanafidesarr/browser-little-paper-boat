# LITTLE PAPER BOAT — STYLIZED MEADOW ART DIRECTION

## 1. Visual Identity
**Stylized Meadow + Cozy Fantasy**

Little Paper Boat’s environment evokes the warmth, charm, and peaceful tranquility of a stylized picture book world (inspired by games like *Animal Crossing*, *The Witness*, and *Ghibli* animation). The environment emphasizes soft rounded shapes, rich organic vegetation, warm sunlight, and clean pastel nature tones.

---

## 2. Harmonious Color Palette

| Name | Hex Code | PlayCanvas Vec3 / Color | Description |
|---|---|---|---|
| **Meadow Green** | `#78B96B` | `(0.471, 0.725, 0.420)` | Primary lush meadow grass plateau |
| **Grass Green** | `#9ACB72` | `(0.604, 0.796, 0.447)` | Embankment crests & foliage highlights |
| **Deep Forest Green** | `#477C52` | `(0.278, 0.486, 0.322)` | Conifers, deep shadows, and mossy woods |
| **Water Soft Blue** | `#8BD3E8` | `(0.545, 0.827, 0.910)` | Crystal clear river water |
| **Sky Blue** | `#A8D8E8` | `(0.659, 0.847, 0.910)` | Clear day sky atmosphere |
| **Warm Sunlight** | `#FFE5A3` | `(1.000, 0.898, 0.639)` | Soft golden daylight illumination |
| **Flower Yellow** | `#F7D66A` | `(0.969, 0.839, 0.416)` | Wild buttercups & flower centers |
| **Flower Pink** | `#E99AB2` | `(0.914, 0.604, 0.698)` | Water lotus blossoms & meadow flowers |
| **Flower White** | `#F4F1E5` | `(0.957, 0.945, 0.898)` | Chamomile daisies |
| **Flower Purple** | `#B39DDB` | `(0.702, 0.616, 0.859)` | Wild meadow bells |

---

## 3. Stylized Vegetation & Geometry Architecture

### 3.1 Trees
- **Deciduous Trees:** Multi-sphere fluffy cloud canopies forming a soft, pillowy anime silhouette. Smooth warm wooden trunks with natural green color variations.
- **Birch Trees:** Elegant slender pale cream trunks with tiered, airy pastel-green foliage puffs.
- **Stylized Pines:** Stepped conical tiers with deep forest green needles and rounded geometry.
- **Flowering Bushes:** Rounded dome foliage clusters accented with small pink and yellow blossom specks.

### 3.2 Wildflowers & Grass
- **Wildflower Clusters:** 3-stem clusters with varied petal geometry supporting daisies (white), buttercups (yellow), pink blossoms, and purple bells.
- **Stylized Grass Tufts:** 4-blade curved grass clusters of varying heights and angles.

### 3.3 Riverbanks & Shorelines
- **10-Column Multi-Tier Profile:**
  - Waterline silt & sand lip (`height: 0.0m`).
  - Wet dark clay shoreline (`height: 0.48m`).
  - Warm brown stratified soil bluff (`height: 1.50m`).
  - Grass crest (`height: 2.64m`).
  - Elevated meadow plateau (`height: 3.00m`, `width: 15.0m`).
- Hand-painted procedural gradient texture with stratified cutbank earth, organic pebbles, and wildflower sprinkles.

---

## 4. Environment Animation
- **Gentle Wind Sway:** Grass tufts and wildflowers sway smoothly in the breeze (`Math.sin(time * 2.2 + phase) * amplitude`).
- **Breathing Tree Canopies:** Deciduous and birch canopies subtly breathe and tilt with the wind.
- **Butterflies:** Charming yellow, soft blue, and pink butterflies flutter along the riverbanks in smooth figure-8 flight paths with animated wing fluttering.
- **Water Lily Floating:** Lily pads gently bob on the moving surface ripples.
