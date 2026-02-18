# Kill any process using port 3002
$port = 3002
$connections = netstat -ano | findstr ":$port" | findstr "LISTENING"
if ($connections) {
    $connections | ForEach-Object {
        $parts = $_ -split '\s+'
        $pid = $parts[-1]
        if ($pid -match '^\d+$') {
            try {
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                Write-Host "Killed process $pid on port $port"
            } catch {
                # Process might already be gone, ignore
            }
        }
    }
    Start-Sleep -Milliseconds 500
}
