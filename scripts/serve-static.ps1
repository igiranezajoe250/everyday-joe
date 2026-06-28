param(
    [Parameter(Mandatory = $true)]
    [string]$Root,

    [int]$Port = 3001
)

$ErrorActionPreference = "Stop"

$resolvedRoot = (Resolve-Path -LiteralPath $Root).Path

Add-Type -AssemblyName System.Web

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://127.0.0.1:$Port/")
$listener.Start()

Write-Host "Serving $resolvedRoot on http://127.0.0.1:$Port/"

$contentTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".js" = "application/javascript; charset=utf-8"
    ".mjs" = "application/javascript; charset=utf-8"
    ".css" = "text/css; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png" = "image/png"
    ".jpg" = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif" = "image/gif"
    ".svg" = "image/svg+xml"
    ".webp" = "image/webp"
    ".ico" = "image/x-icon"
    ".ttf" = "font/ttf"
    ".woff" = "font/woff"
    ".woff2" = "font/woff2"
}

while ($listener.IsListening) {
    $context = $listener.GetContext()
    try {
        $requestPath = [System.Web.HttpUtility]::UrlDecode($context.Request.Url.AbsolutePath.TrimStart('/'))
        if ([string]::IsNullOrWhiteSpace($requestPath)) {
            $requestPath = "index.html"
        }

        $candidatePath = Join-Path $resolvedRoot $requestPath
        if ((Test-Path -LiteralPath $candidatePath) -and (Get-Item -LiteralPath $candidatePath).PSIsContainer) {
            $candidatePath = Join-Path $candidatePath "index.html"
        }

        if (-not (Test-Path -LiteralPath $candidatePath)) {
            $candidatePath = Join-Path $resolvedRoot "index.html"
        }

        $fullPath = (Resolve-Path -LiteralPath $candidatePath).Path
        if (-not $fullPath.StartsWith($resolvedRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
            throw "Path escapes root"
        }

        $bytes = [System.IO.File]::ReadAllBytes($fullPath)
        $extension = [System.IO.Path]::GetExtension($fullPath).ToLowerInvariant()
        $context.Response.ContentType = $contentTypes[$extension]
        if (-not $context.Response.ContentType) {
            $context.Response.ContentType = "application/octet-stream"
        }
        $context.Response.ContentLength64 = $bytes.Length
        $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } catch {
        $context.Response.StatusCode = 500
        $message = [System.Text.Encoding]::UTF8.GetBytes($_.Exception.Message)
        $context.Response.OutputStream.Write($message, 0, $message.Length)
    } finally {
        $context.Response.OutputStream.Close()
    }
}
