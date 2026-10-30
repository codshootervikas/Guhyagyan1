$ErrorActionPreference = "Stop"

$baseDir = $PSScriptRoot
$port = 3000
$envFile = Join-Path $baseDir ".env"
$supabaseUrl = ""
$supabaseAnonKey = ""

if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#")) {
            $parts = $line -split '=', 2
            if ($parts.Count -eq 2) {
                $k = $parts[0].Trim()
                $v = $parts[1].Trim().Trim('"').Trim("'")
                if ($k -eq "PORT") { $port = [int]$v }
                if ($k -eq "SUPABASE_URL") { $supabaseUrl = $v }
                if ($k -eq "SUPABASE_ANON_KEY") { $supabaseAnonKey = $v }
            }
        }
    }
}

$listener = New-Object System.Net.HttpListener
$prefix = "http://127.0.0.1:$port/"
$listener.Prefixes.Add($prefix)

# Copy poster asset if in artifact directory
$posterSource = "C:\Users\lenovo\.gemini\antigravity\brain\a8b6de61-1b9c-4714-a7ee-502e9db1d300\.user_uploaded\media_1793265414159_86117020.jpg"
$posterDest = Join-Path $baseDir "assets\images\harinama-chintamani-poster.jpg"
if (Test-Path $posterSource) {
    try {
        $parent = Split-Path $posterDest
        if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
        Copy-Item -Path $posterSource -Destination $posterDest -Force
    } catch {}
}

# Copy speaker photo if in artifact directory
$speakerSource = "C:\Users\lenovo\.gemini\antigravity\brain\a8b6de61-1b9c-4714-a7ee-502e9db1d300\.user_uploaded\media_1793354102045_6f0f6322.jpg"
$speakerDest = Join-Path $baseDir "assets\images\vraj-kishor-das.jpg"
if (Test-Path $speakerSource) {
    try {
        $parent = Split-Path $speakerDest
        if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
        Copy-Item -Path $speakerSource -Destination $speakerDest -Force
    } catch {}
}

try {
    $listener.Start()
    Write-Host "=========================================================="
    Write-Host " Guhya Gyan Spiritual Sanctuary Server Running"
    Write-Host " Local URL: $prefix"
    Write-Host "=========================================================="
    try { Start-Process $prefix } catch {}
} catch {
    Write-Error "Failed to start listener on $prefix : $_"
    exit 1
}

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".png"  = "image/png"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".webp" = "image/webp"
    ".woff" = "font/woff"
    ".woff2"= "font/woff2"
    ".ttf"  = "font/ttf"
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $req = $context.Request
        $res = $context.Response

        try {
            $rawUrl = $req.RawUrl.Split('?')[0]
            if ($rawUrl -eq "/" -or [string]::IsNullOrEmpty($rawUrl)) {
                $rawUrl = "/index.html"
            }

            # Provide client configuration endpoint
            if ($rawUrl -eq "/api/config") {
                $configJson = @{
                    SUPABASE_URL = $supabaseUrl
                    SUPABASE_ANON_KEY = $supabaseAnonKey
                } | ConvertTo-Json -Compress

                $bytes = [System.Text.Encoding]::UTF8.GetBytes($configJson)
                $res.ContentType = "application/json; charset=utf-8"
                $res.Headers.Add("Cache-Control", "no-cache")
                $res.ContentLength64 = $bytes.Length
                if ($req.HttpMethod -ne "HEAD") {
                    $res.OutputStream.Write($bytes, 0, $bytes.Length)
                }
                $res.OutputStream.Close()
                continue
            }

            $relPath = $rawUrl.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
            $filePath = Join-Path $baseDir $relPath

            if (-not (Test-Path $filePath -PathType Leaf)) {
                if ($relPath -like "*harinama-chintamani-poster.jpg" -and (Test-Path $posterSource)) {
                    try {
                        if (-not (Test-Path $posterDest)) {
                            Copy-Item -Path $posterSource -Destination $posterDest -Force
                        }
                    } catch {}
                    $filePath = if (Test-Path $posterDest) { $posterDest } else { $posterSource }
                }
            }

            if (Test-Path $filePath -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $contentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
                $res.ContentType = $contentType
                $res.Headers.Add("Cache-Control", "no-cache")
                
                $fileBytes = [System.IO.File]::ReadAllBytes($filePath)
                $res.ContentLength64 = $fileBytes.Length
                if ($req.HttpMethod -ne "HEAD") {
                    $res.OutputStream.Write($fileBytes, 0, $fileBytes.Length)
                }
                $res.OutputStream.Close()
            } else {
                $res.StatusCode = 404
                $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                $res.ContentLength64 = $errBytes.Length
                if ($req.HttpMethod -ne "HEAD") {
                    $res.OutputStream.Write($errBytes, 0, $errBytes.Length)
                }
                $res.OutputStream.Close()
            }
        } catch {
            Write-Host "Request error: $($_.Exception.Message)" -ForegroundColor DarkYellow
            try { $res.OutputStream.Close() } catch {}
        }
    }
} finally {
    $listener.Stop()
    $listener.Close()
}
