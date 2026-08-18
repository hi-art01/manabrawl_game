Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"
$outDir = Join-Path (Split-Path -Parent $PSScriptRoot) "imges"

function ColorFromHex([string]$hex, [int]$alpha = 255) {
    $h = $hex.TrimStart("#")
    return [System.Drawing.Color]::FromArgb(
        $alpha,
        [Convert]::ToInt32($h.Substring(0, 2), 16),
        [Convert]::ToInt32($h.Substring(2, 2), 16),
        [Convert]::ToInt32($h.Substring(4, 2), 16)
    )
}

function BrushHex([string]$hex, [int]$alpha = 255) {
    return New-Object System.Drawing.SolidBrush (ColorFromHex $hex $alpha)
}

function PenHex([string]$hex, [float]$width = 4, [int]$alpha = 255) {
    $pen = New-Object System.Drawing.Pen (ColorFromHex $hex $alpha), $width
    $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    return $pen
}

function Points([float[]]$coords) {
    $pts = New-Object "System.Drawing.PointF[]" ($coords.Length / 2)
    for ($i = 0; $i -lt $coords.Length; $i += 2) {
        $pts[$i / 2] = New-Object System.Drawing.PointF $coords[$i], $coords[$i + 1]
    }
    return $pts
}

function Draw-Star($g, [float]$cx, [float]$cy, [float]$inner, [float]$outer, [int]$points, $brush) {
    $coords = New-Object System.Collections.Generic.List[float]
    for ($i = 0; $i -lt $points * 2; $i++) {
        $angle = -[Math]::PI / 2 + ($i * [Math]::PI / $points)
        $radius = $(if ($i % 2 -eq 0) { $outer } else { $inner })
        $coords.Add([float]($cx + [Math]::Cos($angle) * $radius))
        $coords.Add([float]($cy + [Math]::Sin($angle) * $radius))
    }
    $g.FillPolygon($brush, (Points $coords.ToArray()))
}

function Draw-Weapon($g, [string]$kind, [string]$accent) {
    $pen = PenHex $accent 12
    $thin = PenHex "#111827" 5

    switch ($kind) {
        "sword" {
            $g.DrawLine($thin, 255, 170, 338, 385)
            $g.DrawLine($pen, 255, 170, 338, 385)
            $g.FillPolygon((BrushHex "#e5e7eb"), (Points 238,148, 269,151, 262,194))
        }
        "spear" {
            $g.DrawLine($thin, 155, 150, 355, 382)
            $g.DrawLine($pen, 155, 150, 355, 382)
            $g.FillPolygon((BrushHex "#e5e7eb"), (Points 137,126, 180,146, 151,173))
        }
        "staff" {
            $g.DrawLine($thin, 145, 155, 344, 410)
            $g.DrawLine($pen, 145, 155, 344, 410)
            $g.FillEllipse((BrushHex $accent), 124, 122, 52, 52)
            $g.DrawEllipse((PenHex "#111827" 4), 124, 122, 52, 52)
        }
        "bow" {
            $path = New-Object System.Drawing.Drawing2D.GraphicsPath
            $path.AddBezier(320, 145, 390, 210, 390, 310, 320, 395)
            $g.DrawPath($thin, $path)
            $g.DrawPath($pen, $path)
            $g.DrawLine((PenHex "#f8fafc" 2), 320, 145, 320, 395)
        }
        "chain" {
            for ($i = 0; $i -lt 6; $i++) {
                $g.DrawEllipse((PenHex $accent 5), 310 + $i * 16, 205 + $i * 18, 25, 17)
            }
        }
        "axe" {
            $g.DrawLine($thin, 160, 150, 340, 410)
            $g.DrawLine($pen, 160, 150, 340, 410)
            $g.FillPolygon((BrushHex "#94a3b8"), (Points 146,130, 214,145, 177,206, 121,183))
            $g.DrawPolygon((PenHex "#111827" 4), (Points 146,130, 214,145, 177,206, 121,183))
        }
        "sun" {
            Draw-Star $g 328 132 30 64 12 (BrushHex $accent 205)
            $g.FillEllipse((BrushHex "#facc15"), 296, 100, 64, 64)
        }
        "yoyo" {
            $g.DrawLine((PenHex "#e5e7eb" 4), 205, 285, 95, 365)
            $g.DrawLine((PenHex "#e5e7eb" 4), 285, 285, 405, 365)
            $g.FillEllipse((BrushHex $accent), 70, 340, 54, 54)
            $g.FillEllipse((BrushHex $accent), 382, 340, 54, 54)
        }
        default {
            Draw-Star $g 330 160 25 52 8 (BrushHex $accent 190)
        }
    }
}

$characters = @(
    @{ Name="gojo"; Hair="#f8fafc"; Outfit="#111827"; Accent="#60a5fa"; Weapon="orb"; Skin="#f5d0c5"; Visor=$true },
    @{ Name="sukuna"; Hair="#fca5a5"; Outfit="#f8fafc"; Accent="#ef4444"; Weapon="claw"; Skin="#f1b99f" },
    @{ Name="killua"; Hair="#e0f2fe"; Outfit="#0f172a"; Accent="#7dd3fc"; Weapon="yoyo"; Skin="#f2c9b6" },
    @{ Name="knuckle"; Hair="#111827"; Outfit="#f97316"; Accent="#facc15"; Weapon="fist"; Skin="#e8b28e" },
    @{ Name="sinbad"; Hair="#7c3aed"; Outfit="#f8fafc"; Accent="#38bdf8"; Weapon="sword"; Skin="#d8a06d" },
    @{ Name="aladdin"; Hair="#60a5fa"; Outfit="#f8fafc"; Accent="#60a5fa"; Weapon="staff"; Skin="#f0c0a0" },
    @{ Name="alibaba"; Hair="#facc15"; Outfit="#f97316"; Accent="#fb923c"; Weapon="sword"; Skin="#eab08d" },
    @{ Name="escanor"; Hair="#facc15"; Outfit="#ffffff"; Accent="#f97316"; Weapon="sun"; Skin="#e7a885" },
    @{ Name="saber"; Hair="#fde68a"; Outfit="#1d4ed8"; Accent="#93c5fd"; Weapon="sword"; Skin="#f1c5a9" },
    @{ Name="archer"; Hair="#f8fafc"; Outfit="#7f1d1d"; Accent="#e5e7eb"; Weapon="bow"; Skin="#d7a184" },
    @{ Name="lancer"; Hair="#1e3a8a"; Outfit="#1d4ed8"; Accent="#ef4444"; Weapon="spear"; Skin="#e4ad90" },
    @{ Name="gilgamesh"; Hair="#facc15"; Outfit="#f59e0b"; Accent="#facc15"; Weapon="chain"; Skin="#e5ae87" },
    @{ Name="riderzero"; Hair="#7c2d12"; Outfit="#a16207"; Accent="#f59e0b"; Weapon="sword"; Skin="#d59a72" },
    @{ Name="riderstaynight"; Hair="#4c1d95"; Outfit="#7e22ce"; Accent="#c084fc"; Weapon="chain"; Skin="#dfaa92" },
    @{ Name="casterzero"; Hair="#1f2937"; Outfit="#064e3b"; Accent="#22c55e"; Weapon="staff"; Skin="#c99a80" },
    @{ Name="casterstaynight"; Hair="#7e22ce"; Outfit="#4c1d95"; Accent="#f472b6"; Weapon="staff"; Skin="#efb8a0" },
    @{ Name="assassinzero"; Hair="#111827"; Outfit="#334155"; Accent="#94a3b8"; Weapon="claw"; Skin="#d6a189" },
    @{ Name="assassinstaynight"; Hair="#0f172a"; Outfit="#1e293b"; Accent="#bfdbfe"; Weapon="sword"; Skin="#e2b39a" },
    @{ Name="berserkerzero"; Hair="#0f172a"; Outfit="#475569"; Accent="#94a3b8"; Weapon="sword"; Skin="#b98572" },
    @{ Name="berserkerstaynight"; Hair="#111827"; Outfit="#7f1d1d"; Accent="#ef4444"; Weapon="axe"; Skin="#b77965" }
)

foreach ($c in $characters) {
    $bmp = New-Object System.Drawing.Bitmap 512, 512, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    $shadow = PenHex "#111827" 10
    $outline = PenHex "#111827" 6
    $accentPen = PenHex $c.Accent 8

    $g.FillEllipse((BrushHex $c.Accent 42), 88, 64, 336, 386)
    $g.DrawEllipse((PenHex $c.Accent 4 120), 110, 82, 292, 346)

    Draw-Weapon $g $c.Weapon $c.Accent

    $cloak = Points 150,210, 112,440, 402,440, 362,210, 296,184, 255,218, 214,184
    $g.FillPolygon((BrushHex $c.Outfit), $cloak)
    $g.DrawPolygon($outline, $cloak)

    $torso = Points 194,210, 318,210, 344,420, 168,420
    $g.FillPolygon((BrushHex $c.Outfit), $torso)
    $g.DrawPolygon($outline, $torso)
    $g.DrawLine($accentPen, 210, 250, 302, 250)
    $g.DrawLine((PenHex $c.Accent 5 190), 228, 290, 286, 390)

    $g.FillRectangle((BrushHex "#111827"), 190, 410, 46, 65)
    $g.FillRectangle((BrushHex "#111827"), 276, 410, 46, 65)
    $g.FillRectangle((BrushHex $c.Accent), 176, 465, 70, 24)
    $g.FillRectangle((BrushHex $c.Accent), 266, 465, 70, 24)

    $g.FillEllipse((BrushHex $c.Skin), 188, 88, 136, 136)
    $g.DrawEllipse($outline, 188, 88, 136, 136)

    $hair = Points 178,126, 198,67, 231,103, 260,58, 284,104, 324,72, 336,142, 316,109, 286,135, 252,111, 216,139
    $g.FillPolygon((BrushHex $c.Hair), $hair)
    $g.DrawPolygon((PenHex "#111827" 5), $hair)

    if ($c.Visor) {
        $g.FillRectangle((BrushHex "#0f172a"), 204, 140, 104, 25)
        $g.DrawRectangle((PenHex "#60a5fa" 3), 204, 140, 104, 25)
    } else {
        $g.FillEllipse((BrushHex "#111827"), 222, 144, 14, 14)
        $g.FillEllipse((BrushHex "#111827"), 276, 144, 14, 14)
    }

    $g.DrawArc((PenHex "#7c2d12" 4 190), 232, 166, 48, 24, 10, 160)
    Draw-Star $g 122 98 8 18 8 (BrushHex $c.Accent 220)
    Draw-Star $g 394 124 6 14 8 (BrushHex $c.Accent 180)

    $bmp.Save((Join-Path $outDir "$($c.Name).png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}
