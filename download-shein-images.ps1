$baseDir = "e:\trae\6ab525474b425bc807509c51\yayuhong-web\public\images\products"

$categories = @{
    womens = @(
        "https://img.ltwebstatic.com/images3_pi/2019/10/16/157121065670822a0559edc9a20136a111a4718145.avif",
        "https://img.ltwebstatic.com/images3_pi/2019/10/16/15712106679a688cf6cea076cff889b0a6b7889997.avif",
        "https://img.ltwebstatic.com/images3_pi/2019/10/16/1571210709b727041b08a32f16e3d2a158d559948f.avif",
        "https://img.ltwebstatic.com/images3_pi/2019/10/16/15712107177cd4e76a51fca4069c47f29cdbed4392.avif",
        "https://img.ltwebstatic.com/images3_pi/2019/10/16/15712107291aea047ed98d7d3629a1f66f7ab177fd.avif",
        "https://img.ltwebstatic.com/images3_pi/2019/10/16/15712107498da8294b8bf50c80837fa0608f92225b.avif",
        "https://img.ltwebstatic.com/images3_acp/2020/05/04/1588585759e6889d28cb297b9061e8fb45ff68f7bc.avif",
        "https://img.ltwebstatic.com/images3_acp/2023/03/14/1678772593e8d54375421ec781a337e6a72092e31a.avif",
        "https://img.ltwebstatic.com/v4/p/pfms/2025/11/27/15/17642329914c4e2c0eb371adb45fec92af6441ad4f.avif",
        "https://img.ltwebstatic.com/v4/p/pfms/2025/11/27/af/1764232973ab8613e8b5510477f3366c87fb946408.avif",
        "https://img.ltwebstatic.com/v4/p/pfms/2025/11/27/b8/176423295559068eef4c82020caae7f95716de1b2b.avif",
        "https://img.ltwebstatic.com/v4/p/pfms/2025/11/27/a9/17642328523d60e89a459c8da1a41ff4ba354c369c.avif",
        "https://img.ltwebstatic.com/v4/p/pfms/2025/11/27/be/17642329026cbfc83ff515cc191eeeea26be4f41b6.avif",
        "https://img.ltwebstatic.com/v4/p/pfms/2025/11/27/ec/17642328773e8be75ac685a10181c9b36cc5875631.avif",
        "https://img.ltwebstatic.com/v4/p/pfms/2025/11/27/75/1764233010f8708d4d6c5a488d57820faf6712d041.avif",
        "https://img.ltwebstatic.com/v4/p/pfms/2025/11/11/03/17628501677360e37c413301fd4ce0f8ccffa390fe.avif",
        "https://img.ltwebstatic.com/v4/p/pfms/2025/11/14/3f/1763102319e71d2861787bbeeed3b27e0996f8d81f.avif"
    )
    kids = @(
        "https://img.ltwebstatic.com/images3_pi/2020/03/30/1585556531965e5d98ef5a432eab61147c16af31c6.avif",
        "https://img.ltwebstatic.com/images3_pi/2020/03/30/158555620619e714eac6cf4d24523635af030c0012.avif",
        "https://img.ltwebstatic.com/images3_pi/2020/03/30/15855567198bad4ed15088ca01365c8f69ea77b49c.avif",
        "https://img.ltwebstatic.com/images3_pi/2020/03/30/1585556145d5570e831d3df08f4c1803af0efa030d.avif",
        "https://img.ltwebstatic.com/images3_pi/2020/03/30/1585556301bc3664cc0e59b223bf78e4155f30ff0b.avif",
        "https://img.ltwebstatic.com/images3_pi/2020/03/30/15855564026fcf3d3a93350ff7bb921f512c2795ce.avif",
        "https://img.ltwebstatic.com/images3_pi/2020/03/30/15855566827f622f6ea3c8d230d1655bad7f114f67.avif",
        "https://img.ltwebstatic.com/images3_pi/2020/03/30/15855564343707ae1547770b64d8a08fde15076d18.avif",
        "https://img.ltwebstatic.com/images3_pi/2020/03/30/15855567509ceff4ce13de7e8706a63fad7ee459d5.avif",
        "https://img.ltwebstatic.com/images3_pi/2020/03/30/1585556500fea3c570a8cdd3df14f20815c348872f.avif",
        "https://img.ltwebstatic.com/images3_pi/2020/03/30/15855563461db451bd5692c5bebd52c6bac56eafbb.avif",
        "https://img.ltwebstatic.com/images3_pi/2020/03/30/158555664362acf943db9d324e60e9a112625dfc3e.avif",
        "https://img.ltwebstatic.com/images3_pi/2020/03/30/15855565738cdcca3acceaef88d76f86a453c1d082.avif",
        "https://img.ltwebstatic.com/images3_ccc/2024/11/20/c3/17320925911e06348e027fb3f6e71a78280043da85.png",
        "https://img.ltwebstatic.com/images3_ccc/2024/10/23/29/1729671747122fd964135a7edf9b97d92bcd91dcd5.png",
        "https://img.ltwebstatic.com/v4/j/spmp/2026/09/13/64/17892867127b3b09dcbcd41e29f023d9632fc64e79_thumbnail_405x.avif",
        "https://img.ltwebstatic.com/v4/j/spmp/2026/09/13/68/17892867124574d07ba0c3a2d59c0694a872144518_thumbnail_405x.avif"
    )
    loungewear = @(
        "https://img.ltwebstatic.com/images3_acp/2023/01/16/1673862576c4b8f69c137f9f1871af51433573007a.png",
        "https://img.ltwebstatic.com/images3_acp/2023/01/16/167386261165843f2252f78ca591478026371ff3c5.png",
        "https://img.ltwebstatic.com/images3_acp/2023/01/16/1673862652048b8d8d859c6a65d86991d03e6cd137.png",
        "https://img.ltwebstatic.com/images3_acp/2020/05/04/1588585759e6889d28cb297b9061e8fb45ff68f7bc.avif",
        "https://img.ltwebstatic.com/images3_acp/2023/03/14/1678772593e8d54375421ec781a337e6a72092e31a.avif",
        "https://img.ltwebstatic.com/v4/p/pfms/2025/11/27/15/17642329914c4e2c0eb371adb45fec92af6441ad4f.avif",
        "https://img.ltwebstatic.com/v4/p/pfms/2025/11/27/af/1764232973ab8613e8b5510477f3366c87fb946408.avif",
        "https://img.ltwebstatic.com/v4/p/pfms/2025/11/27/b8/176423295559068eef4c82020caae7f95716de1b2b.avif"
    )
}

foreach ($category in $categories.Keys) {
    $catDir = Join-Path $baseDir $category
    if (-not (Test-Path $catDir)) {
        New-Item -ItemType Directory -Path $catDir -Force | Out-Null
    }
    
    $urls = $categories[$category]
    $i = 1
    foreach ($url in $urls) {
        $ext = if ($url -match "\.avif$") { ".avif" } elseif ($url -match "\.png$") { ".png" } else { ".jpg" }
        $filename = "{0}{1}{2}" -f $category, $i.ToString("00"), $ext
        $filepath = Join-Path $catDir $filename
        
        Write-Host "Downloading $category $i : $url"
        try {
            Invoke-WebRequest -Uri $url -OutFile $filepath -UseBasicParsing -TimeoutSec 30
            Write-Host "  OK: $filename"
        } catch {
            Write-Host "  FAILED: $($_.Exception.Message)"
        }
        $i++
    }
}

Write-Host "`nDone! Downloaded all images."
