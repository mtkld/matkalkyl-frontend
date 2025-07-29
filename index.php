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

        echo "\t\t<script defer src=\"{$urlPath}?v=" . time() . "\"></script>\n";
    }
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
		
<?php includeAllJS(__DIR__ . '/js/primitives', '/js/primitives'); ?>

<?php includeAllJS(__DIR__ . '/js/modules', '/js/modules'); ?>

<?php includeAllJS(__DIR__ . '/js/framework', '/js/framework'); ?>

		<script defer src="/js/init.js?v=<?= time() ?>"></script>
		<script defer src="/js/DOMContentLoaded.js?v=<?= time() ?>"></script>



	</head>

	<body>
		<main id="mount-root"></main>
	</body>
</html>

