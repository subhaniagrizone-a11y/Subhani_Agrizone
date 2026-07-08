$root = 'e:\Subhni Agrizone'
$src = Join-Path $root 'src'
$files = Get-ChildItem $src -Recurse -File | Where-Object { $_.Extension -in '.ts', '.tsx' }
$graph = @{}

foreach ($f in $files) {
  $rel = $f.FullName.Substring($root.Length + 1).Replace('\\', '/')
  $graph[$rel] = @()
  $content = Get-Content $f.FullName -Raw
  $matches = [regex]::Matches($content, '(?m)^\s*import\s+[^;]*?from\s+["''][^"'']+["'']')
  foreach ($m in $matches) {
    $line = $m.Value
    $impMatch = [regex]::Match($line, '["'']([^"'']+)["'']')
    if (-not $impMatch.Success) { continue }
    $imp = $impMatch.Groups[1].Value
    $target = $null

    if ($imp.StartsWith('@/')) {
      $base = Join-Path $src ($imp.Substring(2).Replace('/', '\\'))
      $cands = @($base + '.ts', $base + '.tsx', (Join-Path $base 'index.ts'), (Join-Path $base 'index.tsx'))
      foreach ($c in $cands) { if (Test-Path $c) { $target = $c; break } }
    }
    elseif ($imp.StartsWith('.')) {
      $base = Join-Path $f.DirectoryName ($imp.Replace('/', '\\'))
      $cands = @($base + '.ts', $base + '.tsx', (Join-Path $base 'index.ts'), (Join-Path $base 'index.tsx'))
      foreach ($c in $cands) { if (Test-Path $c) { $target = $c; break } }
    }

    if ($target) {
      $tRel = $target.Substring($root.Length + 1).Replace('\\', '/')
      $graph[$rel] += $tRel
    }
  }
}

$visited = @{}
$stack = @{}
$path = @()
$cycles = New-Object System.Collections.Generic.List[string]

function Dfs([string]$n) {
  $script:visited[$n] = $true
  $script:stack[$n] = $true
  $script:path += $n

  foreach ($nei in $script:graph[$n]) {
    if (-not $script:visited.ContainsKey($nei)) {
      Dfs $nei
    }
    elseif ($script:stack.ContainsKey($nei) -and $script:stack[$nei]) {
      $idx = $script:path.IndexOf($nei)
      if ($idx -ge 0) {
        $cyc = ($script:path[$idx..($script:path.Count - 1)] + $nei) -join ' -> '
        if (-not $script:cycles.Contains($cyc)) { [void]$script:cycles.Add($cyc) }
      }
    }
  }

  $script:stack[$n] = $false
  if ($script:path.Count -gt 0) {
    if ($script:path.Count -eq 1) { $script:path = @() }
    else { $script:path = $script:path[0..($script:path.Count - 2)] }
  }
}

foreach ($n in $graph.Keys) {
  if (-not $visited.ContainsKey($n)) { Dfs $n }
}

"cycles_found=$($cycles.Count)"
$cycles | Select-Object -First 40
