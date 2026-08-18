const MapLayouts = [
    {
        name: "Central Arena",
        platforms: [
            // Original Dense Layout
            { x: 440, y: 550, w: 400, h: 20 }, // Main low plat
            { x: 540, y: 400, w: 200, h: 20 }, // Mid
            { x: 590, y: 250, w: 100, h: 20 }, // High Tower
            { x: 50, y: 600, w: 150, h: 20 },
            { x: 250, y: 500, w: 100, h: 20 },
            { x: 50, y: 350, w: 150, h: 20 }, // Left Peak
            { x: 1080, y: 600, w: 150, h: 20 },
            { x: 930, y: 500, w: 100, h: 20 },
            { x: 1080, y: 350, w: 150, h: 20 }, // Right Peak
            { x: 440, y: 150, w: 400, h: 20 }, // TOP Skybridge
            { x: 750, y: 450, w: 80, h: 20 },
            { x: 450, y: 450, w: 80, h: 20 }
        ]
    },
    {
        name: "Sky Pillars",
        platforms: [
            // Left Pillar
            { x: 100, y: 600, w: 200, h: 20 },
            { x: 150, y: 450, w: 100, h: 20 },
            { x: 100, y: 250, w: 200, h: 20 },

            // Right Pillar
            { x: 980, y: 600, w: 200, h: 20 },
            { x: 1030, y: 450, w: 100, h: 20 },
            { x: 980, y: 250, w: 200, h: 20 },

            // Central Columns
            { x: 400, y: 500, w: 150, h: 20 },
            { x: 730, y: 500, w: 150, h: 20 },
            { x: 540, y: 300, w: 200, h: 20 },
            { x: 590, y: 100, w: 100, h: 20 }
        ]
    },
    {
        name: "Floating Isles",
        platforms: [
            // Far Left
            { x: 0, y: 400, w: 150, h: 20 },
            // Far Right
            { x: 1130, y: 400, w: 150, h: 20 },
            // Big Center
            { x: 340, y: 600, w: 600, h: 20 },
            // Scattered high bits
            { x: 200, y: 200, w: 150, h: 20 },
            { x: 930, y: 200, w: 150, h: 20 },
            { x: 540, y: 400, w: 200, h: 20 },
            { x: 590, y: 150, w: 100, h: 20 },
            // Under-floor protective bits (not really useful here but for flavor)
            { x: 440, y: 700, w: 400, h: 20 }
        ]
    },
    {
        name: "Lava Caverns",
        platforms: [
            // Ground level with gaps (over "lava")
            { x: 0, y: 650, w: 200, h: 20 },
            { x: 300, y: 650, w: 200, h: 20 },
            { x: 600, y: 650, w: 200, h: 20 },
            { x: 900, y: 650, w: 200, h: 20 },
            { x: 1100, y: 650, w: 180, h: 20 },
            // Stalactite platforms (upper cave)
            { x: 150, y: 450, w: 120, h: 20 },
            { x: 400, y: 400, w: 150, h: 20 },
            { x: 700, y: 380, w: 150, h: 20 },
            { x: 1000, y: 450, w: 120, h: 20 },
            // Cave ceiling area
            { x: 300, y: 200, w: 180, h: 20 },
            { x: 600, y: 150, w: 200, h: 20 },
            { x: 900, y: 200, w: 180, h: 20 },
            // Central danger zone
            { x: 540, y: 550, w: 200, h: 20 }
        ]
    },
    {
        name: "Celestial Tower",
        platforms: [
            // Base floor
            { x: 400, y: 700, w: 480, h: 20 },
            // Ascending left side
            { x: 200, y: 600, w: 150, h: 20 },
            { x: 100, y: 450, w: 180, h: 20 },
            { x: 50, y: 300, w: 150, h: 20 },
            { x: 150, y: 150, w: 120, h: 20 },
            // Ascending right side
            { x: 930, y: 600, w: 150, h: 20 },
            { x: 1000, y: 450, w: 180, h: 20 },
            { x: 1080, y: 300, w: 150, h: 20 },
            { x: 1010, y: 150, w: 120, h: 20 },
            // Central tower platforms
            { x: 520, y: 550, w: 240, h: 20 },
            { x: 560, y: 400, w: 160, h: 20 },
            { x: 590, y: 250, w: 100, h: 20 },
            // Crown of the tower
            { x: 540, y: 80, w: 200, h: 20 }
        ]
    },
    {
        name: "Chaos Bridges",
        platforms: [
            // Lower bridges
            { x: 0, y: 600, w: 280, h: 20 },
            { x: 1000, y: 600, w: 280, h: 20 },
            { x: 380, y: 650, w: 520, h: 20 },
            // Middle bridge network
            { x: 100, y: 400, w: 200, h: 20 },
            { x: 350, y: 450, w: 150, h: 20 },
            { x: 550, y: 380, w: 180, h: 20 },
            { x: 780, y: 450, w: 150, h: 20 },
            { x: 980, y: 400, w: 200, h: 20 },
            // Upper chaos zone
            { x: 200, y: 220, w: 180, h: 20 },
            { x: 450, y: 280, w: 120, h: 20 },
            { x: 640, y: 200, w: 100, h: 20 },
            { x: 810, y: 280, w: 120, h: 20 },
            { x: 900, y: 220, w: 180, h: 20 },
            // Highest crossing
            { x: 500, y: 100, w: 280, h: 20 }
        ]
    },
    {
        name: "Titan Expanse",
        width: 2600,
        height: 1600,
        fitToView: true,
        spawns: { p1: 820, p2: 1705 },
        platforms: [
            // Huge open field with enough side space to kite, chase, and reset.
            { x: 180, y: 1330, w: 420, h: 28 },
            { x: 760, y: 1330, w: 440, h: 28 },
            { x: 1400, y: 1330, w: 440, h: 28 },
            { x: 2020, y: 1330, w: 420, h: 28 },

            // Mid lanes
            { x: 360, y: 1150, w: 240, h: 24 },
            { x: 760, y: 1070, w: 220, h: 24 },
            { x: 1130, y: 1160, w: 340, h: 24 },
            { x: 1620, y: 1070, w: 220, h: 24 },
            { x: 2000, y: 1150, w: 240, h: 24 },

            // High routes
            { x: 240, y: 830, w: 220, h: 24 },
            { x: 650, y: 730, w: 200, h: 24 },
            { x: 1050, y: 775, w: 500, h: 24 },
            { x: 1750, y: 730, w: 200, h: 24 },
            { x: 2140, y: 830, w: 220, h: 24 },

            // Tiny duel perches
            { x: 1180, y: 500, w: 110, h: 22 },
            { x: 1310, y: 500, w: 110, h: 22 }
        ]
    }
];
