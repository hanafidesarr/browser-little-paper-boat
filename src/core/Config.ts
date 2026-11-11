export const GameConfig = {
  TITLE: 'Little Paper Boat',
  TAGLINE: 'A little boat. A wonderful journey.',
  
  // Boat Physics & Dynamics
  BOAT: {
    DEFAULT_SPEED: 4.8,          // Baseline forward river speed
    STEER_SPEED: 7.2,            // Lateral responsiveness
    STEER_ACCEL: 24.0,           // Lateral acceleration
    STEER_DAMPING: 8.0,          // Inertia damping
    BANK_ANGLE_MAX: 16.0,        // Degrees of visual banking into turns
    FLOAT_BOB_FREQ: 2.2,         // Vertical water oscillation frequency
    FLOAT_BOB_AMP: 0.05,         // Vertical water oscillation amplitude
    FLOAT_ROLL_FREQ: 1.8,        // Roll oscillation frequency
    FLOAT_ROLL_AMP: 4.5,         // Roll oscillation amplitude (degrees)
    FLOAT_PITCH_FREQ: 1.5,       // Pitch oscillation frequency
    FLOAT_PITCH_AMP: 2.5,        // Pitch oscillation amplitude (degrees)
    SAFETY_MARGIN: 0.7,          // Distance from water edge to bounce back
    BOUNCE_DAMPING: 0.5          // Restitution on bank contact
  },

  // Camera Settings
  CAMERA: {
    FOLLOW_DISTANCE: 7.5,        // Distance behind boat
    ELEVATION: 4.2,              // Height above boat
    LOOKAHEAD: 7.0,              // Distance ahead along river spline to look at
    FOV: 55,
    POS_SMOOTHING: 7.0,          // Camera position lerp rate
    ROT_SMOOTHING: 6.0,          // Camera rotation slerp rate
    BANK_INFLUENCE: 0.2          // Camera subtle roll banking
  },

  // Audio Volumes
  AUDIO: {
    MUSIC_DEFAULT: 0.6,
    AMBIENT_DEFAULT: 0.7,
    SFX_DEFAULT: 0.8
  }
};
