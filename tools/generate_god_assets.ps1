Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$outDir = Join-Path (Split-Path -Parent $PSScriptRoot) "imges"

function New-Canvas {
    $bmp = New-Object System.Drawing.Bitmap 512, 512, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    return @{ Bitmap = $bmp; Graphics = $g }
}

function Brush([int]$a, [int]$r, [int]$g, [int]$b) {
    return New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb($a, $r, $g, $b))
}

function PenObj([int]$a, [int]$r, [int]$g, [int]$b, [float]$w) {
    $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb($a, $r, $g, $b)), $w
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

function Draw-Starburst($g, [float]$cx, [float]$cy, [float]$inner, [float]$outer, [int]$points, $brush) {
    $coords = New-Object System.Collections.Generic.List[float]
    for ($i = 0; $i -lt $points * 2; $i++) {
        $angle = -[Math]::PI / 2 + ($i * [Math]::PI / $points)
        $radius = $(if ($i % 2 -eq 0) { $outer } else { $inner })
        $coords.Add([float]($cx + [Math]::Cos($angle) * $radius))
        $coords.Add([float]($cy + [Math]::Sin($angle) * $radius))
    }
    $g.FillPolygon($brush, (Points $coords.ToArray()))
}

function Draw-Slifer {
    $canvas = New-Canvas
    $g = $canvas.Graphics

    $aura = Brush 44 239 68 68
    $g.FillEllipse($aura, 58, 55, 388, 388)
    $g.DrawEllipse((PenObj 105 248 113 113 5), 77, 72, 350, 350)

    $body = New-Object System.Drawing.Drawing2D.GraphicsPath
    $body.AddBezier(78, 322, 120, 195, 204, 401, 291, 230)
    $body.AddBezier(291, 230, 352, 111, 420, 198, 378, 318)
    $g.DrawPath((PenObj 245 20 8 8 51), $body)
    $g.DrawPath((PenObj 255 126 17 17 39), $body)
    $g.DrawPath((PenObj 210 248 113 113 14), $body)

    $tail = Points 55,327, 19,301, 69,286, 104,316
    $g.FillPolygon((Brush 255 153 27 27), $tail)
    $g.DrawPolygon((PenObj 235 20 8 8 5), $tail)

    $leftWing = Points 185,169, 42,93, 118,251, 151,211, 182,284, 214,196
    $rightWing = Points 314,147, 480,80, 394,252, 360,207, 326,282, 297,194
    $g.FillPolygon((Brush 222 185 28 28), $leftWing)
    $g.FillPolygon((Brush 222 185 28 28), $rightWing)
    $g.DrawPolygon((PenObj 235 20 8 8 6), $leftWing)
    $g.DrawPolygon((PenObj 235 20 8 8 6), $rightWing)
    $g.DrawLine((PenObj 180 248 113 113 5), 185,169, 118,251)
    $g.DrawLine((PenObj 180 248 113 113 5), 314,147, 394,252)

    $head = Points 313,171, 407,132, 457,170, 412,215, 455,252, 368,247, 318,211
    $g.FillPolygon((Brush 255 181 28 28), $head)
    $g.DrawPolygon((PenObj 255 20 8 8 7), $head)

    $lowerJaw = Points 382,214, 458,240, 393,257, 352,238
    $g.FillPolygon((Brush 255 127 29 29), $lowerJaw)
    $g.DrawPolygon((PenObj 230 20 8 8 5), $lowerJaw)
    $g.FillEllipse((Brush 255 253 224 71), 391, 169, 18, 18)
    $g.FillEllipse((Brush 255 20 8 8), 397, 174, 7, 7)

    $horn1 = Points 360,145, 365,78, 391,143
    $horn2 = Points 409,139, 459,93, 432,158
    $g.FillPolygon((Brush 255 250 250 250), $horn1)
    $g.FillPolygon((Brush 255 250 250 250), $horn2)
    $g.DrawPolygon((PenObj 200 20 8 8 4), $horn1)
    $g.DrawPolygon((PenObj 200 20 8 8 4), $horn2)

    for ($i = 0; $i -lt 9; $i++) {
        $x = 363 + $i * 9
        $tooth = Points $x,222, ($x + 4),239, ($x + 9),222
        $g.FillPolygon((Brush 255 255 255 255), $tooth)
    }

    $lightning = PenObj 230 254 240 138 7
    $g.DrawLines($lightning, (Points 238,41, 210,112, 248,112, 211,205))
    $g.DrawLines($lightning, (Points 443,276, 398,326, 439,326, 381,432))

    $canvas.Bitmap.Save((Join-Path $outDir "egyptian_god_slifer.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $canvas.Bitmap.Dispose()
}

function Draw-Obelisk {
    $canvas = New-Canvas
    $g = $canvas.Graphics

    $g.FillEllipse((Brush 48 37 99 235), 55, 60, 400, 410)
    $g.DrawEllipse((PenObj 95 147 197 253 6), 78, 82, 356, 362)

    $shadow = PenObj 190 15 23 42 13
    $blueOutline = PenObj 255 15 23 42 8
    $main = Brush 255 37 99 235
    $light = Brush 255 96 165 250
    $dark = Brush 255 30 64 175
    $gold = Brush 255 250 204 21

    $horns = Points 202,97, 170,35, 238,89, 274,88, 342,35, 309,99
    $g.FillPolygon((Brush 255 191 219 254), $horns)
    $g.DrawPolygon($blueOutline, $horns)

    $torso = Points 181,160, 331,160, 371,315, 319,438, 194,438, 141,315
    $g.FillPolygon($main, $torso)
    $g.DrawPolygon($blueOutline, $torso)
    $g.FillPolygon($light, (Points 221,182, 292,182, 309,316, 257,380, 205,316))
    $g.DrawPolygon((PenObj 125 15 23 42 4), (Points 221,182, 292,182, 309,316, 257,380, 205,316))

    $head = Points 213,98, 300,98, 328,145, 297,187, 217,187, 184,145
    $g.FillPolygon($dark, $head)
    $g.DrawPolygon($blueOutline, $head)
    $g.FillRectangle((Brush 255 14 165 233), 218, 139, 76, 11)
    $g.FillEllipse((Brush 255 250 204 21), 229, 126, 16, 16)
    $g.FillEllipse((Brush 255 250 204 21), 270, 126, 16, 16)

    $leftArm = Points 139,185, 48,249, 79,330, 158,300, 191,224
    $rightArm = Points 373,185, 464,249, 433,330, 354,300, 321,224
    $g.FillPolygon($dark, $leftArm)
    $g.FillPolygon($dark, $rightArm)
    $g.DrawPolygon($blueOutline, $leftArm)
    $g.DrawPolygon($blueOutline, $rightArm)

    $g.FillEllipse($main, 33, 292, 97, 93)
    $g.FillEllipse($main, 382, 292, 97, 93)
    $g.DrawEllipse($shadow, 35, 294, 93, 89)
    $g.DrawEllipse($shadow, 384, 294, 93, 89)
    $g.FillRectangle($light, 64, 310, 38, 18)
    $g.FillRectangle($light, 411, 310, 38, 18)

    $g.FillPolygon($gold, (Points 207,250, 306,250, 287,287, 226,287))
    $g.DrawPolygon((PenObj 160 120 53 15 4), (Points 207,250, 306,250, 287,287, 226,287))

    $g.FillPolygon($dark, (Points 190,431, 236,431, 225,493, 162,493))
    $g.FillPolygon($dark, (Points 322,431, 276,431, 287,493, 350,493))
    $g.DrawPolygon($blueOutline, (Points 190,431, 236,431, 225,493, 162,493))
    $g.DrawPolygon($blueOutline, (Points 322,431, 276,431, 287,493, 350,493))

    for ($i = 0; $i -lt 6; $i++) {
        $x = 93 + $i * 66
        $g.DrawLines((PenObj 160 147 197 253 5), (Points $x,456, ($x + 18),430, ($x + 40),462))
    }

    $canvas.Bitmap.Save((Join-Path $outDir "egyptian_god_obelisk.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $canvas.Bitmap.Dispose()
}

function Draw-Ra {
    $canvas = New-Canvas
    $g = $canvas.Graphics

    Draw-Starburst $g 256 245 118 224 24 (Brush 65 250 204 21)
    $g.FillEllipse((Brush 88 251 146 60), 89, 76, 335, 335)
    $g.DrawEllipse((PenObj 170 253 224 71 7), 105, 91, 305, 305)

    $leftWing = Points 242,190, 38,112, 100,210, 39,251, 146,271, 74,340, 216,308
    $rightWing = Points 270,190, 474,112, 412,210, 473,251, 366,271, 438,340, 296,308
    $g.FillPolygon((Brush 240 250 204 21), $leftWing)
    $g.FillPolygon((Brush 240 250 204 21), $rightWing)
    $g.DrawPolygon((PenObj 230 120 53 15 6), $leftWing)
    $g.DrawPolygon((PenObj 230 120 53 15 6), $rightWing)
    for ($i = 0; $i -lt 5; $i++) {
        $g.DrawLine((PenObj 180 254 240 138 5), 236, 207, (72 + $i * 31), (153 + $i * 36))
        $g.DrawLine((PenObj 180 254 240 138 5), 276, 207, (440 - $i * 31), (153 + $i * 36))
    }

    $body = New-Object System.Drawing.Drawing2D.GraphicsPath
    $body.AddBezier(245,177, 189,248, 211,359, 256,448)
    $body.AddBezier(256,448, 301,359, 323,248, 267,177)
    $body.CloseFigure()
    $g.FillPath((Brush 255 234 88 12), $body)
    $g.DrawPath((PenObj 245 120 53 15 7), $body)
    $g.FillPath((Brush 105 254 240 138), $body)

    $head = Points 224,115, 257,58, 292,115, 321,142, 285,183, 225,183, 190,142
    $g.FillPolygon((Brush 255 253 186 116), $head)
    $g.DrawPolygon((PenObj 245 120 53 15 7), $head)
    $beak = Points 256,139, 343,155, 257,178
    $g.FillPolygon((Brush 255 250 204 21), $beak)
    $g.DrawPolygon((PenObj 230 120 53 15 5), $beak)
    $g.FillEllipse((Brush 255 239 68 68), 239, 126, 16, 16)
    $g.FillEllipse((Brush 255 239 68 68), 274, 126, 16, 16)

    $crown = Points 224,112, 196,52, 238,88, 256,28, 276,88, 318,52, 290,112
    $g.FillPolygon((Brush 255 253 224 71), $crown)
    $g.DrawPolygon((PenObj 220 120 53 15 4), $crown)

    $flamePen = PenObj 205 248 113 113 8
    $g.DrawLines($flamePen, (Points 193,400, 154,459, 208,437, 191,497))
    $g.DrawLines($flamePen, (Points 321,400, 358,459, 304,437, 321,497))

    $canvas.Bitmap.Save((Join-Path $outDir "egyptian_god_ra.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $canvas.Bitmap.Dispose()
}

Draw-Slifer
Draw-Obelisk
Draw-Ra
