
# Secure Admin Routes
$adminFiles = Get-ChildItem -Path "app\api\admin" -Recurse -Filter "route.ts" | Where-Object { $_.FullName -notmatch "login|verify|bootstrap" }
foreach ($file in $adminFiles) {
    $content = Get-Content $file.FullName -Raw
    if ($content -notmatch "requireAdmin") {
        Write-Host "Securing Admin: $($file.Name)"
        $content = "import { requireAdmin } from '@/lib/security/authz';`n" + $content
        # Inject check at start of function body
        $content = $content -replace "(export async function \w+\(.*\)\s*\{)", "`$1`n  await requireAdmin();"
        Set-Content $file.FullName $content
    }
}

# Secure Cron Routes
$cronFiles = Get-ChildItem -Path "app\api\cron" -Recurse -Filter "route.ts"
foreach ($file in $cronFiles) {
    $content = Get-Content $file.FullName -Raw
    if ($content -notmatch "requireCron") {
         Write-Host "Securing Cron: $($file.Name)"
        $content = "import { requireCron } from '@/lib/security/authz';`n" + $content
        # Note: requireCron needs 'req'. Ensure 'req' is in args?
        # If args is empty "()", we need to add "req: NextRequest"?
        # Regex replacement won't add args. 
        # We assume existing cron routes have req.
        # Cron route: "export async function GET(req: NextRequest) {"
        $content = $content -replace "(export async function \w+\(.*\)\s*\{)", "`$1`n  requireCron(req);"
        Set-Content $file.FullName $content
    }
}

# Secure Webhook Routes
$webhookFiles = Get-ChildItem -Path "app\api\webhooks" -Recurse -Filter "route.ts"
foreach ($file in $webhookFiles) {
    $content = Get-Content $file.FullName -Raw
    if ($content -notmatch "requireWebhook") {
         Write-Host "Securing Webhook: $($file.Name)"
        $content = "import { requireWebhook } from '@/lib/security/authz';`n" + $content
        $content = $content -replace "(export async function \w+\(.*\)\s*\{)", "`$1`n  await requireWebhook(req);"
        Set-Content $file.FullName $content
    }
}
