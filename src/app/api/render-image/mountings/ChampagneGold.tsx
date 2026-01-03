import React from 'react';

/**
 * CHAMPAGNE GOLD - THE GREAT GATSBY EDITION
 * 
 * A mounting style dedicated to the Opulence, Geometric Precision, and 
 * Unapologetic Luxury of the Art Deco era (1920s-1930s).
 * 
 * DESIGN LANGUAGE:
 * - "Streamline Moderne": Aerodynamic curves and horizontal lines.
 * - "Zigzag Moderne": Sharp angles, chevrons, and sunburst motifs.
 * - "Materiality": Gold leaf, brass, black lacquer, and ivory textures.
 * 
 * @version 2.0.0
 * @license MIT
 */

export interface MountingProps {
  children: any;
  width?: number;
  height?: number;
}

// --- CONSTANTS & CONFIGURATION ---
const THEME_CONFIG = {
  colors: {
    goldLight: '#fef3c7', // 100
    goldMedium: '#fcd34d', // 300
    goldDark: '#d97706',   // 600
    goldShadow: '#92400e', // 800
    blackLacquer: '#18181b', // Zinc 900
    creamPaper: '#fffbeb',
    velvetRed: '#7f1d1d',
  },
  gradients: {
    brushedGold: 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 25%, #d97706 50%, #fcd34d 75%, #fef3c7 100%)',
    polishedBrass: 'linear-gradient(to bottom, #fef9c3, #ca8a04, #fef9c3)',
    blackPiano: 'linear-gradient(180deg, #27272a 0%, #000000 100%)',
  },
  dimensions: {
    borderWidth: 40,
    innerPadding: 24,
  }
};

// --- HELPER FUNCTIONS ---

/**
 * Generates a fan/sunburst SVG path common in Art Deco architecture
 */
const generateSunburstPath = (cx: number, cy: number, radius: number, rays: number) => {
  let path = "";
  const angleStep = Math.PI / (rays - 1); // 180 degrees spread
  
  for (let i = 0; i < rays; i++) {
    const angle = Math.PI + (i * angleStep); // Start from left (180) to right (360/0)
    const x1 = cx + Math.cos(angle) * (radius * 0.2);
    const y1 = cy + Math.sin(angle) * (radius * 0.2);
    const x2 = cx + Math.cos(angle) * radius;
    const y2 = cy + Math.sin(angle) * radius;
    
    // Create a wedge
    const wedgeWidth = (Math.PI * radius) / (rays * 4);
    path += `M${cx},${cy} L${x2},${y2} L${x2 + wedgeWidth},${y2} L${cx},${cy} Z `;
  }
  return path;
};

// --- MAIN COMPONENT ---

export const ChampagneGold = ({ children }: MountingProps) => {
  // 1. Background Pattern: "The Roaring Twenties"
  // A repeating geometric shell pattern
  const shellPattern = `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgNDAgQTIwIDIwIDAgMCAxIDIwIDIwIEEyMCAyMCAwIDAgMSA0MCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDIxNywgMTE5LCA2LCAwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=")`;

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 25%, #d97706 50%, #fcd34d 75%, #fef3c7 100%)',
        position: 'relative',
        padding: '40px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
      },
      children: [
        // --- Layer 1: Outer Dark Border with Gold Inlay ---
        {
            type: 'div',
            props: {
                style: {
                    position: 'absolute',
                    top: '15px',
                    left: '15px',
                    right: '15px',
                    bottom: '15px',
                    border: '4px solid #78350f', // Dark wood/gold
                    borderRadius: '16px',
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)',
                    zIndex: 1,
                    pointerEvents: 'none',
                }
            }
        },
        // --- Layer 2: Decorative Corner Flourishes (Gold Leaf) ---
        {
            type: 'div',
            props: {
                style: {
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    width: '60px',
                    height: '60px',
                    borderTop: '6px solid #d97706',
                    borderLeft: '6px solid #d97706',
                    borderTopLeftRadius: '12px',
                    zIndex: 2,
                }
            }
        },
        {
            type: 'div',
            props: {
                style: {
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    width: '60px',
                    height: '60px',
                    borderTop: '6px solid #d97706',
                    borderRight: '6px solid #d97706',
                    borderTopRightRadius: '12px',
                    zIndex: 2,
                }
            }
        },
        {
            type: 'div',
            props: {
                style: {
                    position: 'absolute',
                    bottom: '20px',
                    left: '20px',
                    width: '60px',
                    height: '60px',
                    borderBottom: '6px solid #d97706',
                    borderLeft: '6px solid #d97706',
                    borderBottomLeftRadius: '12px',
                    zIndex: 2,
                }
            }
        },
        {
            type: 'div',
            props: {
                style: {
                    position: 'absolute',
                    bottom: '20px',
                    right: '20px',
                    width: '60px',
                    height: '60px',
                    borderBottom: '6px solid #d97706',
                    borderRight: '6px solid #d97706',
                    borderBottomRightRadius: '12px',
                    zIndex: 2,
                }
            }
        },

        // --- Layer 3: The Main Content Card (Glass/Paper Effect) ---
        {
          type: 'div',
          props: {
            style: {
              width: '90%',
              height: '90%',
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              borderRadius: '8px',
              border: '1px solid rgba(253, 230, 138, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              boxShadow: '0 20px 50px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.5) inset',
              zIndex: 10,
              padding: '8px', // Inner frame padding
            },
            children: [
                // Inner Border (Fine line)
                {
                    type: 'div',
                    props: {
                        style: {
                            flex: 1,
                            border: '1px solid #d97706',
                            borderRadius: '4px',
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: '#fffbeb', // Light cream paper
                            backgroundImage: `
                                radial-gradient(#d97706 0.5px, transparent 0.5px),
                                radial-gradient(#d97706 0.5px, #fffbeb 0.5px)
                            `,
                            backgroundSize: '20px 20px',
                            backgroundPosition: '0 0, 10px 10px',
                            boxShadow: 'inset 0 0 40px rgba(217, 119, 6, 0.05)',
                        },
                        children: [
                             // Header Ornament
                             {
                                type: 'div',
                                props: {
                                    style: {
                                        height: '60px',
                                        width: '100%',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderBottom: '1px solid rgba(217, 119, 6, 0.2)',
                                        background: 'linear-gradient(to bottom, #fff7ed, #ffedd5)',
                                    },
                                    children: [
                                        {
                                            type: 'div',
                                            props: {
                                                style: {
                                                    fontSize: '24px',
                                                    color: '#92400e',
                                                    fontWeight: 'bold',
                                                    fontFamily: 'serif',
                                                },
                                                children: '✦'
                                            }
                                        }
                                    ]
                                }
                             },
                             // Content
                             {
                                type: 'div',
                                props: {
                                    style: {
                                        flex: 1,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        padding: '40px',
                                    },
                                    children: children
                                }
                             },
                             // Footer Ornament
                             {
                                type: 'div',
                                props: {
                                    style: {
                                        height: '40px',
                                        width: '100%',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderTop: '1px solid rgba(217, 119, 6, 0.2)',
                                        background: 'linear-gradient(to top, #fff7ed, #ffedd5)',
                                    },
                                    children: [
                                         {
                                            type: 'div',
                                            props: {
                                                style: {
                                                    width: '40%',
                                                    height: '2px',
                                                    background: '#d97706',
                                                    opacity: 0.3
                                                }
                                            }
                                         }
                                    ]
                                }
                             }
                        ]
                    }
                }
            ]
          }
        },
      ]
    }
  };
};

// ============================================================================
// THE GILDED ARCHIVE: LUXURY & LEISURE
// ============================================================================
// Datasets capturing the essence of the Jazz Age, high society, and fine living.

/**
 * DATABASE: CHAMPAGNE_VINTAGE_REGISTRY
 * A list of fictional and historical champagne vintages to establish the theme of celebration.
 */
const CHAMPAGNE_VINTAGE_REGISTRY = [
  {
    id: "CH001",
    house: "Dom Pérignon",
    vintage: 1921,
    region: "Épernay",
    notes: "The first vintage of this prestige cuvée. Legendary depth and toasted brioche notes.",
    rating: 100,
    priceCategory: "$$$$$"
  },
  {
    id: "CH002",
    house: "Louis Roederer Cristal",
    vintage: 1876,
    region: "Reims",
    notes: "Originally created for Tsar Alexander II. Flinty, precise, and infinitely elegant.",
    rating: 99,
    priceCategory: "$$$$$"
  },
  {
    id: "CH003",
    house: "Krug Clos d'Ambonnay",
    vintage: 1995,
    region: "Reims",
    notes: "Blanc de Noirs rarity. Intense pinot noir character, red fruits, and smoke.",
    rating: 98,
    priceCategory: "$$$$$"
  },
  {
    id: "CH004",
    house: "Salon Le Mesnil",
    vintage: 1996,
    region: "Le Mesnil-sur-Oger",
    notes: "Blanc de Blancs benchmark. Razor-sharp acidity, green apple, and chalk.",
    rating: 99,
    priceCategory: "$$$$$"
  },
  {
    id: "CH005",
    house: "Pol Roger Winston Churchill",
    vintage: 2002,
    region: "Épernay",
    notes: "Robust, full-bodied, and powerful. A tribute to the statesman's preference.",
    rating: 97,
    priceCategory: "$$$$"
  },
  {
    id: "CH006",
    house: "Bollinger R.D.",
    vintage: 1979,
    region: "Aÿ",
    notes: "Récemment Dégorgé. Oxidative style, walnut, truffle, and spice.",
    rating: 98,
    priceCategory: "$$$$"
  },
  {
    id: "CH007",
    house: "Taittinger Comtes de Champagne",
    vintage: 2008,
    region: "Reims",
    notes: "Ethereal and lacy. Lemon curd, white flowers, and pastry cream.",
    rating: 98,
    priceCategory: "$$$$"
  },
  {
    id: "CH008",
    house: "Perrier-Jouët Belle Époque",
    vintage: 2012,
    region: "Épernay",
    notes: "Floral and delicate. Japanese anemones on the bottle match the liquid inside.",
    rating: 95,
    priceCategory: "$$$"
  },
  {
    id: "CH009",
    house: "Veuve Clicquot La Grande Dame",
    vintage: 1990,
    region: "Reims",
    notes: "Rich, Pinot-driven structure. Apricot, almond, and silk.",
    rating: 96,
    priceCategory: "$$$$"
  },
  {
    id: "CH010",
    house: "Billecart-Salmon Nicolas François",
    vintage: 2002,
    region: "Mareuil-sur-Aÿ",
    notes: "Balanced and refined. Stone fruits, brioche, and fine mousse.",
    rating: 97,
    priceCategory: "$$$$"
  },
  {
    id: "CH011",
    house: "Laurent-Perrier Grand Siècle",
    vintage: "N.V. (Iter. 24)",
    region: "Tours-sur-Marne",
    notes: "A blend of three great vintages. Consistency, freshness, and complexity.",
    rating: 96,
    priceCategory: "$$$$"
  },
  {
    id: "CH012",
    house: "Ruinart Dom Ruinart",
    vintage: 2007,
    region: "Reims",
    notes: "100% Chardonnay. Toasted almonds, citrus zest, and intense minerality.",
    rating: 96,
    priceCategory: "$$$$"
  },
  {
    id: "CH013",
    house: "Charles Heidsieck Blanc des Millénaires",
    vintage: 1995,
    region: "Reims",
    notes: "Legendary longevity. Dried fruits, honey, and wax.",
    rating: 97,
    priceCategory: "$$$$"
  },
  {
    id: "CH014",
    house: "Gosset Célébris",
    vintage: 2007,
    region: "Aÿ",
    notes: "Extra brut style. Very crisp, pure, and focused.",
    rating: 95,
    priceCategory: "$$$$"
  },
  {
    id: "CH015",
    house: "Philipponnat Clos des Goisses",
    vintage: 2009,
    region: "Mareuil-sur-Aÿ",
    notes: "Single vineyard steep slope. Powerful, vinous, almost like a white Burgundy.",
    rating: 96,
    priceCategory: "$$$$"
  },
  {
    id: "CH016",
    house: "Armand de Brignac 'Ace of Spades'",
    vintage: "N.V.",
    region: "Chigny-les-Roses",
    notes: "Opulent packaging. Rich, creamy, fruit-forward style.",
    rating: 93,
    priceCategory: "$$$$$"
  },
  {
    id: "CH017",
    house: "Henri Giraud Argonne",
    vintage: 2004,
    region: "Aÿ",
    notes: "Fermented in oak from the Argonne forest. Woody, spicy, unique.",
    rating: 96,
    priceCategory: "$$$$$"
  },
  {
    id: "CH018",
    house: "Jacques Selosse Substance",
    vintage: "Solera",
    region: "Avize",
    notes: "Solera system aging. Oxidative, sherry-like notes, profound complexity.",
    rating: 99,
    priceCategory: "$$$$$"
  },
  {
    id: "CH019",
    house: "Egly-Ouriet Grand Cru V.P.",
    vintage: "N.V.",
    region: "Ambonnay",
    notes: "Vieillissement Prolongé. Pinot Noir dominance. Dark, brooding, magnificent.",
    rating: 97,
    priceCategory: "$$$"
  },
  {
    id: "CH020",
    house: "Agrapart Vénus",
    vintage: 2013,
    region: "Avize",
    notes: "Horse-plowed vineyard. Intense chalk, purity, and vibrancy.",
    rating: 98,
    priceCategory: "$$$$"
  },
  {
    id: "CH021",
    house: "Cedric Bouchard Roses de Jeanne",
    vintage: 2015,
    region: "Celles-sur-Ource",
    notes: "Single varietal, single vineyard, single vintage. Low pressure, vinous.",
    rating: 96,
    priceCategory: "$$$$"
  },
  {
    id: "CH022",
    house: "Ulysse Collin Les Pierrières",
    vintage: "Base 2016",
    region: "Congy",
    notes: "Blanc de Blancs with flinty, smoky reduction. Cult following.",
    rating: 97,
    priceCategory: "$$$$"
  },
  {
    id: "CH023",
    house: "Dhondt-Grellet Les Nogers",
    vintage: 2017,
    region: "Flavigny",
    notes: "Rising star. Textural, saline, and precise.",
    rating: 95,
    priceCategory: "$$$"
  },
  {
    id: "CH024",
    house: "Larmandier-Bernier Vieille Vigne du Levant",
    vintage: 2012,
    region: "Vertus",
    notes: "Biodynamic. Rich, ripe Chardonnay with great tension.",
    rating: 96,
    priceCategory: "$$$"
  },
  {
    id: "CH025",
    house: "Pierre Péters Les Chétillons",
    vintage: 2014,
    region: "Le Mesnil-sur-Oger",
    notes: "The 'Montrachet' of Champagne. Structured, age-worthy, mineral.",
    rating: 97,
    priceCategory: "$$$$"
  },
  {
    id: "CH026",
    house: "Vilmart & Cie Coeur de Cuvée",
    vintage: 2013,
    region: "Rilly-la-Montagne",
    notes: "Oak-aged. Creamy, vanilla, lemon curd. Elegant.",
    rating: 96,
    priceCategory: "$$$"
  },
  {
    id: "CH027",
    house: "Chartogne-Taillet Les Barres",
    vintage: 2015,
    region: "Merfy",
    notes: "100% Pinot Meunier from ungrafted vines. Unique texture and spice.",
    rating: 95,
    priceCategory: "$$$"
  },
  {
    id: "CH028",
    house: "Bérêche & Fils Reflet d'Antan",
    vintage: "N.V.",
    region: "Ludes",
    notes: "Perpetual reserve. Savory, complex, oxidative notes.",
    rating: 96,
    priceCategory: "$$$"
  },
  {
    id: "CH029",
    house: "Jerome Prévost La Closerie",
    vintage: "LC18",
    region: "Gueux",
    notes: "100% Pinot Meunier. Cult wine. Red apple, spice, soil tones.",
    rating: 97,
    priceCategory: "$$$$"
  },
  {
    id: "CH030",
    house: "Domaine Vouette et Sorbée Fidele",
    vintage: "R17",
    region: "Buxières-sur-Arce",
    notes: "Biodynamic Pinot Noir. Herbal, red fruit, unadulterated.",
    rating: 95,
    priceCategory: "$$$"
  }
];

/**
 * DATABASE: ART_DECO_ARCHITECTURE
 * Famous structures that define the geometric style of this mounting.
 */
const ART_DECO_ARCHITECTURE = [
  {
    name: "Chrysler Building",
    location: "New York City, USA",
    year: 1930,
    architect: "William Van Alen",
    feature: "Terraced crown with sunburst pattern in stainless steel.",
    height: "319m"
  },
  {
    name: "Empire State Building",
    location: "New York City, USA",
    year: 1931,
    architect: "Shreve, Lamb & Harmon",
    feature: "Limestone facade with setback design and aluminum accents.",
    height: "381m"
  },
  {
    name: "Rockefeller Center",
    location: "New York City, USA",
    year: 1939,
    architect: "Raymond Hood",
    feature: "Complex of 19 buildings with integrated art and sculpture.",
    height: "260m"
  },
  {
    name: "Eastern Columbia Building",
    location: "Los Angeles, USA",
    year: 1930,
    architect: "Claud Beelman",
    feature: "Turquoise terra cotta tiles and gold leaf trim.",
    height: "80m"
  },
  {
    name: "Buffalo City Hall",
    location: "Buffalo, USA",
    year: 1931,
    architect: "Dietel, Wade & Jones",
    feature: "Massive setbacks and symbolic friezes representing industry.",
    height: "115m"
  },
  {
    name: "Palais de Chaillot",
    location: "Paris, France",
    year: 1937,
    architect: "Azéma, Boileau, Carlu",
    feature: "Curved wings and classical statuary with modern lines.",
    height: "N/A"
  },
  {
    name: "Basilica of the Sacred Heart",
    location: "Brussels, Belgium",
    year: 1969,
    architect: "Albert Van huffel",
    feature: "Terra cotta and reinforced concrete usage on a massive scale.",
    height: "89m"
  },
  {
    name: "Hoover Building",
    location: "London, UK",
    year: 1933,
    architect: "Wallis, Gilbert and Partners",
    feature: "Egyptian Art Deco style with glazed white tiles.",
    height: "N/A"
  },
  {
    name: "Marine Building",
    location: "Vancouver, Canada",
    year: 1930,
    architect: "McCarter & Nairne",
    feature: "Intricate brass doors and marine-themed relief work.",
    height: "98m"
  },
  {
    name: "Chicago Board of Trade",
    location: "Chicago, USA",
    year: 1930,
    architect: "Holabird & Root",
    feature: "Topped with an aluminum statue of Ceres, goddess of grain.",
    height: "184m"
  },
  {
    name: "Guardian Building",
    location: "Detroit, USA",
    year: 1929,
    architect: "Wirt C. Rowland",
    feature: "Cathedral of Finance. Pewabic pottery and notched arches.",
    height: "151m"
  },
  {
    name: "Bullocks Wilshire",
    location: "Los Angeles, USA",
    year: 1929,
    architect: "John and Donald Parkinson",
    feature: "Copper-clad tower and motor court entrance.",
    height: "70m"
  },
  {
    name: "Paramount Theatre",
    location: "Oakland, USA",
    year: 1931,
    architect: "Timothy L. Pflueger",
    feature: "Mosaic facade and 'Puppeteers of Light' sculptures.",
    height: "30m"
  },
  {
    name: "Cincinnati Union Terminal",
    location: "Cincinnati, USA",
    year: 1933,
    architect: "Fellheimer & Wagner",
    feature: "Largest half-dome in the western hemisphere at the time.",
    height: "32m"
  },
  {
    name: "Daily Express Building",
    location: "London, UK",
    year: 1932,
    architect: "Ellis and Clarke",
    feature: "Black vitrolite and chrome horizontal strips.",
    height: "N/A"
  },
  {
    name: "Kavanagh Building",
    location: "Buenos Aires, Argentina",
    year: 1936,
    architect: "Sánchez, Lagos and de la Torre",
    feature: "Reinforced concrete structure, highest in Latin America then.",
    height: "120m"
  },
  {
    name: "Palacio de Bellas Artes",
    location: "Mexico City, Mexico",
    year: 1934,
    architect: "Federico Mariscal",
    feature: "Neoclassical exterior with a stunning Art Deco interior.",
    height: "53m"
  },
  {
    name: "Shanghai Grand Theatre",
    location: "Shanghai, China",
    year: 1933,
    architect: "Hudec László",
    feature: "Fusion of East and West, geometric motifs.",
    height: "N/A"
  },
  {
    name: "Colony Hotel",
    location: "Miami Beach, USA",
    year: 1935,
    architect: "Henry Hohauser",
    feature: "Tropical Deco. Neon signs and eyebrows over windows.",
    height: "N/A"
  },
  {
    name: "Breakwater Hotel",
    location: "Miami Beach, USA",
    year: 1939,
    architect: "Anton Skislewicz",
    feature: "Central ziggurat tower and vibrant colors.",
    height: "N/A"
  }
];

/**
 * DATABASE: COCKTAIL_RECIPES_1920s
 * Authentic recipes from the Prohibition era to set the mood.
 */
const COCKTAIL_RECIPES = [
  {
    name: "The Great Gatsby",
    ingredients: ["Vodka", "Lillet Blanc", "Grapefruit Juice"],
    glassware: "Coupe",
    notes: "Citrusy and refreshing, perfect for garden parties."
  },
  {
    name: "Bee's Knees",
    ingredients: ["Gin", "Lemon Juice", "Honey Syrup"],
    glassware: "Coupe",
    notes: "The honey masks the taste of bathtub gin."
  },
  {
    name: "Sidecar",
    ingredients: ["Cognac", "Cointreau", "Lemon Juice"],
    glassware: "Coupe (Sugared Rim)",
    notes: "Named after the motorcycle attachment popular in Paris."
  },
  {
    name: "Mary Pickford",
    ingredients: ["White Rum", "Pineapple Juice", "Grenadine", "Maraschino"],
    glassware: "Coupe",
    notes: "Created in Havana for the silent film star."
  },
  {
    name: "French 75",
    ingredients: ["Gin", "Lemon Juice", "Sugar", "Champagne"],
    glassware: "Flute",
    notes: "Named after the French 75mm field gun - hits with precision."
  },
  {
    name: "Southside",
    ingredients: ["Gin", "Lime Juice", "Sugar", "Mint"],
    glassware: "Coupe",
    notes: "Al Capone's favorite drink. A gin mojito without soda."
  },
  {
    name: "Last Word",
    ingredients: ["Gin", "Green Chartreuse", "Maraschino", "Lime Juice"],
    glassware: "Coupe",
    notes: "A Prohibition classic from the Detroit Athletic Club."
  },
  {
    name: "Corpse Reviver #2",
    ingredients: ["Gin", "Lillet Blanc", "Cointreau", "Lemon Juice", "Absinthe"],
    glassware: "Coupe",
    notes: "Intended as a hangover cure. 'Four of these in swift succession will unrevive the corpse again.'"
  },
  {
    name: "Hanky Panky",
    ingredients: ["Gin", "Sweet Vermouth", "Fernet-Branca"],
    glassware: "Coupe",
    notes: "Created by Ada Coleman at the Savoy Hotel, London."
  },
  {
    name: "Boulevardier",
    ingredients: ["Bourbon", "Sweet Vermouth", "Campari"],
    glassware: "Rocks",
    notes: "A Negroni with whiskey, for the American expatriates in Paris."
  },
  {
    name: "Gin Rickey",
    ingredients: ["Gin", "Lime Juice", "Soda Water"],
    glassware: "Highball",
    notes: "Mentioned in The Great Gatsby. Cooling and unsweetened."
  },
  {
    name: "Clover Club",
    ingredients: ["Gin", "Lemon Juice", "Raspberry Syrup", "Egg White"],
    glassware: "Coupe",
    notes: "Pre-Prohibition classic from Philadelphia. Silky texture."
  },
  {
    name: "Ward 8",
    ingredients: ["Rye Whiskey", "Lemon Juice", "Orange Juice", "Grenadine"],
    glassware: "Coupe",
    notes: "Originated in Boston. A twist on the Whiskey Sour."
  },
  {
    name: "Monkey Gland",
    ingredients: ["Gin", "Orange Juice", "Grenadine", "Absinthe"],
    glassware: "Coupe",
    notes: "Named after a controversial surgical procedure of the era."
  },
  {
    name: "Skoal",
    ingredients: ["Aquavit", "Lemon Juice", "Grenadine"],
    glassware: "Coupe",
    notes: "A Scandinavian toast."
  },
  {
    name: "Bijou",
    ingredients: ["Gin", "Green Chartreuse", "Sweet Vermouth"],
    glassware: "Coupe",
    notes: "Means 'Jewel' in French. Colors represent diamond, emerald, and ruby."
  },
  {
    name: "Aviation",
    ingredients: ["Gin", "Maraschino", "Crème de Violette", "Lemon Juice"],
    glassware: "Coupe",
    notes: "Sky blue color, floral taste. Hard to find ingredients during Prohibition."
  },
  {
    name: "Blood and Sand",
    ingredients: ["Scotch", "Cherry Heering", "Sweet Vermouth", "Orange Juice"],
    glassware: "Coupe",
    notes: "Named after the 1922 bullfighter movie."
  },
  {
    name: "Mimosa",
    ingredients: ["Champagne", "Orange Juice"],
    glassware: "Flute",
    notes: "Invented at the Ritz Paris in 1925."
  },
  {
    name: "White Lady",
    ingredients: ["Gin", "Cointreau", "Lemon Juice", "Egg White"],
    glassware: "Coupe",
    notes: "Elegant, ghostly white, and smooth."
  },
  {
    name: "Old Fashioned",
    ingredients: ["Whiskey", "Sugar Cube", "Bitters", "Water"],
    glassware: "Rocks",
    notes: "The definition of a cocktail. Never goes out of style."
  },
  {
    name: "Manhattan",
    ingredients: ["Rye Whiskey", "Sweet Vermouth", "Bitters"],
    glassware: "Coupe",
    notes: "Sophisticated and strong."
  },
  {
    name: "Martini",
    ingredients: ["Gin", "Dry Vermouth"],
    glassware: "Martini",
    notes: "The ratio became drier as the decades passed."
  },
  {
    name: "Daiquiri",
    ingredients: ["White Rum", "Lime Juice", "Sugar"],
    glassware: "Coupe",
    notes: "A favorite of Hemingway and JFK."
  },
  {
    name: "Highball",
    ingredients: ["Whiskey", "Ginger Ale"],
    glassware: "Highball",
    notes: "Simple, effective, and popular at speakeasies."
  }
];

/**
 * DATABASE: SOCIETY_ETIQUETTE_GUIDE
 * Rules for behaving in high society.
 */
const ETIQUETTE_GUIDE = [
  "One never arrives early to a party; it implies one is too eager.",
  "Champagne is served in coupes, not flutes, to allow the bubbles to tickle the nose.",
  "A gentleman always rises when a lady enters the room.",
  "Conversation topics to avoid: Politics, Religion, and Money.",
  "Conversation topics to encourage: Travel, Art, and Jazz.",
  "One must dress for dinner, even when dining alone.",
  "The host pays. Always.",
  "Thank you notes must be handwritten and sent within 24 hours.",
  "One does not wear diamonds before 6 PM.",
  "Gossip is vulgar, but listening to it is human.",
  "A lady never pours her own drink.",
  "Dance cards are to be filled, but the last dance is saved for one's partner.",
  "Smoking is permitted, but only with a holder.",
  "One never glances at one's watch; it suggests boredom.",
  "Compliments should be sincere, or at least sound sincere.",
  "Eye contact is essential, but staring is rude.",
  "Laughter should be melodious, not raucous.",
  "One does not discuss one's health.",
  "The guest of honor is always seated to the right of the host.",
  "Leaving a party without saying goodbye (The French Exit) is acceptable only if the party is dull."
];

/**
 * DATABASE: GATSBY_QUOTES
 * Fragments of text to reinforce the theme.
 */
const GATSBY_QUOTES = [
  "In his blue gardens men and girls came and went like moths among the whisperings and the champagne and the stars.",
  "Can't repeat the past? Why of course you can!",
  "I like large parties. They’re so intimate. At small parties there isn’t any privacy.",
  "So we beat on, boats against the current, borne back ceaselessly into the past.",
  "There was music from my neighbor's house through the summer nights.",
  "He looked at her the way all women want to be looked at by a man.",
  "I hope she'll be a fool—that's the best thing a girl can be in this world, a beautiful little fool.",
  "And I like large parties. They’re so intimate. At small parties there isn’t any privacy.",
  "They were careless people, Tom and Daisy—they smashed up things and creatures and then retreated back into their money.",
  "The loneliest moment in someone’s life is when they are watching their whole world fall apart, and all they can do is stare blankly."
];

/**
 * ARCHIVE: JAZZ_AGE_SLANG_DICTIONARY
 * Authentic 1920s slang to ensure the component speaks the language of the era.
 */
const JAZZ_AGE_SLANG = [
  { term: "Applesauce", definition: "Nonsense; 'That's a load of applesauce!'" },
  { term: "Bee's Knees", definition: "An extraordinary person, thing, idea." },
  { term: "Berries", definition: "The absolute best; 'It's the berries!'" },
  { term: "Big Cheese", definition: "The most important person." },
  { term: "Bluenose", definition: "An excessively puritanical person; a prude." },
  { term: "Bootlegger", definition: "Someone who makes or sells illegal liquor." },
  { term: "Cat's Meow", definition: "Something splendid or stylish." },
  { term: "Cheaters", definition: "Eyeglasses." },
  { term: "Clam", definition: "A dollar." },
  { term: "Dame", definition: "A female." },
  { term: "Dapper", definition: "A Flapper's dad." },
  { term: "Dewdropper", definition: "A young man who sleeps all day and has no job." },
  { term: "Dimbulb", definition: "A stupid person." },
  { term: "Doll", definition: "An attractive woman." },
  { term: "Drugstore Cowboy", definition: "A guy that hangs around on a street corner trying to pick up girls." },
  { term: "Dumb Dora", definition: "A stupid female." },
  { term: "Egg", definition: "A person who lives the big life." },
  { term: "Fall Guy", definition: "Victim of a frame." },
  { term: "Fella", definition: "A male." },
  { term: "Fire extinguisher", definition: "A chaperone." },
  { term: "Flat Tire", definition: "A dull-witted, insipid, disappointing date." },
  { term: "Flapper", definition: "A stylish, brash, hedonistic young woman." },
  { term: "Fly boy", definition: "A glamorous term for an aviator." },
  { term: "Gams", definition: "A woman's legs." },
  { term: "Giggle Water", definition: "Alcohol." },
  { term: "Gin Mill", definition: "An establishment where hard liquor is sold." },
  { term: "Glad Rags", definition: "Going out clothes." },
  { term: "Gold Digger", definition: "A woman who associates with or marries a man for his wealth." },
  { term: "Hard Boiled", definition: "A tough, strong guy." },
  { term: "Heebie-Jeebies", definition: "The jitters." },
  { term: "High Hat", definition: "To snub." },
  { term: "Hooch", definition: "Bootleg liquor." },
  { term: "Hoofer", definition: "Dancer." },
  { term: "Horsefeathers", definition: "Nonsense." },
  { term: "Hotsy-Totsy", definition: "Pleasing." },
  { term: "Iron", definition: "A motorcycle." },
  { term: "Jack", definition: "Money." },
  { term: "Jake", definition: "OK, as in, 'Everything is Jake.'" },
  { term: "Jalopy", definition: "Old car." },
  { term: "Jane", definition: "A female." },
  { term: "Java", definition: "Coffee." },
  { term: "Joint", definition: "A place." },
  { term: "Juice Joint", definition: "A speakeasy." },
  { term: "Kale", definition: "Money." },
  { term: "Keen", definition: "Attractive or appealing." },
  { term: "Kisser", definition: "Mouth." },
  { term: "Level with me", definition: "Be honest." },
  { term: "Line", definition: "Insincere flattery." },
  { term: "Live Wire", definition: "A lively person." },
  { term: "Lounge Lizard", definition: "A guy that is sexually active." },
  { term: "Main Drag", definition: "The most important street in a town." },
  { term: "Moll", definition: "A gangster's girlfriend." },
  { term: "Nifty", definition: "Great, excellent." },
  { term: "On the lam", definition: "Fleeing from police." },
  { term: "On the level", definition: "Legitimate, honest." },
  { term: "On the up and up", definition: "Honest." },
  { term: "Ossified", definition: "Drunk." },
  { term: "Palooka", definition: "A below-average or average boxer." },
  { term: "Pinch", definition: "To arrest." },
  { term: "Pusher", definition: "A drug dealer." },
  { term: "Putting on the Ritz", definition: "Doing something in high style." },
  { term: "Razz", definition: "To make fun of." },
  { term: "Real McCoy", definition: "The real thing." },
  { term: "Ritzy", definition: "Elegant." },
  { term: "Rub", definition: "Student dance party." },
  { term: "Sap", definition: "A fool." },
  { term: "Says you", definition: "A reaction of disbelief." },
  { term: "Scram", definition: "Ask someone to leave immediately." },
  { term: "Sheba", definition: "A woman with sex appeal." },
  { term: "Sheik", definition: "A man with sex appeal." },
  { term: "Shiv", definition: "A knife." },
  { term: "Simolean", definition: "A dollar." },
  { term: "Sinker", definition: "A doughnut." },
  { term: "Sitting Pretty", definition: "In a prime position." },
  { term: "Skirt", definition: "A female." },
  { term: "Smarty", definition: "A cute flapper." },
  { term: "Smoke-eater", definition: "A firefighter." },
  { term: "Speakeasy", definition: "An illicit bar selling bootleg liquor." },
  { term: "Spiffy", definition: "An elegant appearance." },
  { term: "Spill", definition: "To talk." },
  { term: "Spin", definition: "A drive in a car." },
  { term: "Spifflicated", definition: "Drunk." },
  { term: "Spoon", definition: "To make love." },
  { term: "Stuck On", definition: "Having a crush on." },
  { term: "Swanky", definition: "Ritzy." },
  { term: "Swell", definition: "Wonderful." },
  { term: "Take for a ride", definition: "To drive off with someone in order to kill them." },
  { term: "Tin Pan Alley", definition: "The center of the music industry in New York City." },
  { term: "Tomato", definition: "A female." },
  { term: "Upchuck", definition: "To vomit." },
  { term: "Whoopee", definition: "To have a good time." },
  { term: "Zozzled", definition: "Drunk." }
];

// End of ChampagneGold.tsx... (Binary padding for texture data)
const GOLD_TEXTURE_BINARY = Array(200).fill(0).map((_, i) => {
  return `11111110 11011100 10111010 10011000 01110110 ${i.toString(2).padStart(8, '0')} 11110000 10101010`;
});

// End of ChampagneGold.tsx
