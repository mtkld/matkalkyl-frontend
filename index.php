<?php
function includeAllJS(string $baseDir, string $webPath)
{
    $absPath = realpath($baseDir);
    if (!$absPath || !is_dir($absPath)) {
        return;
    }

    $baseLen = strlen($absPath);

    $rii = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($absPath, RecursiveDirectoryIterator::SKIP_DOTS)
    );

    foreach ($rii as $file) {
        if ($file->getExtension() !== 'js') {
            continue;
        }

        $relativePath = substr($file->getPathname(), $baseLen); // e.g. /subdir/script.js
        $urlPath = rtrim($webPath, '/') . str_replace(DIRECTORY_SEPARATOR, '/', $relativePath);

        echo "\t\t<script type=\"module\" src=\"{$urlPath}?v=" . time() . "\"></script>\n";
    }
}

function generateGlobalImports(string $baseDir, string $webPath)
{
    $absPath = realpath($baseDir);
    if (!$absPath || !is_dir($absPath)) {
        return;
    }

    $baseLen = strlen($absPath);
    $linesImport = [];
    $linesAttach = [];

    $rii = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($absPath, RecursiveDirectoryIterator::SKIP_DOTS)
    );

    foreach ($rii as $file) {
        if ($file->getExtension() !== 'js') {
            continue;
        }

        $class = pathinfo($file->getBasename(), PATHINFO_FILENAME);
        if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/', $class)) {
            continue;
        }

        $relativePath = substr($file->getPathname(), $baseLen);
        $urlPath = rtrim($webPath, '/') . str_replace(DIRECTORY_SEPARATOR, '/', $relativePath);
        $versionedPath = "{$urlPath}?v=" . time();

        $linesImport[] = "const mod_{$class} = await import(\"{$versionedPath}\");";
        $linesAttach[] = "window.{$class} = mod_{$class}.{$class};";

    }

    echo "\t\t\t\t";
    echo implode("\n\t\t\t\t", $linesImport) . "\n";
    echo "\n";
    echo "\t\t\t\t";
    echo implode("\n\t\t\t\t", $linesAttach) . "\n";
}










?><!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />

		<title>Test</title>

		<!--    Categories
			-------------------- 
			Primitives
			Config 
			Config: System 
			Config: User 
			Exec: Initialize
			Exec: Operate
			Exec: Finalize
			Data: State 
			Data: Artifact 
			-------------------- -->
		<!--
		Because in the future, we want dynamic script loading like:

			const module = await import('/example/external-code.js');
			module.init(); // or whatever the plugin exposes

		We need to use type="module" for all inclusion of js scripts.

		Because I dislike the import {...}, and it creates a big mess with relative paths etc,
		we just use import to a minimum. Thus DOMContentLoaded.js below will import all classes.

		-->
<!--		
<?php includeAllJS(__DIR__ . '/js/primitives', '/js/primitives'); ?>

<?php includeAllJS(__DIR__ . '/js/modules', '/js/modules'); ?>

<?php includeAllJS(__DIR__ . '/js/framework', '/js/framework'); ?>
-->
		<script type="module">
		document.addEventListener("DOMContentLoaded", async () => {
			// Lets import everything once and for all and forget about the messy import {...} syntax.
			// We need 
<?php generateGlobalImports(__DIR__ . '/js/framework', '/js/framework'); ?>

<?php echo implode("\n", array_map(fn ($line) => "\t\t\t\t" . $line, explode("\n", file_get_contents(__DIR__ . '/js/DOMContentLoaded.js')))); ?>

		}); // end DOMContentLoaded 
		</script>
	</head>
	<body>
		<main id="mount-root"></main>
	</body>
</html>
