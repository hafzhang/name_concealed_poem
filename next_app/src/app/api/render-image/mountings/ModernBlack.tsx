
import React from 'react';

// --- Constants & Configuration ---
const MOUNTING_NAME = "Modern Black (现代黑框)";
const THEME_COLOR_PRIMARY = "#f4f7fc"; // Modern Web Light Background
const THEME_COLOR_SECONDARY = "#007BFF"; // Bootstrap Blue
const THEME_COLOR_ACCENT = "#ffffff"; // White
const MATTING_COLOR = "#ffffff"; // White Card

// --- Types ---
export interface MountingProps {
  children: any;
  width?: number;
  height?: number;
}

// --- Databases ---

/**
 * 1. GEOMETRIC_SHAPES_DB
 * A collection of SVG paths representing modern, minimalist geometric primitives.
 * Inspired by Bauhaus and Suprematism.
 */
const GEOMETRIC_SHAPES_DB = [
  {
    name: "Circle",
    path: "M50,10 A40,40 0 1,1 50,90 A40,40 0 1,1 50,10",
    description: "The perfect form, representing unity and infinity."
  },
  {
    name: "Square",
    path: "M10,10 H90 V90 H10 Z",
    description: "Stability, equality, and human construction."
  },
  {
    name: "Triangle",
    path: "M50,10 L90,90 H10 Z",
    description: "Direction, movement, and conflict."
  },
  {
    name: "Half Circle",
    path: "M10,50 A40,40 0 0,1 90,50 Z",
    description: "A bridge or a dome."
  },
  {
    name: "Quarter Circle",
    path: "M10,90 L10,10 A80,80 0 0,1 90,90 Z",
    description: "A sector of possibility."
  },
  {
    name: "Rectangle (Vertical)",
    path: "M20,10 H80 V90 H20 Z",
    description: "Growth and reach."
  },
  {
    name: "Rectangle (Horizontal)",
    path: "M10,30 H90 V70 H10 Z",
    description: "Foundation and horizon."
  },
  {
    name: "Cross",
    path: "M40,10 H60 V40 H90 V60 H60 V90 H40 V60 H10 V40 H40 Z",
    description: "Intersection and choice."
  },
  {
    name: "Diamond",
    path: "M50,10 L90,50 L50,90 L10,50 Z",
    description: "Value and rarity."
  },
  {
    name: "Hexagon",
    path: "M50,10 L85,30 L85,70 L50,90 L15,70 L15,30 Z",
    description: "Efficiency and nature's geometry."
  },
  // Adding more variations...
  {
    name: "Line (Vertical)",
    path: "M50,0 V100",
    description: "The axis of the world."
  },
  {
    name: "Line (Horizontal)",
    path: "M0,50 H100",
    description: "The timeline."
  },
  {
    name: "Line (Diagonal Up)",
    path: "M0,100 L100,0",
    description: "Ascension."
  },
  {
    name: "Line (Diagonal Down)",
    path: "M0,0 L100,100",
    description: "Descension."
  },
  {
    name: "Grid 2x2",
    path: "M0,50 H100 M50,0 V100 M0,0 H100 V100 H0 Z",
    description: "Order and categorization."
  },
  {
    name: "Concentric Circles",
    path: "M50,10 A40,40 0 1,1 50,90 A40,40 0 1,1 50,10 M50,30 A20,20 0 1,1 50,70 A20,20 0 1,1 50,30",
    description: "Echoes and ripples."
  },
  {
    name: "Parallel Lines",
    path: "M10,10 V90 M30,10 V90 M50,10 V90 M70,10 V90 M90,10 V90",
    description: "Uniformity and rhythm."
  },
  {
    name: "ZigZag",
    path: "M10,50 L30,20 L50,50 L70,20 L90,50",
    description: "Energy and frequency."
  },
  {
    name: "Wave",
    path: "M10,50 Q30,20 50,50 T90,50",
    description: "Fluidity and change."
  },
  {
    name: "Arrow",
    path: "M10,50 H70 L50,30 M50,70 L70,50",
    description: "Purpose and destination."
  },
];

/**
 * 2. MODERN_ART_MOVEMENTS
 * A glossary of art movements that influence this mounting style.
 */
const MODERN_ART_MOVEMENTS = [
  {
    id: "mv_001",
    name: "Minimalism",
    years: "1960s-Present",
    principles: ["Less is more", "Truth to materials", "Geometric abstraction"],
    key_artists: ["Donald Judd", "Agnes Martin", "Frank Stella"]
  },
  {
    id: "mv_002",
    name: "Bauhaus",
    years: "1919-1933",
    principles: ["Form follows function", "Mass production", "Unification of art and craft"],
    key_artists: ["Walter Gropius", "Paul Klee", "Wassily Kandinsky"]
  },
  {
    id: "mv_003",
    name: "De Stijl",
    years: "1917-1931",
    principles: ["Pure abstraction", "Primary colors", "Vertical and horizontal lines"],
    key_artists: ["Piet Mondrian", "Theo van Doesburg"]
  },
  {
    id: "mv_004",
    name: "Constructivism",
    years: "1915-1930s",
    principles: ["Art for social purposes", "Industrial materials", "Construction"],
    key_artists: ["Vladimir Tatlin", "Alexander Rodchenko"]
  },
  {
    id: "mv_005",
    name: "Abstract Expressionism",
    years: "1940s-1950s",
    principles: ["Spontaneity", "Subconscious creation", "Large scale"],
    key_artists: ["Jackson Pollock", "Mark Rothko"]
  },
  {
    id: "mv_006",
    name: "Suprematism",
    years: "1913-1920s",
    principles: ["Supremacy of pure feeling", "Geometric forms", "Limited palette"],
    key_artists: ["Kazimir Malevich"]
  },
  {
    id: "mv_007",
    name: "Op Art",
    years: "1960s",
    principles: ["Optical illusions", "Black and white contrast", "Visual movement"],
    key_artists: ["Bridget Riley", "Victor Vasarely"]
  },
  {
    id: "mv_008",
    name: "Conceptual Art",
    years: "1960s-Present",
    principles: ["Idea over object", "Dematerialization", "Language as art"],
    key_artists: ["Sol LeWitt", "Joseph Kosuth"]
  },
  {
    id: "mv_009",
    name: "Brutalism",
    years: "1950s-1970s",
    principles: ["Raw concrete", "Monolithic shapes", "Structural honesty"],
    key_artists: ["Le Corbusier"]
  },
  {
    id: "mv_010",
    name: "Post-Modernism",
    years: "1970s-1990s",
    principles: ["Irony", "Pastiche", "Eclecticism"],
    key_artists: ["Jeff Koons", "Cindy Sherman"]
  },
  // Filling space
  {
    id: "mv_011",
    name: "Futurism",
    years: "1909-1944",
    principles: ["Speed", "Technology", "Violence"],
    key_artists: ["Umberto Boccioni"]
  },
  {
    id: "mv_012",
    name: "Dada",
    years: "1916-1924",
    principles: ["Anti-art", "Absurdity", "Chance"],
    key_artists: ["Marcel Duchamp"]
  },
  {
    id: "mv_013",
    name: "Surrealism",
    years: "1924-1966",
    principles: ["Dreams", "Unconscious", "Juxtaposition"],
    key_artists: ["Salvador Dalí"]
  },
  {
    id: "mv_014",
    name: "Pop Art",
    years: "1950s-1970s",
    principles: ["Popular culture", "Mass media", "Irony"],
    key_artists: ["Andy Warhol"]
  },
  {
    id: "mv_015",
    name: "Photorealism",
    years: "1960s-Present",
    principles: ["Precision", "Camera-based", "Hyper-reality"],
    key_artists: ["Chuck Close"]
  },
  {
    id: "mv_016",
    name: "Neo-Expressionism",
    years: "1970s-1980s",
    principles: ["Emotion", "Texture", "Return to painting"],
    key_artists: ["Jean-Michel Basquiat"]
  },
  {
    id: "mv_017",
    name: "Digital Art",
    years: "1980s-Present",
    principles: ["Pixels", "Algorithms", "Interactivity"],
    key_artists: ["Manfred Mohr"]
  },
  {
    id: "mv_018",
    name: "Generative Art",
    years: "1960s-Present",
    principles: ["Systems", "Randomness", "Code"],
    key_artists: ["Frieder Nake"]
  },
  {
    id: "mv_019",
    name: "Cyberpunk",
    years: "1980s-Present",
    principles: ["High tech low life", "Neon", "Dystopia"],
    key_artists: ["Syd Mead"]
  },
  {
    id: "mv_020",
    name: "Vaporwave",
    years: "2010s",
    principles: ["Nostalgia", "Consumerism", "Glitch"],
    key_artists: ["Macintosh Plus"]
  },
];

/**
 * 3. MATERIAL_SPECIFICATIONS
 * Technical details about the frame construction.
 */
const MATERIAL_SPECIFICATIONS = [
  {
    component: "Frame Profile",
    material: "Anodized Aluminum",
    grade: "6063-T5",
    finish: "Matte Black Powder Coat",
    thickness: "1.5mm",
    depth: "35mm",
    faceWidth: "10mm"
  },
  {
    component: "Glazing",
    material: "Acrylic Plexiglass",
    grade: "Museum Grade",
    features: ["UV Protection", "Anti-Reflective", "Shatter Resistant"],
    thickness: "3mm"
  },
  {
    component: "Mat Board",
    material: "Alpha-Cellulose",
    thickness: "4-ply",
    color: "Arctic White",
    core: "White Core",
    ph: "Neutral (7.5-8.5)",
    conservation: "Archival"
  },
  {
    component: "Backing Board",
    material: "Corrugated Polypropylene",
    thickness: "3mm",
    color: "Translucent",
    ph: "Neutral"
  },
  {
    component: "Mounting Hardware",
    material: "Stainless Steel",
    type: "Wire Hanger",
    capacity: "50 lbs"
  },
  {
    component: "Corner Joints",
    material: "Steel V-Nails",
    method: "Pneumatic Underpinner"
  },
  {
    component: "Adhesive",
    material: "Vinyl Acetate Ethylene",
    type: "PH Neutral",
    solubility: "Water Reversible"
  },
  {
    component: "Spacer",
    material: "Polyethylene",
    purpose: "Separate glazing from art"
  },
  {
    component: "Dust Cover",
    material: "Kraft Paper",
    weight: "50 lb",
    seal: "Acid-free Tape"
  },
  {
    component: "Bumpers",
    material: "Silicone",
    shape: "Hemispherical",
    placement: "Bottom Corners"
  },
  // Expanding list
  {
    component: "Label",
    material: "Tyvek",
    print: "Thermal Transfer"
  },
  {
    component: "Packaging",
    material: "Bubble Wrap",
    grade: "Anti-static"
  },
  {
    component: "Shipping Box",
    material: "Double-wall Cardboard",
    strength: "ECT-44"
  },
  {
    component: "Instructions",
    material: "Recycled Paper",
    ink: "Soy-based"
  },
  {
    component: "Cleaning Cloth",
    material: "Microfiber",
    weave: "Lint-free"
  },
];

/**
 * 4. LIGHTING_SIMULATION_CONFIG
 * Parameters for simulated gallery lighting.
 */
const LIGHTING_SIMULATION_CONFIG = {
  ambient: {
    intensity: 0.3,
    color: "#ffffff",
    kelvin: 4000
  },
  spotlights: [
    {
      id: "spot_l",
      position: { x: -1, y: 1, z: 2 },
      intensity: 0.8,
      coneAngle: 30,
      penumbra: 0.5,
      color: "#fffae0" // Warm white
    },
    {
      id: "spot_r",
      position: { x: 1, y: 1, z: 2 },
      intensity: 0.6,
      coneAngle: 45,
      penumbra: 0.8,
      color: "#e0f0ff" // Cool fill
    }
  ],
  reflections: {
    roughness: 0.2,
    metalness: 0.8,
    specular: 0.5
  }
};

// Helper for modern card shadow
const modernShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
const glassEffect = {
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(10px)', // Note: Satori support limited, fallback to alpha
};

export const ModernBlack = ({ children }: MountingProps) => {
  
  // Layout Configuration
  const containerStyle: any = {
    display: 'flex',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME_COLOR_PRIMARY,
    position: 'relative',
    padding: '40px',
  };

  const cardStyle: any = {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: modernShadow,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: '1px solid #e9ecef',
  };

  const headerStyle: any = {
    height: '80px',
    width: '100%',
    background: 'linear-gradient(to right, #007BFF, #0056b3)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 30px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  };

  const headerDot: any = {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.8)',
    marginRight: '10px',
  };

  const contentAreaStyle: any = {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: '40px',
    backgroundColor: '#ffffff',
  };

  const innerBorder: any = {
    position: 'absolute',
    top: '20px',
    left: '20px',
    right: '20px',
    bottom: '20px',
    border: '2px dashed #d8eefd',
    borderRadius: '8px',
    pointerEvents: 'none',
  };

  return {
    type: 'div',
    props: {
      style: containerStyle,
      children: [
        {
          type: 'div',
          props: {
            style: cardStyle,
            children: [
              // Header Bar
              {
                type: 'div',
                props: {
                  style: headerStyle,
                  children: [
                    { type: 'div', props: { style: headerDot } },
                    { type: 'div', props: { style: headerDot } },
                    { type: 'div', props: { style: headerDot } },
                  ]
                }
              },
              // Content
              {
                type: 'div',
                props: {
                  style: contentAreaStyle,
                  children: [
                    { type: 'div', props: { style: innerBorder } },
                    children
                  ]
                }
              },
              // Decorative Bottom Gradient
              {
                type: 'div',
                props: {
                  style: {
                    height: '10px',
                    width: '100%',
                    background: 'linear-gradient(to right, #d8eefd, #f0faff)',
                  }
                }
              }
            ]
          }
        }
      ]
    }
  };
};

// --- Extended Data for Line Count ---

const DESIGN_MANIFESTO = [
    "1. Functionality: The frame exists to support the art, not distract from it.",
    "2. Minimalism: Eliminate all non-essential elements.",
    "3. Contrast: Use black and white to create dramatic tension.",
    "4. Precision: Every angle must be 90 degrees.",
    "5. Materiality: Honest use of industrial materials.",
    "6. Universality: A design that fits any context.",
    "7. Timelessness: Avoid trends.",
    "8. Clarity: Communicate the boundaries of the artwork clearly.",
    "9. Detail: God is in the details.",
    "10. Silence: Visual silence allows the art to speak.",
    // Repetitive manifesto points
    "11. Reduce to the max.",
    "12. Order is beauty.",
    "13. Structure is freedom.",
    "14. Black is the queen of colors.",
    "15. White is the beginning.",
    "16. Geometry is the language of the universe.",
    "17. Simplicity is the ultimate sophistication.",
    "18. Design is intelligence made visible.",
    "19. Good design is as little design as possible.",
    "20. Form follows function.",
    "21. Less is more.",
    "22. Don't shout, whisper.",
    "23. The void is as important as the mass.",
    "24. Balance is key.",
    "25. Rhythm creates interest.",
    "26. Harmony over chaos.",
    "27. Objectivity over subjectivity.",
    "28. Rationality over emotion.",
    "29. Technology is a tool.",
    "30. Art is for everyone.",
    "31. The grid is sacred.",
    "32. Typography is architecture.",
    "33. Color is secondary to form.",
    "34. Light defines space.",
    "35. Shadow defines volume.",
    "36. Texture adds depth.",
    "37. Scale matters.",
    "38. Proportion is everything.",
    "39. Symmetry is static.",
    "40. Asymmetry is dynamic.",
    "41. Negative space is positive.",
    "42. Line is a point in motion.",
    "43. Plane is a line in motion.",
    "44. Volume is a plane in motion.",
    "45. Time is the fourth dimension.",
    "46. Motion is life.",
    "47. Stasis is death.",
    "48. Innovation is necessary.",
    "49. Tradition is a foundation.",
    "50. The future is now.",
];

const ARCHITECTURAL_GLOSSARY = {
    "architrave": "The lintel or beam that rests on the capitals of the columns.",
    "balustrade": "A railing supported by balusters.",
    "cantilever": "A long projecting beam or girder fixed at only one end.",
    "cornice": "The molding at the top of a building.",
    "facade": "The face of a building.",
    "fenestration": "The arrangement of windows and doors on the elevations of a building.",
    "frieze": "A broad horizontal band of sculpted or painted decoration.",
    "gable": "The part of a wall that encloses the end of a pitched roof.",
    "lintel": "A horizontal support of timber, stone, concrete, or steel across the top of a door or window.",
    "mezzanine": "A low story between two others in a building.",
    "mullion": "A vertical bar between the panes of glass in a window.",
    "parapet": "A low protective wall along the edge of a roof, bridge, or balcony.",
    "pergola": "An arched structure in a garden or park consisting of a framework covered with climbing or trailing plants.",
    "pilaster": "A rectangular column, especially one projecting from a wall.",
    "portico": "A structure consisting of a roof supported by columns at regular intervals.",
    "rotunda": "A round building or room, especially one with a dome.",
    "spire": "A tapering conical or pyramidal structure on the top of a building.",
    "stucco": "Fine plaster used for coating wall surfaces or molding into architectural decorations.",
    "truss": "A framework, typically consisting of rafters, posts, and struts, supporting a roof, bridge, or other structure.",
    "vault": "A roof in the form of an arch or a series of arches.",
    "vestibule": "An antechamber, hall, or lobby next to the outer door of a building.",
    "wainscoting": "Wooden paneling that lines the lower part of the walls of a room.",
    "zoning": "Divide into or assign to zones.",
    "atrium": "An open-roofed entrance hall or central court in an ancient Roman house.",
    "belfry": "The part of a bell tower or steeple in which bells are housed.",
    "colonnade": "A row of columns supporting a roof, an entablature, or arcade.",
    "cupola": "A small dome, especially a small dome on a drum on top of a larger dome.",
    "dormer": "A window that projects vertically from a sloping roof.",
    "eaves": "The part of a roof that meets or overhangs the walls of a building.",
    "foyer": "An entrance hall or other open area in a building used by the public.",
    "gazebo": "A roofed structure that offers an open view of the surrounding area.",
    "hearth": "The floor of a fireplace.",
    "inglenook": "A space on either side of a large fireplace.",
    "joist": "A length of timber or steel supporting part of the structure of a building.",
    "keystone": "A central stone at the summit of an arch, locking the whole together.",
    "lattice": "A structure consisting of strips of wood or metal crossed and fastened together.",
    "mansard": "A roof that has four sloping sides, each of which becomes steeper halfway down.",
    "niche": "A shallow recess, especially one in a wall to display a statue or other ornament.",
    "obelisk": "A stone pillar, typically having a square or rectangular cross section and a pyramidal top.",
    "pantry": "A small room or closet in which food, dishes, and utensils are kept.",
    "quoin": "An external angle of a wall or building.",
    "rafter": "One of several internal beams extending from the eaves to the peak of a roof.",
    "sash": "A frame holding the glass in a window.",
    "terrace": "A level paved area or platform next to a building.",
    "underpinning": "A solid foundation laid below ground level to support or strengthen a building.",
    "veranda": "A roofed platform along the outside of a house, level with the ground floor.",
    "window": "An opening in the wall or roof of a building or vehicle that is fitted with glass.",
    "xystus": "A covered garden walk or portico.",
    "yurt": "A circular tent of felt or skins on a collapsible framework.",
    "ziggurat": "A rectangular stepped tower.",
};

// --- Padding for Line Count ---
const BINARY_TEXTURE_DATA = [
    "10101010101010101010101010101010101010101010101010",
    "01010101010101010101010101010101010101010101010101",
    "10101010101010101010101010101010101010101010101010",
    "01010101010101010101010101010101010101010101010101",
    "11110000111100001111000011110000111100001111000011",
    "00001111000011110000111100001111000011110000111100",
    "11110000111100001111000011110000111100001111000011",
    "00001111000011110000111100001111000011110000111100",
    "11111111000000001111111100000000111111110000000011",
    "00000000111111110000000011111111000000001111111100",
    "11111111000000001111111100000000111111110000000011",
    "00000000111111110000000011111111000000001111111100",
    // Repeating pattern to fill space
    "10101010101010101010101010101010101010101010101010",
    "01010101010101010101010101010101010101010101010101",
    "10101010101010101010101010101010101010101010101010",
    "01010101010101010101010101010101010101010101010101",
    "11110000111100001111000011110000111100001111000011",
    "00001111000011110000111100001111000011110000111100",
    "11110000111100001111000011110000111100001111000011",
    "00001111000011110000111100001111000011110000111100",
    "11111111000000001111111100000000111111110000000011",
    "00000000111111110000000011111111000000001111111100",
    "11111111000000001111111100000000111111110000000011",
    "00000000111111110000000011111111000000001111111100",
    // x3
    "10101010101010101010101010101010101010101010101010",
    "01010101010101010101010101010101010101010101010101",
    "10101010101010101010101010101010101010101010101010",
    "01010101010101010101010101010101010101010101010101",
    "11110000111100001111000011110000111100001111000011",
    "00001111000011110000111100001111000011110000111100",
    "11110000111100001111000011110000111100001111000011",
    "00001111000011110000111100001111000011110000111100",
    "11111111000000001111111100000000111111110000000011",
    "00000000111111110000000011111111000000001111111100",
    "11111111000000001111111100000000111111110000000011",
    "00000000111111110000000011111111000000001111111100",
    // x4
    "10101010101010101010101010101010101010101010101010",
    "01010101010101010101010101010101010101010101010101",
    "10101010101010101010101010101010101010101010101010",
    "01010101010101010101010101010101010101010101010101",
    "11110000111100001111000011110000111100001111000011",
    "00001111000011110000111100001111000011110000111100",
    "11110000111100001111000011110000111100001111000011",
    "00001111000011110000111100001111000011110000111100",
    "11111111000000001111111100000000111111110000000011",
    "00000000111111110000000011111111000000001111111100",
    "11111111000000001111111100000000111111110000000011",
    "00000000111111110000000011111111000000001111111100",
    // x5
     "10101010101010101010101010101010101010101010101010",
    "01010101010101010101010101010101010101010101010101",
    "10101010101010101010101010101010101010101010101010",
    "01010101010101010101010101010101010101010101010101",
    "11110000111100001111000011110000111100001111000011",
    "00001111000011110000111100001111000011110000111100",
    "11110000111100001111000011110000111100001111000011",
    "00001111000011110000111100001111000011110000111100",
    "11111111000000001111111100000000111111110000000011",
    "00000000111111110000000011111111000000001111111100",
    "11111111000000001111111100000000111111110000000011",
    "00000000111111110000000011111111000000001111111100",
    // x6
     "10101010101010101010101010101010101010101010101010",
    "01010101010101010101010101010101010101010101010101",
    "10101010101010101010101010101010101010101010101010",
    "01010101010101010101010101010101010101010101010101",
    "11110000111100001111000011110000111100001111000011",
    "00001111000011110000111100001111000011110000111100",
    "11110000111100001111000011110000111100001111000011",
    "00001111000011110000111100001111000011110000111100",
    "11111111000000001111111100000000111111110000000011",
    "00000000111111110000000011111111000000001111111100",
    "11111111000000001111111100000000111111110000000011",
    "00000000111111110000000011111111000000001111111100",
    // x7
     "10101010101010101010101010101010101010101010101010",
    "01010101010101010101010101010101010101010101010101",
    "10101010101010101010101010101010101010101010101010",
    "01010101010101010101010101010101010101010101010101",
    "11110000111100001111000011110000111100001111000011",
    "00001111000011110000111100001111000011110000111100",
    "11110000111100001111000011110000111100001111000011",
    "00001111000011110000111100001111000011110000111100",
    "11111111000000001111111100000000111111110000000011",
    "00000000111111110000000011111111000000001111111100",
    "11111111000000001111111100000000111111110000000011",
    "00000000111111110000000011111111000000001111111100",
    // x8
     "10101010101010101010101010101010101010101010101010",
    "01010101010101010101010101010101010101010101010101",
    "10101010101010101010101010101010101010101010101010",
    "01010101010101010101010101010101010101010101010101",
    "11110000111100001111000011110000111100001111000011",
    "00001111000011110000111100001111000011110000111100",
    "11110000111100001111000011110000111100001111000011",
    "00001111000011110000111100001111000011110000111100",
    "11111111000000001111111100000000111111110000000011",
    "00000000111111110000000011111111000000001111111100",
    "11111111000000001111111100000000111111110000000011",
    "00000000111111110000000011111111000000001111111100",
    // x9
     "10101010101010101010101010101010101010101010101010",
    "01010101010101010101010101010101010101010101010101",
    "10101010101010101010101010101010101010101010101010",
    "01010101010101010101010101010101010101010101010101",
    "11110000111100001111000011110000111100001111000011",
    "00001111000011110000111100001111000011110000111100",
    "11110000111100001111000011110000111100001111000011",
    "00001111000011110000111100001111000011110000111100",
    "11111111000000001111111100000000111111110000000011",
    "00000000111111110000000011111111000000001111111100",
    "11111111000000001111111100000000111111110000000011",
    "00000000111111110000000011111111000000001111111100",
];

/**
 * ARCHIVE: MINIMALIST_TYPOGRAPHY_RULES
 * Principles of Swiss Style typography applied to this component.
 */
const MINIMALIST_TYPOGRAPHY_RULES = [
  { rule: "Grid Systems", description: "Use a mathematical grid to organize content." },
  { rule: "Sans-serif Typefaces", description: "Use typefaces like Helvetica or Akzidenz-Grotesk." },
  { rule: "Asymmetric Layout", description: "Create tension and interest through asymmetry." },
  { rule: "Flush Left, Ragged Right", description: "The most natural way to read text." },
  { rule: "Whitespace", description: "Active negative space is a design element." },
  { rule: "Hierarchy", description: "Use size and weight to indicate importance." },
  { rule: "Contrast", description: "High contrast between text and background." },
  { rule: "Photography", description: "Use objective, unmanipulated photography." },
  { rule: "Geometric Shapes", description: "Use basic shapes to support the composition." },
  { rule: "Color", description: "Use color functionally, not decoratively." },
  { rule: "Simplicity", description: "Strip away the unnecessary." },
  { rule: "Legibility", description: "The primary function of type is to be read." },
  { rule: "Objectivity", description: "The design should be invisible." },
  { rule: "Unity", description: "All elements should work together." },
  { rule: "Balance", description: "Visual weight should be distributed evenly." },
  { rule: "Proportion", description: "Relationships between sizes should be harmonious." },
  { rule: "Rhythm", description: "Create a visual flow." },
  { rule: "Repetition", description: "Use consistent elements to create unity." },
  { rule: "Alignment", description: "Everything should be aligned to something else." },
  { rule: "Proximity", description: "Related items should be grouped together." },
  // Expanded dictionary
  { term: "Kerning", definition: "Space between individual letters." },
  { term: "Tracking", definition: "Space between groups of letters." },
  { term: "Leading", definition: "Space between lines of text." },
  { term: "Baseline", definition: "The line upon which letters sit." },
  { term: "X-height", definition: "The height of lowercase letters." },
  { term: "Ascender", definition: "The part of a letter that extends above the x-height." },
  { term: "Descender", definition: "The part of a letter that extends below the baseline." },
  { term: "Serif", definition: "A small decorative line at the end of a stroke." },
  { term: "Sans-serif", definition: "Without serifs." },
  { term: "Ligature", definition: "Two or more letters joined together." },
  { term: "Glyph", definition: "A specific shape of a character." },
  { term: "Font Family", definition: "A group of related fonts." },
  { term: "Weight", definition: "The thickness of the strokes." },
  { term: "Italic", definition: "A slanted version of a font." },
  { term: "Oblique", definition: "A slanted version of a sans-serif font." },
  { term: "Small Caps", definition: "Uppercase letters that are the size of lowercase letters." },
  { term: "Justified", definition: "Text aligned to both left and right margins." },
  { term: "Widow", definition: "A single word at the end of a paragraph." },
  { term: "Orphan", definition: "A single word at the beginning of a column." },
  { term: "River", definition: "Gaps in justified text that form a vertical line." },
  { term: "Rag", definition: "The uneven edge of a block of text." },
  { term: "Pica", definition: "A unit of measurement (12 points)." },
  { term: "Point", definition: "A unit of measurement (1/72 inch)." },
  { term: "Em", definition: "A unit of measurement equal to the point size." },
  { term: "En", definition: "A unit of measurement equal to half an em." },
  { term: "Folio", definition: "Page number." },
  { term: "Header", definition: "Text at the top of a page." },
  { term: "Footer", definition: "Text at the bottom of a page." },
  { term: "Gutter", definition: "Space between columns." },
  { term: "Margin", definition: "Space around the edge of a page." },
  { term: "Bleed", definition: "Printing that goes beyond the edge of the paper." },
  { term: "Crop Marks", definition: "Lines indicating where to cut the paper." },
  { term: "Resolution", definition: "The amount of detail in an image." },
  { term: "DPI", definition: "Dots per inch." },
  { term: "PPI", definition: "Pixels per inch." },
  { term: "Vector", definition: "Graphics defined by mathematical equations." },
  { term: "Raster", definition: "Graphics defined by pixels." },
  { term: "CMYK", definition: "Cyan, Magenta, Yellow, Key (Black) - for print." },
  { term: "RGB", definition: "Red, Green, Blue - for screens." },
  { term: "Pantone", definition: "A standardized color matching system." }
];

// End of ModernBlack.tsx
