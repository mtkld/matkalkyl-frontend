<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />

		<title>Test</title>

		<!--     Unused
		     -------------------- 
			Config 
			Config: System 
			Config: User 
			Exec: Finalize
			Data: State 
			Data: Artifact 
		     -------------------- -->
		
		<!-- Primitives -->	
		<script defer src="/js/pipe.js?v=<?= time() ?>"></script>
		<script defer src="/js/masterpiperelay.js?v=<?= time() ?>"></script>
		<script defer src="/js/jswslogclient.js?v=<?= time() ?>"></script>
		<script defer src="/js/jswslogclientstatusdisplay.js?v=<?= time() ?>"></script>
		
		<!-- Exec -->



		<!-- Exec: Operate -->

		<script defer src="/js/core-system-logic/encryption.js?v=<?= time() ?>"></script>
		<script defer src="/js/storage-logic/user-local-store.js?v=<?= time() ?>"></script>
		<script defer src="/js/core-system-logic/user.js?v=<?= time() ?>"></script>

		<script defer src="/js/coordination-logic/ui-data-coordinator.js?v=<?= time() ?>"></script>
		<script defer src="/js/coordination-logic/context/context.js?v=<?= time() ?>"></script>
		<script defer src="/js/coordination-logic/context/context-manager.js?v=<?= time() ?>"></script>
		<script defer src="/js/coordination-logic/context/context-switcher.js?v=<?= time() ?>"></script>
		<script defer src="/js/coordination-logic/display-coordinator.js?v=<?= time() ?>"></script>
		<script defer src="/js/coordination-logic/user-interaction-coordinator.js?v=<?= time() ?>"></script>

		<script defer src="/js/display-logic/register-user-ui.js?v=<?= time() ?>"></script>

		<script defer src="/js/wspluginclient.js?v=<?= time() ?>"></script>

				
		<script defer src="/js/consoledisplay.js?v=<?= time() ?>"></script>

		<!-- Exec: Initialize -->
		<script defer src="/js/init.js?v=<?= time() ?>"></script>
		<script defer src="/js/DOMContentLoaded.js?v=<?= time() ?>"></script>

	</head>

	<body>
		<main id="mount-root"></main>
	</body>
</html>

