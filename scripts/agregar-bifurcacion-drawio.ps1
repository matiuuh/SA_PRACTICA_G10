param(
    [Parameter(Mandatory = $true)]
    [string]$InputPath,

    [Parameter(Mandatory = $true)]
    [string]$OutputPath
)

$xml = [xml](Get-Content -LiteralPath $InputPath -Raw)
$root = $xml.mxGraphModel.root
$groupId = '59'

foreach ($id in @('40', '41', '42', '43')) {
    $node = $root.SelectSingleNode("*[@id='$id']")
    if ($node) {
        [void]$root.RemoveChild($node)
    }
}

$finGeometry = $root.SelectSingleNode("*[@id='6']/mxCell/mxGeometry")
$finGeometry.SetAttribute('y', '2310')

function Add-Cell([string]$fragment) {
    $documentFragment = $xml.CreateDocumentFragment()
    $documentFragment.InnerXml = $fragment
    [void]$root.AppendChild($documentFragment)
}

Add-Cell @"
<mxCell id="fork_pago" parent="$groupId" vertex="1" style="shape=line;html=1;strokeWidth=8;fillColor=#000000;strokeColor=#000000;direction=east;">
  <mxGeometry x="365" y="2045" width="400" height="10" as="geometry"/>
</mxCell>
"@

Add-Cell @"
<mxCell id="join_pago" parent="$groupId" vertex="1" style="shape=line;html=1;strokeWidth=8;fillColor=#000000;strokeColor=#000000;direction=east;">
  <mxGeometry x="225" y="2190" width="420" height="10" as="geometry"/>
</mxCell>
"@

Add-Cell @"
<mxCell id="edge_pago_no_fork" edge="1" parent="$groupId" source="14" target="fork_pago" value="No"
 style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=block;endFill=1;fontSize=16;">
  <mxGeometry relative="1" as="geometry"/>
</mxCell>
"@

Add-Cell @"
<mxCell id="edge_fork_liberar" edge="1" parent="$groupId" source="fork_pago" target="15"
 style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=block;endFill=1;">
  <mxGeometry relative="1" as="geometry"/>
</mxCell>
"@

Add-Cell @"
<mxCell id="edge_fork_error" edge="1" parent="$groupId" source="fork_pago" target="16"
 style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=block;endFill=1;">
  <mxGeometry relative="1" as="geometry"/>
</mxCell>
"@

Add-Cell @"
<mxCell id="edge_liberar_join" edge="1" parent="$groupId" source="15" target="join_pago"
 style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=block;endFill=1;">
  <mxGeometry relative="1" as="geometry"/>
</mxCell>
"@

Add-Cell @"
<mxCell id="edge_error_join" edge="1" parent="$groupId" source="16" target="join_pago"
 style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=block;endFill=1;">
  <mxGeometry relative="1" as="geometry"/>
</mxCell>
"@

Add-Cell @"
<mxCell id="edge_join_fin" edge="1" parent="$groupId" source="join_pago" target="6"
 style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=block;endFill=1;">
  <mxGeometry relative="1" as="geometry"/>
</mxCell>
"@

$settings = New-Object System.Xml.XmlWriterSettings
$settings.Indent = $true
$settings.Encoding = New-Object System.Text.UTF8Encoding($false)

$writer = [System.Xml.XmlWriter]::Create($OutputPath, $settings)
try {
    $xml.Save($writer)
}
finally {
    $writer.Dispose()
}
